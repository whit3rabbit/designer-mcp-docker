"""Discover PDF and PPTX design evidence, or sample explicit DESIGN.md checks."""

import argparse
import json
import re
from itertools import groupby
from pathlib import Path
from xml.etree import ElementTree
from zipfile import ZipFile

DRAWING_NS = {"a": "http://schemas.openxmlformats.org/drawingml/2006/main"}
THEME_PATH = re.compile(r"ppt/theme/theme[1-9][0-9]*\.xml")
SUBSET_PREFIX = re.compile(r"^[A-Z]{6}\+")


def read_theme(deck, part):
    if not THEME_PATH.fullmatch(part):
        raise ValueError(f"Expected a PPTX theme part, got {part!r}")
    try:
        entry = deck.getinfo(part)
    except KeyError:
        return {}
    if entry.file_size > 2_000_000:
        raise ValueError(f"Theme part is too large: {part}")
    return theme_values(ElementTree.fromstring(deck.read(entry)))


def theme_values(root):
    elements = root.find("a:themeElements", DRAWING_NS)
    if elements is None:
        elements = root  # A theme override puts its schemes directly under the root.
    values = {}
    for slot in elements.findall("a:clrScheme/*", DRAWING_NS):
        color = slot.find("a:srgbClr", DRAWING_NS)
        rgb = color.get("val") if color is not None else None
        if color is None:
            system = slot.find("a:sysClr", DRAWING_NS)
            rgb = system.get("lastClr") if system is not None else None
        if rgb and re.fullmatch(r"[\dA-Fa-f]{6}", rgb):
            values[f"color.{slot.tag.split('}')[-1]}"] = f"#{rgb}"
    for slot in ("majorFont", "minorFont"):
        latin = elements.find(f"a:fontScheme/a:{slot}/a:latin", DRAWING_NS)
        if latin is not None and latin.get("typeface"):
            values[f"font.{slot}"] = latin.get("typeface")
    return values


def pptx_observations(path, checks):
    with ZipFile(path) as deck:
        themes = {}
        for check in checks:
            part = check.get("part", "ppt/theme/theme1.xml")
            if part not in themes:
                themes[part] = read_theme(deck, part)
            prop = check["property"]
            yield {"location": f"{part} {prop}", "token": check["token"], "value": themes[part].get(prop)}


def pdf_value(char, prop):
    if prop == "font-family":
        # PDF exports commonly prefix embedded font subsets with a six-letter identifier.
        return SUBSET_PREFIX.sub("", char.get("fontname", "")) or None
    if prop == "font-size":
        size = char.get("size")
        return f"{size:.6g}pt" if size is not None else None
    if prop == "color":
        color = char.get("non_stroking_color")
        if isinstance(color, (int, float)):
            color = (color,)
        if not isinstance(color, (tuple, list)) or len(color) not in (1, 3):
            return None
        if char.get("ncs") not in (None, "DeviceRGB", "DeviceGray"):
            return None
        channels = color * 3 if len(color) == 1 else color
        return f"rgb({' '.join(f'{value * 100:.8g}%' for value in channels)})"
    raise ValueError(f"Unsupported PDF property: {prop}")


def pdf_observations(path, checks):
    import pdfplumber

    with pdfplumber.open(path) as pdf:
        for check in checks:
            page, index, prop = check["page"], check["char"], check["property"]
            value = None
            if 1 <= page <= len(pdf.pages):
                chars = pdf.pages[page - 1].chars
                if 0 <= index < len(chars):
                    value = pdf_value(chars[index], prop)
            yield {"location": f"page {page} char {index} {prop}", "token": check["token"], "value": value}


def add_section(capture, role, location, parent_id=None, **details):
    section_id = f"s{len(capture['sections']) + 1}"
    capture["sections"].append({
        "id": section_id, "parentId": parent_id, "role": role, "location": location, **details,
    })
    return section_id


def add_observations(capture, section_id, location, values, kind):
    observations = capture["observations"]
    for prop, value in values.items():
        if value is not None:
            observations.append({
                "id": f"o{len(observations) + 1}", "sectionId": section_id,
                "location": location, "property": prop, "value": value, "kind": kind,
            })


def page_numbers(total, requested):
    if requested is None:
        return list(range(1, min(total, 3) + 1))
    if any(number < 1 or number > total for number in requested):
        raise ValueError(f"Pages or slides must be between 1 and {total}.")
    return sorted(set(requested))


def pdf_capture(path, requested, capture):
    import pdfplumber

    properties = ("font-family", "font-size", "color")

    def text_style(char):
        return tuple(pdf_value(char, prop) for prop in properties)

    with pdfplumber.open(path) as pdf:
        capture["scope"] = {"pages": page_numbers(len(pdf.pages), requested), "totalPages": len(pdf.pages)}
        for number in capture["scope"]["pages"]:
            page = pdf.pages[number - 1]
            location = f"page {number}"
            page_id = add_section(capture, "page", location, page=number)
            lines = page.extract_text_lines(return_chars=True)
            if not lines:
                capture["gaps"].append({"location": location, "reason": "No selectable text. Inspect a rendered page for structure and estimated styles."})
            sampled = set()
            for index, line in enumerate(lines[:120], 1):
                line_location = f"{location} line {index}"
                bounds = [round(line[key], 2) for key in ("x0", "top", "x1", "bottom")]
                line_id = add_section(capture, "text-line", line_location, page_id, boundsPt=bounds)
                for span_index, (style, group) in enumerate(groupby(line["chars"], text_style), 1):
                    # Keep the first location of each style per page. Repeated spans add no token evidence.
                    if style in sampled or len(sampled) == 60:
                        continue
                    sampled.add(style)
                    chars = list(group)
                    x0 = min(char["x0"] for char in chars)
                    top = min(char["top"] for char in chars)
                    x1 = max(char["x1"] for char in chars)
                    bottom = max(char["bottom"] for char in chars)
                    span = f"{line_location} span {span_index} [{x0:.2f}, {top:.2f}, {x1:.2f}, {bottom:.2f} pt]"
                    add_observations(capture, line_id, span, dict(zip(properties, style)), "measured")
            if len(lines) > 120 or len(sampled) == 60:
                capture["gaps"].append({"location": location, "reason": "Capture reached its line or distinct style limit."})
            page.close()


def pptx_fill(node):
    colors = node.xpath("./a:solidFill/a:srgbClr | ./a:solidFill/a:schemeClr")
    if not colors:
        return {}
    color = colors[0]
    value = color.get("val")
    if color.tag.endswith("}srgbClr") and value and re.fullmatch(r"[\dA-Fa-f]{6}", value):
        # A modifier can change the final color, even for a direct RGB declaration.
        return {"base-color" if len(color) else "color": f"#{value}"}
    return {"theme-color-slot": value}


def pptx_text_style(node):
    size = node.get("sz", "")
    family = next((font.get("typeface") for font in node.xpath("./a:latin")), None)
    return {
        **pptx_fill(node),
        "font-size": f"{int(size) / 100:g}pt" if size.isdecimal() else None,
        "font-theme-reference" if family and family.startswith("+") else "font-family": family,
        "font-weight": {"1": 700, "true": 700, "0": 400, "false": 400}.get(node.get("b")),
    }


def pptx_shapes(capture, shapes, parent_id, parent_location, budget):
    from pptx.enum.shapes import MSO_SHAPE_TYPE

    for shape in shapes:
        if budget[0] == 0:
            return
        budget[0] -= 1
        location = f"{parent_location} shape {shape.shape_id}"
        role = shape.shape_type.name.lower().replace("_", "-") if shape.shape_type is not None else "shape"
        if shape.is_placeholder:
            role = shape.placeholder_format.type.name.lower().replace("_", "-")
        elif shape.has_text_frame and shape.text.strip():
            role = "text"
        bounds = [round(value.pt, 2) if value is not None else None for value in (shape.left, shape.top, shape.width, shape.height)]
        shape_id = add_section(capture, role, location, parent_id, boundsPt=bounds)
        for node in shape._element.xpath("./p:spPr"):
            add_observations(capture, shape_id, f"{location} fill", pptx_fill(node), "declared")
        text_nodes = shape._element.xpath("./p:txBody/a:p/a:pPr/a:defRPr | ./p:txBody/a:p/*/a:rPr")
        for index, node in enumerate(text_nodes[:60], 1):
            add_observations(capture, shape_id, f"{location} text style {index}", pptx_text_style(node), "declared")
        if len(text_nodes) > 60:
            capture["gaps"].append({"location": location, "reason": "Text style limit reached."})
        if shape.shape_type == MSO_SHAPE_TYPE.GROUP:
            pptx_shapes(capture, shape.shapes, shape_id, location, budget)


def pptx_capture(path, requested, capture):
    from pptx import Presentation
    from pptx.opc.constants import RELATIONSHIP_TYPE as RT

    deck = Presentation(path)
    slides = page_numbers(len(deck.slides), requested)
    capture["scope"] = {"slides": slides, "totalSlides": len(deck.slides)}
    themes = {}
    for number in slides:
        slide = deck.slides[number - 1]
        layout = slide.slide_layout
        master = layout.slide_master
        location = f"slide {number}"
        slide_id = add_section(capture, "slide", location, slide=number, layout=str(layout.part.partname))
        for layer, part in (("master", master.part), ("layout", layout.part), ("slide", slide.part)):
            for rel in part.rels.values():
                if rel.is_external or rel.reltype not in {RT.THEME, RT.THEME_OVERRIDE}:
                    continue
                theme = rel.target_part
                if theme.partname not in themes:
                    xml = theme.blob
                    if len(xml) > 2_000_000:
                        raise ValueError(f"Theme part is too large: {theme.partname}")
                    themes[theme.partname] = theme_values(ElementTree.fromstring(xml))
                add_observations(capture, slide_id, f"{location} {layer} {theme.partname}", themes[theme.partname], "declared")
        for node in slide._element.xpath("./p:cSld/p:bg/p:bgPr"):
            add_observations(capture, slide_id, f"{location} background", pptx_fill(node), "declared")
        budget = [120]
        pptx_shapes(capture, slide.shapes, slide_id, location, budget)
        if budget[0] == 0:
            capture["gaps"].append({"location": location, "reason": "Shape limit reached."})


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("artifact", type=Path)
    parser.add_argument("checks", type=Path, nargs="?", help="JSON array of observations to sample")
    parser.add_argument("--discover", action="store_true", help="Discover structure and styles without a token map")
    parser.add_argument("--pages", type=int, nargs="+", help="One-based pages or slides for discovery (default: first three)")
    args = parser.parse_args()
    suffix = args.artifact.suffix.lower()
    if suffix not in {".pdf", ".pptx"}:
        parser.error("Expected a .pptx or .pdf artifact")
    if args.discover:
        if args.checks is not None:
            parser.error("Use either a checks file or --discover")
        capture = {
            "version": 1, "source": {"kind": suffix[1:], "locator": args.artifact.name},
            "sections": [], "observations": [], "gaps": [],
        }
        discover = pdf_capture if suffix == ".pdf" else pptx_capture
        try:
            discover(args.artifact, args.pages, capture)
        except ValueError as exc:
            parser.error(str(exc))
        result = capture
    else:
        if args.checks is None or args.pages is not None:
            parser.error("Provide a checks file, or use --discover with optional --pages")
        checks = json.loads(args.checks.read_text(encoding="utf-8"))
        sampler = pdf_observations if suffix == ".pdf" else pptx_observations
        result = list(sampler(args.artifact, checks))
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()

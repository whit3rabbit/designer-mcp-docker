# Editing Existing Decks & Templates (OOXML)

Pick layouts first:
```bash
python scripts/thumbnail.py template.pptx template-thumbs
```
Always pass the second `prefix` argument named after the deck so grids don't overwrite `thumbnails`. Pair with `python scripts/slide_text.py template.pptx` to map content onto varied layouts.

## Unpack, Edit, Pack, Validate

```bash
python3 -c "import sys,zipfile; zipfile.ZipFile(sys.argv[1]).extractall('unpacked')" deck.pptx
python scripts/add_slide.py unpacked/ slide2.xml --after slide2.xml
# reorder / delete slides in <p:sldIdLst> in ppt/presentation.xml
python scripts/clean.py unpacked/
# edit slide content in ppt/slides/slideN.xml
(cd unpacked && rm -f ../out.pptx && zip -Xr ../out.pptx .)
python scripts/office/validate.py out.pptx --original deck.pptx
```

## Rules

- **Do all structural work (add, delete, reorder) before editing slide content.**
- **Never copy a slide file by hand** — use `add_slide.py` (or `add_slide.py deck.pptx slide2.xml -o out.pptx`; always pass `-o` to avoid in-place overwrite). Duplicated slides still reference the source's chart/SmartArt parts.
- **`python-pptx` limits:** cannot duplicate slides, collapses formatting on `text_frame.text = "..."` (assign `run.text` instead), and cannot read SVG/EMF (`add_picture` raises `UnidentifiedImageError`).
- **Legacy `.ppt`:** convert first via `python scripts/office/soffice.py --headless --convert-to pptx file.ppt`. Keep `.potx` extension on `.potx` outputs.
- **XML transforms:** parse with `defusedxml.minidom` (not `xml.etree.ElementTree`, which rewrites namespace prefixes).
- **Template slots ≠ source items:** delete unused entire groups (image + text boxes), not just text.
- **Paragraphs & text:** one `<a:p>` per list item, copy sibling `<a:pPr>`, set `b="1"` on `<a:rPr>` for headers/labels, inherit bullets from layout (never literal `•`), and add `xml:space="preserve"` on `<a:t>` for leading/trailing spaces.

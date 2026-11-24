---
name: pptx
description: "Create, edit, analyze, and convert PowerPoint (.pptx, .potx) presentations, decks, and layouts."
license: Apache-2.0. LICENSE.txt has complete terms. Rewritten to be agent/harness-agnostic.
---

# PPTX Creation, Editing & Analysis

Route by task and load only the reference you need:

| Task | Load |
|---|---|
| **Create a new deck** (`pptxgenjs`, structured themes/layouts, visual craft) | [references/create-pptxgenjs.md](references/create-pptxgenjs.md) |
| **Edit an existing `.pptx`/`.potx`** (unpack, `add_slide.py`, `clean.py`, OOXML) | [references/edit-ooxml.md](references/edit-ooxml.md) |
| **QA & render to images** (required before delivering any deck) | [references/qa.md](references/qa.md) |

When the `design-system` skill is available, research the visual direction there first (or pick a vendored template via `design_template` / `design_file`) rather than using generic palettes.

## Scripts (relative to this skill directory)

| Script | Purpose |
|---|---|
| `scripts/slide_text.py deck.pptx` | Extract all slide text, tables, charts, alt text, notes as markdown |
| `scripts/thumbnail.py deck.pptx [prefix]` | Labeled slide layout grid (always pass a deck-specific `prefix`) |
| `scripts/add_slide.py unpacked/ slide2.xml [--after slideN.xml]` | Duplicate slide/layout with full package bookkeeping (`-o out.pptx` for direct file) |
| `scripts/clean.py unpacked/` | Remove unreferenced slides, media, and rels after `<p:sldIdLst>` is final |
| `scripts/apply_theme.js` | Inject `THEME` colors/fonts into `.pptx` after `pres.writeFile()` |
| `scripts/office/validate.py deck.pptx [--original src.pptx]` | Schema, relationship, content-type, chart, and slide XML validation |
| `scripts/office/soffice.py --headless --convert-to pdf deck.pptx` | Sandboxed LibreOffice wrapper |

## Dependencies

Check before relying on a tool and install only what fails: `pptxgenjs` (npm); `python-pptx`, `Pillow`, `defusedxml`, `lxml` (pip); LibreOffice (`soffice` via `scripts/office/soffice.py`); `pdftoppm` (Poppler). Inside the `designer-mcp` plugin, `npm install` in the plugin root installs `pptxgenjs`, `jszip`, and `docx`.

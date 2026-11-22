---
name: designer-documents
description: "Create, edit, validate, and convert Word, PowerPoint, Excel, and PDF files. Use for document deliverables."
---

# Designer Documents

Five bundled sub-skills, one per format. Read the matching sub-skill and
follow it:

| Deliverable | Sub-skill |
|---|---|
| Word documents (.docx, .dotx) | [docx/SKILL.md](docx/SKILL.md) |
| Slide decks (.pptx, .potx) | [pptx/SKILL.md](pptx/SKILL.md) |
| Spreadsheets (.xlsx, .xlsm, .csv) | [xlsx/SKILL.md](xlsx/SKILL.md) |
| PDF creation, forms, merging, OCR | [pdf/SKILL.md](pdf/SKILL.md) |
| Reading PDFs from disk | [pdf-reading/SKILL.md](pdf-reading/SKILL.md) |

## Authority

The sub-skills supply file mechanics and the render-and-inspect QA loop. They
are not a design authority. When the document is a design artifact (brand
guidelines, spec deck, token workbook), style it from the locked reference in
the [design-system](../design-system/SKILL.md) skill instead of falling back
to default document styling. Script paths inside each sub-skill are relative
to that sub-skill's own directory.

## Runtimes and dependencies

The sub-skills span two runtimes. Match the runtime to the task, and do not
install everything for every job.

| Sub-skill | Create (Node.js) | Edit, inspect, validate (Python) |
|---|---|---|
| pptx | `pptxgenjs`, and `scripts/apply_theme.js` injects the theme | `python-pptx`, `Pillow`, `defusedxml`, `lxml`, LibreOffice via `scripts/office/soffice.py` |
| docx | `docx` (docx-js) | `lxml`, `defusedxml`, `validators`, LibreOffice via `scripts/office/soffice.py` |
| xlsx | none | `openpyxl`, `pandas`, `defusedxml`, `lxml`, `scripts/recalc.py` drives LibreOffice |
| pdf | none required (`pdf-lib` is the named JS alternative) | `pypdf`, `pdfplumber`, `pdf2image`, `Pillow` |
| pdf-reading | none | `pypdf`, `pdfplumber` (optional: `pypdfium2`, `pytesseract`) |

Dependencies: Python packages in the plugin root's
[requirements.txt](../../requirements.txt), npm packages in the plugin root's
[package.json](../../package.json) (`docx`, `pptxgenjs`, `jszip`), plus the
system tools (`soffice`, `pdftoppm`, `pandoc`) named in the sub-skills that
use them. Conditional npm packages are deliberately not in the manifest:
`react-icons`, `react`, `react-dom`, and `sharp` (the pptx icon recipe) and
`pdf-lib` (PDF work in JavaScript) install on demand when a require fails.
Check what is available before relying on any of it, and install only what is
missing.

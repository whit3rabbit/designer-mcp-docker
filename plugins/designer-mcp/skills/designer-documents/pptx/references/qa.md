# PPTX QA & Image Conversion (Required)

## 1. Content QA

```bash
python scripts/slide_text.py output.pptx
python scripts/slide_text.py output.pptx | grep -iE "\bx{3,}\b|lorem|ipsum|\bTODO|\[insert|this.*(page|slide).*layout"
```
Fix any leftover placeholder text or missing content before delivering.

## 2. File QA

```bash
python scripts/office/validate.py output.pptx                      # built from scratch
python scripts/office/validate.py output.pptx --original src.pptx  # built from a template
```
Always pass `--original` for template-derived decks so template-inherited XSD quirks don't mask your regressions.

## 3. Converting to Images

```bash
python scripts/office/soffice.py --headless --convert-to pdf output.pptx
rm -f slide-*.jpg
pdftoppm -jpeg -r 150 output.pdf slide
ls -1 "$PWD"/slide-*.jpg
```
On macOS without LibreOffice, export PDF via Microsoft PowerPoint (`osascript`), then `rm -f slide-*.jpg && pdftoppm -jpeg -r 150 output.pdf slide`. Re-run all commands after fixes.

## 4. Visual QA

Inspect every rendered slide image with vision/image-viewing capability (ideally a fresh second pass or separate reviewer):
- **Text overflow or cut-off at box/slide boundaries** (check first; never shrink below 14pt body / 10pt captions — cut words, widen, or split the slide).
- Overlapping elements, source/footer collisions, gaps < 0.3", margins < 0.5", or misaligned columns.
- Low-contrast text or icons; template decorations mispositioned after text replacement.
- Inconsistent title positions or chart label styles across slides of the same type; mid-word or number-unit line breaks; leftover placeholders.

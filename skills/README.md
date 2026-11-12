# Skills

`skills/designer-mcp/` is one merged, distributable agent skill. It carries the
research-first design methodology, the MCP tool docs, and six bundled
sub-skills (document toolchains plus the frontend-design craft layer). The
whole directory is COPY'd into the Docker image (`COPY skills/ ./skills/`) and
zipped at build time into the single `designer-mcp-skill.zip` served at `/skill`,
so treat every file as distributable: no secrets, no scratch material.

## Layout

| Path inside `skills/designer-mcp/` | What it is | License |
|---|---|---|
| `SKILL.md` | Primary skill: research-first design methodology + local MCP tool docs, plus routing to the sub-skills | See repo |
| `references/`, `agents/`, `evals/` | Craft references, agent interface metadata, eval harness | See repo |
| `docx/`, `pptx/`, `xlsx/`, `pdf/`, `pdf-reading/` | Document skills, rewritten to be agent/harness-agnostic and routed under designer-mcp for design decisions | Apache-2.0 (`LICENSE.txt` in each, verbatim from [anthropics/skills](https://github.com/anthropics/skills)) |
| `frontend-design/` | Implementation-craft layer for distinctive UI work, executed inside designer-mcp's research-first workflow | Apache-2.0 (`LICENSE.txt`, verbatim from upstream) |
| `requirements.txt`, `package.json` | Dependency manifests for the sub-skills' scripts | See repo |

The document skills' SKILL.md files keep their own frontmatter, so a harness
that scans nested skill files can still route by their trigger descriptions;
the top-level SKILL.md routes by path otherwise.

## Dependencies

The sub-skill scripts declare what they need instead of assuming a
preinstalled stack. They span two runtimes; match the runtime to the task:

| Sub-skill | Create (Node.js) | Edit, inspect, validate (Python) |
|---|---|---|
| pptx | `pptxgenjs`; `scripts/apply_theme.js` injects the theme | `python-pptx`, `Pillow`, `defusedxml`, `lxml`; LibreOffice via `scripts/office/soffice.py` |
| docx | `docx` (docx-js) | `lxml`, `defusedxml`, `validators`; LibreOffice via `scripts/office/soffice.py` |
| xlsx | none | `openpyxl`, `pandas`; `scripts/recalc.py` drives LibreOffice |
| pdf | none required (`pdf-lib` is the named JS alternative) | `pypdf`, `pdfplumber`, `pdf2image`, `Pillow` |
| pdf-reading | none | `pypdf`, `pdfplumber` (optional: `pypdfium2`, `pytesseract`) |

- **Python:** `pip install -r skills/designer-mcp/requirements.txt` covers
  lxml, defusedxml, validators, python-pptx, Pillow, pdf2image, pdfplumber,
  pypdf, openpyxl and pandas. Optional extras (markitdown, reportlab,
  PyMuPDF, pypdfium2, pytesseract, numpy) are commented out in the file.
- **Node:** `npm install` in `skills/designer-mcp/` installs `docx`,
  `pptxgenjs` and `jszip` for the document-creation scripts (docx-js, the
  pptxgenjs deck path, and `pptx/scripts/apply_theme.js`). Conditional npm
  packages are not in the manifest: `react-icons`, `react`, `react-dom`,
  `sharp` (the pptx icon recipe) and `pdf-lib` (PDF work in JavaScript)
  install on demand when a require fails, per the skills' check-then-install
  rule.
- **System tools:** LibreOffice (`soffice`), Poppler (`pdftoppm`) and `pandoc`
  are named in each sub-skill's Dependencies section; each script and SKILL.md
  says check-then-install, so install only what a task actually needs.

The Docker image does not preinstall these. It serves the skill for download;
the consuming agent installs what its task needs. This keeps the image lean
and preserves the offline invariant (no runtime network use).

## Licensing

The six bundled sub-skills are adapted from [Anthropic's public skills
repository](https://github.com/anthropics/skills) (docx, pptx, xlsx, pdf,
frontend-design) and reworked for this deployment. Each sub-skill directory
carries the upstream Apache-2.0 `LICENSE.txt` verbatim. (An earlier revision
of this README called them "Anthropic source-available"; the upstream license
is Apache-2.0, and the frontmatter labels now match.) The `pdf-reading`
sub-skill is a rework of the pdf skill and ships the same license text. The
designer-mcp methodology itself is adapted from Refero's MIT-licensed
`refero_skill`; see the Provenance section of its SKILL.md.

## What was changed from the source bundle

The source skills were written for Claude's own runtime (bundled skills in the
Claude Desktop/apps environment). Each SKILL.md was rewritten so any agent
harness can use them:

- **No runtime assumptions.** "Preinstalled" library notes became
  check-then-install guidance ("try the import; install only what fails").
  References to a specific product's docs/artifact surfaces became neutral
  "if your runtime offers a native document/page/slide artifact type" routing.
- **Harness-neutral inspection language.** "Read the image" / "view tool"
  phrasing became "inspect with whatever image-viewing or vision capability
  is available to you"; subagent suggestion reworded to "a separate reviewer
  (a subagent if your harness supports one, or your own second pass)".
- **No product branding.** One example referenced a specific assistant's
  brand accent; it is generalized. `comment.py` no longer defaults the DOCX
  comment author to a hardcoded name; it uses `$DOCX_COMMENT_AUTHOR` or the
  local username, with initials derived from it.
- **designer-mcp routing.** Each skill states its relationship to
  `designer-mcp`: the document skills provide file mechanics and defer design
  decisions (palette, type, layout direction) to a designer-mcp reference
  lock; `frontend-design` is the implementation-craft layer that executes
  inside the research-first workflow rather than a parallel design authority.

The document skills' technical content (OOXML gotchas, tool choices, QA
loops) is preserved as-is; only harness-specific prose was rewritten.

## Relationship between the skills

- The top-level `designer-mcp` SKILL.md is the design methodology and the
  single install point. When it is available, design decisions come from its
  research workflow (styles/components/presets research → reference lock →
  quality gate).
- `frontend-design` executes within it: craft principles for the synthesis
  and implementation phases, self-sufficient when copied out standalone.
- The document skills are delivery/inspection mechanics: decks, spec
  documents, token matrices, PDF deliverables, and the render-and-inspect
  QA loop that designer-mcp's visual workflow prescribes.

## Install

```bash
# Copy the one skill directory
cp -r skills/designer-mcp ~/.hermes/skills/

# Or from the zip the gallery serves
node scripts/package-skill.mjs
unzip dist/designer-mcp-skill.zip -d ~/.hermes/skills-src/ && \
  cp -r ~/.hermes/skills-src/skills/designer-mcp ~/.hermes/skills/
```

`scripts/package-skill.mjs` zips `skills/designer-mcp/` into
`dist/designer-mcp-skill.zip`, preserving the `skills/designer-mcp/` layout
that skill installers expect. The gallery's `/skill` route and the Dockerfile
depend on that name. Then install the script dependencies on the machine that
will run them (see Dependencies above).

# designer-mcp plugin

`plugins/designer-mcp/` is a marketplace plugin with four skills. It carries
the research-first design methodology (`design-system`, which bundles the
`design-template-authoring` sub-skill), the offline catalog and MCP setup
(`designer-mcp`), the document toolchains (`designer-documents`, which
bundles docx, pptx, xlsx, pdf, and pdf-reading), and the UI craft and SDK
layers (`designer-ui`, which bundles frontend-design and ui-sdk). The Docker
image copies the whole directory into the image, and
`scripts/package-skill.mjs` zips the four skills into the single
`designer-mcp-skill.zip` served at `/skill`, so treat every file as
distributable: no secrets, no scratch material.

## Layout

| Path | What it is | License |
|---|---|---|
| `skills/design-system/` | Primary skill: research-first design methodology, DESIGN.md capture workflow, craft references, capture scripts, evals, and the bundled `design-template-authoring/` sub-skill | See repo (sub-skill: Apache-2.0 `LICENSE.txt`) |
| `skills/designer-mcp/` | Catalog access skill: MCP server setup, tool routing, install snippets, tool evals | See repo |
| `skills/designer-mcp/install/` | Ready-made MCP registration snippets for 24 agent harnesses: config location per harness, Docker image and local-checkout variants | See repo |
| `skills/designer-mcp/references/`, `skills/designer-mcp/evals/` | Tool reference, catalog workflows, skill directory (routes and recommends the sibling skills), eval harness | See repo |
| `skills/design-system/references/`, `agents/`, `evals/` | Craft references, agent interface metadata, eval harness | See repo |
| `skills/designer-documents/` | Routing skill bundling `docx/`, `pptx/`, `xlsx/`, `pdf/`, `pdf-reading/`: file mechanics and render-and-inspect QA, design decisions come from a design-system reference lock | See repo (sub-skills: Apache-2.0 `LICENSE.txt` in each, verbatim from [anthropics/skills](https://github.com/anthropics/skills)) |
| `skills/designer-ui/` | Routing skill bundling `frontend-design/` (implementation craft executed inside design-system's research-first workflow) and `ui-sdk/` (offline docs for the `@ui-sdk/*` headless packages, searchable via `design_docs_search` / `design_docs_get`) | See repo (sub-skills: Apache-2.0 `LICENSE.txt` files) |
| `.zcode-plugin/plugin.json`, `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, `.cursor-plugin/plugin.json`, `.mcp.json` | Plugin manifests and the auto-registered Docker MCP server | See repo |
| `requirements.txt`, `package.json` | Dependency manifests for the sub-skills' scripts | See repo |

The four top-level skills carry their own `SKILL.md`, and the bundled
sub-skills keep theirs, so a harness that scans nested skill files can still
route by trigger descriptions. The top-level skills route by path otherwise.

## Manifests and install

- **ZCode.** Plugin Marketplace, Add, then paste this repo (the directory
  holding `.claude-plugin/marketplace.json`). Install `designer-mcp`. The
  `.zcode-plugin/plugin.json` manifest declares the skills and the Docker
  MCP server, so the `design_*` tools register on install.
- **Claude Code.** `claude plugin marketplace add whit3rabbit/designer-mcp-docker`
  then `claude plugin install designer-mcp@designer-mcp-docker`. The
  marketplace command also takes a path, so a checkout can install itself:
  `claude plugin marketplace add /path/to/this-repo`.
- **Codex and other harnesses.** The skills CLI discovers the four skills
  and asks which to install: `npx -y skills add whit3rabbit/designer-mcp-docker`.
  Add `--all` to install everything without prompts, or `-s <skill>` for
  one. This path copies the skill directories only, so the plugin-root
  manifests and routing eval cases stay in the repo, and the sub-skills'
  check-then-install guidance covers the rest.
- **Manual.** Grab `designer-mcp-skill.zip` from the gallery `/skill` route
  or build it with `node scripts/package-skill.mjs`. The zip contains
  `skills/<four skill directories, with the bundled sub-skills inside>`, the
  plugin-root `evals/` routing suite, and the dependency manifests at the
  zip root. Unzip it into your skills directory.

## Dependencies

The skill scripts declare what they need instead of assuming a preinstalled
stack. They span two runtimes, so match the runtime to the task:

| Skill | Create (Node.js) | Edit, inspect, validate (Python) |
|---|---|---|
| pptx | `pptxgenjs`, and `scripts/apply_theme.js` injects the theme | `python-pptx`, `Pillow`, `defusedxml`, `lxml`, LibreOffice via `scripts/office/soffice.py` |
| docx | `docx` (docx-js) | `lxml`, `defusedxml`, `validators`, LibreOffice via `scripts/office/soffice.py` |
| xlsx | none | `openpyxl`, `pandas`, and `scripts/recalc.py` drives LibreOffice |
| pdf | none required (`pdf-lib` is the named JS alternative) | `pypdf`, `pdfplumber`, `pdf2image`, `Pillow` |
| pdf-reading | none | `pypdf`, `pdfplumber` (optional: `pypdfium2`, `pytesseract`) |

- **Python:** `pip install -r plugins/designer-mcp/requirements.txt` covers
  lxml, defusedxml, validators, python-pptx, Pillow, pdf2image, pdfplumber,
  pypdf, openpyxl and pandas. Optional extras (markitdown, reportlab,
  PyMuPDF, pypdfium2, pytesseract, numpy) are commented out in the file.
- **Node:** `npm install` in `plugins/designer-mcp/` installs `docx`,
  `pptxgenjs` and `jszip` for the document-creation scripts (docx-js, the
  pptxgenjs deck path, and `pptx/scripts/apply_theme.js`). Conditional npm
  packages are not in the manifest: `react-icons`, `react`, `react-dom`,
  `sharp` (the pptx icon recipe) and `pdf-lib` (PDF work in JavaScript)
  install on demand when a require fails, per the skills' check-then-install
  rule.
- **System tools:** LibreOffice (`soffice`), Poppler (`pdftoppm`) and `pandoc`
  are named in each skill's Dependencies section, and each script and
  SKILL.md says check-then-install, so install only what a task actually
  needs.

The Docker image does not preinstall these. It serves the skills for
download, and the consuming agent installs what its task needs. This keeps
the image lean and preserves the offline invariant (no runtime network use).

## Licensing

The five document and craft skills are adapted from [Anthropic's public
skills repository](https://github.com/anthropics/skills) (docx, pptx, xlsx,
pdf, frontend-design) and reworked for this deployment. Each carries the
upstream Apache-2.0 `LICENSE.txt` verbatim. (An earlier revision
of this README called them "Anthropic source-available". The upstream license
is Apache-2.0, and the frontmatter labels now match.)

The `pdf-reading`
skill is a rework of the pdf skill and ships the same license text. The
`ui-sdk` skill is the ui-sdk package's own docs bundle under its
Apache-2.0 `LICENSE.txt`. The design-system methodology itself is adapted
from Refero's MIT-licensed `refero_skill`, and the designer-mcp catalog
layer reads public pages only. See the Provenance sections of both SKILL.md
files.

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
  is available to you". Subagent suggestion reworded to "a separate reviewer
  (a subagent if your harness supports one, or your own second pass)".
- **No product branding.** One example referenced a specific assistant's
  brand accent, and it is generalized. `comment.py` no longer defaults the
  DOCX comment author to a hardcoded name, and it uses `$DOCX_COMMENT_AUTHOR`
  or the local username, with initials derived from it.
- **design-system routing.** Each skill states its relationship to the
  plugin: the document skills provide file mechanics and defer design
  decisions (palette, type, layout direction) to a design-system reference
  lock, and `frontend-design` is the implementation-craft layer that executes
  inside the research-first workflow rather than a parallel design authority.

The document skills' technical content (OOXML gotchas, tool choices, QA
loops) is preserved as-is, and only harness-specific prose was rewritten.

## Relationship between the skills

- The `design-system` skill is the design methodology. When it is available,
  design decisions come from its research workflow (styles, components, and
  presets research, then a reference lock, then the quality gate). Its
  bundled `design-template-authoring` sub-skill scaffolds new vendored
  templates.
- `designer-mcp` owns the offline catalog: MCP setup, tool routing, and the
  install snippets. Research loops start at `design-system`, and tool
  mechanics live here.
- `designer-ui` bundles the craft and behavior layers: `frontend-design`
  executes within design-system as implementation craft (self-sufficient
  when copied out standalone), and `ui-sdk` documents the headless
  behavior/accessibility primitives.
- `designer-documents` bundles the delivery and inspection mechanics: decks,
  spec documents, token matrices, PDF deliverables, and the
  render-and-inspect QA loop that design-system's visual workflow
  prescribes.

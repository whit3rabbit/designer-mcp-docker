# Skills audit: designer-mcp bundle

- **Path:** `skills/` (1 parent skill + 7 bundled sub-skills) · **Date:** 2026-11-15 · **Auditor:** rabbit-skills-audit
- **Standard:** Anthropic Agent Skills best practices
  (https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- **Verdict (post-fix):** **PASS WITH WARNINGS**: 0 errors, 1 confirmed warning, 2 info. The one warning is a documented vendor constraint in the ui-sdk docs bundle. `audit_static.py --strict` exits 0 on all 8 skills.
- **Original verdict:** FAIL (1 error, 9 confirmed warnings, 5 info). Strict linter count before `needs_review` resolution: 1 error / 201 warnings / 15 info. The Step 6 fix pass resolved every error and confirmed warning. The fix log below records what changed and how each fix was verified.

**Regression note.** The previous audit (2026-11-10, in git history at this path) ended PASS post-fix. Since then the bundle gained the `ui-sdk/` sub-skill and the parent SKILL.md grew past the 500-line limit, so the error and most new warnings traced to that addition. Both are now resolved or accepted as documented vendor constraints.

## Cross-skill summary (post-fix)

| Skill | Verdict | Errors | Confirmed warnings | Fix applied |
|---|---|---|---|---|
| `designer-mcp` (parent) | PASS WITH WARNINGS | 0 | 0 own files (vendor aggregate attributed to `ui-sdk/`) | ST-01 restructure, ui-sdk table rows |
| `docx` | PASS | 0 | 0 | SC-05 deps line extended |
| `pptx` | PASS | 0 | 0 | n/a |
| `xlsx` | PASS | 0 | 0 | SC-05 deps line extended |
| `pdf` | PASS | 0 | 0 | n/a |
| `pdf-reading` | PASS | 0 | 0 | MD-12 description rewritten |
| `frontend-design` | PASS | 0 | 0 | n/a |
| `ui-sdk` | PASS WITH WARNINGS | 0 | 1 (accepted vendor ST-04 aggregate) | CQ-03 naming, ST-03 link, broken link |

Linter runs: one pass per skill directory (`audit_static.py --format markdown`), plus a parent pass with `--checklist`. Raw outputs kept in `/tmp/skills-audit/` (pre-fix) and `/tmp/skills-audit/post/` (post-fix, all `--strict` exit 0).

## Fix log (2026-11-15, verified)

Every fix was verified by a fresh `audit_static.py --strict` run per skill (all exit 0) plus `npm test` (all checks passed).

### ST-01 · error · Parent SKILL.md over the line limit: FIXED
- Moved the "Use Components", "Use Presets", and "Use Templates" detail blocks into a new `references/catalog-tools.md` (with a Contents section), and left a 13-line routing section in their place. Moved the registration and gallery commands into `references/mcp-tools.md` and collapsed "MCP Setup" to a 7-line pointer. Moved the Quality Gate checklist into `references/research-playbook.md` (new section, Contents entry added), and left a pointer. Body is now 452 lines (was 535). Linter: ST-01 error gone, ST-01a info headroom remains.

### ST-04 · warning · design-md-workflow.md lacks a table of contents: FIXED
- Added a `## Contents` section listing the four main headings. Linter: the only repo-authored ST-04 finding is gone. All 13 repo-authored references now carry TOCs.

### SC-05 · warning · docx Dependencies line omits Python packages: FIXED
- `docx/SKILL.md:97` now names `lxml`, `defusedxml`, and `validators` (pip) for the edit and validate scripts.

### SC-05 · warning · xlsx Dependencies line omits defusedxml: FIXED
- `xlsx/SKILL.md:113` now names `defusedxml` alongside `openpyxl`, `pandas`, `markitdown`.

### MD-12 · warning · pdf-reading second-person description: FIXED
- `pdf-reading/SKILL.md:3` is rewritten in third person ("Reads and inspects PDF files from disk..."). Trigger coverage and the pdf-skill non-goal are preserved.

### ST-03 · warning · patterns.md two levels deep in ui-sdk: FIXED
- `ui-sdk/SKILL.md:26` path 2 now links `[patterns.md](references/patterns.md)` directly. Standalone ui-sdk lint: no ST-03 findings.

### CQ-03 · warning · `design-mcp` naming inside ui-sdk SKILL.md: FIXED
- `ui-sdk/SKILL.md:17` now says `designer-mcp`. Line 23 and the parent's server name agree.

### SC-08 · warning · Broken vendored link found during re-lint: FIXED
- `ui-sdk/docs/core/README.md:14` linked `../skills/ui-sdk/SKILL.md`, which resolves to nothing in the bundle. Now `../SKILL.md`.

### ST-02 · info · ui-sdk missing from routing tables: FIXED
- Added a `ui-sdk` row to the parent SKILL.md deliverable table and the dependency table, updated `skills/README.md` ("seven bundled sub-skills", new layout row, licensing note for the ui-sdk license) and `AGENTS.md` (seven sub-skills with provenance split).

### Accepted vendor constraints (documented, not fixed)
- **ST-04 aggregate**: 138 vendored files under `ui-sdk/docs/` exceed 100 lines without a per-file Contents section (largest: `docs/react/core.md`, 8027 lines). The `llms.txt` indexes plus `design_docs_search` mitigate at catalog level. Generating TOCs would rewrite 138 vendor files wholesale for marginal gain. Accepted as a vendor constraint.
- **Vendor CQ-03**: `ui-sdk/docs/core/agents.md` says "endpoints" (6x) and "routes" (30x). Vendored prose, so accepted as shipped.
- **EV-02 · info**: `evals/evals.json` holds 12 scenarios but both recorded runs are one harness on one unnamed model. Needs real cross-model eval runs. Left as the open process item.

## Findings from the pre-fix audit

### ST-01 · error · Parent SKILL.md body exceeds 500 lines
- **Evidence:** `skills/designer-mcp/SKILL.md:1`: "535 body lines (limit 500)" (linter estimate ~6,235 tokens)
- **Why:** The whole body loads on activation. Best practice keeps SKILL.md under 500 lines and pushes detail into on-demand references.
- **Fix:** Three cuts bring it to roughly 405 lines without losing content:
  1. Collapse "MCP Setup" (lines 97 to 122) to a short pointer. `references/mcp-tools.md` already documents both servers and setup.
  2. Move the "Use Components", "Use Presets", and "Use Templates" detail blocks (lines 255 to 324) into `references/mcp-tools.md` (or a new `references/catalog-tools.md`) and keep the routing one-liners.
  3. Move the Quality Gate checklist (lines 502 to 526) into `references/research-playbook.md`, leaving one sentence plus a link.

### ST-04 · warning · Repo-authored reference lacks a table of contents
- **Evidence:** `skills/designer-mcp/references/design-md-workflow.md:1`: "214 lines, no contents section"
- **Why:** A file over 100 lines should open with a Contents section so a partial read (`head -100`) shows the full scope.
- **Fix:** Add a `## Contents` list of the file's headings right after the title. This is the only over-100-line file the repo itself authored that lacks one.

### SC-05 · warning · docx Dependencies line omits its Python packages
- **Evidence:** `skills/designer-mcp/docx/SKILL.md:97`: "`docx` (npm) · `pandoc` · LibreOffice (`soffice`) · `pdftoppm` (Poppler)."
- **Why:** The edit/validate path imports `defusedxml` (see `docx/scripts/comment.py`, `docx/scripts/office/validators/base.py`), and `lxml` plus `validators` are also required per the parent's dependency table. The sub-skill's own Dependencies line names none of them, so a standalone install of this sub-skill misses them.
- **Fix:** Extend the line to: "`docx` (npm) · `pandoc` · LibreOffice (`soffice`) · `pdftoppm` (Poppler) · `lxml`, `defusedxml`, `validators` (pip, for the edit and validate scripts) or `pip install -r ../requirements.txt`."

### SC-05 · warning · xlsx Dependencies line omits defusedxml
- **Evidence:** `skills/designer-mcp/xlsx/SKILL.md:112`: "`openpyxl`, `pandas`, `markitdown` (pip)"
- **Why:** `xlsx/scripts/office/validate.py:22` and `validators/base.py:8` import `defusedxml`, which appears only in the parent `requirements.txt`, not in this line.
- **Fix:** Change the line to "`openpyxl`, `pandas`, `markitdown`, `defusedxml` (pip)".

### MD-12 · warning · pdf-reading description is second person
- **Evidence:** `skills/designer-mcp/pdf-reading/SKILL.md:3`: "Use this skill when you need to read, inspect, or extract content from PDF files"
- **Why:** Descriptions read best in third person because they describe the skill, not address the agent. Low urgency: the "Use this skill when" pattern matches upstream Anthropic style and triggers fine in practice.
- **Fix:** `description: "Reads and inspects PDF files from disk: content inventory, text extraction, page rasterization, embedded image, attachment, table, and form-field extraction, and reading-strategy selection. Use when PDF content is not in context and must be read from disk. Do not use for PDF creation, form filling, merging, splitting, watermarking, or encryption (use the pdf skill)."`

### ST-03 · warning · ui-sdk patterns.md is reachable only two levels deep
- **Evidence:** `skills/designer-mcp/ui-sdk/references/create-component.md:30`: "[patterns.md](patterns.md) has the roles for common shapes"
- **Why:** `SKILL.md` links `create-component.md`, which alone links `patterns.md`. References should be one level deep from SKILL.md.
- **Fix:** Link it from the path 2 bullet in `ui-sdk/SKILL.md:26`: "read [references/create-component.md](references/create-component.md) and its [references/patterns.md](references/patterns.md)".

### ST-04 · warning (vendor aggregate) · 138 ui-sdk doc files over 100 lines lack a Contents section
- **Evidence:** `skills/designer-mcp/ui-sdk/docs/react/core.md:1`: "8027 lines, no contents section" (largest of 138 flagged files, all under `ui-sdk/docs/`)
- **Why:** These are vendored package docs referenced through `docs/<framework>/llms.txt` and `design_docs_search`. The llms.txt index mitigates at the catalog level, but any partial read of one huge file (core.md is over 300 KB) sees no scope.
- **Fix:** Accept as a vendor constraint, or generate per-file Contents sections at bake time (`npm run bake`) so the shipped copy differs only by the TOC block.

### CQ-03 · warning · Three names for one MCP server inside ui-sdk SKILL.md
- **Evidence:** `skills/designer-mcp/ui-sdk/SKILL.md:17`: "MCP tools (when connected to `design-mcp`)"
- **Why:** Line 23 of the same file says `designer-mcp`, the tool prefix is `design_*`, and the parent registers the server as `designer`. Rotating names invite wrong tool calls.
- **Fix:** Change line 17 to `designer-mcp`.

### EV-02 · info · No cross-model evaluation evidence
- **Evidence:** `skills/designer-mcp/evals/evals.json`: 2 recorded runs, both `model: "CLI default"` on `runner: "Codex CLI 0.154.0"`. The file's own notes say "Record every run in results[] with the model name to build cross-model evidence (EV-02)."
- **Why:** EV-01 and EV-03 are satisfied (12 scenarios, paraphrase triggers), but all evidence comes from one harness on one unnamed model.
- **Fix:** Run 2 or 3 scenarios on a second model tier or harness and append the runs to `results[]`.

### ST-02 · info · ui-sdk missing from the parent's sub-skill tables
- **Evidence:** `skills/designer-mcp/SKILL.md:180`: the "Document and Deliverable Skills" table and the dependency table (lines 201 to 207) list six sub-skills. `ui-sdk/` is mentioned only in Non-Negotiables (line 75): "the bundled `ui-sdk/` sub-skill"
- **Why:** The table is the parent's routing surface. A bundled sub-skill absent from it relies on one prose mention for discovery. Same drift in `skills/README.md` ("six bundled sub-skills") and `AGENTS.md`.
- **Fix:** Add a `ui-sdk` row to both tables and update the counts in `skills/README.md` and `AGENTS.md`.

### MD-07 · info · Non-gerund names across all eight skills
- **Evidence:** `skills/designer-mcp/SKILL.md:2`: `name: designer-mcp`
- **Why:** Gerund names are preferred but noun phrases are acceptable. Product names (`designer-mcp`, `docx`, `pptx`, `xlsx`, `pdf`) and the noun phrase `frontend-design` are all fine. No action.

## Pre-share checklist (22 items)

Core quality:

- [x] Description is specific and includes key terms (MD-14, MD-15)
- [x] Description includes what it does and when to use it (MD-09, MD-12, MD-13). One kept exception: pdf-reading MD-12.
- [x] SKILL.md body is under 500 lines (ST-01): fixed, 452 lines. ST-01a info headroom remains.
- [x] Additional details are in separate files (ST-02, ST-06)
- [x] No time-sensitive information (CQ-02): all 23 flags resolved as dated doc examples, not claims
- [x] Consistent terminology (CQ-03): parent flag dropped as false positive. One kept finding in `ui-sdk/SKILL.md:17`.
- [x] Examples are concrete (CQ-04)
- [x] File references one level deep (ST-03): parent clean. One kept finding in ui-sdk.
- [x] Progressive disclosure (ST-02, ST-04, ST-05): repo files fixed. The vendored ui-sdk docs aggregate is accepted (see fix log).

Code and scripts:

- [x] Scripts solve rather than defer (SC-01)
- [x] Error handling explicit (SC-01)
- [x] No voodoo constants (SC-02)
- [x] Required packages listed (SC-05): clean at parent level (`requirements.txt`, `package.json`, parent table). Two kept findings inside docx and xlsx.
- [x] Scripts have clear documentation (SC-03): all 40 flags dropped: flagged files are internal modules of documented entry points (for example `pdf/FORMS.md:4` documents `check_fillable_fields`)
- [x] Forward slashes only, links resolve (SC-04, SC-08): all 10 flags dropped: `pptx/scripts/apply_theme.js`, `docx/scripts/office/soffice.py`, `xlsx/scripts/recalc.py`, and every `../SKILL.md` exist, and `SKILL.md:195` states "Script paths inside each sub-skill are relative to that sub-skill's own directory."
- [x] Validation steps for critical operations (SC-06): `docx/SKILL.md:37` "## Verify the output", xlsx mandatory recalc, `references/visual-workflow.md` QA pass
- [x] Feedback loops for quality-critical tasks (WF-03): frontend-design flag dropped: its "Process: plan, review against the brief, build, critique" section contains the loop

Testing:

- [x] At least three evaluations (EV-01): 12 scenarios
- [ ] Tested across model tiers (EV-02): open process item, needs real cross-model eval runs
- [x] Real usage scenarios and paraphrase triggers (EV-03)
- [n/a] Team feedback incorporated (EV-04): solo project

## Strengths

- **Descriptions set what + when + non-goals with real trigger phrases** (MD-13, MD-15). The xlsx description even defines the negative space: "Do NOT trigger when the primary deliverable is a Word document, HTML report..."
- **Dependency honesty is systematic** (SC-05): parent manifests plus per-skill check-then-install guidance in every sub-skill, with conditional npm packages deliberately documented as on-demand.
- **Verification loops are concrete** (WF-03, SC-06): recalc mandatory for formulas, render-and-inspect QA in the document skills, and a visual QA pass in `references/visual-workflow.md`.
- **Progressive disclosure is mostly right** (ST-02): a 54-line ui-sdk SKILL.md routes a 161-file docs tree through `llms.txt` indexes and an MCP search tool, with an explicit "Don't read the whole `docs/` folder" warning.

## Not audited

- Runtime behavior, live trigger accuracy, and whether `design_docs_search` correctly serves the ui-sdk docs (static audit only, no sub-skill code was executed)
- Accuracy of the vendored ui-sdk docs against the actual `@ui-sdk/*` packages
- Content quality of the vendored `anthropics/skills` sub-skill bodies beyond the checks above (they are upstream files copied under Apache-2.0, rewritten only for harness neutrality)

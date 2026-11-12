# Skill audit: designer-mcp

- **Path:** `skills/designer-mcp/` · **Date:** 2026-11-10 · **Auditor:** rabbit-skills-audit
- **Standard:** Anthropic's official Agent Skills guidance
  (https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- **Verdict (post-fix):** **PASS** — 0 errors, 0 confirmed warnings. `audit_static.py --strict` exits 0. Info-level items are documented below; two carry process caveats (see Watch items).
- **Original verdict:** FAIL (1 error, 7 warnings, 8 info). The Step 6 improvement loop fixed every error and confirmed warning; the fix log below records what changed and how each fix was verified.

**Scope.** The bundle is one merged skill: the primary `SKILL.md` plus 11
repo-authored `references/*.md`, `evals/evals.json`, `requirements.txt`,
`package.json`, `agents/openai.yaml`, documented by `skills/README.md`; and six
nested sub-skills (`docx/`, `pptx/`, `xlsx/`, `pdf/`, `pdf-reading/`,
`frontend-design/`) adapted from anthropics/skills with verbatim Apache-2.0
`LICENSE.txt` files. Each sub-skill also lints standalone at PASS WITH WARNINGS
(0 errors each). Fixes inside adapted sub-skill files touch prose and error
handling only, per `skills/README.md:92-93` (technical OOXML content preserved).

**Method.** `audit_static.py --format markdown --checklist` before and after;
full manual reads of every authored file and all quoted evidence; a delegated
prose pass over the 11 references with spot-verification; a purpose-built
slug checker (`heading_check.py`, code-fence aware, GitHub dedup rules) for
every anchor link in all 14 markdown files touched; `py_compile` plus a
missing-file smoke test for every edited script; a `--strict` re-run after the
fix pass.

## Summary by area (post-fix)

| Area | Status | Change from first audit |
|------|--------|------------------------|
| MD (Metadata) | pass | MD-10 fixed; MD-07 kept by choice |
| ST (Structure) | pass | All ST-04 findings fixed; ST-01a info remains as headroom watch |
| CQ (Content quality) | pass | All findings fixed or softened |
| WF (Workflows) | pass | No findings, unchanged |
| SC (Scripts & code) | pass | SC-01 and SC-02 fixed and smoke-tested |
| EV (Evaluations) | info | EV-01/EV-03 pass; EV-02 remains a process item |

## Fix log (verified)

### MD-10 · error · description over the 1,024-character cap — FIXED
- Applied the 1,021-character replacement from the original report to `SKILL.md:3`. Dropped keywords (`conversion`, `spacing`, `responsive design`) remain covered by `copywriting.md` and `craft-details.md`; the dropped "Research is mandatory" sentence is enforced by the Non-Negotiables and Quality Gate sections, so no behavior change. Verified by extraction: 1,021 characters.

### CQ-03 · screens/flows contradiction in `visual-workflow.md` — FIXED
- Line 4 now reads "styles for taste, the craft references and user material for product patterns, interaction reasoning for journeys." Step 1 of Three Visual Directions (line 40) got the same treatment ("add craft references and user material"). Both now match SKILL.md:26-29 and mcp-tools.md.

### CQ-03 · `motion.md` example broke its own `transition: all` ban — FIXED
- Line 231 now lists properties explicitly: `transition: opacity 200ms var(--ease-out), transform 200ms var(--ease-out);`

### CQ-03 · ledger carried two names — FIXED
- `example-workflow.md:194` renamed to `### Decision Ledger` with a TOC anchor update and a one-line note tying it to the research-playbook template. The canonical term is now "Decision Ledger" everywhere (SKILL.md, evals.json, both references).

### CQ-02 · harness-specific tooling claims — FIXED
- `visual-workflow.md:23` Codex Desktop / `image_gen` sentence replaced with capability language ("If your runtime provides a native image-generation tool, use it when it is available"); the "Do not assume another agent can call Codex Desktop's built-in image tool" passage neutralized likewise.

### ST-04 · 17 broken Contents anchors — FIXED
- The slug checker found two more than the audit did (typography.md L11 `×` and L25 `+` slugs). All 17 fixed across mcp-tools.md (7, `_` character vs hyphen slugs), typography.md (8, duplicate-heading dedup suffixes plus two symbol slugs), craft-details.md (2), icons.md (1). Post-fix validation: 0 broken across all 14 markdown files, 325 total links checked.

### ST-04 · 7 adapted files over 100 lines lacked Contents — FIXED
- Added `## Contents` blocks (generated from real headings with slug rules) to `pdf/SKILL.md`, `pdf/FORMS.md`, `pdf/REFERENCE.md`, `pdf-reading/SKILL.md`, `pdf-reading/REFERENCE.md`, `pptx/SKILL.md`, `xlsx/SKILL.md`. Every TOC entry validated against actual heading slugs.

### SC-01 · 5 pdf scripts crashed raw on missing files — FIXED
- `check_bounding_boxes.py`, `create_validation_image.py`, `extract_form_structure.py`, `fill_fillable_fields.py`, `fill_pdf_form_with_annotations.py` now wrap their file/JSON loads in `try/except` with one-line `ERROR:` messages and exit 1. Verified: `py_compile` clean on all 8 edited scripts; smoke test prints `ERROR: fields file not found: /tmp/does-not-exist.json` and exits 1.

### SC-02 · unjustified constants — FIXED
- `pptx/scripts/thumbnail.py` (9 constants), `pptx/scripts/add_slide.py` (slide-id range), `xlsx/scripts/recalc.py` (merge-scan bound) now carry one-line justifications (e.g. "slide IDs are 32-bit signed").

### SC-05 · dependency pointer overclaimed — FIXED
- `SKILL.md` now says system tools are "named in the sub-skills that use them" instead of promising a Dependencies section that pdf, pdf-reading, and frontend-design lack.

### CQ-05 · two virtualization libraries, no default — FIXED
- `craft-details.md:329` now names virtua as the default (matching the example) with react-window as the lighter alternative.

### CQ-02 · soft time anchors — SOFTENED
- "Newer models" to "Recent models", "This is now a common AI default" to "This has become a common AI default" in anti-ai-slop.md. mcp-tools.md catalog counts carry an as-of-bake note.

### Residual nit · unrooted `scripts/` paths in mcp-tools.md — FIXED
- Added one sentence below the server table: the `scripts/` paths are rooted at the image's repository root, not the skill directory.

## New findings during the fix pass

### HYGIENE · warning · scratch directory inside the distributable skill — FIXED
- **Evidence:** `skills/designer-mcp/tmp/design_systems/` (six template packs with readme.md files) appeared mid-session and was not in the first inventory. AGENTS.md Rule 3: anything under `skills/` is COPY'd into the image and must be distributable; scratch belongs in dockerignored `tmp/`.
- **Why it matters:** `COPY skills/ ./skills/` would bake the scratch into the image. The zip packager already excludes any `tmp/` dir (`scripts/package-skill.mjs:29`), so the image and the zip would diverge.
- **Fix applied:** `.dockerignore` now excludes `skills/designer-mcp/tmp/`, matching the packager. `.gitignore` left alone: the scratch belongs to a concurrent session that should decide whether to relocate it out of `tmp/` or delete it.

### ST-01a · concurrent edits shrank the headroom — WATCH
- SKILL.md grew from 464 to 477 body lines during this audit (a concurrent session added the two-runtime dependency matrix). Still under 500; the next addition should extract a section into `references/`.

## Resolved heuristic flags (dropped, with reason)

| Flag | Location | Reason dropped |
|---|---|---|
| SC-03 | ~40 flags on `__init__.py` and `office/helpers/` / `office/validators/` modules | Package internals never referenced from prose; runnable entry scripts carry explicit run intent in their SKILL.md files. |
| SC-03 | `tmp/design_systems/**` JS and readme files | Scratch material, now excluded from both image and zip; not skill content. |
| SC-05 | `docx/scripts/office/validate.py` (`import helpers`, `import validators`) | Local sibling packages, not third-party. Real deps are covered by requirements.txt, package.json, the SKILL.md matrix, and the README matrix. |
| SC-08 | `SKILL.md:181,183` (`scripts/apply_theme.js`, `scripts/office/soffice.py`, `scripts/recalc.py`) | Sub-skill-relative paths in the dependency matrix, covered by the preamble sentence "Script paths inside each sub-skill are relative to that sub-skill's own directory" (SKILL.md:173-174). |
| SC-08 | `mcp-tools.md` server-table paths | Container-side paths under "The container ships two stdio MCP servers", now with an explicit rooting sentence. |
| CQ-05 | `anti-ai-slop.md:45` | The line states the default outright ("RULE: Default is NO cards") followed by a justification test. Default plus escape hatch, done right. |
| ST-03 orphans | `pdf/FORMS.md`, `pdf/REFERENCE.md`, `pdf-reading/REFERENCE.md`, tmp readmes | Each FORMS/REFERENCE file is referenced by its own sibling SKILL.md; the linter only scans links from the top-level SKILL.md. |

## Pre-share checklist (22 items, post-fix)

### Core quality

- [x] Description is specific with key terms (MD-14, MD-15): 1,021 characters, verified by extraction.
- [x] Description covers what and when (MD-09/12/13): third person, explicit trigger clauses.
- [x] `SKILL.md` body under 500 lines (ST-01): 477 body lines. Watch: concurrent edits are closing on the ceiling.
- [x] Additional details live in separate files (ST-02, ST-06): 11 domain-split references, 6 sub-skills.
- [x] No time-sensitive information (CQ-02): harness-specific claims neutralized; soft anchors softened; counts marked as-of-bake.
- [x] Consistent terminology (CQ-03): one name per concept (Decision Ledger), no self-contradicting examples, screens/flows scope consistent in every file.
- [x] Examples are concrete (CQ-04): templates plus filled samples in every format-prescribing file.
- [x] File references one level deep (ST-03): authored refs one level; sub-skill nesting documented and accepted.
- [x] Progressive disclosure (ST-02/04/05): all 17 references over 100 lines carry validated Contents sections; 0 broken anchors across 325 links.
- [x] Workflows have clear steps (WF-01): routing table, numbered loops, phase gates throughout.

### Code and scripts

- [x] Scripts solve rather than defer (SC-01): all 5 flagged scripts compile and handle missing/invalid input with clear errors (smoke-tested).
- [x] Error handling is explicit (SC-01): same.
- [x] No voodoo constants (SC-02): every flagged constant now carries a justification.
- [x] Required packages are listed (SC-05): manifests, SKILL.md matrix, README matrix; pointer wording corrected.
- [x] Scripts have clear documentation (SC-03): run intent stated per sub-skill; remaining flags are package internals and scratch.
- [x] No Windows paths; every linked file resolves (SC-04, SC-08): grep clean; all relative links resolve.
- [x] Validation steps for critical operations (SC-06): render-and-inspect QA loops, office validators, severity-gated QA pass.
- [x] Feedback loops included (WF-03): validate-after-build rule, Quality Gate, visual QA gate.

### Testing

- [x] At least three evaluations (EV-01): 9 scenarios in evals/evals.json.
- [ ] Tested across model tiers (EV-02): results[] still empty. Process item, info-level; see Watch items.
- [x] Real usage scenarios (EV-03): 2 paraphrase triggers, 2 negative-scope scenarios.
- [n/a] Team feedback (EV-04): solo skill, no channel yet.

## Watch items (open, non-blocking)

- **EV-02 (info):** no model has run the eval suite yet. Run the 9 scenarios on at least two tiers and append to `results[]`. This is the only checklist box not green.
- **ST-01a (info):** SKILL.md is at 477 of 500 lines with another session actively editing it. Extract the dependency matrix or deliverable routing into `references/` before the next addition.
- **Scratch relocation:** `skills/designer-mcp/tmp/design_systems/` is now image-safe and zip-safe, but per the repo convention it should move to `skills/tmp/` or be deleted once the owning session finishes.

## Strengths

- **Honest metadata (MD-13/14/16):** what, when, and precedence over generic design skills, all within the character cap.
- **True progressive disclosure (ST-02/03, CQ-01):** SKILL.md routes, references carry the detail. Every Contents anchor resolves. No filler in any file.
- **Gated workflows (WF-01/03/04):** four task modes, numbered loops, a quality gate. The QA pass classifies by severity and blocks handoff.
- **Evals beyond the minimum (EV-01/03):** 9 scenarios including paraphrase triggers and negative scope tests.
- **Dependency discipline (SC-05):** two-runtime manifests, per-sub-skill matrix, check-then-install language throughout.

## Not audited

- Runtime behavior and live trigger accuracy (static audit only; evals not executed).
- Live behavior of the `design_*` / `refero_*` MCP servers against the cache.
- Byte-level fidelity of the six adapted sub-skills against current anthropics/skills upstream; LICENSE.txt files are verbatim.
- The concurrent session's in-flight changes outside this audit's fix scope (dependency matrix content, tmp/design_systems feature work).

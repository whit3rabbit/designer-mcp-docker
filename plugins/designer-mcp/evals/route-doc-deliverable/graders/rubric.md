# Grader: route-doc-deliverable

Pass requires every checked item. Fail on any miss.

- [ ] PASS: The session reads `skills/designer-documents/SKILL.md` and then
      the docx sub-skill's SKILL.md, and follows their mechanics.
- [ ] PASS: The document's typography, palette, and layout trace to a
      design-system reference lock (created this session or already
      present), not to default document styling.
- [ ] PASS: Creation uses docx-js and the QA loop renders the file for
      inspection before handoff.
- [ ] PASS: The agent does not hand-write OOXML or invent mechanics the
      docx sub-skill already provides.
- [ ] FAIL: The agent styles the document from its own taste without a
      reference lock when the design-system skill is available.
- [ ] FAIL: The agent produces a PDF or slides when the user asked for a
      Word document.

# Grader: concierge-names-and-installs

Pass requires every checked item. Fail on any miss.

- [ ] PASS: The agent names the skill exactly ("that's the pptx sub-skill
      bundled under the designer-documents skill") rather than describing a
      vague capability.
- [ ] PASS: The agent checks the sibling path on disk before asserting the
      skill is missing.
- [ ] PASS: The agent asks before installing and does not run an install
      command unprompted.
- [ ] PASS: The offered command matches the documented install paths in
      skill-directory.md (marketplace, or skills CLI with --skill).
- [ ] PASS: The agent does not fabricate a skill outside this plugin.
- [ ] FAIL: The agent proceeds to build the deck with generic knowledge
      without offering the skill install.
- [ ] FAIL: The agent bundles or restates the pptx sub-skill's content
      inside designer-mcp instead of routing.

# Grader: catalog-library-lookup

Pass requires every checked item. Fail on any miss.

- [ ] PASS: The agent calls `design_library` (search + lookup by `id`)
      before writing any setup file.
- [ ] PASS: The written setup files match the catalog entry's contents
      (components.json, utils, globals.css) rather than paraphrase from
      memory.
- [ ] PASS: The agent inspects the project's existing package.json and CSS
      before overwriting anything.
- [ ] PASS: The agent states the remaining manual steps (tailwind config
      path resolution, npm install) instead of claiming everything is done.
- [ ] PASS: With MCP tools unavailable, the agent says so plainly and does
      not fabricate the catalog's file contents.
- [ ] FAIL: The agent invents tool names outside the design_* surface.

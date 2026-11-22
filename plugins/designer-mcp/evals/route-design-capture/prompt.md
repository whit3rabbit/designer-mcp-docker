# Route: design capture

## Query

"Capture this landing page as DESIGN.md and make a reusable starter from it."

## Setup

Fresh session with the plugin installed and the design_* MCP tools
registered. The landing page is open in a browser the agent controls.

## Expected behavior

- Routes the task to the design-system skill and follows its DESIGN.md
  workflow (references/design-md-workflow.md), not a generic summary.
- Uses the designer-mcp skill's catalog tools only when a reference is
  needed beyond the user's page.
- Produces DESIGN.md plus the companion evidence file, a shared stylesheet
  with token names, a preview, and a starter that consumes the package.
- Preserves the page's section order and content roles, and labels sampled
  values with their provenance.
- Resamples the rendered starter and reports token coverage.

## Out of scope

File-format mechanics (deck, workbook, PDF) and frontend craft execution.

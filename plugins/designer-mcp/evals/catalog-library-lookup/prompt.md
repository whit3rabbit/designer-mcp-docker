# Route: catalog library lookup

## Query

"Install shadcn in this project."

## Setup

Fresh session with the plugin installed and the design_* MCP tools
registered. The project is a Vite + React app without shadcn. This tests
the designer-mcp skill's library layer.

## Expected behavior

- Uses `design_library` for shadcn, then `design_library` for
  the install steps and the setup files with their contents, instead of
  recalling the setup from memory.
- Respects what the project already has (checks package.json and existing
  CSS before writing).
- Writes the real setup files from the catalog entry (components.json,
  utils, globals.css) and states what remains for the user to run.
- Chains into `design_kit_search` when the user next needs components
  on top, and mentions the offline import map (`design_assets`)
  when the user asks about imports without a network.
- Falls back honestly when the MCP tools are unavailable, rather than
  fabricating the catalog's file contents.

## Out of scope

Visual design direction and document deliverables.

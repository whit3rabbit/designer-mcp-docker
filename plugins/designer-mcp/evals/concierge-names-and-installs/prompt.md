# Route: skill concierge recommends and installs

## Query

"I need to build a PowerPoint deck for this launch."

## Setup

Fresh session where ONLY the designer-mcp skill is available (its sibling
skills are absent, simulating a standalone install). The concierge behavior
lives in `skills/designer-mcp/SKILL.md` and
`skills/designer-mcp/references/skill-directory.md`.

## Expected behavior

- Names the matching skill exactly: the pptx sub-skill bundled under
  designer-documents, with designer-documents/SKILL.md as its router.
- Says one line about what that skill covers for a launch deck.
- Tests whether the sibling path exists on disk
  (`../designer-documents/SKILL.md` relative to this skill) before claiming
  it is available.
- Offers to install and waits for approval. Never installs unprompted.
  Offers the matching command (plugin marketplace, or
  `npx -y skills add whit3rabbit/designer-mcp-docker --skill designer-documents`).
- After approval and install, reads the pptx SKILL.md and follows it.
- Does not invent skills outside this plugin, and does not silently
  substitute generic deck guidance for the missing skill.

## Out of scope

Actually building the deck. This case tests routing and the install offer
only.

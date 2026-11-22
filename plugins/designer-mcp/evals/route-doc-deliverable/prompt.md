# Route: document deliverable

## Query

"Turn this research summary into a polished Word document I can send to a
client."

## Setup

Fresh session with the plugin installed. A plain-text research summary is
provided in the workspace. No reference lock exists yet unless the agent
creates one.

## Expected behavior

- Routes the deliverable through the designer-documents skill to its docx
  sub-skill and follows the docx mechanics (docx-js creation,
  render-and-inspect QA with soffice and pdftoppm).
- Recognizes the document as a design artifact and either works from an
  existing design-system reference lock or runs the research workflow first
  instead of defaulting to generic document styling.
- Does not invent Word file mechanics that the docx sub-skill already
  specifies.
- Renders and inspects the result before handoff.

## Out of scope

Catalog research beyond establishing the visual direction, and PDF or
spreadsheet mechanics.

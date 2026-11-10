# Research Playbook

Depth, synthesis, and reporting detail for the Designer MCP skill. Read this
when the task needs more than a quick style lookup.

## Contents

- [Research Depth](#research-depth)
- [Style Queries](#style-queries)
- [Extraction Checklist](#extraction-checklist)
- [Synthesis](#synthesis)
  - [Visual Direction](#visual-direction)
  - [Product Pattern](#product-pattern)
  - [Journey Logic](#journey-logic)
- [Present Findings](#present-findings)
- [Decision Ledger](#decision-ledger)

## Style Queries

Good style queries:

- editorial monochrome SaaS landing page
- warm trustworthy healthcare product marketing
- premium fintech website with restrained typography
- playful creator tool landing page with vivid accents
- developer tool website with product screenshots
- luxury ecommerce editorial product page
- productivity SaaS with airy spacing
- data infrastructure website dark technical style
- Attio editorial SaaS typography
- Linear changelog dark developer tool
- shadcn monochrome design system

## Extraction Checklist

Extract from styles:

- north star / visual thesis
- typography personality and type scale
- color roles and accent discipline
- spacing density and rhythm
- layout system, section rhythm, and composition patterns
- card/button/surface treatments
- borders, shadows, radius
- elevation and depth rules
- component examples and implementation/code notes when present
- imagery, graphics, illustration, or product screenshot treatment
- media asset strategy: real asset, generated/stock asset, code-native primitive, product screenshot, or placeholder
- do/don't rules
- one memorable visual move to adapt

## Research Depth

Match depth to task risk.

For a quick visual improvement:

- 2-3 style searches
- 2-3 full styles
- 1 short synthesis

For a new landing page, brand direction, or major redesign:

- 3-5 style searches
- 3-4 full styles in one batch; use additional batches only when needed
- craft-reference research for concrete sections/components
- clear visual direction before implementation

For a product workflow:

- styles for visual language
- craft references for key states/components
- interaction reasoning for sequencing

For high-stakes or ambiguous tasks:

- search from several angles
- compare strong and unusual references
- document tradeoffs before designing

## Synthesis

Separate findings into three buckets.

### Visual Direction

From styles:

- mood
- typography
- palette
- density
- surfaces
- imagery
- distinctive details
- do/don't rules

Output example:

```text
Use a precise analytics SaaS foundation: white canvas, compact UI copy, restrained black
primary actions, thin borders, and product screenshots in framed panels. Borrow disciplined
accent use from another reference, but keep color rare.
```

### Product Pattern

From craft references and user material:

- what the interface needs to contain
- common layouts
- component patterns
- states
- copy and CTAs
- specific tactics

Output example:

```text
Pricing pages commonly put the billing toggle above plan cards, highlight one plan, and
move detailed feature comparison below. We should adapt the comparison structure but keep
the hero quieter because this product sells trust, not hype.
```

### Journey Logic

Output example:

```text
Cancellation flows usually collect a reason, offer a relevant alternative, confirm the
destructive action, then state when access ends. The best flows give a clear return path.
```

## Present Findings

Do not dump every result. Give the user a short research summary before
designing when the task is non-trivial.

Suggested format:

```text
Research summary:
- Styles reviewed: [count] across [directions]
- Craft references used: [which, if any]

Visual direction:
- [primary style foundation]
- [reference lock / signature traits to preserve]
- [borrowed detail 1]
- [borrowed detail 2]

Product patterns:
- [concrete UI decisions]

Recommendation:
- [what to design and why]
```

## Decision Ledger

Before implementation, convert research into a short decision ledger:

| Decision | Source | Source rule / role | Why |
|----------|--------|--------------------|-----|
| [palette/type/layout/media/content choice] | [style/craft reference/user constraint] | [token/component/media role to preserve] | [specific rationale] |

If a major choice has no source, do not ship it as a design decision. Either
research more, tie it to the user's constraints, or remove it.

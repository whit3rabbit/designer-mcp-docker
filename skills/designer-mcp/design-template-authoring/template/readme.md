# __NAME__ design system

TODO: one intro paragraph describing the system from the reference: what it looks like, what it is set in, and what the flagship surface is. Mention the deliberate extremes.

## How to use this

- TODO: how to link styles.css and take values from tokens.
- TODO: build with the documented classes, view source on the demo pages.
- TODO: what templates/ holds, and (for slide-first systems) that the deck starter is the layout contract for generated decks.
- TODO: where the tokens live and how to retune without drift.

## Direction

TODO: the layout grammar in two or three sentences: band or grid, divider weight, panel rules, button grammar, photography treatment.

## Color

TODO: the ground, text and accent values with their roles, the mono-scheme note if accent-2 is a stand-in, how the 100–900 ramps are meant to be used, and where ghost or divider tokens draw.

## Type

TODO: the heading and body families, weights, what carries the bold voice, and how density and radius are baked into the scales.

## Icons

TODO: the icon set (Lucide is the house default) and sizing.

## Interaction states

TODO: hover tints from the accent ramp, the focus-visible ring, selection tint, disabled opacity.

## Components

| Class | What it is | Shown in |
| --- | --- | --- |
| `.btn` with `.btn-primary`, `.btn-dark`, `.btn-ghost` | TODO: actions | components/buttons.html |
| `.tag` variants | TODO: small labels | components/buttons.html |
| `.card` with `.card-kicker`, `.card-title`, `.card-body`, `.card-meta`, plus `.panel-ink` and `.panel-accent` | TODO: cards and panels | components/cards.html |
| `.stat-num` (`.ink`), `.stat-label`, `.bar-track`, `.bar-fill` | TODO: stats and progress | components/stats.html |
| `.chip`, `.pill`, `.arch`, `.frame` | TODO: bullet chip and photo masks | components/grids.html |
| `.wordmark` (with an `i` slash, `.on-dark`) | TODO: the lockup | components/navigation.html |
| `.nav` + `.nav-links` | TODO: the header bar | components/navigation.html |
| `.table` | TODO: data tables | components/table.html |
| `.hr` | TODO: the rule | foundations/layout.html |

## Do

- TODO: the rules that keep the system itself, stated as positive instructions.

## Don't

- TODO: the anti-patterns, stated as prohibitions.

## Files

- TODO: one line per file in the folder, matching the actual tree.

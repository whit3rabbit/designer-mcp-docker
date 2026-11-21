# Deck runtime files: copy, never edit

The deck starter needs four vendored runtime files in this folder. They are
identical across every vendored system, generated in another workspace, and
the frontend build rewrites URLs inside `support.js`. Copy them byte-for-byte.

- `deck-stage.js`: the `<deck-stage>` player (navigation, thumbnail rail, print).
- `support.js`: the dc runtime that parses the `<x-dc>` document.
- `image-slot.js`: the drag-and-drop photo placeholder.
- `ds-base.js`: the styles.css and bundle loader.

Copy them from any existing vendored system:

```bash
SRC=data/design-systems/modernist/templates/deck
DST=data/design-systems/<slug>/templates/deck
cp "$SRC"/deck-stage.js "$SRC"/support.js "$SRC"/image-slot.js "$SRC"/ds-base.js "$DST"/
```

Inside the served image the same files live under
`/cache/design-systems/modernist/templates/deck/`.

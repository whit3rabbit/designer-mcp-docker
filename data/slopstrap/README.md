# Slopstrap (vendored)

Slopstrap v4.2.0 is Mike Lacher's satirical CSS and JS framework that makes any
page look hastily vibecoded by an LLM. This repo vendors it as a gallery
easter egg: a downloadable zip under `/assets`, a catalog entry under
`/components`, and live examples at `/slopstrap`.

- Source: <https://slopstrap.mikelacher.com/>
- Download: <https://slopstrap.mikelacher.com/dist/slopstrap.zip>
- Author: Mike Lacher, <https://mikelacher.com>
- License: MIT, declared in the upstream README shipped inside the zip. That
  README is kept here verbatim as `upstream-README.md`.
- Downloaded: 2026-11-23
- Modifications: none. The zip and the extracted `dist/` files are
  byte-identical to upstream.

Checksums (sha256):

- `slopstrap.zip`: `197d1842aefb52c376739c1addf629292b908cf52c4e27f0861ecff2b7bdb4af`
- `dist/slopstrap.css`: `c5270c89851aeb40c960be41a9d3341a6d22c24e9df02dbdb174dc2ba5ab7676`
- `dist/slopstrap.js`: `9f6400de68e272dcd1905cfcb4ac609d474539fdb9f42d54151cc003f7228e74`

Notes:

- The CSS and JS contain no remote URLs. The only `url()` references are
  inline `data:` SVG masks, so the framework satisfies the offline invariant
  as-is.
- Upstream docs suggest Google Fonts links for Inter, Instrument Serif, and
  JetBrains Mono. The gallery never links them. The font stacks fall back to
  system fonts, which is the intended offline rendering here.
- `examples/` holds the example HTML documents this repo authors. The catalog
  merge inlines them into the `code` fields of `component.json` variants, and
  the `/slopstrap` gallery page renders its sections from the same classes.
  To refresh the vendor copy, re-download the zip, re-extract `dist/`, and
  update the checksums above.

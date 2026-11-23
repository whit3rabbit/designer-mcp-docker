import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * slopstrap.mjs — shared loader for the vendored Slopstrap easter egg.
 *
 * data/slopstrap/component.json holds the catalog metadata. The example
 * documents live beside it as real HTML files (examples/*.html) and are
 * inlined into each variant's `code` field here, so the record matches the
 * shape the GradientDeck fetcher produces for every other component.
 */

/** Load the full detail record, inlining example HTML into variant code. */
export async function readSlopstrapRecord(root) {
  const meta = JSON.parse(await readFile(join(root, "component.json"), "utf8"));
  const variants = [];
  for (const variant of meta.variants || []) {
    const code = await readFile(join(root, variant.filename), "utf8");
    variants.push({ ...variant, code });
  }
  return { ...meta, variants };
}

/** Derive the index entry from a detail record: no code, no FAQ. */
export function slopstrapIndexEntry(record) {
  return {
    slug: record.slug,
    title: record.title,
    description: record.description,
    category: record.category,
    breadcrumb: record.breadcrumb,
    url: record.url,
    variants: (record.variants || []).map(({ code, registryDependencies, ...rest }) => rest),
  };
}

/**
 * The inline script every native preview carries: flip the html element to
 * data-preview="ready" (the readiness contract every preview honors) and
 * report height to the gallery page, which grows the frame.
 */
const READY_AND_HEIGHT_SCRIPT = `<script>
(function () {
  var root = document.documentElement;
  var send = function () {
    parent.postMessage({ source: "design-preview", type: "height", height: document.documentElement.scrollHeight }, "*");
  };
  var ready = function () {
    root.setAttribute("data-preview", "ready");
    send();
    setTimeout(send, 250);
  };
  window.addEventListener("load", ready);
  if (window.ResizeObserver) new ResizeObserver(send).observe(document.documentElement);
}());
</script>`;

/**
 * Build a self-contained preview document from an example page: the
 * framework CSS and JS are inlined so the document works in a sandboxed
 * frame, in the static site, and in the thumbnail capturer with no asset
 * resolution at all. The body content is wrapped in #preview-root and the
 * html element flips from data-preview="loading" to "ready" on load,
 * matching the contract the browser test asserts on every preview. Throws
 * when the example does not carry exactly one stylesheet link and one
 * script tag, or when the vendored files cannot be embedded safely.
 */
export function nativePreviewDocument(code, css, js) {
  if (/<\/style/i.test(css)) throw new Error("native preview: css contains a closing style tag");
  if (/<\/script/i.test(js)) throw new Error("native preview: js contains a closing script tag");
  let matched = 0;
  const inlined = code
    .replace(/[ \t]*<link[^>]*rel="stylesheet"[^>]*>\n?/, () => {
      matched += 1;
      return `<style>\n${css}\n</style>\n`;
    })
    .replace(/[ \t]*<script[^>]*\ssrc=[^>]*><\/script>\n?/, () => {
      matched += 1;
      return `<script>\n${js}\n</script>\n`;
    });
  if (matched !== 2) {
    throw new Error(`native preview needs exactly one stylesheet link and one script tag, matched ${matched}`);
  }
  const hasFlag = inlined.includes("data-preview=");
  const flagged = hasFlag ? inlined : inlined.replace(/<html(\s)/i, '<html data-preview="loading"$1');
  if (!hasFlag && flagged === inlined) {
    throw new Error("native preview: example lacks an <html> tag to flag");
  }
  const opened = flagged.replace(/(<body[^>]*>)/i, "$1\n<div id=\"preview-root\">");
  if (opened === flagged) {
    throw new Error("native preview: example lacks a <body> tag to wrap");
  }
  return opened.replace("</body>", `</div>\n${READY_AND_HEIGHT_SCRIPT}\n</body>`);
}

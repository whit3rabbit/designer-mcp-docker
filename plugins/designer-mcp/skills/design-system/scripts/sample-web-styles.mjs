// Runs against a caller-owned Playwright or Puppeteer page at its current viewport and state.
export async function sampleWebStyles(page, checks) {
  return page.evaluate(async (requested) => {
    await document.fonts.ready;
    const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
    const result = [];
    for (const { selector, property, token, pseudo } of requested) {
      const label = `${selector}${pseudo ?? ""} ${property}`;
      const nodes = document.querySelectorAll(selector);
      if (result.length + Math.max(1, nodes.length) > 1000) {
        throw new Error("More than 1,000 observations. Narrow the selectors.");
      }
      if (!nodes.length) result.push({ location: label, token, value: null });
      for (const [index, node] of nodes.entries()) {
        const style = getComputedStyle(node, pseudo ?? null);
        const value = style.getPropertyValue(property).trim() || null;
        result.push({ location: `${label} [${index + 1}]`, token, value, rootFontSize });
      }
    }
    return result;
  }, checks);
}

// Discover representative styles before the caller has decided on token names.
export async function captureWebStyles(page, { state = "current", locator } = {}) {
  return page.evaluate(async ({ state, locator }) => {
    await document.fonts.ready;
    const roles = {
      body: "canvas", header: "header", nav: "navigation", main: "main", aside: "complementary",
      footer: "footer", section: "section", article: "article", form: "form", p: "paragraph",
      a: "link", button: "button", input: "input", select: "input", textarea: "input",
      ul: "list", ol: "list", table: "table", figure: "figure", figcaption: "caption",
      img: "image", video: "video", details: "disclosure", summary: "summary",
    };
    const ariaRoles = new Set([
      "banner", "navigation", "main", "complementary", "contentinfo", "region", "article", "form",
      "search", "heading", "link", "button", "textbox", "list", "table", "figure", "img", "dialog",
    ]);
    const properties = [
      "color", "background-color", "font-family", "font-size", "font-weight", "line-height",
      "letter-spacing", "gap", "padding", "border-radius", "box-shadow",
    ];
    const root = getComputedStyle(document.documentElement);
    const scope = {
      viewport: { width: innerWidth, height: innerHeight },
      colorScheme: root.colorScheme,
      rootFontSize: Number.parseFloat(root.fontSize),
      state,
    };
    const source = { kind: "web", locator: locator ?? (/^https?:$/.test(location.protocol)
      ? location.origin + location.pathname : location.protocol) };
    const sections = [];
    const observations = [];
    const gaps = [];
    const ancestors = new Map();
    const sampled = new Set();
    const nodes = document.querySelectorAll(`${Object.keys(roles).join(",")},h1,h2,h3,h4,h5,h6,[role]`);

    function locationOf(node) {
      const parts = [];
      for (let current = node; current && current !== document.body; current = current.parentElement) {
        let index = 1;
        for (let sibling = current.previousElementSibling; sibling; sibling = sibling.previousElementSibling) {
          if (sibling.localName === current.localName) index++;
        }
        parts.unshift(`${CSS.escape(current.localName)}:nth-of-type(${index})`);
      }
      return ["body", ...parts].join(" > ");
    }

    for (const node of nodes) {
      if (!document.body?.contains(node)) continue;
      const style = getComputedStyle(node);
      if (style.visibility !== "visible" || (!node.getClientRects().length && style.display !== "contents")) continue;
      if (style.display !== "contents" && node.checkVisibility?.({ opacityProperty: true }) === false) continue;
      const tag = node.localName;
      const ariaRole = node.getAttribute("role")?.split(/\s+/).find((role) => ariaRoles.has(role));
      const heading = /^h([1-6])$/.exec(tag);
      const role = ariaRole || (heading ? "heading" : Object.hasOwn(roles, tag) && roles[tag]);
      if (!role) continue;
      if (sections.length === 150) {
        gaps.push({ location: "document", reason: "Section limit reached. Inspect the remaining sections separately." });
        break;
      }
      let parent = node.parentElement;
      while (parent && !ancestors.has(parent)) parent = parent.parentElement;
      const id = `s${sections.length + 1}`;
      const selector = locationOf(node);
      const section = { id, parentId: ancestors.get(parent) ?? null, role, location: selector };
      const level = Number(node.getAttribute("aria-level") || heading?.[1]);
      if (role === "heading" && Number.isInteger(level) && level > 0) section.level = level;
      sections.push(section);
      ancestors.set(node, id);

      const values = properties.map((property) => style.getPropertyValue(property).trim());
      const signature = JSON.stringify([role, section.level, ...values]);
      if (sampled.has(signature)) continue;
      if (observations.length + properties.length > 750) {
        if (!gaps.some(({ location }) => location === "computed styles")) {
          gaps.push({ location: "computed styles", reason: "Style limit reached. Sample remaining roles with targeted checks." });
        }
        continue;
      }
      sampled.add(signature);
      for (const [index, property] of properties.entries()) {
        if (values[index]) observations.push({
          id: `o${observations.length + 1}`, sectionId: id, location: selector,
          property, value: values[index], kind: "computed",
        });
      }
    }
    return { version: 1, source, scope, sections, observations, gaps };
  }, { state, locator });
}

/**
 * components-index.mjs — Unified cross-library Component Hub & Canonical Concept Mapper.
 *
 * Indexes every component library in the offline cache under one consistent schema:
 *   - shadcn/ui (Tailwind gallery React demos)
 *   - ReUI (87 categories / 1,264 live Radix + Base UI shadcn variants)
 *   - HyperUI (68 HTML + Tailwind categories with light/dark live demos)
 *   - HeroUI v3 (73 components + live CSS previews via baked heroui.min.css)
 *   - Mantine UI (123 live vendored React + CSS module components)
 *   - daisyUI 5 (68 components / 67 live HTML+CSS demos across 35 themes)
 *   - Base UI (37 headless React primitive docs)
 *   - GradientDeck AI (109 AI/Agent React + Tailwind + Motion + Lucide components)
 *   - Slopstrap (vendored HTML + CSS satirical framework)
 *   - 16 UI Kits (Chakra UI, Material UI, Ant Design, PrimeReact, coss ui,
 *     Magic UI, Motion Primitives, UnoCSS, Panda CSS, vanilla-extract, StyleX,
 *     Open Props, Ark UI, + 3 licence-restricted pointer kits)
 *
 * Groups overlapping primitives into canonical generic components (Button, Dialog,
 * Tabs, Accordion, Table, Card, Input, Select, Badge, Tooltip, etc.) so users can
 * either filter by a specific library OR click a generic component and switch
 * between library implementations side by side.
 */

import { hasHeroUiPreview } from "./heroui-preview.mjs";

export const LIBRARY_META = {
  gradientdeck: {
    id: "gradientdeck",
    name: "GradientDeck AI",
    short: "AI Components",
    stack: "React",
    styling: "Tailwind + Motion",
    previewable: true,
    href: "/components?lib=gradientdeck",
    summary: "109 AI, chat, agent, voice & artifact UI components using React, Tailwind, Motion, and Lucide.",
  },
  shadcn: {
    id: "shadcn",
    name: "shadcn/ui",
    short: "shadcn/ui",
    stack: "React",
    styling: "Tailwind + Radix",
    previewable: true,
    href: "/tailwind/shadcn",
    summary: "Core shadcn/ui React components rendered live from the cached offline import map.",
  },
  reui: {
    id: "reui",
    name: "ReUI (shadcn)",
    short: "ReUI",
    stack: "React",
    styling: "Tailwind + Radix / Base UI",
    previewable: true,
    href: "/reui",
    summary: "1,264 production shadcn/ui variants in 87 categories with dual Radix UI & Base UI TSX.",
  },
  heroui: {
    id: "heroui",
    name: "HeroUI v3",
    short: "HeroUI v3",
    stack: "React",
    styling: "Tailwind + React Aria",
    previewable: true,
    href: "/heroui",
    summary: "73 HeroUI v3 components, 16 guides, oklch theme tokens, and baked @heroui/styles CSS previews.",
  },
  mantine: {
    id: "mantine",
    name: "Mantine UI",
    short: "Mantine",
    stack: "React",
    styling: "CSS Modules",
    previewable: true,
    href: "/mantine",
    summary: "123 ready-made ui.mantine.dev components rendered live from vendored @mantine packages.",
  },
  daisyui: {
    id: "daisyui",
    name: "daisyUI 5",
    short: "daisyUI",
    stack: "HTML + CSS",
    styling: "Semantic Tailwind CSS (35 themes)",
    previewable: true,
    href: "/daisyui",
    summary: "68 pure HTML/CSS components with live previews across all 35 built-in themes.",
  },
  hyperui: {
    id: "hyperui",
    name: "HyperUI",
    short: "HyperUI",
    stack: "HTML + CSS",
    styling: "Tailwind CSS",
    previewable: true,
    href: "/tailwind",
    summary: "68 copy-paste Tailwind HTML marketing & application UI blocks with light/dark variants.",
  },
  baseui: {
    id: "baseui",
    name: "Base UI",
    short: "Base UI",
    stack: "React",
    styling: "Headless (Unstyled)",
    previewable: false,
    href: "/baseui",
    summary: "37 accessible, unstyled React primitives (@base-ui/react) + 42 handbook guides.",
  },
  slopstrap: {
    id: "slopstrap",
    name: "Slopstrap",
    short: "Slopstrap",
    stack: "HTML + CSS",
    styling: "Standalone CSS/JS",
    previewable: true,
    href: "/slopstrap",
    summary: "Satirical AI-slop CSS/JS framework by Mike Lacher (MIT) rendered live offline.",
  },
};

const UIKIT_STACK = {
  chakra: { stack: "React", styling: "Emotion / Panda" },
  mui: { stack: "React", styling: "Material / Emotion" },
  antd: { stack: "React", styling: "CSS-in-JS" },
  primereact: { stack: "React", styling: "CSS / PassThrough" },
  coss: { stack: "React", styling: "Tailwind + Base UI" },
  magicui: { stack: "React", styling: "Tailwind + Motion" },
  motion: { stack: "React", styling: "Tailwind + Motion" },
  ark: { stack: "React / Vue / Solid", styling: "Headless" },
  openprops: { stack: "CSS", styling: "CSS Custom Properties" },
  unocss: { stack: "CSS", styling: "Atomic CSS Engine" },
  panda: { stack: "CSS", styling: "Build-time CSS-in-JS" },
  "vanilla-extract": { stack: "CSS", styling: "Zero-runtime TS CSS" },
  stylex: { stack: "CSS", styling: "Atomic JS CSS" },
  reactbits: { stack: "React", styling: "Pointer (llms.txt)" },
  aceternity: { stack: "React", styling: "Pointer (llms.txt)" },
  twentyfirst: { stack: "React", styling: "Pointer (llms.txt)" },
};

// Canonical generic UI component taxonomy: alias -> { slug, name, category }
const CANONICAL_SPECS = [
  ["button", "Button", "Actions", ["button", "buttons", "button-group", "icon-button", "close-button", "application-buttons", "loading-button"]],
  ["dialog", "Dialog & Modal", "Overlays", ["dialog", "modal", "modals", "alert-dialog", "application-modals", "confirm-dialog"]],
  ["accordion", "Accordion", "Data Display", ["accordion", "accordions", "application-accordions", "disclosure", "collapse"]],
  ["tabs", "Tabs", "Navigation", ["tab", "tabs", "application-tabs"]],
  ["tooltip", "Tooltip", "Overlays", ["tooltip", "tooltips"]],
  ["popover", "Popover", "Overlays", ["popover", "popovers", "hover-card", "preview-card"]],
  ["drawer", "Drawer & Sheet", "Overlays", ["drawer", "drawers", "sheet", "sheets", "side-menu", "application-side-menu"]],
  ["menu", "Menu & Dropdown", "Navigation", ["menu", "dropdown", "dropdown-menu", "dropdowns", "context-menu", "menubar", "application-dropdowns", "navigation-menu"]],
  ["card", "Card", "Data Display", ["card", "cards", "marketing-cards", "article-cards", "info-cards", "application-cards"]],
  ["table", "Table & Data Grid", "Data Display", ["table", "tables", "data-table", "data-grid", "application-tables", "application-grids"]],
  ["input", "Input & Text Field", "Forms", ["input", "inputs", "text-field", "text-input", "input-group", "input-otp", "pin-input", "number-field", "number-input", "application-inputs", "search-field"]],
  ["textarea", "Textarea", "Forms", ["textarea", "text-area", "application-textareas"]],
  ["select", "Select & Combobox", "Forms", ["select", "selects", "combobox", "autocomplete", "application-selects", "listbox"]],
  ["checkbox", "Checkbox", "Forms", ["checkbox", "checkboxes", "checkbox-group", "application-checkboxes"]],
  ["radio-group", "Radio Group", "Forms", ["radio", "radio-group", "radio-groups", "application-radio-groups"]],
  ["switch", "Switch & Toggle", "Forms", ["switch", "switches", "toggle", "toggles", "toggle-group", "application-toggles", "segmented-control"]],
  ["slider", "Slider", "Forms", ["slider", "sliders", "range-slider"]],
  ["badge", "Badge & Chip", "Data Display", ["badge", "badges", "chip", "chips", "tag", "tags", "application-badges"]],
  ["avatar", "Avatar", "Data Display", ["avatar", "avatars", "avatar-group"]],
  ["alert", "Alert & Banner", "Feedback", ["alert", "alerts", "banner", "banners", "application-alerts", "marketing-announcements", "callout"]],
  ["toast", "Toast & Notification", "Feedback", ["toast", "toasts", "sonner", "snackbar", "notification", "notifications"]],
  ["progress", "Progress & Meter", "Feedback", ["progress", "progress-bar", "progress-circle", "meter", "application-progress-bars"]],
  ["skeleton", "Skeleton", "Feedback", ["skeleton", "skeletons"]],
  ["spinner", "Spinner & Loader", "Feedback", ["spinner", "loader", "loading", "application-loaders"]],
  ["breadcrumb", "Breadcrumbs", "Navigation", ["breadcrumb", "breadcrumbs", "application-breadcrumbs"]],
  ["pagination", "Pagination", "Navigation", ["pagination", "application-pagination"]],
  ["steps", "Steps & Stepper", "Navigation", ["step", "steps", "stepper", "application-steps"]],
  ["calendar", "Calendar & Date Picker", "Forms", ["calendar", "date-picker", "date-field", "date-range-picker", "time-field", "date-input"]],
  ["carousel", "Carousel", "Data Display", ["carousel", "carousels"]],
  ["timeline", "Timeline", "Data Display", ["timeline", "timelines", "application-timelines"]],
  ["fieldset", "Form & Fieldset", "Forms", ["form", "fieldset", "field", "label", "application-forms", "authentication"]],
  ["separator", "Separator & Divider", "Layout", ["separator", "divider", "dividers", "application-dividers"]],
  ["navbar", "Navbar & Header", "Layout", ["navbar", "navbars", "header", "headers", "marketing-headers", "application-headers", "navigation"]],
  ["footer", "Footer", "Layout", ["footer", "footers", "marketing-footers"]],
  ["hero", "Hero Section", "Marketing", ["hero", "heroes", "marketing-banners", "marketing-ctas"]],
  ["pricing", "Pricing", "Marketing", ["pricing", "marketing-pricing"]],
  ["stats", "Stats & KPI", "Data Display", ["stat", "stats", "application-stats", "marketing-stats"]],
  ["faq", "FAQ", "Marketing", ["faq", "faqs", "marketing-faqs"]],
  ["command", "Command Palette", "Overlays", ["command", "cmdk", "command-menu", "spotlight"]],
  ["kbd", "Keyboard Shortcut (Kbd)", "Data Display", ["kbd", "keyboard"]],
  ["link", "Link", "Navigation", ["link", "links"]],
  ["file-upload", "File Upload & Dropzone", "Forms", ["file-upload", "dropzone", "upload", "application-file-uploaders"]],
  ["rating", "Rating", "Forms", ["rating", "ratings"]],
  ["tree", "Tree View", "Data Display", ["tree", "tree-view", "treeview"]],
  ["scroll-area", "Scroll Area", "Layout", ["scroll-area", "scrollarea"]],
  ["resizable", "Resizable Panels", "Layout", ["resizable", "splitter"]],
  ["collapsible", "Collapsible", "Layout", ["collapsible"]],
  ["color-picker", "Color Picker", "Forms", ["color-picker", "color-swatch", "color-slider", "color-area", "color-field"]],
  ["empty-state", "Empty State", "Feedback", ["empty", "empty-state", "error-pages", "not-found"]],
  ["code", "Code Block", "Data Display", ["code", "code-block", "snippet", "terminal"]],
];

const ALIAS_TO_CANONICAL = new Map();
const CANONICAL_INFO = new Map();
for (const [slug, name, category, aliases] of CANONICAL_SPECS) {
  CANONICAL_INFO.set(slug, { slug, name, category });
  for (const a of aliases) ALIAS_TO_CANONICAL.set(a, slug);
}

function normSlug(raw) {
  return String(raw || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function resolveConcept(slug, name) {
  const s1 = normSlug(slug);
  if (ALIAS_TO_CANONICAL.has(s1)) return ALIAS_TO_CANONICAL.get(s1);
  const s2 = normSlug(name);
  if (ALIAS_TO_CANONICAL.has(s2)) return ALIAS_TO_CANONICAL.get(s2);
  // Strip common prefixes from hyperui/mantine
  const stripped = s1.replace(/^(application|marketing|ecommerce|neobrutalism)-/, "");
  if (ALIAS_TO_CANONICAL.has(stripped)) return ALIAS_TO_CANONICAL.get(stripped);
  const singular = stripped.replace(/s$/, "");
  if (ALIAS_TO_CANONICAL.has(singular)) return ALIAS_TO_CANONICAL.get(singular);
  return null;
}

/**
 * Build the complete cross-library component hub index.
 */
export function buildUnifiedComponentsHub({
  componentsIndex = null,
  reuiIndex = null,
  herouiCatalog = null,
  mantineCatalog = null,
  daisyuiCatalog = null,
  baseuiCatalog = null,
  uikitsIndex = null,
  uikitCatalogs = new Map(),
  tailwindShadcn = [],
  tailwindHyperui = [],
  frontend = null,
} = {}) {
  const libraries = [];
  const items = [];
  const conceptMap = new Map();

  const registerConceptImpl = (conceptSlug, impl) => {
    if (!conceptSlug) return;
    const info = CANONICAL_INFO.get(conceptSlug);
    if (!info) return;
    if (!conceptMap.has(conceptSlug)) {
      conceptMap.set(conceptSlug, {
        slug: info.slug,
        name: info.name,
        category: info.category,
        implementations: [],
        _seenLibs: new Set(),
      });
    }
    const bucket = conceptMap.get(conceptSlug);
    // Keep the strongest implementation per library (prefer live preview, exact slug match)
    if (bucket._seenLibs.has(impl.lib)) {
      const idx = bucket.implementations.findIndex((x) => x.lib === impl.lib);
      if (idx >= 0) {
        const cur = bucket.implementations[idx];
        const curScore = (cur.previewable ? 4 : 0) + (normSlug(cur.slug) === conceptSlug ? 3 : 0);
        const nextScore = (impl.previewable ? 4 : 0) + (normSlug(impl.slug) === conceptSlug ? 3 : 0);
        if (nextScore > curScore) bucket.implementations[idx] = impl;
      }
      return;
    }
    bucket._seenLibs.add(impl.lib);
    bucket.implementations.push(impl);
  };

  // 1. GradientDeck AI Components + Slopstrap (from bake/components.json)
  const gdList = (componentsIndex?.components || []).filter((c) => c.slug !== "slopstrap");
  const slopEntry = (componentsIndex?.components || []).find((c) => c.slug === "slopstrap");
  if (gdList.length) {
    libraries.push({ ...LIBRARY_META.gradientdeck, count: gdList.length });
    for (const c of gdList) {
      const name = c.breadcrumb?.split("/").at(-1)?.trim() || c.title || c.name || c.slug;
      const v0 = c.variants?.[0];
      const thumb = v0 && frontend?.thumbnailPath ? frontend.thumbnailPath(c.slug, v0.id) : null;
      const previewUrl = v0 && frontend?.previewPath ? frontend.previewPath(c.slug, v0) : null;
      const item = {
        id: `gradientdeck:${c.slug}`,
        lib: "gradientdeck",
        libName: "GradientDeck AI",
        slug: c.slug,
        name,
        category: c.category || "AI UI",
        desc: c.description || "",
        stack: "React",
        styling: "Tailwind + Motion",
        previewable: Boolean(previewUrl),
        previewUrl,
        thumb,
        href: `/component/${encodeURIComponent(c.slug)}`,
        variantCount: (c.variants || []).length,
      };
      items.push(item);
      registerConceptImpl(resolveConcept(c.slug, name), item);
    }
  }

  // 2. shadcn/ui (Tailwind gallery React demos)
  if (tailwindShadcn.length) {
    libraries.push({ ...LIBRARY_META.shadcn, count: tailwindShadcn.length });
    for (const g of tailwindShadcn) {
      const v0 = g.variants?.[0];
      const previewUrl = v0?.preview ? `/assets/${frontend?.publicManifest?.version || ""}/${v0.preview}` : null;
      const item = {
        id: `shadcn:${g.slug}`,
        lib: "shadcn",
        libName: "shadcn/ui",
        slug: g.slug,
        name: g.name,
        category: g.category || "Primitives",
        desc: `Interactive shadcn/ui ${g.name} component rendered offline from cached CDN.`,
        stack: "React",
        styling: "Tailwind + Radix",
        previewable: Boolean(previewUrl),
        previewUrl,
        thumb: g.thumbnail || null,
        href: `/tailwind/shadcn/${encodeURIComponent(g.slug)}`,
        variantCount: (g.variants || []).length,
      };
      items.push(item);
      registerConceptImpl(resolveConcept(g.slug, g.name), item);
    }
  }

  // 3. ReUI (87 categories, 1,264 live Radix + Base UI shadcn variants)
  const reuiCats = reuiIndex?.categories || [];
  if (reuiCats.length) {
    libraries.push({
      ...LIBRARY_META.reui,
      count: reuiCats.length,
      totalVariants: reuiIndex?.total || 0,
    });
    for (const c of reuiCats) {
      const firstItem = c.items?.[0]?.name || null;
      const previewUrl = firstItem && frontend?.reuiPreviewPath ? frontend.reuiPreviewPath(c.slug, firstItem) : null;
      const item = {
        id: `reui:${c.slug}`,
        lib: "reui",
        libName: "ReUI (shadcn)",
        slug: c.slug,
        name: c.label || c.slug,
        category: "shadcn / Radix + Base UI",
        desc: c.description || "",
        stack: "React",
        styling: "Tailwind + Radix / Base UI",
        previewable: Boolean(previewUrl),
        previewUrl,
        thumb: `/reui/screenshot/${encodeURIComponent(c.slug)}-dark.png`,
        href: `/reui/${encodeURIComponent(c.slug)}`,
        variantCount: c.count || 0,
      };
      items.push(item);
      registerConceptImpl(resolveConcept(c.slug, c.label), item);
    }
  }

  // 4. HeroUI v3 (73 components + live CSS previews for semantic components)
  const heroComps = herouiCatalog?.components || [];
  if (heroComps.length) {
    libraries.push({ ...LIBRARY_META.heroui, count: heroComps.length });
    for (const c of heroComps) {
      const live = hasHeroUiPreview(c.slug);
      const item = {
        id: `heroui:${c.slug}`,
        lib: "heroui",
        libName: "HeroUI v3",
        slug: c.slug,
        name: c.name,
        category: c.group || "Components",
        desc: c.description || "",
        stack: "React",
        styling: "Tailwind + React Aria",
        previewable: live,
        previewUrl: live ? `/heroui/preview/${encodeURIComponent(c.slug)}` : null,
        thumb: null,
        href: `/heroui/component/${encodeURIComponent(c.slug)}`,
        variantCount: 1,
      };
      items.push(item);
      registerConceptImpl(resolveConcept(c.slug, c.name), item);
    }
  }

  // 5. Mantine UI (123 live components)
  const mantineComps = mantineCatalog?.components || [];
  if (mantineComps.length) {
    libraries.push({ ...LIBRARY_META.mantine, count: mantineComps.length });
    for (const c of mantineComps) {
      const previewUrl = frontend?.mantinePreviewPath ? frontend.mantinePreviewPath(c.slug) : null;
      const thumb = frontend?.mantineThumbnailPath ? frontend.mantineThumbnailPath(c.slug) : null;
      const item = {
        id: `mantine:${c.slug}`,
        lib: "mantine",
        libName: "Mantine UI",
        slug: c.slug,
        name: c.name || c.title || c.slug,
        category: c.category || "Components",
        desc: c.title || "",
        stack: "React",
        styling: "CSS Modules",
        previewable: Boolean(previewUrl),
        previewUrl,
        thumb,
        href: `/mantine/component/${encodeURIComponent(c.slug)}`,
        variantCount: 1,
      };
      items.push(item);
      registerConceptImpl(resolveConcept(c.category, c.name), item);
      registerConceptImpl(resolveConcept(c.slug, c.name), item);
    }
  }

  // 6. daisyUI 5 (68 components, 35 themes)
  const daisyComps = daisyuiCatalog?.components || [];
  if (daisyComps.length) {
    libraries.push({ ...LIBRARY_META.daisyui, count: daisyComps.length });
    for (const c of daisyComps) {
      const previewUrl = frontend?.daisyuiPreviewPath ? frontend.daisyuiPreviewPath(c.slug) : null;
      const thumb = frontend?.daisyuiThumbnailPath ? frontend.daisyuiThumbnailPath(c.slug) : null;
      const item = {
        id: `daisyui:${c.slug}`,
        lib: "daisyui",
        libName: "daisyUI 5",
        slug: c.slug,
        name: c.name,
        category: c.group || "Components",
        desc: c.description || "",
        stack: "HTML + CSS",
        styling: "Tailwind CSS (35 themes)",
        previewable: Boolean(previewUrl),
        previewUrl,
        thumb,
        href: `/daisyui/component/${encodeURIComponent(c.slug)}`,
        variantCount: (daisyuiCatalog?.themes || []).length || 35,
        themes: daisyuiCatalog?.themes || [],
      };
      items.push(item);
      registerConceptImpl(resolveConcept(c.slug, c.name), item);
    }
  }

  // 7. HyperUI (68 HTML + Tailwind groups)
  if (tailwindHyperui.length) {
    libraries.push({ ...LIBRARY_META.hyperui, count: tailwindHyperui.length });
    for (const g of tailwindHyperui) {
      const v0 = g.variants?.[0];
      const previewUrl = v0?.preview ? `/assets/${frontend?.publicManifest?.version || ""}/${v0.preview}` : null;
      const item = {
        id: `hyperui:${g.slug}`,
        lib: "hyperui",
        libName: "HyperUI",
        slug: g.slug,
        name: g.name,
        category: g.category || "HTML Blocks",
        desc: `${(g.variants || []).length} copy-paste Tailwind HTML examples (light & dark).`,
        stack: "HTML + CSS",
        styling: "Tailwind CSS",
        previewable: Boolean(previewUrl),
        previewUrl,
        thumb: g.thumbnail || null,
        href: `/tailwind/hyperui/${encodeURIComponent(g.slug)}`,
        variantCount: (g.variants || []).length,
      };
      items.push(item);
      registerConceptImpl(resolveConcept(g.slug, g.name), item);
    }
  }

  // 8. Base UI (37 headless primitives)
  const baseComps = baseuiCatalog?.components || [];
  if (baseComps.length) {
    libraries.push({ ...LIBRARY_META.baseui, count: baseComps.length });
    for (const c of baseComps) {
      const item = {
        id: `baseui:${c.slug}`,
        lib: "baseui",
        libName: "Base UI",
        slug: c.slug,
        name: c.name,
        category: "Headless Primitives",
        desc: c.description || "",
        stack: "React",
        styling: "Headless",
        previewable: false,
        previewUrl: null,
        thumb: null,
        href: `/baseui/doc/components/${encodeURIComponent(c.slug)}`,
        variantCount: 1,
      };
      items.push(item);
      registerConceptImpl(resolveConcept(c.slug, c.name), item);
    }
  }

  // 9. UI Kits (Chakra, MUI, AntD, PrimeReact, coss, Magic UI, Motion Primitives, Ark, Open Props, etc.)
  for (const kitRow of uikitsIndex?.kits || []) {
    if (kitRow.error) continue;
    const cat = uikitCatalogs.get(kitRow.kit);
    const meta = UIKIT_STACK[kitRow.kit] || { stack: "React", styling: kitRow.usesTailwind ? "Tailwind" : "CSS" };
    const kitItems = cat?.items || [];
    const libId = `uikit:${kitRow.kit}`;
    libraries.push({
      id: libId,
      kit: kitRow.kit,
      name: kitRow.name,
      short: kitRow.name,
      stack: meta.stack,
      styling: meta.styling,
      previewable: kitItems.some((i) => i.previewable),
      href: `/uikits/${encodeURIComponent(kitRow.kit)}`,
      count: kitItems.length,
      kind: kitRow.kind,
      summary: kitRow.note || `${kitItems.length} baked items (${kitRow.kind || "docs"}).`,
    });
    for (const it of kitItems) {
      const previewUrl = it.previewable ? `/uikits/${encodeURIComponent(kitRow.kit)}/preview/${encodeURIComponent(it.slug)}` : null;
      const item = {
        id: `${libId}:${it.slug}`,
        lib: libId,
        libName: kitRow.name,
        slug: it.slug,
        name: it.name || it.slug,
        category: it.group || kitRow.category || "Components",
        desc: it.description || "",
        stack: meta.stack,
        styling: meta.styling,
        previewable: Boolean(previewUrl),
        previewUrl,
        thumb: null,
        href: `/uikits/${encodeURIComponent(kitRow.kit)}/item/${encodeURIComponent(it.slug)}`,
        variantCount: (it.source?.length || 0) + (it.demo?.length || 0) + (it.docs?.length || 0),
      };
      items.push(item);
      if (kitRow.kind !== "pointer") {
        registerConceptImpl(resolveConcept(it.slug, it.name), item);
      }
    }
  }

  // 10. Slopstrap (optional entry)
  if (slopEntry) {
    libraries.push({ ...LIBRARY_META.slopstrap, count: (slopEntry.variants || []).length || 4 });
  }

  // Sort canonical concepts: most library implementations first, then name
  const concepts = [...conceptMap.values()]
    .filter((c) => c.implementations.length >= 2)
    .map((c) => {
      // Order implementations: live previews first, then major libraries
      const libOrder = ["shadcn", "reui", "heroui", "mantine", "daisyui", "hyperui", "baseui", "uikit:chakra", "uikit:mui", "uikit:antd", "uikit:primereact", "uikit:ark", "uikit:coss", "uikit:magicui", "gradientdeck"];
      c.implementations.sort((a, b) => {
        if (a.previewable !== b.previewable) return a.previewable ? -1 : 1;
        const ia = libOrder.indexOf(a.lib);
        const ib = libOrder.indexOf(b.lib);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.libName.localeCompare(b.libName);
      });
      return {
        slug: c.slug,
        name: c.name,
        category: c.category,
        libCount: c.implementations.length,
        liveCount: c.implementations.filter((x) => x.previewable).length,
        implementations: c.implementations,
      };
    })
    .sort((a, b) => b.libCount - a.libCount || a.name.localeCompare(b.name));

  return {
    totals: {
      libraries: libraries.length,
      concepts: concepts.length,
      items: items.length,
    },
    libraries,
    concepts,
    items,
  };
}

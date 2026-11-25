/**
 * mcp-legacy-tools.mjs — legacy 40+ tool schemas loaded only when
 * --legacy-tools or DESIGN_LEGACY_TOOLS is enabled.
 *
 * Kept out of scripts/mcp-server.mjs so default 17-tool startup never
 * parses or allocates ~900 lines of unused schema objects.
 */

const SOURCES = ["refero", "opendesign"];
const THEMES = ["light", "dark", "mixed"];
const DOC_KINDS = ["component", "guide"];
const DOC_SECTIONS = ["core", "react", "web", "references", "skill"];
const UIKIT_IDS = [
  "chakra", "mui", "antd", "primereact", "coss", "magicui", "motion",
  "unocss", "panda", "vanilla-extract", "stylex", "openprops", "ark",
  "reactbits", "aceternity", "twentyfirst",
];
const UIKIT_KINDS = ["component", "guide", "topic", "tokens", "index"];
const UIKIT_SCHEMA = {
  type: "string",
  enum: UIKIT_IDS,
  description: "Kit id from design_uikit_list (see that tool's description for the full set).",
};
const MAX_PAGE_BYTES = 100_000;
const PAGE_PROPERTIES = {
  offset: {
    type: "integer",
    minimum: 0,
    maximum: 100_000_000,
    description: "Resume at previous nextOffset.",
  },
  maxBytes: {
    type: "integer",
    minimum: 1000,
    maximum: MAX_PAGE_BYTES,
    description: "Max bytes per reply (default 40000).",
  },
};
const OUTLINE_PROPERTIES = {
  ...PAGE_PROPERTIES,
  outline: {
    type: "boolean",
    description: "Return heading outline with byte offsets rather than full text.",
  },
  section: {
    type: "string",
    description: "Extract only this section by heading title.",
  },
};
const MAX_PRESET_IDS = 20;
const DETAIL_LEVELS = ["summary", "full"];
const DETAIL_PROPERTY = {
  type: "string",
  enum: DETAIL_LEVELS,
  description: '"summary" (default) or "full".',
};
const MAX_DOC_COMPONENTS = 5;
const DESIGN_IDENTIFIER = {
  type: "string",
  description: "Exact gallery reference (designer:<source>:<id>), cached id, site name, hostname, or URL.",
};
const DESIGN_MD_INPUT = {
  identifier: DESIGN_IDENTIFIER,
  content: { type: "string", description: "Raw DESIGN.md markdown, up to 200,000 UTF-8 bytes." },
  source: { type: "string", enum: SOURCES, description: "Disambiguate a cached identifier." },
  css: { type: "string", description: "Companion CSS text. Reads unconditional :root custom properties." },
  tokens: {
    type: "array",
    description: "Optional companion token rows from JSON or CSS. Document values take precedence for the same token path.",
    maxItems: 1000,
    items: {
      type: "object",
      properties: {
        name: { type: "string" },
        value: { type: ["string", "number"] },
        type: { type: "string", description: "Optional category, e.g. color, fontFamily, spacing, radius, shadow, or dimension." },
      },
      required: ["name", "value"],
    },
  },
};
const DESIGN_MD_ONE_INPUT_NOTE = " Pass exactly one of identifier or content.";
const STITCH_TOKEN_GROUPS = ["colors", "typography", "spacing", "rounded", "components"];
const DASHBOARD_LIST_KINDS = ["all", "stacks", "starters", "presets", "verticals", "frameworks", "references", "subskills"];
const DASHBOARD_GET_KINDS = ["stack", "starter", "preset", "vertical", "framework", "reference", "skill"];

export const LEGACY_TOOLS = [
  {
    name: "design_search",
    description:
      "Natural-language search over local design systems (Refero, OpenDesign) by vibe, industry, font, color. Runs offline.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: 'Natural-language query, e.g. "warm healthcare" or "dark developer tools".',
        },
        theme: { type: "string", enum: THEMES, description: "Filter by theme." },
        source: {
          type: "string",
          enum: SOURCES,
          description: "Filter by source: refero or opendesign.",
        },
        limit: { type: "integer", minimum: 1, maximum: 50, description: "How many results (default 10, max 50)." },
        detail: { ...DETAIL_PROPERTY, description: '"summary" (default, short palette) or "full" (every swatch with its role).' },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "design_get",
    description:
      "Resolve a gallery ref, id, site, host, or URL to full design record, color tokens, and package files.",
    inputSchema: {
      type: "object",
      properties: {
        identifier: DESIGN_IDENTIFIER,
        source: { type: "string", enum: SOURCES, description: "Restrict the lookup to one source." },
        detail: { ...DETAIL_PROPERTY, description: '"summary" (default) or "full" (adds the raw token dump).' },
      },
      required: ["identifier"],
      additionalProperties: false,
    },
  },
  {
    name: "design_package_file",
    description:
      "Read one cached OpenDesign package file (e.g. DESIGN.md, tokens.css) by relative path.",
    inputSchema: {
      type: "object",
      properties: {
        identifier: {
          type: "string",
          pattern: "^designer:opendesign:[a-z0-9-]+$",
          description: "Exact OpenDesign gallery reference, e.g. designer:opendesign:arc.",
        },
        path: { type: "string", description: "Exact relative file path from the package inventory." },
      },
      required: ["identifier", "path"],
      additionalProperties: false,
    },
  },
  {
    name: "design_claude_package",
    description:
      "Read one file from a Claude Design package (README.md, tokens.json, components) by relative path.",
    inputSchema: {
      type: "object",
      properties: {
        identifier: {
          type: "string",
          pattern: "^designer:opendesign:[a-z0-9-]+$",
          description: "Exact OpenDesign gallery reference, e.g. designer:opendesign:arc.",
        },
        path: { type: "string", description: "Exact relative file path from the package inventory." },
      },
      required: ["identifier", "path"],
      additionalProperties: false,
    },
  },
  {
    name: "design_list",
    description:
      "List designs in the local catalog, optionally filtered by theme, source, or industry.",
    inputSchema: {
      type: "object",
      properties: {
        theme: { type: "string", enum: THEMES, description: "Filter by theme." },
        source: { type: "string", enum: SOURCES, description: "Filter by source: refero or opendesign." },
        industry: { type: "string", description: "Exact industry label, as listed by design_facets." },
        limit: { type: "integer", minimum: 1, maximum: 100, description: "How many (default 25, max 100). Page with offset." },
        offset: { type: "integer", minimum: 0, maximum: 1000000, description: "How many to skip (default 0)." },
        detail: { ...DETAIL_PROPERTY, description: '"summary" (default, short palette) or "full" (every swatch with its role).' },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_facets",
    description:
      "Distribution counts across the catalog: total designs, and breakdowns by theme, source, " +
      "industry, and font.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "design_markdown",
    description:
      "The DESIGN.md for one design — the canonical, agent-readable design brief. For Refero " +
      "entries it is rendered from the cached record; for OpenDesign entries it is the original " +
      "hand-written document.",
    inputSchema: {
      type: "object",
      properties: {
        identifier: DESIGN_IDENTIFIER,
        source: { type: "string", enum: SOURCES, description: "Restrict the lookup to one source." },
      },
      required: ["identifier"],
      additionalProperties: false,
    },
  },
  {
    name: "design_component_search",
    description:
      "Search the AI component library — AI/agent React components (chat, voice, agent activity) + Slopstrap " +
      "with full source code (shadcn-style registry exports), not HeroUI, Mantine, daisyUI, or Base UI. " +
      "Filter by category or free-text query.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free-text match on name, description, category, variants." },
        category: { type: "string", description: "Component category, e.g. chat, voice, writing. Every search reply lists them all." },
        limit: { type: "integer", minimum: 1, maximum: 100, description: "Max results (default 20, max 100)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_component_get",
    description:
      "One component's record: description, install command, FAQ, and each variant's id, file, and " +
      "dependencies. Source comes from design_component_code.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Component slug, e.g. prompt-input." },
        detail: { ...DETAIL_PROPERTY, description: '"summary" (default) or "full" (inlines every variant\'s source).' },
      },
      required: ["slug"],
      additionalProperties: false,
    },
  },
  {
    name: "design_component_code",
    description:
      "The source code for one component variant. Use this when you need to copy the " +
      "implementation into a project.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Component slug, e.g. prompt-input." },
        variant: { type: "string", description: "Variant id or name. Defaults to the first variant." },
        includeCode: { type: "boolean", description: "Include the source (default true)." },
        ...PAGE_PROPERTIES,
      },
      required: ["slug"],
      additionalProperties: false,
    },
  },
  {
    name: "design_preset_search",
    description:
      "Search the preset catalogs — background gradients and patterns, liquid glass effects, " +
      "and color scales. Returns preset ids and names; use design_preset_get for the CSS.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free-text match on name, id, category." },
        kind: { type: "string", description: "Catalog to search, e.g. patterns, liquid-glass." },
        limit: { type: "integer", minimum: 1, maximum: 100, description: "Max results (default 20, max 100)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_preset_get",
    description:
      "Presets from one catalog with their CSS style and React code template, a page at a time; " +
      "pass ids from design_preset_search to fetch specific ones.",
    inputSchema: {
      type: "object",
      properties: {
        kind: { type: "string", description: "Catalog kind, e.g. patterns." },
        ids: {
          type: "array",
          items: { type: "string" },
          maxItems: MAX_PRESET_IDS,
          description: "Preset ids to return. Omit to page through the catalog.",
        },
        limit: { type: "integer", minimum: 1, maximum: 100, description: "Page size (default 20, max 100)." },
        offset: { type: "integer", minimum: 0, maximum: 100000, description: "How many to skip (default 0)." },
      },
      required: ["kind"],
      additionalProperties: false,
    },
  },
  {
    name: "design_library_search",
    description:
      "Search the vendored library catalog: common frontend libraries (react, tailwind, shadcn, " +
      "radix-ui, lucide, heroicons, motion) and font sources (google-fonts, fontsource) with the " +
      "exact files and steps needed to install each. Use design_library_get for the full entry " +
      "with file contents.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free-text match on name, id, category, summary, keywords." },
        category: { type: "string", description: "Filter by category, e.g. framework, css, components, fonts, icons." },
        limit: { type: "integer", minimum: 1, maximum: 50, description: "Max results (default 20, max 50)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_library_get",
    description:
      "One library entry in full: install steps (cli, npm, cdn), the files the setup needs with " +
      "their contents (components.json, cn helper, theme css, font wiring), and what depends on " +
      "what. This answers 'what files would I need to install X'.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Library id from design_library_search, e.g. shadcn, tailwind." },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "design_asset_list",
    description:
      "Inventory built frontend CDN assets: starter, bundled modules, Tailwind examples, and packages.",
    inputSchema: {
      type: "object",
      properties: {
        detail: { ...DETAIL_PROPERTY, description: '"summary" (default, grouped counts) or "full" (includes all 200+ vendored packages).' },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_asset_importmap",
    description:
      "Import map resolving bare module specifiers to content-addressed asset URLs for offline usage.",
    inputSchema: {
      type: "object",
      properties: {
        origin: {
          type: "string",
          description: "Gallery origin to compose absolute URLs against, e.g. http://127.0.0.1:8787. Omit for origin-relative paths under base.",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_template_list",
    description:
      "List the vendored design-system templates: seven complete, generic systems " +
      "(Swiss modernist, classical serif, dark nocturne, organic rounded, newsprint " +
      "broadsheet, blueprint industry, slide-first loam). Each entry carries swatches, " +
      "fonts, token and file counts, and its starter templates. Runs entirely offline.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Free-text match on slug, name, description, heading font.",
        },
        limit: { type: "integer", minimum: 1, maximum: 50, description: "Max results (default 20, max 50)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_template_get",
    description:
      "One design-system template in full: the theme parameters it was generated " +
      "from, every token (name, value, kind), the component class table, the " +
      "starter templates, the complete file listing, and the filled design-system " +
      "manifest. Use design_template_file to read an individual file's content.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Template slug, e.g. modernist." },
      },
      required: ["slug"],
      additionalProperties: false,
    },
  },
  {
    name: "design_template_file",
    description:
      "One text file from a design-system template: the token sheet (styles.css), " +
      "a starter landing page, the written guide (readme.md), a foundation or " +
      "component card, a theme file. The path must be listed in the template's " +
      "files[] (see design_template_get). Binary assets are refused.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Template slug, e.g. nocturne." },
        path: {
          type: "string",
          description: "Folder-relative path from files[], e.g. styles.css.",
        },
        offset: PAGE_PROPERTIES.offset,
        maxBytes: { ...PAGE_PROPERTIES.maxBytes, description: "Max bytes of text per reply (default 100000, the maximum)." },
      },
      required: ["slug", "path"],
      additionalProperties: false,
    },
  },
  {
    name: "design_manifest_template",
    description:
      "The design-system manifest JSON: the machine-readable contract for one " +
      "design system, with sections for overview/principles, colors, typography, " +
      "spacing, corner radius, shadows, components, and assets. Without arguments " +
      "returns the blank template; pass slug to get it filled from one of the " +
      "vendored design-system templates. Fill it in (or adapt a filled one) and " +
      "keep it beside the work as the token and component contract.",
    inputSchema: {
      type: "object",
      properties: {
        slug: {
          type: "string",
          description: "Optional template slug. Omit for the blank template.",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_markdown_parse",
    description:
      "Import DESIGN.md from the catalog or pasted content. Reads Refero, OpenDesign, Google Stitch, " +
      "and WebDesignHot. Returns prose, rules, typed token paths, sources, and diagnostics. Runs offline." +
      DESIGN_MD_ONE_INPUT_NOTE,
    inputSchema: {
      type: "object",
      properties: DESIGN_MD_INPUT,
      additionalProperties: false,
    },
  },
  {
    name: "design_manifest_from",
    description:
      "Seed a design-system-manifest/v1 from a catalog or pasted DESIGN.md and optional companion tokens. " +
      "Returns the fields populated from source evidence, remaining gaps, and diagnostics." +
      DESIGN_MD_ONE_INPUT_NOTE,
    inputSchema: {
      type: "object",
      properties: DESIGN_MD_INPUT,
      additionalProperties: false,
    },
  },
  {
    name: "design_markdown_render",
    description:
      "Generate Google Stitch-style DESIGN.md from named design tokens and optional Markdown guidance. " +
      "Provide values from the source artifact, retaining unresolved design decisions in prose.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Name of the design system." },
        description: { type: "string", description: "One-line summary for the document front matter." },
        tokens: {
          type: "object",
          properties: Object.fromEntries(STITCH_TOKEN_GROUPS.map((group) => [group, { type: "object" }])),
          additionalProperties: false,
          description: "Token tree keyed by colors, typography, spacing, rounded, and components.",
        },
        body: { type: "string", description: "Optional Markdown guidance with Overview, Colors, Typography, and other relevant sections." },
      },
      required: ["name", "tokens"],
      additionalProperties: false,
    },
  },
  {
    name: "design_markdown_validate",
    description:
      "Check a DESIGN.md for parse and token reference errors. Optionally compare named token paths with " +
      "observed values from a rendered webpage or document. Supply requiredTokens to check coverage of applied roles." +
      DESIGN_MD_ONE_INPUT_NOTE,
    inputSchema: {
      type: "object",
      properties: {
        ...DESIGN_MD_INPUT,
        requiredTokens: {
          type: "array",
          minItems: 1,
          maxItems: 1000,
          uniqueItems: true,
          items: { type: "string", minLength: 1 },
          description: "Applied token paths that must each have a passing observation.",
        },
        observations: {
          type: "array",
          maxItems: 1000,
          items: {
            type: "object",
            properties: {
              location: { type: "string", description: "Selector, slide/shape, page/span, or other observable location." },
              token: { type: "string", description: "Expected token path, e.g. colors.primary." },
              value: { type: ["string", "number", "null"], description: "Observed value, or null when it could not be measured." },
              rootFontSize: { type: "number", exclusiveMinimum: 0, description: "Computed root font size in CSS px, for rem comparisons." },
            },
            required: ["location", "token", "value"],
          },
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_docs_search",
    description:
      "@ui-sdk/* only — search offline ui-sdk (@ui-sdk/core, @ui-sdk/react, @ui-sdk/web) documentation and skill references by keyword or section. Not for HeroUI, Mantine, daisyUI, or Base UI (use design_{heroui,mantine,daisyui,baseui}_search).",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search keywords (e.g. 'select', 'dialog', 'webmcp', 'roving focus'). Omit to list docs." },
        section: { type: "string", enum: DOC_SECTIONS, description: "Filter to one doc section." },
        limit: { type: "integer", minimum: 1, maximum: 100, description: "Max results (default 20, max 100)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_docs_get",
    description:
      "Read an offline ui-sdk documentation page or skill reference by path (from design_docs_search, e.g. 'docs/react/components/select.md' or 'docs/web/llms.txt').",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Relative doc path inside the ui-sdk bundle." },
        ...OUTLINE_PROPERTIES,
      },
      required: ["path"],
      additionalProperties: false,
    },
  },
  {
    name: "design_heroui_list_components",
    description:
      "List the offline HeroUI v3 (@heroui/react) catalog: every component with a description and group, the guide index, and the baked versions.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "design_heroui_search",
    description:
      "Search the offline HeroUI v3 catalog of components and guides by keyword (e.g. 'date picker', 'toast', 'theming').",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search keywords. Omit to list everything." },
        kind: { type: "string", enum: DOC_KINDS, description: "Filter to components or guides." },
        limit: { type: "integer", minimum: 1, maximum: 100, description: "Max results (default 20, max 100)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_heroui_get_docs",
    description:
      "Read HeroUI v3 component docs (examples, props, anatomy, accessibility) for @heroui/react components.",
    inputSchema: {
      type: "object",
      properties: {
        components: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
          maxItems: MAX_DOC_COMPONENTS,
          description: "Up to 5 component names in PascalCase or kebab-case (e.g. 'Button', 'date-picker').",
        },
        ...OUTLINE_PROPERTIES,
      },
      required: ["components"],
      additionalProperties: false,
    },
  },
  {
    name: "design_heroui_get_guide",
    description:
      "Read a HeroUI v3 guide (theming, styling, composition, dark-mode, animation, etc.).",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Guide slug ('theming-for-agents') or catalog path ('guides/theming.md')." },
        ...OUTLINE_PROPERTIES,
      },
      required: ["path"],
      additionalProperties: false,
    },
  },
  {
    name: "design_heroui_get_source",
    description:
      "Read HeroUI v3 component TSX source from the pinned upstream tag.",
    inputSchema: {
      type: "object",
      properties: {
        component: { type: "string", description: "Component name (e.g. 'Button' or 'date-picker')." },
        includeStories: { type: "boolean", description: "Also return the large *.stories.tsx demos (default false)." },
      },
      required: ["component"],
      additionalProperties: false,
    },
  },
  {
    name: "design_heroui_get_styles",
    description:
      "Read @heroui/styles CSS for one component: BEM classes, variants, and states.",
    inputSchema: {
      type: "object",
      properties: {
        component: { type: "string", description: "Component name (e.g. 'Button' or 'date-picker')." },
      },
      required: ["component"],
      additionalProperties: false,
    },
  },
  {
    name: "design_heroui_get_theme_variables",
    description:
      "Read the default HeroUI v3 theme variables and design tokens (oklch color space) for light and dark modes, the base for custom themes.",
    inputSchema: {
      type: "object",
      properties: {
        part: { type: "string", description: "Optional filter by token part (e.g. 'colors', 'layout', 'base')." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_heroui_migration_guide",
    description:
      "HeroUI v2-to-v3 migration guides ('index' lists them; or pass a slug like 'styling', 'button').",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "'index' or a migration guide slug." },
        ...OUTLINE_PROPERTIES,
      },
      required: ["name"],
      additionalProperties: false,
    },
  },
  {
    name: "design_mantine_list_components",
    description:
      "List the offline Mantine UI catalog (ui.mantine.dev): every ready-made component with title and category, the category tree, and the vendored @mantine package versions the live previews run on.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "design_mantine_search",
    description:
      "Search the offline Mantine UI catalog of ready-made components by keyword (e.g. 'navbar', 'table', 'carousel', 'stats').",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search keywords. Omit to list everything." },
        category: { type: "string", description: "Filter to one category slug (e.g. 'navbars', 'stats')." },
        limit: { type: "integer", minimum: 1, maximum: 100, description: "Max results (default 20, max 100)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_mantine_get_component",
    description:
      "Read a Mantine ready-made component: full source (TSX + CSS module), packages, and preview availability.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Component slug, e.g. 'article-card', 'navbar-nested', 'user-button'." },
      },
      required: ["slug"],
      additionalProperties: false,
    },
  },
  {
    name: "design_daisyui_list_components",
    description:
      "List offline daisyUI 5 catalog: components, groups, compiled CSS version, and themes.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "design_daisyui_search",
    description:
      "Search the offline daisyUI catalog by keyword (e.g. 'dropdown', 'chat bubble', 'table zebra', 'btn-primary'). Matches names, groups, descriptions and class names.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search keywords. Omit to list everything." },
        group: { type: "string", description: "Filter to one group (e.g. 'Actions', 'Data input', 'Navigation')." },
        limit: { type: "integer", minimum: 1, maximum: 100, description: "Max results (default 20, max 100)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_daisyui_get_component",
    description:
      "Read one daisyUI component: class names by category, syntax, example HTML, and usage rules.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Component slug, e.g. 'button', 'modal', 'chat', 'range'." },
      },
      required: ["slug"],
      additionalProperties: false,
    },
  },
  {
    name: "design_style_list",
    description: "List the offline Refero Styles catalog: per-site design profiles with palette, fonts, counts.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer", minimum: 1, maximum: 200, description: "Max rows (default 40)." },
        offset: { type: "integer", minimum: 0, maximum: 100000000, description: "Row offset: the previous reply's nextOffset." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_style_search",
    description: "Search Refero Styles: names, domains, descriptions, fonts, palette colors.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search keywords. Omit to list everything." },
        limit: { type: "integer", minimum: 1, maximum: 200, description: "Max results (default 20)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_style_get",
    description: "Read one Refero style profile in full; the markdown export is design_style_get_md.",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Style uuid." },
      },
      required: ["uuid"],
      additionalProperties: false,
    },
  },
  {
    name: "design_style_get_md",
    description: "Read a Refero style's DESIGN.md export, paged.",
    inputSchema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "Style uuid." },
        ...OUTLINE_PROPERTIES,
      },
      required: ["uuid"],
      additionalProperties: false,
    },
  },
  {
    name: "design_baseui_list_components",
    description:
      "List offline Base UI docs catalog: headless components, guides, release version, and licence.",
    inputSchema: {
      type: "object",
      properties: {
        kind: { type: "string", enum: ["components", "guides", "all"], description: "Filter to components, guides, or all (default all)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_baseui_search",
    description:
      "Search the offline Base UI docs catalog of components and guides by keyword (e.g. 'dialog', 'form', 'animation', 'rtl').",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search keywords. Omit to list everything." },
        kind: { type: "string", enum: DOC_KINDS, description: "Filter to components or guides (guides cover overview, handbook and utilities)." },
        limit: { type: "integer", minimum: 1, maximum: 100, description: "Max results (default 20, max 100)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_baseui_get_docs",
    description:
      "Read Base UI component docs (examples, anatomy, props, accessibility) for @base-ui/react components.",
    inputSchema: {
      type: "object",
      properties: {
        components: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
          maxItems: MAX_DOC_COMPONENTS,
          description: "Up to 5 component names in PascalCase, kebab-case or plain English (e.g. 'Dialog', 'alert-dialog', 'Number Field').",
        },
        ...OUTLINE_PROPERTIES,
      },
      required: ["components"],
      additionalProperties: false,
    },
  },
  {
    name: "design_baseui_get_guide",
    description:
      "Read a Base UI guide: handbook (styling, animation, forms), utilities, or overview.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Guide slug ('styling'), a section path ('handbook/styling'), or a catalog path ('handbook/styling.md').",
        },
        ...OUTLINE_PROPERTIES,
      },
      required: ["path"],
      additionalProperties: false,
    },
  },
  {
    name: "design_uikit_list",
    description:
      "List the offline UI kits layer (16 kits). Without kit: list all kits. With kit: that kit's items, paged.",
    inputSchema: {
      type: "object",
      properties: {
        kit: { ...UIKIT_SCHEMA, description: "A kit id to list its items instead of the kit index." },
        limit: { type: "integer", minimum: 1, maximum: 500, description: "Max items (default 150)." },
        offset: { type: "integer", minimum: 0, maximum: 100000000, description: "Item offset: the previous reply's nextOffset." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_uikit_search",
    description:
      "Search the offline UI kits layer by keyword across every kit, or inside one kit. Kits and their items are listed by design_uikit_list.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search keywords. Omit to list everything." },
        kit: { ...UIKIT_SCHEMA, description: "Narrow to one kit." },
        kind: { type: "string", enum: UIKIT_KINDS, description: "Filter by item kind (component, guide, topic, tokens, index)." },
        limit: { type: "integer", minimum: 1, maximum: 100, description: "Max results (default 20, max 100)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_uikit_get_docs",
    description:
      "Read one UI kit item's markdown doc page offline. Pointer kits return their llms.txt index only.",
    inputSchema: {
      type: "object",
      properties: {
        kit: UIKIT_SCHEMA,
        item: { type: "string", description: "Item slug from design_uikit_list or design_uikit_search." },
        path: { type: "string", description: "Specific doc path to read if the item has multiple docs." },
        ...OUTLINE_PROPERTIES,
      },
      required: ["kit", "item"],
      additionalProperties: false,
    },
  },
  {
    name: "design_uikit_get_source",
    description:
      "Read one UI kit item's code offline (demos, component source, CSS tokens, or baked files).",
    inputSchema: {
      type: "object",
      properties: {
        kit: UIKIT_SCHEMA,
        item: { type: "string", description: "Item slug from design_uikit_list or design_uikit_search." },
        path: { type: "string", description: "File to read, as listed by the item ('demo/base.tsx') or any baked path ('registry/accordion.json')." },
        ...PAGE_PROPERTIES,
      },
      required: ["kit", "item"],
      additionalProperties: false,
    },
  },
  {
    name: "design_dashboards_list",
    description:
      "List designer-dashboards stacks, starters, presets, verticals, frameworks, references, sub-skills.",
    inputSchema: {
      type: "object",
      properties: {
        kind: { type: "string", enum: DASHBOARD_LIST_KINDS, description: "Category filter (default 'all')." },
        query: { type: "string", description: "Keyword filter. Omit to list a whole category." },
        limit: { type: "integer", minimum: 1, maximum: 100, description: "Max matches (default 20, max 100)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_dashboards_get",
    description:
      "Read a designer-dashboards stack, starter, preset, vertical, framework kit, reference, or sub-skill offline.",
    inputSchema: {
      type: "object",
      properties: {
        kind: { type: "string", enum: DASHBOARD_GET_KINDS, description: "Artifact kind." },
        id: { type: "string", description: "Id from design_dashboards_list." },
        path: { type: "string", description: "Optional relative file path inside a framework kit or starter." },
        ...PAGE_PROPERTIES,
      },
      required: ["kind", "id"],
      additionalProperties: false,
    },
  },
  {
    name: "design_picks",
    description:
      "Read or manage items sent from the gallery's 'Send to MCP' button (picks queue). Use when the user asks to use what they picked in the browser.",
    annotations: { readOnlyHint: false, idempotentHint: false, destructiveHint: false, openWorldHint: false },
    inputSchema: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["list", "add", "remove", "clear"], description: "Queue action (default 'list')." },
        ref: { type: "string", description: "Canonical designer:<kind>:<id> ref (for add/remove)." },
        label: { type: "string", description: "Human label (for add)." },
        note: { type: "string", description: "Optional user note (for add)." },
        resolve: { type: "boolean", description: "Also resolve each pick into a compact summary (default false)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "design_resolve",
    description:
      "Resolve any canonical designer:<kind>:<id> reference (from 'Send to MCP' or gallery) into a compact summary and follow-up tool hints.",
    inputSchema: {
      type: "object",
      properties: {
        ref: { type: "string", description: "Canonical reference, e.g. designer:opendesign:arc, designer:heroui:button, designer:daisyui:card?theme=nord." },
      },
      required: ["ref"],
      additionalProperties: false,
    },
  },
];

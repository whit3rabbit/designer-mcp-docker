---
name: heroui-migration
description: "HeroUI v2 to v3 migration guide for upgrading components and adapting to breaking changes."
metadata:
  author: heroui
  version: "2.0.0"
  status: preview
---

# HeroUI v2 to v3 Migration Guide

This skill helps agents migrate HeroUI v2 applications to v3. HeroUI v3 introduces breaking changes: compound components, no Provider, Tailwind v4, and removed hooks.

Adapted from HeroUI's official agent skills (Apache-2.0) for fully offline use inside the designer-mcp plugin: the guides are read from the baked layer, never fetched.

---

## Offline Sources

The migration guides come from the baked designer-mcp layer (`<cache>/heroui/migration`, pinned to an upstream tag). Set `HEROUI_MIGRATION_DIR` to override, or register the designer-mcp MCP server and use the `design_kit_docs` tool.

---

## CRITICAL: Always Read Migration Docs Before Applying

**Do NOT assume v2 patterns work in v3.** Always read migration guides before implementing changes.

### Key v2 → v3 Changes

| Feature       | v2 (Migrate From)          | v3 (Migrate To)                        |
| ------------- | -------------------------- | -------------------------------------- |
| Provider      | `<HeroUIProvider>` required | **No Provider needed**                 |
| Component API | Flat props: `<Card title="x">` | Compound: `<Card><Card.Header>`      |
| Event handlers | `onClick`                 | `onPress`                              |
| Styling       | `classNames` prop         | `className` prop                       |
| Hooks         | `useSwitch`, `useDisclosure`, etc. | Compound components, `useOverlayState` |
| Packages      | `@heroui/system`, `@heroui/theme` | `@heroui/react`, `@heroui/styles` |

---

## Accessing Migration Documentation

**For migration details, examples, and step-by-step guides, always read the guides from the offline sources:**

### Using Scripts

```bash
# List all available migration guides
node scripts/list_migration_guides.mjs

# Get main migration workflow (full or incremental)
node scripts/get_migration_guide.mjs full
node scripts/get_migration_guide.mjs incremental

# Get component-specific migration guides
node scripts/get_component_migration_guides.mjs button
node scripts/get_component_migration_guides.mjs button card modal

# Get styling migration guide
node scripts/get_styling_migration_guide.mjs

# Get hooks migration guide
node scripts/get_hooks_migration_guide.mjs
```

### MCP Tool

When the designer-mcp MCP server is registered, `design_kit_docs` serves the same guides: `{"name": "index"}` lists them, `{"name": "agent-guide-full"}`, `{"name": "styling"}`, `{"name": "hooks"}`, or a component slug like `{"name": "button"}` reads one.

---

## Migration Strategies

### Full Migration

- Best for: Projects that can dedicate focused time, and teams comfortable with temporarily broken code
- Migrate all component code first (project broken during migration)
- Switch dependencies to v3
- Complete styling migration

### Incremental Migration

- Best for: Projects that must stay functional, or large codebases migrating gradually
- Set up coexistence (pnpm aliases or component packages)
- Migrate components one-by-one
- Both v2 and v3 coexist during migration

**Always read the agent guide before starting:** `node scripts/get_migration_guide.mjs full` or `incremental`

---

## Core Principles

1. **Read first**: Use scripts or MCP tools to get migration guides before applying changes
2. **Compound components**: v3 uses `Card.Header`, `Card.Title`, `Button` with children, not flat props
3. **No Provider**: Remove `HeroUIProvider` when migrating
4. **onPress not onClick**: All interactive components use `onPress`
5. **Workflow**: Analyze → Migrate components → Switch deps → Styling migration

---

## Migration Workflow Summary

1. Create migration branch
2. Analyze project (HeroUI imports, component usage)
3. Read the main guide: `node scripts/get_migration_guide.mjs full`
4. Migrate components in batches (read component guides per batch)
5. Switch dependencies to v3
6. Read the styling guide: `node scripts/get_styling_migration_guide.mjs`
7. Apply styling updates

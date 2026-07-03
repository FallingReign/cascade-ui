# AGENTS.md — cascade-ui

Project-intrinsic knowledge for AI agents working on this repository.

---

## What This Repo Is

`cascade-ui` is a **shadcn source registry** (GitHub-hosted, no deploy needed).  
It ships a shared design system — theme tokens and Cascade-specific composite components — consumed
by the Cascade app and any future clients via `npx shadcn@latest add FallingReign/cascade-ui/<item>`.

**It does NOT re-host stock shadcn primitives.** Button, Card, Input, etc. are consumed from
`@shadcn` directly in the Cascade app.

---

## Stack

- **Vite 8 + React 19 + TypeScript 6**
- **Tailwind v4** with `@theme inline` token blocks
- **shadcn** style: `radix-nova` (neutral, dark-capable)
- **Lucide** icon library
- Font: `Geist Variable`

---

## Repository Layout

```
registry.json              ← ROOT source registry (the only file consumers care about)
registry/
  ui/
    file-tree.tsx          ← source for each registry:ui item
public/r/                  ← built output (committed; re-run `npx shadcn@latest build` when changed)
  registry.json
  cascade-theme.json
  file-tree.json
src/
  components/ui/           ← local copies of registry sources for the Vite preview only
  App.tsx                  ← preview page — render each component here
  index.css                ← Tailwind v4 + CSS variable tokens
components.json            ← shadcn project config (style, aliases, icon library)
```

---

## Key Commands

```bash
npm install                                        # install deps
npm run dev                                        # Vite preview (hot-reload component harness)
npm run build                                      # typecheck + Vite production build
npx shadcn@latest build                            # build registry → public/r/
npx shadcn@latest registry validate registry.json # validate registry
npm run typecheck                                  # tsc --noEmit only
```

Always run both validate and build after editing `registry.json` or any registry source file.
Always commit the built `public/r/` output alongside source changes.

---

## Theme Decision

**Base preset:** `nova` (neutral palette, radix primitives)  
**Customisations applied to `cascade-theme` registry item:**

| Token | Light | Dark | Reason |
|---|---|---|---|
| `background` | `oklch(0.99 0 0)` | `oklch(0.13 0.008 258)` | Near-white / near-black with subtle cool tint |
| `radius` | `0.375rem` | — | Crisper feel than nova's 0.625rem |
| `muted-foreground` | `oklch(0.52 0.01 258)` | `oklch(0.63 0.008 260)` | Good contrast for secondary text |
| Sidebar tokens | Cool-neutral tint | Darker panel variant | IDE panel aesthetics |

Dark mode works via the `.dark` class selector (add to `<html>` or `<body>`).

---

## Registry Items

| Name | Type | File | Description |
|---|---|---|---|
| `cascade-theme` | `registry:theme` | *(cssVars only, no files)* | Design tokens for light + dark |
| `file-tree` | `registry:ui` | `registry/ui/file-tree.tsx` | Recursive collapsible file navigator |

### `registryDependencies` rule

- Bare names (`"scroll-area"`, `"collapsible"`) → official shadcn primitives. ✅
- Same-repo items → `"FallingReign/cascade-ui/<name>"` (never bare). ✅
- External GitHub → `"owner/repo/item-name"`. ✅

---

## How to Add a New Registry Item

1. Create the source under `registry/ui/<name>.tsx` (or `registry/blocks/`).
   - Only import from: `react`, npm packages listed in `dependencies`, official shadcn ui paths
     (`@/components/ui/*`), and `@/lib/utils`. No app-only imports.

2. Add an entry to `items[]` in `registry.json`:
   ```json
   {
     "name": "my-widget",
     "type": "registry:ui",
     "title": "My Widget",
     "description": "One-line description.",
     "registryDependencies": ["scroll-area"],
     "dependencies": ["some-npm-pkg"],
     "files": [
       {
         "path": "registry/ui/my-widget.tsx",
         "type": "registry:ui",
         "target": "components/ui/my-widget.tsx"
       }
     ]
   }
   ```

3. Copy source to `src/components/ui/my-widget.tsx` (preview harness).

4. Add a demo in `src/App.tsx`.

5. Validate, build, and check the Vite preview:
   ```bash
   npx shadcn@latest registry validate registry.json
   npx shadcn@latest build
   npm run build
   ```

6. Commit `registry.json` + `registry/ui/my-widget.tsx` + `public/r/` output + preview changes.

---

## Consumption Contract (Cascade App)

```bash
# One-off (from the Cascade app directory):
npx shadcn@latest add FallingReign/cascade-ui/cascade-theme
npx shadcn@latest add FallingReign/cascade-ui/file-tree

# Or add to Cascade's components.json > registries:
# "@cascade": "FallingReign/cascade-ui"
# Then: npx shadcn@latest add @cascade/file-tree
```

The CLI reads `registry.json` directly from GitHub HEAD (or a pinned ref/SHA).
No hosting, no publishing, no CI required.

---

## Non-Goals

- Do NOT modify the Cascade app (separate repo/task).
- Do NOT re-host stock shadcn primitives (Button, Input, etc.).
- No npm publish. No deploy. No CI/CD setup.

---

## Branch / PR Convention

- Feature branches: `fm/<short-name>` for agent work, `feature/<short-name>` for human work.
- Always open a PR; never push to `main` directly.
- Include built `public/r/` output in the same commit as source changes.

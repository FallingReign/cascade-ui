# cascade-ui

**Cascade's shared shadcn source registry** — a public GitHub registry that delivers a cohesive
design system (theme tokens + Cascade-specific composite components) to Cascade and any future
clients. Stock shadcn primitives (Button, Card, etc.) are consumed from `@shadcn` directly; only
Cascade-specific composites and the shared theme live here.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Vite + React 19 + TypeScript |
| Styling | Tailwind v4 (`@theme inline`) |
| Component primitives | shadcn (radix-nova style) |
| Font | Geist Variable |
| Registry type | shadcn **source registry** (GitHub) |

---

## Theme

**Preset:** `nova` (neutral, radix-base) — chosen for its clean, high-contrast neutrals that work
equally well in light and dark mode without imposing brand colour. Cascade extends it with:

- Slightly cooler neutral tint (oklch hue ~260) to feel at home next to code
- Tighter radius (`0.375rem` vs `0.625rem`) — crisper, IDE-appropriate feel
- Sidebar tokens tuned for a dark panel + light panel split layout
- Full dark-mode support via `cssVars.dark` in the theme registry item

The theme is distributed as the `cascade-theme` registry item.

---

## Repository Layout

```
cascade-ui/
├── registry.json              ← root registry (source of truth)
├── registry/
│   └── ui/
│       └── file-tree.tsx      ← source for the FileTree composite
├── src/
│   ├── components/ui/         ← local shadcn primitives (for preview only)
│   ├── index.css              ← Tailwind v4 + design tokens
│   └── App.tsx                ← Vite preview page
├── public/r/                  ← built registry output (committed)
│   ├── registry.json
│   ├── cascade-theme.json
│   └── file-tree.json
└── components.json            ← shadcn project config
```

---

## Commands

```bash
# Install dependencies
npm install

# Run the Vite preview (shows all registry items rendered)
npm run dev

# Type-check
npm run typecheck

# Build registry items → public/r/
npx shadcn@latest build

# Validate registry.json
npx shadcn@latest registry validate registry.json

# Vite production build (proves the preview compiles)
npm run build
```

---

## Registry Items

| Name | Type | Description |
|---|---|---|
| `cascade-theme` | `registry:theme` | Cascade design tokens (light + dark CSS vars) |
| `file-tree` | `registry:ui` | Recursive collapsible file-system navigator |

---

## How Cascade Consumes Items

### One-off install (recommended)

```bash
# Inside the Cascade app directory:
npx shadcn@latest add FallingReign/cascade-ui/cascade-theme
npx shadcn@latest add FallingReign/cascade-ui/file-tree
```

The CLI reads `registry.json` directly from GitHub — no hosting or deploy required.

### Add this registry to `components.json` (optional)

Add an entry to the `registries` field of Cascade's `components.json`:

```json
{
  "registries": {
    "@cascade": "FallingReign/cascade-ui"
  }
}
```

Then install items with the namespace shorthand:

```bash
npx shadcn@latest add @cascade/cascade-theme
npx shadcn@latest add @cascade/file-tree
```

### Pinning a version

```bash
npx shadcn@latest add FallingReign/cascade-ui/file-tree#v1.0.0
```

---

## How to Add a New Registry Item

1. **Create the source file** under `registry/ui/`, `registry/blocks/`, or the appropriate
   directory. Keep it copy-pasteable — no hidden app-only imports.

2. **Add it to `registry.json`** under `items`:
   ```json
   {
     "name": "my-widget",
     "type": "registry:ui",
     "title": "My Widget",
     "description": "Short description.",
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
   - `registryDependencies`: bare names = official shadcn; `owner/repo/name` = GitHub.
   - `dependencies`: npm packages the file imports.

3. **Copy source to `src/components/ui/`** for the local preview harness, and add it to `App.tsx`.

4. **Validate and build:**
   ```bash
   npx shadcn@latest registry validate registry.json
   npx shadcn@latest build
   npm run build   # confirm preview compiles
   ```

5. **Commit** `registry.json`, the source file under `registry/`, and the built output under
   `public/r/`. Open a PR.

---

## Dark Mode

The dev preview includes a light/dark toggle in the top-right corner. Cascade apps should add the
`dark` class to `<html>` or `<body>` via their theme toggle. All tokens use semantic CSS variables
that automatically switch via the `.dark` class.

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

## Outside-In Layering

The registry is designed in layers; build inner layers on top of outer ones:

```
Level 0  cascade-theme         → Design tokens (colors, radii, fonts)
Level 1  app-shell             → Outer frame: sidebar + toolbar + main + status-bar
          file-tree            → Left sidebar navigation primitive
Level 2  [future] regions      → Kanban, editor, docs perspective components
Level 3  [future] primitives   → Task cards, filters, inline editors
```

---

## Theme (`cascade-theme`)

**Base preset:** `nova` (neutral, radix-base). OKLCH throughout — perceptually uniform, dark-mode
predictable. Cascade adds a subtle cool hue (~260°) for an IDE palette feel.

**Single source of truth:** all components reference only semantic CSS variables. No raw colors.

### Color token map

| Token | Light | Dark | Purpose |
|---|---|---|---|
| `background` | `oklch(0.99 0 0)` | `oklch(0.13 0.008 258)` | Page canvas |
| `foreground` | `oklch(0.13 0.008 260)` | `oklch(0.96 0.003 260)` | Body text |
| `card` | `oklch(1 0 0)` | `oklch(0.17 0.008 258)` | Surface elevation +1 |
| `primary` | `oklch(0.28 0.02 258)` | `oklch(0.90 0.003 260)` | Brand / interactive |
| `muted` | `oklch(0.96 0.003 260)` | `oklch(0.22 0.008 258)` | Subdued surface |
| `muted-foreground` | `oklch(0.52 0.01 258)` | `oklch(0.63 0.008 260)` | Secondary text |
| `accent` | `oklch(0.94 0.005 258)` | `oklch(0.24 0.008 258)` | Hover / selection |
| `border` | `oklch(0.90 0.004 260)` | `oklch(1 0 0 / 9%)` | Rule lines |
| `ring` | `oklch(0.65 0.01 260)` | `oklch(0.50 0.008 260)` | Focus ring |
| `destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | Error / danger |
| `sidebar` | `oklch(0.97 0.003 260)` | `oklch(0.17 0.008 258)` | Sidebar panel bg |
| `shell-toolbar` | `oklch(1 0 0)` | `oklch(0.17 0.008 258)` | Top toolbar bg |
| `shell-statusbar` | `oklch(0.96 0.003 260)` | `oklch(0.15 0.008 258)` | Status-bar bg |

### Typography & radius

| Token | Value |
|---|---|
| `font-sans` | `'Geist Variable', sans-serif` |
| `font-mono` | `'Geist Mono Variable', ui-monospace, monospace` |
| `radius` | `0.375rem` (crisper than nova's 0.625rem) |

**Dark mode:** add the `dark` class to `<html>` or `<body>`.

### Adjusting the theme

Edit the `cascade-theme` item in `registry.json` (cssVars section) then rebuild:

```bash
npx shadcn@latest build
```

For local previewing, also update the matching variables in `src/index.css`.

---

## AppShell (`app-shell`)

The outer layout shell. All inner regions are provided as slots — the shell owns only structure.

### Region layout (desktop)

```
┌────────────────────────────────────────────────────────────────┐
│  Sidebar (collapsible ⌘B, resizable, bg-sidebar)              │
│  ┌─────────────┐  ┌──────────────────────────────────────────┐ │
│  │sidebarHeader│  │ toolbar (perspective switcher / actions) │ │
│  ├─────────────┤  ├──────────────────────────────────────────┤ │
│  │  sidebar    │  │ children (main perspective area)         │ │
│  │ (scrollable)│  │                                          │ │
│  ├─────────────┤  ├──────────────────────────────────────────┤ │
│  │sidebarFooter│  │ statusBar (git branch, notifications)    │ │
│  └─────────────┘  └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### Slots / props

| Prop | Type | Description |
|---|---|---|
| `sidebarHeader` | `ReactNode` | Logo / project picker at top of sidebar |
| `sidebar` | `ReactNode` | Scrollable nav / file-tree area |
| `sidebarFooter` | `ReactNode` | User profile / settings at bottom of sidebar |
| `toolbar` | `ReactNode` | Top chrome: perspective tabs, breadcrumb, actions |
| `children` | `ReactNode` | Active perspective content (main scrollable area) |
| `statusBar` | `ReactNode` | Optional slim footer strip (hidden when omitted) |
| `defaultSidebarOpen` | `boolean` | Initial sidebar expanded state (default `true`) |
| `className` | `string` | Extra classes on the outermost wrapper |

### Install

```bash
# From the consuming project:
npx shadcn@latest add FallingReign/cascade-ui/app-shell
# Auto-installs: cascade-theme, sidebar, separator, button
```

### Usage

```tsx
import { AppShell, AppShellPlaceholder } from "@/components/ui/app-shell";
import { FileTree } from "@/components/ui/file-tree";

export function Shell() {
  return (
    <AppShell
      sidebarHeader={<ProjectLogo />}
      sidebar={<FileTree nodes={tree} />}
      sidebarFooter={<UserMenu />}
      toolbar={<PerspectiveSwitcher />}
      statusBar={<StatusBar />}
    >
      {/* Active perspective — swap per route/state */}
      <KanbanPerspective />
    </AppShell>
  );
}
```

`AppShellPlaceholder` is a dev helper for visualising empty regions:

```tsx
<AppShell toolbar={<AppShellPlaceholder label="toolbar" className="h-8 w-48" />}>
  <AppShellPlaceholder label="main content" className="h-64 w-full" />
</AppShell>
```

---

## FileTree (`file-tree`)

A recursive, collapsible file-system navigator. Slot it into the `sidebar` prop of `AppShell`.

```bash
npx shadcn@latest add FallingReign/cascade-ui/file-tree
```

---

## Repository Layout

```
cascade-ui/
├── registry.json              ← root registry (source of truth)
├── registry/
│   └── ui/
│       ├── app-shell.tsx      ← outer layout shell
│       └── file-tree.tsx      ← file-system navigator
├── src/
│   ├── components/ui/         ← local copies for Vite preview
│   ├── index.css              ← Tailwind v4 + design tokens
│   └── App.tsx                ← preview page (full shell demo)
├── public/r/                  ← built registry output (committed)
└── components.json            ← shadcn project config
```

---

## Commands

```bash
npm install                                        # install deps
npm run dev                                        # Vite preview with live reload
npm run typecheck                                  # tsc --noEmit
npx shadcn@latest build                            # build registry → public/r/
npx shadcn@latest registry validate registry.json # validate registry
npm run build                                      # production build (CI check)
```

Always validate + build + commit `public/r/` whenever `registry.json` or a source file changes.

---

## How Cascade Consumes Items

```bash
# Inside the Cascade app directory:
npx shadcn@latest add FallingReign/cascade-ui/cascade-theme
npx shadcn@latest add FallingReign/cascade-ui/app-shell
npx shadcn@latest add FallingReign/cascade-ui/file-tree
```

Or register the namespace shorthand in `components.json`:

```json
{ "registries": { "@cascade": "FallingReign/cascade-ui" } }
```

```bash
npx shadcn@latest add @cascade/app-shell
```

---

## Adding a New Registry Item

1. Create `registry/ui/<name>.tsx` — no app-only imports.
2. Add the entry to `registry.json` (`registryDependencies`, `dependencies`, `files`).
3. Copy to `src/components/ui/` and add a demo to `App.tsx`.
4. `npx shadcn@latest registry validate registry.json && npx shadcn@latest build && npm run build`
5. Commit source + `public/r/` output, open a PR.

See `AGENTS.md` for the `registryDependencies` naming rule and full workflow.

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
    file-tree.tsx          ← recursive collapsible file navigator
    app-shell.tsx          ← outer layout shell (sidebar + toolbar + main + status-bar)
public/r/                  ← built output (committed; re-run `npx shadcn@latest build` when changed)
  registry.json
  cascade-theme.json
  file-tree.json
  app-shell.json
src/
  components/ui/           ← local copies of registry sources for the Vite preview only
  App.tsx                  ← preview page — renders the full assembled shell + placeholder content
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

## Outside-In Layering

The registry is designed in layers; inner layers are built on top of outer ones:

```
Level 0  cascade-theme         → Design tokens (colors, radii, fonts) — single source of truth
Level 1  app-shell             → Outer frame (sidebar + toolbar + main + status-bar)
          file-tree            → Left sidebar navigation primitive
Level 2  perspective-switcher  → Animated tab bar that slots into AppShell toolbar
          command-palette        → Cmd/Ctrl-K fuzzy search palette (portal)
          kanban-board           → Drag-to-move status columns (main area)
          front-matter-editor    → Typed key-value metadata editor (sidebar / panel)
          calendar-board         → Month/week calendar of dated events (main area)
Level 3  [future] primitives   → Standalone cards, filters, task items, etc.
```

Inner level items declare the shell or theme as a `registryDependency` (via
`FallingReign/cascade-ui/<name>`) so consumers install them transitively.

---

## Global Theme (`cascade-theme`)

**Base preset:** `nova` (neutral palette, radix primitives)  
**Token strategy:** OKLCH throughout — perceptually uniform, dark-mode predictable.  
**Dark mode:** `.dark` class selector on `<html>` or `<body>`.

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

### Sidebar tokens

| Token | Light | Dark |
|---|---|---|
| `sidebar` | `oklch(0.97 0.003 260)` | `oklch(0.17 0.008 258)` |
| `sidebar-primary` | `oklch(0.28 0.02 258)` | `oklch(0.50 0.18 260)` |
| `sidebar-accent` | `oklch(0.94 0.005 258)` | `oklch(0.24 0.008 258)` |
| `sidebar-border` | `oklch(0.90 0.004 260)` | `oklch(1 0 0 / 9%)` |

### Shell-surface tokens (added in Level 1)

| Token | Light | Dark | Used by |
|---|---|---|---|
| `shell-toolbar` | `oklch(1 0 0)` | `oklch(0.17 0.008 258)` | AppShell toolbar bg |
| `shell-toolbar-foreground` | `oklch(0.13 0.008 260)` | `oklch(0.96 0.003 260)` | Toolbar text |
| `shell-statusbar` | `oklch(0.96 0.003 260)` | `oklch(0.15 0.008 258)` | Status-bar bg |
| `shell-statusbar-foreground` | `oklch(0.52 0.01 258)` | `oklch(0.63 0.008 260)` | Status-bar text |

### Typography / radius decisions

| Token | Value | Reason |
|---|---|---|
| `font-sans` | `'Geist Variable', sans-serif` | Variable weight, great screen clarity |
| `font-mono` | `'Geist Mono Variable', monospace` | Paired with Geist, consistent rhythm |
| `radius` | `0.375rem` | Crisper than nova's 0.625rem; IDE-appropriate |

**Rule:** all components must use semantic tokens only. No raw `oklch()` / hex / Tailwind color
scale in component files — reference `bg-background`, `text-muted-foreground`, etc.

---

## Registry Items

| Name | Type | File | Description |
|---|---|---|---|
| `cascade-theme` | `registry:theme` | *(cssVars only, no files)* | Design tokens for light + dark |
| `file-tree` | `registry:ui` | `registry/ui/file-tree.tsx` | Recursive collapsible file navigator |
| `app-shell` | `registry:ui` | `registry/ui/app-shell.tsx` | Full outer layout shell |
| `perspective-switcher` | `registry:ui` | `registry/ui/perspective-switcher.tsx` | Animated icon-bar → labelled pill; slots into `toolbar` prop |
| `command-palette` | `registry:block` | `registry/ui/command-palette.tsx` | Cmd/Ctrl-K fuzzy palette; portal-rendered |
| `kanban-board` | `registry:block` | `registry/ui/kanban-board.tsx` | Drag-to-move columnar board; emits `onStatusChange` |
| `front-matter-editor` | `registry:block` | `registry/ui/front-matter-editor.tsx` | Typed key-value metadata editor; emits `onFieldChange` |
| `calendar-board` | `registry:block` | `registry/ui/calendar-board.tsx` | Month/week calendar; lays dated events on a grid; emits `onEventClick`, `onDayClick` |

### `registryDependencies` rule

- Bare names (`"scroll-area"`, `"collapsible"`) → official shadcn primitives. ✅
- Same-repo items → `"FallingReign/cascade-ui/<name>"` (never bare). ✅
- External GitHub → `"owner/repo/item-name"`. ✅

---

## AppShell — Regions and Slots

`app-shell` exports: `AppShell`, `AppShellToolbar`, `AppShellStatusBar`, `AppShellPlaceholder`.

### Region layout (desktop)

```
┌────────────────────────────────────────────────────────────────┐
│  Sidebar (collapsible ⌘B, bg-sidebar)                         │
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

### Props / slots

| Prop | Type | Default | Description |
|---|---|---|---|
| `sidebarHeader` | `ReactNode` | — | Logo / project picker at top of sidebar |
| `sidebar` | `ReactNode` | — | Scrollable nav / file-tree area |
| `sidebarFooter` | `ReactNode` | — | User profile / settings at bottom of sidebar |
| `toolbar` | `ReactNode` | — | Top chrome: perspective tabs, breadcrumb, actions |
| `children` | `ReactNode` | — | Active perspective content (main area) |
| `statusBar` | `ReactNode` | — | Optional slim footer strip |
| `defaultSidebarOpen` | `boolean` | `true` | Initial sidebar state |
| `className` | `string` | — | Extra class on outer wrapper |

### Consumer usage

```tsx
import { AppShell } from "@/components/ui/app-shell";
import { FileTree } from "@/components/ui/file-tree";

<AppShell
  sidebarHeader={<ProjectLogo />}
  sidebar={<FileTree nodes={tree} />}
  sidebarFooter={<UserMenu />}
  toolbar={<PerspectiveSwitcher />}
  statusBar={<StatusBar />}
>
  <KanbanPerspective />
</AppShell>
```

### Install (from GitHub registry)

```bash
npx shadcn@latest add FallingReign/cascade-ui/app-shell
# Installs: app-shell + cascade-theme (transitively)
# shadcn deps also auto-added: sidebar, separator, button
```

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

## Level 2 — Region Composites

Regions slot into the Level-1 shell's named slots. They own **no layout chrome** —
only the content inside the slot boundary. All use semantic tokens only.

### Motion policy

`motion/react` is **approved but scoped**:
- ✅ `perspective-switcher` — expand/collapse animation on active tab
- ✅ `command-palette` — open/close spring animation
- ❌ `kanban-board` — CSS transitions only (`transition-colors`, `transition-shadow`)
- ❌ `front-matter-editor` — CSS transitions only

Do not add `motion` as a dependency to motion-free items. Always declare it
per-item in `registry.json > dependencies`.

### How regions compose into the shell

```tsx
<AppShell
  toolbar={
    // PerspectiveSwitcher goes into the toolbar slot
    <PerspectiveSwitcher items={perspectives} onValueChange={setPerspective} />
  }
  sidebar={<FileTree nodes={tree} />}
>
  {/* KanbanBoard or FrontMatterEditor fill the main area */}
  {perspective === "board" ? <KanbanBoard ... /> : <FrontMatterEditor ... />}
</AppShell>

{/* CommandPalette renders outside AppShell — it portals to <body> */}
<CommandPalette items={commands} />
```

### Region item reference

| Item | Shell slot | Key deps | motion? |
|---|---|---|---|
| `perspective-switcher` | `toolbar` | `motion` | ✅ |
| `command-palette` | *(portal — outside shell)* | `motion`, `lucide-react` | ✅ |
| `kanban-board` | `children` (main area) | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` | ❌ |
| `front-matter-editor` | `children` or sidebar panel | *(none beyond React)* | ❌ |
| `calendar-board` | `children` (main area) | `lucide-react` | ❌ |

### `calendar-board` — props and usage

```tsx
import { CalendarBoard, type CalendarEvent } from "@/components/ui/calendar-board";

// Event shape
type CalendarEvent = {
  id: string;
  date: string;       // ISO date, e.g. "2025-08-15"
  title: string;
  status?: string;    // "todo" | "in-progress" | "review" | "done" -> colour dot
  tags?: string[];
};

// CalendarBoardProps
// events          CalendarEvent[]           -- required; host owns data
// onEventClick    (id: string) => void      -- optional; fires on event pill click
// onDayClick      (isoDate: string) => void -- optional; fires on day cell click
// initialMonth    string                    -- "YYYY-MM" or "YYYY-MM-DD"; defaults to today's month
// initialView     "month" | "week"          -- defaults to "month"
// className       string

<CalendarBoard
  events={myEvents}
  onEventClick={(id) => openDetail(id)}
  onDayClick={(iso) => createEvent(iso)}
/>
```

**Overflow:** up to 3 event pills shown per day cell in month view; remainder shown as `+N more`.
**Install:**
```bash
npx shadcn@latest add FallingReign/cascade-ui/calendar-board
```

---

### beUI attribution

`perspective-switcher` and `command-palette` are adapted from
[beUI v2](https://github.com/starc007/ui-components) (MIT).
The beUI copyright notice is preserved in each source file's header comment.
beUI is **not** imported as a package — sources are rewritten for Tailwind v4
and cascade-ui's semantic tokens.

---



```bash
# One-off (from the Cascade app directory):
npx shadcn@latest add FallingReign/cascade-ui/cascade-theme
npx shadcn@latest add FallingReign/cascade-ui/file-tree
npx shadcn@latest add FallingReign/cascade-ui/app-shell

# Level 2 regions:
npx shadcn@latest add FallingReign/cascade-ui/perspective-switcher
npx shadcn@latest add FallingReign/cascade-ui/command-palette
npx shadcn@latest add FallingReign/cascade-ui/kanban-board
npx shadcn@latest add FallingReign/cascade-ui/front-matter-editor
npx shadcn@latest add FallingReign/cascade-ui/calendar-board

# Or add to Cascade's components.json > registries:
# "@cascade": "FallingReign/cascade-ui"
# Then: npx shadcn@latest add @cascade/app-shell
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

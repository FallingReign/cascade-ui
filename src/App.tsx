import * as React from "react";
import { FileTree, type FileTreeNode } from "@/components/ui/file-tree";
import { AppShell, AppShellPlaceholder } from "@/components/ui/app-shell";
import { PerspectiveSwitcher, type PerspectiveItem } from "@/components/ui/perspective-switcher";
import { CommandPalette, type CommandItem } from "@/components/ui/command-palette";
import { KanbanBoard, type KanbanCard, type KanbanStatus } from "@/components/ui/kanban-board";
import { FrontMatterEditor, type FrontMatterField } from "@/components/ui/front-matter-editor";
import { CalendarBoard, type CalendarEvent } from "@/components/ui/calendar-board";
import {
  LayoutDashboard,
  FileText,
  Clock,
  Settings,
  Search,
  PlusCircle,
  GitBranch,
  Star,
  Trash2,
  CalendarDays,
} from "lucide-react";
import "@/index.css";

// ---------------------------------------------------------------------------
// Demo data — File tree
// ---------------------------------------------------------------------------
const DEMO_TREE: FileTreeNode[] = [
  {
    id: "src", name: "src", type: "folder",
    children: [
      {
        id: "src/components", name: "components", type: "folder",
        children: [
          {
            id: "src/components/ui", name: "ui", type: "folder",
            children: [
              { id: "src/components/ui/app-shell.tsx", name: "app-shell.tsx", type: "file" },
              { id: "src/components/ui/file-tree.tsx", name: "file-tree.tsx", type: "file" },
              { id: "src/components/ui/perspective-switcher.tsx", name: "perspective-switcher.tsx", type: "file" },
              { id: "src/components/ui/command-palette.tsx", name: "command-palette.tsx", type: "file" },
              { id: "src/components/ui/kanban-board.tsx", name: "kanban-board.tsx", type: "file" },
              { id: "src/components/ui/front-matter-editor.tsx", name: "front-matter-editor.tsx", type: "file" },
            ],
          },
        ],
      },
      { id: "src/App.tsx", name: "App.tsx", type: "file" },
    ],
  },
  { id: "registry.json", name: "registry.json", type: "file" },
  { id: "package.json", name: "package.json", type: "file" },
];

// ---------------------------------------------------------------------------
// Demo data — Perspective switcher
// ---------------------------------------------------------------------------
const PERSPECTIVES: PerspectiveItem[] = [
  { id: "board",    label: "Board",    icon: <LayoutDashboard className="size-4" /> },
  { id: "docs",     label: "Docs",     icon: <FileText className="size-4" /> },
  { id: "calendar", label: "Calendar", icon: <CalendarDays className="size-4" /> },
  { id: "timeline", label: "Timeline", icon: <Clock className="size-4" /> },
  { id: "settings", label: "Settings", icon: <Settings className="size-4" /> },
];

// ---------------------------------------------------------------------------
// Demo data — Command palette
// ---------------------------------------------------------------------------
const COMMANDS: CommandItem[] = [
  { id: "new-task",   label: "New task",        group: "Create", hint: "⌘N", icon: PlusCircle,   keywords: ["add", "create"], onSelect: () => alert("New task") },
  { id: "search",     label: "Search tasks",     group: "Navigate", hint: "⌘F", icon: Search,       keywords: ["find", "filter"], onSelect: () => alert("Search") },
  { id: "board-view", label: "Switch to Board",  group: "Navigate", icon: LayoutDashboard, onSelect: () => alert("Board") },
  { id: "docs-view",  label: "Switch to Docs",   group: "Navigate", icon: FileText,        onSelect: () => alert("Docs") },
  { id: "branch",     label: "Create branch",    group: "Git", icon: GitBranch, keywords: ["git"], onSelect: () => alert("Branch") },
  { id: "star",       label: "Star this repo",   group: "Git", icon: Star,      onSelect: () => alert("Star") },
  { id: "delete",     label: "Delete task",      group: "Danger", icon: Trash2, keywords: ["remove"], onSelect: () => alert("Delete") },
];

// ---------------------------------------------------------------------------
// Demo data — Kanban board
// ---------------------------------------------------------------------------
const KANBAN_STATUSES: KanbanStatus[] = [
  { id: "todo",        label: "To Do",       colorClass: "bg-muted-foreground" },
  { id: "in-progress", label: "In Progress", colorClass: "bg-amber-500" },
  { id: "review",      label: "In Review",   colorClass: "bg-blue-500" },
  { id: "done",        label: "Done",        colorClass: "bg-green-500" },
];

const INITIAL_CARDS: KanbanCard[] = [
  { id: "c1", title: "Design token audit",        status: "done",        priority: "high",   tags: ["design"],     assignee: "JF", description: "Audit all OKLCH token values for contrast compliance." },
  { id: "c2", title: "App shell layout",          status: "done",        priority: "high",   tags: ["dev"],        assignee: "JF" },
  { id: "c3", title: "Perspective switcher",      status: "done",        priority: "medium", tags: ["dev", "motion"] },
  { id: "c4", title: "Command palette",           status: "in-progress", priority: "medium", tags: ["dev", "motion"], assignee: "AS" },
  { id: "c5", title: "Kanban board",              status: "in-progress", priority: "high",   tags: ["dev"],        assignee: "AS", description: "Drag-to-move between status columns." },
  { id: "c6", title: "Front-matter editor",       status: "review",      priority: "medium", tags: ["dev"],        assignee: "JF" },
  { id: "c7", title: "Registry validation CI",    status: "todo",        priority: "low",    tags: ["infra"] },
  { id: "c8", title: "Dark mode visual QA",       status: "todo",        priority: "medium", tags: ["design", "qa"] },
];

// ---------------------------------------------------------------------------
// Demo data — Calendar
// ---------------------------------------------------------------------------

function isoOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const CALENDAR_EVENTS: CalendarEvent[] = [
  { id: "ev1",  date: isoOffset(0),   title: "Token audit review",         status: "in-progress", tags: ["design"] },
  { id: "ev2",  date: isoOffset(0),   title: "Daily standup",              status: "done" },
  { id: "ev3",  date: isoOffset(0),   title: "Fix focus ring regression",   status: "todo",        tags: ["dev"] },
  { id: "ev4",  date: isoOffset(1),   title: "Calendar composite PR",      status: "in-progress", tags: ["dev"] },
  { id: "ev5",  date: isoOffset(2),   title: "Dark mode QA pass",          status: "todo",        tags: ["qa"] },
  { id: "ev6",  date: isoOffset(3),   title: "Registry validate & build",  status: "todo" },
  { id: "ev7",  date: isoOffset(5),   title: "Kanban polish",              status: "review",      tags: ["dev"] },
  { id: "ev8",  date: isoOffset(7),   title: "Sprint planning",            status: "todo" },
  { id: "ev9",  date: isoOffset(7),   title: "Retrospective",              status: "todo" },
  { id: "ev10", date: isoOffset(7),   title: "Design sync",                status: "todo" },
  { id: "ev11", date: isoOffset(7),   title: "Overflow test event A",      status: "todo" },
  { id: "ev12", date: isoOffset(-3),  title: "File-tree accessibility fix",status: "done",        tags: ["a11y"] },
  { id: "ev13", date: isoOffset(-7),  title: "Level-2 region spec",       status: "done" },
];

// ---------------------------------------------------------------------------
// Demo data — Front-matter editor
// ---------------------------------------------------------------------------
const FM_FIELDS: FrontMatterField[] = [
  { key: "title",       label: "Title",       type: "text",        placeholder: "Task title" },
  { key: "status",      label: "Status",      type: "select",      options: ["todo", "in-progress", "review", "done"] },
  { key: "priority",    label: "Priority",    type: "select",      options: ["low", "medium", "high"] },
  { key: "tags",        label: "Tags",        type: "multiselect", options: ["dev", "design", "motion", "infra", "qa"] },
  { key: "assignee",    label: "Assignee",    type: "text",        placeholder: "Name or initials" },
  { key: "due",         label: "Due date",    type: "date" },
  { key: "points",      label: "Story points",type: "number" },
  { key: "archived",    label: "Archived",    type: "boolean" },
  { key: "description", label: "Description", type: "textarea",    placeholder: "Task description…" },
];

const INITIAL_FM_VALUES: Record<string, string | number | boolean | string[]> = {
  title:       "Front-matter editor panel",
  status:      "review",
  priority:    "medium",
  tags:        ["dev"],
  assignee:    "JF",
  due:         "2025-08-01",
  points:      3,
  archived:    false,
  description: "Renders and edits a typed key-value metadata set.",
};

// ---------------------------------------------------------------------------
// Slot components
// ---------------------------------------------------------------------------

function SidebarHeaderSlot() {
  return (
    <div className="flex items-center gap-2 px-1 py-1">
      <div className="size-6 rounded bg-sidebar-primary" />
      <span className="text-sm font-semibold text-sidebar-foreground">Cascade</span>
    </div>
  );
}

function SidebarFooterSlot() {
  return (
    <div className="flex items-center gap-2 px-1 py-1 text-xs text-sidebar-foreground/60">
      <div className="size-5 rounded-full bg-sidebar-accent" />
      <span>user@cascade</span>
    </div>
  );
}

type PerspectiveId = "board" | "docs" | "calendar" | "timeline" | "settings";

function ToolbarSlot({
  activePerspective,
  onPerspectiveChange,
  onToggleDark,
  dark,
}: {
  activePerspective: PerspectiveId;
  onPerspectiveChange: (id: string) => void;
  onToggleDark: () => void;
  dark: boolean;
}) {
  return (
    <div className="flex flex-1 items-center gap-3">
      <PerspectiveSwitcher
        items={PERSPECTIVES}
        value={activePerspective}
        onValueChange={onPerspectiveChange}
      />
      <div className="flex-1" />
      <span className="hidden text-xs text-muted-foreground sm:inline">⌘K — command palette</span>
      <button
        type="button"
        onClick={onToggleDark}
        className="rounded-sm border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      >
        {dark ? "☀ Light" : "☾ Dark"}
      </button>
    </div>
  );
}

function StatusBarSlot() {
  return (
    <>
      <span className="opacity-60">main</span>
      <span className="opacity-30">·</span>
      <span className="opacity-60">cascade-ui</span>
      <span className="flex-1" />
      <span className="opacity-40">v0.2 — Level 2 regions</span>
    </>
  );
}

// ---------------------------------------------------------------------------
// Perspective content components
// ---------------------------------------------------------------------------

function BoardPerspective() {
  const [cards, setCards] = React.useState<KanbanCard[]>(INITIAL_CARDS);

  const handleStatusChange = (cardId: string, newStatus: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, status: newStatus } : c)),
    );
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border px-4 py-2">
        <h2 className="text-sm font-semibold text-foreground">Board</h2>
        <p className="text-xs text-muted-foreground">Drag cards between columns to change status</p>
      </div>
      <div className="flex-1 overflow-auto">
        <KanbanBoard
          statuses={KANBAN_STATUSES}
          cards={cards}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
}

function DocsPerspective() {
  const [values, setValues] = React.useState<Record<string, string | number | boolean | string[]>>(INITIAL_FM_VALUES);

  const handleChange = (key: string, value: string | number | boolean | string[] | null | undefined) => {
    setValues((prev) => ({ ...prev, [key]: value ?? "" }));
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border px-4 py-2">
        <h2 className="text-sm font-semibold text-foreground">Docs — Front Matter Editor</h2>
        <p className="text-xs text-muted-foreground">Edit document metadata</p>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-sm">
          <FrontMatterEditor
            fields={FM_FIELDS}
            values={values}
            onFieldChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
}

function CalendarPerspective() {
  const [lastClick, setLastClick] = React.useState<string | null>(null);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <CalendarBoard
        events={CALENDAR_EVENTS}
        onEventClick={(id) => setLastClick(`event: ${id}`)}
        onDayClick={(iso) => setLastClick(`day: ${iso}`)}
      />
      {lastClick && (
        <div className="shrink-0 border-t border-border px-4 py-1.5 text-xs text-muted-foreground">
          Last click → {lastClick}
        </div>
      )}
    </div>
  );
}

function TimelinePerspective() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
      <AppShellPlaceholder label="Timeline perspective (future Level-3 region)" className="h-64 w-full max-w-xl" />
    </div>
  );
}

function SettingsPerspective() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
      <AppShellPlaceholder label="Settings perspective (future Level-3 region)" className="h-64 w-full max-w-xl" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// App (preview harness)
// ---------------------------------------------------------------------------

export default function App() {
  const [selectedId, setSelectedId] = React.useState<string>("src/App.tsx");
  const [dark, setDark] = React.useState(false);
  const [perspective, setPerspective] = React.useState<PerspectiveId>("board");

  const mainContent: Record<PerspectiveId, React.ReactNode> = {
    board:    <BoardPerspective />,
    docs:     <DocsPerspective />,
    calendar: <CalendarPerspective />,
    timeline: <TimelinePerspective />,
    settings: <SettingsPerspective />,
  };

  return (
    <div className={dark ? "dark" : ""} style={{ height: "100vh", overflow: "hidden" }}>
      {/* Command palette lives outside AppShell so its portal targets <body> correctly */}
      <CommandPalette items={COMMANDS} />

      <AppShell
        sidebarHeader={<SidebarHeaderSlot />}
        sidebar={
          <FileTree
            nodes={DEMO_TREE}
            selectedId={selectedId}
            onSelect={(node) => {
              if (node.type === "file") setSelectedId(node.id);
            }}
          />
        }
        sidebarFooter={<SidebarFooterSlot />}
        toolbar={
          <ToolbarSlot
            activePerspective={perspective}
            onPerspectiveChange={(id) => setPerspective(id as PerspectiveId)}
            onToggleDark={() => setDark((d) => !d)}
            dark={dark}
          />
        }
        statusBar={<StatusBarSlot />}
      >
        {mainContent[perspective]}
      </AppShell>
    </div>
  );
}

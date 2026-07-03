import * as React from "react";
import { FileTree, type FileTreeNode } from "@/components/ui/file-tree";
import {
  AppShell,
  AppShellPlaceholder,
} from "@/components/ui/app-shell";
import "@/index.css";

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const DEMO_TREE: FileTreeNode[] = [
  {
    id: "src",
    name: "src",
    type: "folder",
    children: [
      {
        id: "src/components",
        name: "components",
        type: "folder",
        children: [
          {
            id: "src/components/ui",
            name: "ui",
            type: "folder",
            children: [
              { id: "src/components/ui/app-shell.tsx", name: "app-shell.tsx", type: "file" },
              { id: "src/components/ui/file-tree.tsx", name: "file-tree.tsx", type: "file" },
            ],
          },
        ],
      },
      { id: "src/App.tsx", name: "App.tsx", type: "file" },
      { id: "src/main.tsx", name: "main.tsx", type: "file" },
      { id: "src/index.css", name: "index.css", type: "file" },
    ],
  },
  {
    id: "registry",
    name: "registry",
    type: "folder",
    children: [
      {
        id: "registry/ui",
        name: "ui",
        type: "folder",
        children: [
          { id: "registry/ui/app-shell.tsx", name: "app-shell.tsx", type: "file" },
          { id: "registry/ui/file-tree.tsx", name: "file-tree.tsx", type: "file" },
        ],
      },
    ],
  },
  { id: "registry.json", name: "registry.json", type: "file" },
  { id: "package.json", name: "package.json", type: "file" },
];

// ---------------------------------------------------------------------------
// Placeholder slot components (stand-ins for real Level-2 content)
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

function ToolbarSlot({ onToggleDark, dark }: { onToggleDark: () => void; dark: boolean }) {
  return (
    <div className="flex flex-1 items-center gap-2">
      {/* Perspective tabs placeholder */}
      <div className="flex items-center gap-1">
        {["Board", "Docs", "Timeline"].map((tab, i) => (
          <button
            key={tab}
            type="button"
            className={[
              "rounded-sm px-3 py-1 text-sm transition-colors",
              i === 0
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
            ].join(" ")}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Dark-mode toggle (preview only) */}
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
      <span className="opacity-40">cascade-ui v0.1</span>
    </>
  );
}

function MainContentPlaceholder() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
      <AppShellPlaceholder
        label="Main perspective area (Level 2 content goes here)"
        className="h-64 w-full max-w-xl"
      />
      <p className="text-xs text-muted-foreground text-center max-w-sm">
        Drop in your kanban board, editor, docs viewer, or any other perspective component here.
        The shell owns only the frame.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// App (preview harness)
// ---------------------------------------------------------------------------

export default function App() {
  const [selectedId, setSelectedId] = React.useState<string>("src/App.tsx");
  const [dark, setDark] = React.useState(false);

  return (
    <div className={dark ? "dark" : ""} style={{ height: "100vh", overflow: "hidden" }}>
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
        toolbar={<ToolbarSlot onToggleDark={() => setDark((d) => !d)} dark={dark} />}
        statusBar={<StatusBarSlot />}
      >
        <MainContentPlaceholder />
      </AppShell>
    </div>
  );
}

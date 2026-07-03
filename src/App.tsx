import * as React from "react";
import { FileTree, type FileTreeNode } from "@/components/ui/file-tree";

// Copy source to components/ui so the preview works directly
import "@/index.css";

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
              { id: "src/components/ui/file-tree.tsx", name: "file-tree.tsx", type: "file" },
              { id: "src/components/ui/button.tsx", name: "button.tsx", type: "file" },
              { id: "src/components/ui/scroll-area.tsx", name: "scroll-area.tsx", type: "file" },
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
          { id: "registry/ui/file-tree.tsx", name: "file-tree.tsx", type: "file" },
        ],
      },
    ],
  },
  { id: "registry.json", name: "registry.json", type: "file" },
  { id: "components.json", name: "components.json", type: "file" },
  { id: "package.json", name: "package.json", type: "file" },
];

export default function App() {
  const [selectedId, setSelectedId] = React.useState<string>("src/components/ui/file-tree.tsx");
  const [dark, setDark] = React.useState(false);

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-4xl p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">cascade-ui</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                shadcn source registry — component preview
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDark((d) => !d)}
              className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
            >
              {dark ? "☀ Light" : "☾ Dark"}
            </button>
          </div>

          {/* Demo */}
          <section>
            <h2 className="mb-3 text-lg font-medium">FileTree</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              A recursive, collapsible file-system navigator built on{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">ScrollArea</code>{" "}
              and{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">Collapsible</code>.
            </p>
            <div className="flex gap-6">
              <div className="w-72 rounded-md border border-border bg-sidebar h-96 overflow-hidden">
                <FileTree
                  nodes={DEMO_TREE}
                  selectedId={selectedId}
                  onSelect={(node) => {
                    if (node.type === "file") setSelectedId(node.id);
                  }}
                />
              </div>
              <div className="flex-1 rounded-md border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">Selected file:</p>
                <p className="mt-1 font-mono text-sm">{selectedId ?? "—"}</p>
                <p className="mt-4 text-xs text-muted-foreground">
                  Click a file in the tree to select it.
                </p>
              </div>
            </div>
          </section>

          {/* Install snippet */}
          <section className="mt-10">
            <h2 className="mb-3 text-lg font-medium">Install</h2>
            <pre className="rounded-md bg-muted px-4 py-3 text-sm font-mono overflow-x-auto">
              {`npx shadcn@latest add FallingReign/cascade-ui/file-tree`}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
}

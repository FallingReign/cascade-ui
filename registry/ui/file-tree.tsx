"use client";

import * as React from "react";
import {
  ChevronRight,
  File,
  Folder,
  FolderOpen,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface FileTreeNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileTreeNode[];
}

export interface FileTreeProps {
  /** Root nodes to display */
  nodes: FileTreeNode[];
  /** Called when a file node is clicked */
  onSelect?: (node: FileTreeNode) => void;
  /** Currently-selected file id */
  selectedId?: string;
  /** Additional class names on the scroll container */
  className?: string;
}

// ─── Internal recursive node ────────────────────────────────────────────────

interface FileTreeNodeItemProps {
  node: FileTreeNode;
  depth: number;
  selectedId?: string;
  onSelect?: (node: FileTreeNode) => void;
  defaultOpen?: boolean;
}

function FileTreeNodeItem({
  node,
  depth,
  selectedId,
  onSelect,
  defaultOpen = false,
}: FileTreeNodeItemProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const isSelected = node.id === selectedId;

  if (node.type === "folder") {
    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-1.5 rounded-sm px-2 py-1 text-sm",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              "transition-colors",
            )}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
          >
            <ChevronRight
              className={cn(
                "size-3.5 shrink-0 text-muted-foreground transition-transform duration-150",
                open && "rotate-90",
              )}
            />
            {open ? (
              <FolderOpen className="size-4 shrink-0 text-muted-foreground" />
            ) : (
              <Folder className="size-4 shrink-0 text-muted-foreground" />
            )}
            <span className="truncate">{node.name}</span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {node.children?.map((child) => (
            <FileTreeNodeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect?.(node)}
      className={cn(
        "flex w-full items-center gap-1.5 rounded-sm px-2 py-1 text-sm",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "transition-colors",
        isSelected && "bg-accent text-accent-foreground font-medium",
      )}
      style={{ paddingLeft: `${depth * 12 + 24}px` }}
      aria-current={isSelected ? "true" : undefined}
    >
      <File className="size-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{node.name}</span>
    </button>
  );
}

// ─── Public component ────────────────────────────────────────────────────────

/**
 * FileTree — Cascade-specific file-system navigator.
 *
 * Renders a recursive collapsible tree of files and folders.
 * Supports selection, keyboard navigation, and dark mode via semantic tokens.
 *
 * @example
 * ```tsx
 * <FileTree
 *   nodes={tree}
 *   selectedId="src/App.tsx"
 *   onSelect={(node) => openFile(node.id)}
 * />
 * ```
 */
export function FileTree({ nodes, onSelect, selectedId, className }: FileTreeProps) {
  return (
    <ScrollArea className={cn("h-full w-full", className)}>
      <nav aria-label="File tree" className="py-1">
        {nodes.map((node) => (
          <FileTreeNodeItem
            key={node.id}
            node={node}
            depth={0}
            selectedId={selectedId}
            onSelect={onSelect}
            defaultOpen={node.type === "folder"}
          />
        ))}
      </nav>
    </ScrollArea>
  );
}

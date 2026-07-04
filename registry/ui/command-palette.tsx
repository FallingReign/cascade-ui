/**
 * CommandPalette — Cascade UI Level 2
 *
 * Cmd/Ctrl-K fuzzy search palette with groups, keyboard navigation, and
 * a React portal. Adapted from beUI command-palette (starc007/ui-components, MIT).
 * Copyright (c) starc007 — rewritten for Tailwind v4 / cascade-ui tokens.
 *
 * Uses motion/react for open/close animation. Accepts command items via props.
 */

"use client";

import { motion, useReducedMotion } from "motion/react";
import { Search, type LucideIcon } from "lucide-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Easing (inlined)
// ---------------------------------------------------------------------------
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CommandItem = {
  id: string;
  label: string;
  /** Group heading — items without a group go under "Results". */
  group?: string;
  /** Keyboard hint rendered on the right (e.g. "⌘O"). */
  hint?: string;
  /** Extra fuzzy-match keywords. */
  keywords?: string[];
  /** Lucide icon rendered on the left. */
  icon?: LucideIcon;
  /** Arbitrary right-side decoration (badge, etc.). */
  badge?: ReactNode;
  onSelect: () => void;
};

export interface CommandPaletteProps {
  items: CommandItem[];
  /** Opens with Cmd/Ctrl + this key. Default: "k" */
  shortcut?: string;
  placeholder?: string;
  emptyMessage?: string;
  /** Controlled open state. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Simple fuzzy-match: every char in `needle` appears in order in `hay`. */
function fuzzyMatch(needle: string, hay: string) {
  if (!needle) return true;
  needle = needle.toLowerCase();
  hay = hay.toLowerCase();
  let i = 0;
  for (const ch of hay) {
    if (ch === needle[i]) i++;
    if (i === needle.length) return true;
  }
  return false;
}

// Animation — entrance reads as instant; tight spring, fast exit.
const PANEL_SPRING = {
  type: "spring",
  stiffness: 560,
  damping: 40,
  mass: 0.5,
} as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CommandPalette({
  items,
  shortcut = "k",
  placeholder = "Type a command or search…",
  emptyMessage = "No results found.",
  open: controlledOpen,
  onOpenChange,
}: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const controlled = controlledOpen !== undefined;
  const open = controlled ? controlledOpen : internalOpen;
  const setOpen = useCallback(
    (v: boolean) => {
      if (!controlled) setInternalOpen(v);
      onOpenChange?.(v);
    },
    [controlled, onOpenChange],
  );

  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const uid = useId();
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const updateQuery = useCallback((v: string) => {
    setQuery(v);
    setActive(0);
  }, []);

  // Keyboard shortcut + Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === shortcut.toLowerCase()) {
        e.preventDefault();
        setOpen(!open);
        return;
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, shortcut, setOpen]);

  // Focus input when opened; reset query
  useEffect(() => {
    if (open) {
      updateQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open, updateQuery]);

  // Prevent body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Filtered items
  const filtered = useMemo(() => {
    if (!query) return items;
    return items.filter((it) => {
      const haystacks = [it.label, it.group ?? "", ...(it.keywords ?? [])];
      return haystacks.some((h) => fuzzyMatch(query, h));
    });
  }, [items, query]);

  const hasIcons = useMemo(() => items.some((it) => it.icon), [items]);

  // Group items
  const grouped = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    filtered.forEach((it) => {
      const g = it.group ?? "Results";
      const list = map.get(g) ?? [];
      list.push(it);
      map.set(g, list);
    });
    return Array.from(map.entries());
  }, [filtered]);

  // Keyboard nav inside the dialog
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(filtered.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const it = filtered[active];
      if (it) { it.onSelect(); setOpen(false); }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLButtonElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  let cursor = 0;

  if (!mounted) return null;

  return createPortal(
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-[100]",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      {/* Backdrop */}
      <motion.div
        initial={false}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: open ? 0.18 : 0.12, ease: EASE_OUT }}
        onClick={() => setOpen(false)}
        className={cn(
          "absolute inset-0 bg-background/60 backdrop-blur-sm",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
      />

      {/* Panel */}
      <div className="pointer-events-none absolute inset-0 flex items-start justify-center p-4 pt-[18vh]">
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          initial={false}
          animate={{
            opacity: open ? 1 : 0,
            y: open || reduce ? 0 : -8,
            scale: open || reduce ? 1 : 0.97,
          }}
          transition={
            reduce
              ? { duration: 0.1 }
              : open
                ? PANEL_SPRING
                : { duration: 0.12, ease: EASE_OUT }
          }
          onKeyDown={onKeyDown}
          className={cn(
            "w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl will-change-transform",
            open ? "pointer-events-auto" : "pointer-events-none",
          )}
        >
          {/* Search row */}
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => updateQuery(e.target.value)}
              placeholder={placeholder}
              tabIndex={open ? 0 : -1}
              role="combobox"
              aria-expanded={open}
              aria-controls={`${uid}-list`}
              aria-activedescendant={
                filtered.length > 0 ? `${uid}-opt-${active}` : undefined
              }
              aria-autocomplete="list"
              className="h-12 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline-block">
              ESC
            </kbd>
          </div>

          {/* Results list */}
          <div
            ref={listRef}
            id={`${uid}-list`}
            role="listbox"
            aria-label="Commands"
            className="max-h-[60vh] overflow-y-auto p-2"
          >
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              grouped.map(([group, list]) => (
                <div key={group} className="mb-1 last:mb-0">
                  <div
                    aria-hidden
                    className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {group}
                  </div>
                  {list.map((it) => {
                    const idx = cursor++;
                    const isActive = idx === active;
                    const Icon = it.icon;
                    return (
                      <button
                        key={it.id}
                        type="button"
                        id={`${uid}-opt-${idx}`}
                        role="option"
                        aria-selected={isActive}
                        data-index={idx}
                        onMouseEnter={() => setActive(idx)}
                        onClick={() => { it.onSelect(); setOpen(false); }}
                        tabIndex={open ? 0 : -1}
                        className={cn(
                          "relative isolate flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors",
                          isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                        )}
                      >
                        {Icon ? (
                          <Icon className="size-4 shrink-0" />
                        ) : hasIcons ? (
                          <span className="size-4 shrink-0" />
                        ) : null}
                        <span className="flex-1 truncate">{it.label}</span>
                        {it.badge ? (
                          <span className="shrink-0">{it.badge}</span>
                        ) : null}
                        {it.hint ? (
                          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            {it.hint}
                          </kbd>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>,
    document.body,
  );
}

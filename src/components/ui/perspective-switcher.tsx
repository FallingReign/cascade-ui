/**
 * PerspectiveSwitcher — Cascade UI Level 2
 *
 * An icon bar where the active perspective expands to a labelled pill.
 * Adapted from beUI expandable-tabs (starc007/ui-components, MIT).
 * Copyright (c) starc007 — rewritten for Tailwind v4 / cascade-ui tokens.
 *
 * Uses motion/react for the expand animation. Slots into AppShell's
 * `toolbar` prop.
 */

"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Easing (inlined — no external ease lib dependency)
// ---------------------------------------------------------------------------
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PerspectiveItem = {
  id: string;
  /** Visible label shown when the tab is active. */
  label: string;
  /** Icon rendered inside the button at all times. */
  icon: ReactNode;
};

export interface PerspectiveSwitcherProps {
  items: PerspectiveItem[];
  /** Controlled active id. */
  value?: string | null;
  /** Initial active id (uncontrolled). */
  defaultValue?: string | null;
  /** Called when the active perspective changes. */
  onValueChange?: (id: string) => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Layout constants (px)
// ---------------------------------------------------------------------------
const TAB_H = 32;   // h-8
const TAB_W = 32;   // closed icon-only width
const BAR_PX = 4;   // horizontal padding inside pill container
const BAR_GAP = 2;  // gap between tabs
const ICON_W = 16;  // icon render width
const LABEL_GAP = 6;
const LABEL_EXTRA_PX = 28; // left+right label padding beyond icon

// Spring presets
const PILL_SPRING = { type: "spring", duration: 0.46, bounce: 0.05 } as const;
const LABEL_OPEN_SPRING = { type: "spring", duration: 0.38, bounce: 0.03 } as const;
const LABEL_CLOSE = { duration: 0.14, ease: EASE_OUT } as const;

// ---------------------------------------------------------------------------
// Label width measurement hook
// ---------------------------------------------------------------------------
function useLabelWidths(items: PerspectiveItem[]) {
  const refs = useRef<Record<string, HTMLSpanElement | null>>({});
  const [widths, setWidths] = useState<Record<string, number>>({});

  const setRef = useCallback(
    (id: string) => (node: HTMLSpanElement | null) => {
      refs.current[id] = node;
    },
    [],
  );

  const measure = useCallback(() => {
    const next: Record<string, number> = {};
    for (const item of items) {
      const node = refs.current[item.id];
      if (node) next[item.id] = Math.ceil(node.offsetWidth);
    }
    setWidths((cur) => {
      const same =
        Object.keys(cur).length === Object.keys(next).length &&
        Object.keys(next).every((k) => cur[k] === next[k]);
      return same ? cur : next;
    });
  }, [items]);

  useLayoutEffect(() => { measure(); }, [measure]);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    for (const item of items) {
      const node = refs.current[item.id];
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, [items, measure]);

  return { setRef, widths };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PerspectiveSwitcher({
  items,
  value,
  defaultValue,
  onValueChange,
  className,
}: PerspectiveSwitcherProps) {
  const reduce = useReducedMotion();
  const controlled = value !== undefined;
  const [internal, setInternal] = useState<string | null>(
    defaultValue ?? items[0]?.id ?? null,
  );
  const activeId = controlled ? value : internal;
  const { setRef, widths } = useLabelWidths(items);

  const setActive = useCallback(
    (id: string) => {
      if (!controlled) setInternal(id);
      onValueChange?.(id);
    },
    [controlled, onValueChange],
  );

  const getTabWidth = useCallback(
    (item: PerspectiveItem) =>
      Math.max(
        TAB_W,
        BAR_PX + ICON_W + LABEL_GAP + (widths[item.id] ?? 0) + LABEL_EXTRA_PX,
      ),
    [widths],
  );

  return (
    <>
      {/* Invisible label sizer — lives outside flow so fonts render naturally */}
      <div aria-hidden className="pointer-events-none fixed left-0 top-0 -z-10 flex opacity-0">
        {items.map((item) => (
          <span
            key={item.id}
            ref={setRef(item.id)}
            className="whitespace-nowrap text-sm font-medium leading-none"
          >
            {item.label}
          </span>
        ))}
      </div>

      <div
        role="tablist"
        aria-label="Perspective switcher"
        className={cn(
          "flex items-center gap-0.5 rounded-lg bg-muted p-1",
          className,
        )}
        style={{ padding: BAR_PX, gap: BAR_GAP }}
      >
        {items.map((item) => {
          const isActive = item.id === activeId;
          const labelWidth = widths[item.id] ?? 0;

          return (
            <motion.button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={item.label}
              onClick={() => setActive(item.id)}
              animate={{
                width: isActive ? getTabWidth(item) : TAB_W,
              }}
              transition={reduce ? { duration: 0 } : PILL_SPRING}
              className={cn(
                "relative isolate flex shrink-0 items-center justify-center overflow-hidden rounded-md outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                "text-sm font-medium transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              style={{ height: TAB_H }}
            >
              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.span
                    key="bg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: EASE_OUT }}
                    className="absolute inset-0 -z-10 rounded-md bg-background shadow-sm"
                  />
                )}
              </AnimatePresence>

              {/* Icon — always centered when collapsed, shifts left when open */}
              <span className="grid shrink-0 place-items-center" style={{ width: ICON_W }}>
                {item.icon}
              </span>

              {/* Label — animates width + opacity */}
              <motion.span
                aria-hidden
                initial={false}
                animate={
                  reduce
                    ? { width: isActive ? labelWidth : 0, opacity: isActive ? 1 : 0, marginLeft: isActive ? LABEL_GAP : 0 }
                    : { width: isActive ? labelWidth : 0, opacity: isActive ? 1 : 0, marginLeft: isActive ? LABEL_GAP : 0, filter: isActive ? "blur(0px)" : "blur(3px)" }
                }
                transition={reduce ? { duration: 0 } : isActive ? LABEL_OPEN_SPRING : LABEL_CLOSE}
                className="inline-block overflow-hidden whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </>
  );
}

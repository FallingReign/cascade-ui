/**
 * KanbanBoard — Cascade UI Level 2
 *
 * Columnar status board with drag-to-move cards. Built on @dnd-kit and
 * shadcn Card + Badge primitives. No motion/react — CSS transitions only.
 *
 * Columns are derived from a status field; cards can be dragged between
 * columns which fires an `onStatusChange` callback.
 */

"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
  closestCenter,
} from "@dnd-kit/core";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type KanbanStatus = {
  id: string;
  label: string;
  /** Optional colour hint — should be a semantic token class name. */
  colorClass?: string;
};

export type KanbanCard = {
  id: string;
  title: string;
  status: string;
  description?: string;
  /** Arbitrary tags shown as small badges. */
  tags?: string[];
  /** Assignee initials or name. */
  assignee?: string;
  /** Priority level. */
  priority?: "low" | "medium" | "high";
};

export interface KanbanBoardProps {
  /** Ordered list of column definitions. */
  statuses: KanbanStatus[];
  /** All cards. */
  cards: KanbanCard[];
  /**
   * Called when a card is dropped onto a different column.
   * The host should update its state; the board does not own card data.
   */
  onStatusChange?: (cardId: string, newStatus: string) => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Priority helpers
// ---------------------------------------------------------------------------

const PRIORITY_COLOR: Record<string, string> = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  low: "bg-muted text-muted-foreground",
};

const PRIORITY_LABEL: Record<string, string> = {
  high: "High",
  medium: "Med",
  low: "Low",
};

// ---------------------------------------------------------------------------
// DraggableCard
// ---------------------------------------------------------------------------

interface DraggableCardProps {
  card: KanbanCard;
  isDragOverlay?: boolean;
}

function KanbanCardItem({ card, isDragOverlay = false }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: card.id,
    data: { card },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative cursor-grab rounded-lg border border-border bg-card p-3",
        "shadow-sm transition-shadow duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isDragging && "opacity-40 shadow-none",
        isDragOverlay &&
          "cursor-grabbing shadow-xl ring-2 ring-ring opacity-100 rotate-1 scale-[1.02]",
      )}
      aria-label={`Kanban card: ${card.title}`}
    >
      {/* Title */}
      <p className="text-sm font-medium text-foreground leading-snug">
        {card.title}
      </p>

      {/* Description */}
      {card.description && (
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
          {card.description}
        </p>
      )}

      {/* Footer row */}
      <div className="mt-2 flex flex-wrap items-center gap-1">
        {/* Priority badge */}
        {card.priority && (
          <span
            className={cn(
              "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium",
              PRIORITY_COLOR[card.priority],
            )}
          >
            {PRIORITY_LABEL[card.priority]}
          </span>
        )}

        {/* Tags */}
        {card.tags?.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
          >
            {tag}
          </span>
        ))}

        {/* Assignee */}
        {card.assignee && (
          <span className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-[9px] font-semibold text-accent-foreground uppercase">
            {card.assignee.slice(0, 2)}
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DroppableColumn
// ---------------------------------------------------------------------------

interface DroppableColumnProps {
  status: KanbanStatus;
  cards: KanbanCard[];
  isOver: boolean;
}

function KanbanColumn({ status, cards, isOver }: DroppableColumnProps) {
  const { setNodeRef } = useDroppable({ id: status.id });

  return (
    <div className="flex w-64 shrink-0 flex-col gap-2">
      {/* Column header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex size-2 rounded-full",
              status.colorClass ?? "bg-muted-foreground",
            )}
          />
          <span className="text-sm font-medium text-foreground">
            {status.label}
          </span>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {cards.length}
        </span>
      </div>

      {/* Card list drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-24 flex-col gap-2 rounded-lg border border-dashed border-border p-2",
          "transition-colors duration-150",
          isOver && "border-ring bg-accent/40",
        )}
      >
        {cards.map((card) => (
          <KanbanCardItem key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// KanbanBoard
// ---------------------------------------------------------------------------

export function KanbanBoard({
  statuses,
  cards,
  onStatusChange,
  className,
}: KanbanBoardProps) {
  const [activeCard, setActiveCard] = React.useState<KanbanCard | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const cardsByStatus = React.useMemo(() => {
    const map = new Map<string, KanbanCard[]>();
    for (const s of statuses) map.set(s.id, []);
    for (const card of cards) {
      const list = map.get(card.status);
      if (list) list.push(card);
      else map.set(card.status, [card]);
    }
    return map;
  }, [statuses, cards]);

  const handleDragStart = (event: DragStartEvent) => {
    const card = event.active.data.current?.card as KanbanCard | undefined;
    setActiveCard(card ?? null);
  };

  const handleDragOver = (event: { over: { id?: string | number } | null }) => {
    setOverId(event.over?.id ? String(event.over.id) : null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    setOverId(null);

    if (!over) return;

    const cardId = String(active.id);
    const newStatus = String(over.id);
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    // Only fire when the status actually changed
    if (card.status !== newStatus && statuses.some((s) => s.id === newStatus)) {
      onStatusChange?.(cardId, newStatus);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        className={cn(
          "flex gap-4 overflow-x-auto p-4 pb-6",
          className,
        )}
      >
        {statuses.map((status) => (
          <KanbanColumn
            key={status.id}
            status={status}
            cards={cardsByStatus.get(status.id) ?? []}
            isOver={overId === status.id}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeCard ? (
          <KanbanCardItem card={activeCard} isDragOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

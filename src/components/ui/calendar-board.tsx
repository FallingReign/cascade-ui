/**
 * CalendarBoard — Cascade UI Level 2
 *
 * A month/week calendar that lays files carrying a date onto a grid.
 * Presentational only — the host supplies events and handles callbacks.
 * No motion/react — CSS transitions only.
 *
 * Slots into AppShell's main area (`children` prop).
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CalendarEvent = {
  id: string;
  /** ISO date string, e.g. "2025-08-15" */
  date: string;
  title: string;
  status?: string;
  tags?: string[];
};

export type CalendarView = "month" | "week";

export interface CalendarBoardProps {
  /** Events to display. The host owns data — component is read-only. */
  events: CalendarEvent[];
  /** Called when the user clicks an event. */
  onEventClick?: (id: string) => void;
  /** Called when the user clicks an empty day cell. */
  onDayClick?: (isoDate: string) => void;
  /** Month to start on (ISO date or "YYYY-MM"). Defaults to current month. */
  initialMonth?: string;
  /** Starting view. Defaults to "month". */
  initialView?: CalendarView;
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Return "YYYY-MM-DD" for a Date object. */
function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse a month string ("YYYY-MM" or "YYYY-MM-DD") → { year, month } (0-indexed month). */
function parseMonth(raw: string): { year: number; month: number } {
  const parts = raw.split("-");
  return {
    year: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10) - 1,
  };
}

/** Return first day of month for given year/month (0-indexed). */
function firstOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

/** Return number of days in a month. */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Build the full 6×7 grid of dates for a month view.
 * Returns dates including leading/trailing days from adjacent months.
 */
function buildMonthGrid(year: number, month: number): Date[] {
  const first = firstOfMonth(year, month);
  const startDow = first.getDay(); // 0=Sun
  const total = daysInMonth(year, month);

  const grid: Date[] = [];

  // Leading days from previous month
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    grid.push(d);
  }

  // Days of this month
  for (let d = 1; d <= total; d++) {
    grid.push(new Date(year, month, d));
  }

  // Trailing days to fill to 42 cells (6 rows × 7 cols)
  const remaining = 42 - grid.length;
  for (let d = 1; d <= remaining; d++) {
    grid.push(new Date(year, month + 1, d));
  }

  return grid;
}

/**
 * Return the 7-day week containing a given date (starting Sunday).
 */
function buildWeekDays(anchor: Date): Date[] {
  const dow = anchor.getDay();
  const sunday = new Date(anchor);
  sunday.setDate(anchor.getDate() - dow);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });
}

/** Group events by ISO date string. */
function groupByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();
  for (const ev of events) {
    const key = ev.date.slice(0, 10); // normalise to YYYY-MM-DD
    const list = map.get(key) ?? [];
    list.push(ev);
    map.set(key, list);
  }
  return map;
}

/** Map a status string to a dot colour class (semantic-token-based). */
function statusDotClass(status?: string): string {
  switch (status) {
    case "done": return "bg-green-500 dark:bg-green-400";
    case "in-progress": return "bg-amber-500 dark:bg-amber-400";
    case "review": return "bg-blue-500 dark:bg-blue-400";
    case "todo": return "bg-muted-foreground";
    default: return "bg-primary";
  }
}

// ---------------------------------------------------------------------------
// Event pill
// ---------------------------------------------------------------------------

interface EventPillProps {
  event: CalendarEvent;
  onClick?: (id: string) => void;
  compact?: boolean;
}

function EventPill({ event, onClick, compact = false }: EventPillProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(event.id);
      }}
      className={cn(
        "flex w-full items-center gap-1 rounded px-1 py-0.5 text-left",
        "text-xs font-medium text-foreground",
        "bg-accent hover:bg-accent/80 transition-colors duration-100",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "truncate",
      )}
      title={event.title}
      aria-label={`Event: ${event.title}`}
    >
      <span
        className={cn(
          "inline-block shrink-0 rounded-full",
          compact ? "size-1.5" : "size-2",
          statusDotClass(event.status),
        )}
        aria-hidden
      />
      <span className="truncate">{event.title}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Month cell
// ---------------------------------------------------------------------------

const MAX_VISIBLE = 3;

interface MonthCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
  onEventClick?: (id: string) => void;
  onDayClick?: (isoDate: string) => void;
}

function MonthCell({
  date,
  isCurrentMonth,
  isToday,
  events,
  onEventClick,
  onDayClick,
}: MonthCellProps) {
  const iso = toISODate(date);
  const visible = events.slice(0, MAX_VISIBLE);
  const overflow = events.length - MAX_VISIBLE;

  return (
    <div
      role="gridcell"
      tabIndex={0}
      aria-label={`${iso}${events.length ? `, ${events.length} event${events.length > 1 ? "s" : ""}` : ""}`}
      onClick={() => onDayClick?.(iso)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onDayClick?.(iso);
      }}
      className={cn(
        "relative flex min-h-[90px] flex-col gap-0.5 rounded-md border border-transparent p-1 text-left",
        "cursor-pointer select-none transition-colors duration-100",
        "hover:border-border hover:bg-accent/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        !isCurrentMonth && "opacity-30",
      )}
    >
      {/* Day number */}
      <span
        className={cn(
          "inline-flex size-6 items-center justify-center self-start rounded-full text-xs font-medium",
          isToday
            ? "bg-primary text-primary-foreground"
            : "text-foreground",
        )}
      >
        {date.getDate()}
      </span>

      {/* Events */}
      <div className="flex flex-col gap-0.5">
        {visible.map((ev) => (
          <EventPill key={ev.id} event={ev} onClick={onEventClick} />
        ))}
        {overflow > 0 && (
          <span className="px-1 text-[10px] text-muted-foreground">
            +{overflow} more
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Week row cell
// ---------------------------------------------------------------------------

interface WeekCellProps {
  date: Date;
  isToday: boolean;
  events: CalendarEvent[];
  onEventClick?: (id: string) => void;
  onDayClick?: (isoDate: string) => void;
}

function WeekCell({ date, isToday, events, onEventClick, onDayClick }: WeekCellProps) {
  const iso = toISODate(date);

  return (
    <div
      role="gridcell"
      tabIndex={0}
      aria-label={`${iso}${events.length ? `, ${events.length} event${events.length > 1 ? "s" : ""}` : ""}`}
      onClick={() => onDayClick?.(iso)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onDayClick?.(iso);
      }}
      className={cn(
        "flex flex-1 flex-col gap-0.5 rounded-md border border-transparent p-1",
        "cursor-pointer select-none transition-colors duration-100",
        "hover:border-border hover:bg-accent/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      {/* Day number */}
      <span
        className={cn(
          "inline-flex size-6 items-center justify-center self-center rounded-full text-xs font-medium",
          isToday
            ? "bg-primary text-primary-foreground"
            : "text-foreground",
        )}
      >
        {date.getDate()}
      </span>

      {/* Events stacked vertically */}
      <div className="flex flex-col gap-0.5">
        {events.map((ev) => (
          <EventPill key={ev.id} event={ev} onClick={onEventClick} compact />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CalendarBoard
// ---------------------------------------------------------------------------

export function CalendarBoard({
  events,
  onEventClick,
  onDayClick,
  initialMonth,
  initialView = "month",
  className,
}: CalendarBoardProps) {
  const todayDate = React.useMemo(() => new Date(), []);
  const todayISO = toISODate(todayDate);

  // Derive initial year/month from prop or today
  const initial = React.useMemo(() => {
    if (initialMonth) return parseMonth(initialMonth);
    return { year: todayDate.getFullYear(), month: todayDate.getMonth() };
  }, [initialMonth, todayDate]);

  const [year, setYear] = React.useState(initial.year);
  const [month, setMonth] = React.useState(initial.month);
  const [view, setView] = React.useState<CalendarView>(initialView);

  // For week view: anchor day (defaults to today if in current month, else 1st)
  const [weekAnchor, setWeekAnchor] = React.useState<Date>(() => {
    if (initialMonth) {
      const { year: y, month: m } = parseMonth(initialMonth);
      return new Date(y, m, 1);
    }
    return todayDate;
  });

  // Index events by date
  const eventsByDate = React.useMemo(() => groupByDate(events), [events]);

  // Navigation
  const goPrev = () => {
    if (view === "month") {
      if (month === 0) { setYear((y) => y - 1); setMonth(11); }
      else setMonth((m) => m - 1);
    } else {
      setWeekAnchor((a) => {
        const d = new Date(a);
        d.setDate(d.getDate() - 7);
        return d;
      });
    }
  };

  const goNext = () => {
    if (view === "month") {
      if (month === 11) { setYear((y) => y + 1); setMonth(0); }
      else setMonth((m) => m + 1);
    } else {
      setWeekAnchor((a) => {
        const d = new Date(a);
        d.setDate(d.getDate() + 7);
        return d;
      });
    }
  };

  const goToday = () => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth());
    setWeekAnchor(now);
  };

  // Month grid
  const monthGrid = React.useMemo(
    () => (view === "month" ? buildMonthGrid(year, month) : []),
    [view, year, month],
  );

  // Week days
  const weekDays = React.useMemo(
    () => (view === "week" ? buildWeekDays(weekAnchor) : []),
    [view, weekAnchor],
  );

  // Header label
  const headerLabel =
    view === "month"
      ? `${MONTH_NAMES[month]} ${year}`
      : (() => {
          const first = weekDays[0];
          const last = weekDays[6];
          if (!first || !last) return "";
          const sameMonth = first.getMonth() === last.getMonth();
          if (sameMonth) {
            return `${MONTH_NAMES[first.getMonth()]} ${first.getDate()}–${last.getDate()}, ${first.getFullYear()}`;
          }
          return `${MONTH_NAMES[first.getMonth()]} ${first.getDate()} – ${MONTH_NAMES[last.getMonth()]} ${last.getDate()}, ${last.getFullYear()}`;
        })();

  return (
    <div className={cn("flex h-full flex-col overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-2">
        {/* Calendar icon + label */}
        <Calendar className="size-4 text-muted-foreground" aria-hidden />
        <span className="min-w-[180px] text-sm font-semibold text-foreground" aria-live="polite">
          {headerLabel}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous"
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-md border border-border",
              "text-muted-foreground hover:bg-accent hover:text-foreground",
              "transition-colors duration-100",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next"
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-md border border-border",
              "text-muted-foreground hover:bg-accent hover:text-foreground",
              "transition-colors duration-100",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <ChevronRight className="size-4" />
          </button>
          <button
            type="button"
            onClick={goToday}
            className={cn(
              "rounded-md border border-border px-2.5 py-1 text-xs font-medium",
              "text-muted-foreground hover:bg-accent hover:text-foreground",
              "transition-colors duration-100",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            Today
          </button>
        </div>

        <div className="flex-1" />

        {/* View toggle */}
        <div
          role="group"
          aria-label="Calendar view"
          className="flex rounded-md border border-border p-0.5 gap-0.5"
        >
          {(["month", "week"] as CalendarView[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={cn(
                "rounded px-2.5 py-1 text-xs font-medium capitalize transition-colors duration-100",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                view === v
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        {view === "month" ? (
          <div className="min-w-[420px] p-3">
            {/* Day-of-week headers */}
            <div
              role="row"
              className="mb-1 grid grid-cols-7 gap-1"
              aria-label="Days of week"
            >
              {DAYS_OF_WEEK.map((d) => (
                <div
                  key={d}
                  role="columnheader"
                  className="py-1 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* 6 × 7 grid */}
            <div
              role="grid"
              aria-label={`Month of ${MONTH_NAMES[month]} ${year}`}
              className="grid grid-cols-7 gap-1"
            >
              {monthGrid.map((date) => {
                const iso = toISODate(date);
                return (
                  <MonthCell
                    key={iso}
                    date={date}
                    isCurrentMonth={date.getMonth() === month}
                    isToday={iso === todayISO}
                    events={eventsByDate.get(iso) ?? []}
                    onEventClick={onEventClick}
                    onDayClick={onDayClick}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <div className="min-w-[420px] p-3">
            {/* Day-of-week headers with date numbers */}
            <div
              role="row"
              className="mb-1 grid grid-cols-7 gap-1"
              aria-label="Days of week"
            >
              {weekDays.map((date) => {
                const iso = toISODate(date);
                const isToday = iso === todayISO;
                return (
                  <div
                    key={iso}
                    role="columnheader"
                    className="flex flex-col items-center py-1"
                  >
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {DAYS_OF_WEEK[date.getDay()]}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                        isToday
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground",
                      )}
                    >
                      {date.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Single row of cells */}
            <div
              role="grid"
              aria-label={`Week of ${toISODate(weekDays[0] ?? new Date())}`}
              className="grid grid-cols-7 gap-1"
            >
              {weekDays.map((date) => {
                const iso = toISODate(date);
                return (
                  <WeekCell
                    key={iso}
                    date={date}
                    isToday={iso === todayISO}
                    events={eventsByDate.get(iso) ?? []}
                    onEventClick={onEventClick}
                    onDayClick={onDayClick}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

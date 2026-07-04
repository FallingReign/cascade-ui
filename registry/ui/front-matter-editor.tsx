/**
 * FrontMatterEditor — Cascade UI Level 2
 *
 * Renders and edits a typed key-value metadata set. Built on shadcn form
 * primitives (Input, Select, Textarea, Label). No motion/react — CSS
 * transitions only. Emits changes via `onFieldChange` callback.
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Field type definitions
// ---------------------------------------------------------------------------

export type FrontMatterFieldType =
  | "text"
  | "number"
  | "date"
  | "select"
  | "multiselect"
  | "boolean"
  | "textarea";

export type FrontMatterField = {
  key: string;
  label: string;
  type: FrontMatterFieldType;
  /** Options for select / multiselect fields. */
  options?: string[];
  placeholder?: string;
  description?: string;
};

export type FrontMatterValue =
  | string
  | number
  | boolean
  | string[]
  | null
  | undefined;

export interface FrontMatterEditorProps {
  /** Field schema — defines keys, types, and options. */
  fields: FrontMatterField[];
  /** Current values, keyed by `field.key`. */
  values: Record<string, FrontMatterValue>;
  /**
   * Called whenever a field value changes.
   * The host owns data — update `values` prop after each change.
   */
  onFieldChange?: (key: string, value: FrontMatterValue) => void;
  /** When true all inputs are rendered read-only. */
  readOnly?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Shared label for every field row. */
function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-medium text-muted-foreground mb-1 select-none"
    >
      {children}
    </label>
  );
}

/** Optional description text under a field. */
function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-0.5 text-[10px] text-muted-foreground/70">{children}</p>
  );
}

// Shared input class
const INPUT_CLS =
  "flex h-8 w-full rounded-md border border-input bg-background px-2.5 py-1 text-sm text-foreground shadow-none outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

// ---------------------------------------------------------------------------
// Individual field renderers
// ---------------------------------------------------------------------------

interface FieldRendererProps {
  field: FrontMatterField;
  value: FrontMatterValue;
  onChange: (value: FrontMatterValue) => void;
  readOnly: boolean;
}

function TextField({ field, value, onChange, readOnly }: FieldRendererProps) {
  const id = `fme-${field.key}`;
  return (
    <div>
      <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
      <input
        id={id}
        type="text"
        className={INPUT_CLS}
        value={String(value ?? "")}
        placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}…`}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
      />
      {field.description && <FieldHint>{field.description}</FieldHint>}
    </div>
  );
}

function NumberField({ field, value, onChange, readOnly }: FieldRendererProps) {
  const id = `fme-${field.key}`;
  return (
    <div>
      <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
      <input
        id={id}
        type="number"
        className={INPUT_CLS}
        value={value !== null && value !== undefined ? String(value) : ""}
        placeholder={field.placeholder ?? "0"}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.valueAsNumber)}
      />
      {field.description && <FieldHint>{field.description}</FieldHint>}
    </div>
  );
}

function DateField({ field, value, onChange, readOnly }: FieldRendererProps) {
  const id = `fme-${field.key}`;
  return (
    <div>
      <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
      <input
        id={id}
        type="date"
        className={cn(INPUT_CLS, "cursor-pointer")}
        value={String(value ?? "")}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
      />
      {field.description && <FieldHint>{field.description}</FieldHint>}
    </div>
  );
}

function TextareaField({ field, value, onChange, readOnly }: FieldRendererProps) {
  const id = `fme-${field.key}`;
  return (
    <div>
      <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
      <textarea
        id={id}
        rows={3}
        className={cn(
          INPUT_CLS,
          "h-auto resize-none py-2 leading-relaxed",
        )}
        value={String(value ?? "")}
        placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}…`}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
      />
      {field.description && <FieldHint>{field.description}</FieldHint>}
    </div>
  );
}

function SelectField({ field, value, onChange, readOnly }: FieldRendererProps) {
  const id = `fme-${field.key}`;
  const options = field.options ?? [];
  return (
    <div>
      <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
      <select
        id={id}
        className={cn(
          INPUT_CLS,
          "cursor-pointer appearance-none bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M4 6l4 4 4-4' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")] bg-[length:1rem_1rem] bg-[right_0.5rem_center] bg-no-repeat pr-7",
        )}
        value={String(value ?? "")}
        disabled={readOnly}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">— Select —</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {field.description && <FieldHint>{field.description}</FieldHint>}
    </div>
  );
}

function MultiSelectField({ field, value, onChange, readOnly }: FieldRendererProps) {
  const options = field.options ?? [];
  const selected: string[] = Array.isArray(value) ? (value as string[]) : [];

  const toggle = (opt: string) => {
    if (readOnly) return;
    const next = selected.includes(opt)
      ? selected.filter((s) => s !== opt)
      : [...selected, opt];
    onChange(next);
  };

  return (
    <div>
      <span className="block text-xs font-medium text-muted-foreground mb-1 select-none">
        {field.label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              aria-pressed={active}
              disabled={readOnly}
              onClick={() => toggle(opt)}
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
                "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                readOnly && "pointer-events-none opacity-60",
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {field.description && <FieldHint>{field.description}</FieldHint>}
    </div>
  );
}

function BooleanField({ field, value, onChange, readOnly }: FieldRendererProps) {
  const id = `fme-${field.key}`;
  const checked = Boolean(value);
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex-1">
        <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
        {field.description && <FieldHint>{field.description}</FieldHint>}
      </div>
      {/* Simple toggle switch */}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={readOnly}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
          "transition-colors duration-200 ease-in-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          checked ? "bg-primary" : "bg-input",
          readOnly && "pointer-events-none opacity-60",
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block size-4 rounded-full bg-background shadow-sm",
            "transform transition-transform duration-200 ease-in-out",
            checked ? "translate-x-4" : "translate-x-0",
          )}
        />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Field dispatcher
// ---------------------------------------------------------------------------

function FieldRenderer(props: FieldRendererProps) {
  switch (props.field.type) {
    case "text":     return <TextField {...props} />;
    case "number":   return <NumberField {...props} />;
    case "date":     return <DateField {...props} />;
    case "textarea": return <TextareaField {...props} />;
    case "select":   return <SelectField {...props} />;
    case "multiselect": return <MultiSelectField {...props} />;
    case "boolean":  return <BooleanField {...props} />;
    default:         return <TextField {...props} />;
  }
}

// ---------------------------------------------------------------------------
// FrontMatterEditor
// ---------------------------------------------------------------------------

export function FrontMatterEditor({
  fields,
  values,
  onFieldChange,
  readOnly = false,
  className,
}: FrontMatterEditorProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-border bg-card p-4",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-sm font-semibold text-foreground">Properties</h3>
        {readOnly && (
          <span className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            Read-only
          </span>
        )}
      </div>

      {/* Fields */}
      {fields.map((field) => (
        <FieldRenderer
          key={field.key}
          field={field}
          value={values[field.key]}
          readOnly={readOnly}
          onChange={(val) => onFieldChange?.(field.key, val)}
        />
      ))}

      {fields.length === 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No properties defined.
        </p>
      )}
    </div>
  );
}

/**
 * ProjectBudgetChart — Yina's editable "Project Budget" chart for the Overview
 * tab (Figma frame budgetA / node 7331:19825). Rendered 1:1 from the spec:
 *
 *  - white rounded panel, 1px #e0e0e0 border; every row 52px tall with full-width
 *    #e0e0e0 horizontal dividers.
 *  - header row (#d1dfb4): Description | Qty | Rate | Total | Notes (+ unlabelled
 *    actions column).
 *  - four section groups; each = one section-header row (#edf3dc, UPPERCASE label
 *    + "+ Add line item" + right-aligned "Section subtotal" + bold amount), then N
 *    editable data rows (white, bold Total cell, trailing "…" row menu).
 *  - a final Project Total row (#edf3dc, 16px semibold, amount right-aligned).
 *
 * Editable = inline inputs styled to read as plain static text at rest
 * (borderless, transparent), with a light focus affordance. Editing Qty or Rate
 * recomputes that row's Total, its section Subtotal, and the Project Total live.
 * "+ Add line item" appends a blank editable row to the section. The row "…" menu
 * (duplicate / copy link / delete) mutates the row and fires a toast. Description
 * and Notes are editable text.
 *
 * Row Total is computed, never stored: percentage qty ("20%","10%") → that
 * percent of the rate (rate is the base); otherwise leadingNumber(qty) × rate.
 */
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal, Copy, Link2, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/shadcn/dropdown-menu";
import { PROJECT_BUDGET } from "./mockData";

/* ── number / currency helpers ─────────────────────────────────────────── */

const parseMoney = (v) => {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = parseFloat(String(v).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const fmtMoney = (n) =>
  "$" +
  (Number.isFinite(n) ? n : 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/** Percentage qty ("20%") → pct% of rate; else leadingNumber(qty) × rate. */
const rowTotal = (qty, rate) => {
  const r = parseMoney(rate);
  const q = String(qty).trim();
  const num = parseFloat(q.replace(/[^0-9.]/g, ""));
  const n = Number.isFinite(num) ? num : 0;
  return q.includes("%") ? (n / 100) * r : n * r;
};

let addSeq = 0;
const nextRowId = () => `budget-added-${++addSeq}`;

/* ── editable cell ─────────────────────────────────────────────────────── */

function CellInput({ value, onChange, align = "left", bold = false, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-sm bg-transparent px-1 py-0.5 text-sm text-[#09090b] outline-none placeholder:text-[#71717a] focus:bg-[#f7f7f2] focus:ring-1 focus:ring-[#b5d400] ${
        align === "right" ? "text-right" : "text-left"
      } ${bold ? "font-semibold" : "font-normal"}`}
    />
  );
}

/* ── component ─────────────────────────────────────────────────────────── */

export default function ProjectBudgetChart({ query = "" }) {
  const [sections, setSections] = useState(() =>
    PROJECT_BUDGET.sections.map((s) => ({
      ...s,
      rows: s.rows.map((r) => ({ ...r })),
    }))
  );

  const q = query.trim().toLowerCase();

  // Row that currently owns keyboard focus (any of its cells). Kept visible
  // even if its description stops matching the query, so typing under an
  // active filter can never unmount the focused input mid-edit.
  const [editingRowId, setEditingRowId] = useState(null);

  const updateRow = (sectionId, rowId, patch) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              rows: s.rows.map((r) => (r.id === rowId ? { ...r, ...patch } : r)),
            }
      )
    );

  const addLineItem = (sectionId) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              rows: [
                ...s.rows,
                {
                  id: nextRowId(),
                  description: "",
                  qty: "",
                  rate: "",
                  notes: "",
                },
              ],
            }
      )
    );

  const duplicateRow = (sectionId, rowId) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const idx = s.rows.findIndex((r) => r.id === rowId);
        if (idx === -1) return s;
        const clone = { ...s.rows[idx], id: nextRowId() };
        const rows = [...s.rows];
        rows.splice(idx + 1, 0, clone);
        return { ...s, rows };
      })
    );
    toast.success("Line item duplicated");
  };

  const deleteRow = (sectionId, rowId) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : { ...s, rows: s.rows.filter((r) => r.id !== rowId) }
      )
    );
    toast.success("Line item removed");
  };

  const reformatRate = (sectionId, rowId, raw) => {
    if (!String(raw).trim()) return; // leave blank cells blank
    updateRow(sectionId, rowId, { rate: fmtMoney(parseMoney(raw)) });
  };

  // Subtotals + project total derive from ALL rows (filtering is view-only).
  const subtotals = useMemo(
    () =>
      Object.fromEntries(
        sections.map((s) => [
          s.id,
          s.rows.reduce((sum, r) => sum + rowTotal(r.qty, r.rate), 0),
        ])
      ),
    [sections]
  );
  const projectTotal = useMemo(
    () => Object.values(subtotals).reduce((a, b) => a + b, 0),
    [subtotals]
  );

  return (
    <div className="overflow-x-auto">
      {q && (
        <p className="mb-2 text-xs text-neutral-500">
          Filtered view — subtotals and project total reflect all items.
        </p>
      )}
      <div className="min-w-[860px] overflow-hidden rounded-md border border-[#e0e0e0] bg-white">
        <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "34%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "31%" }} />
            <col style={{ width: "6%" }} />
          </colgroup>

          {/* Header row (#d1dfb4) */}
          <thead>
            <tr className="h-[52px] bg-[#d1dfb4] [&>th]:px-4">
              <th className="text-left text-xs font-semibold text-[#09090b]">
                Description
              </th>
              <th className="text-right text-xs font-semibold text-[#09090b]">
                Qty
              </th>
              <th className="text-right text-xs font-semibold text-[#09090b]">
                Rate
              </th>
              <th className="text-right text-xs font-semibold text-[#09090b]">
                Total
              </th>
              <th className="text-left text-xs font-semibold text-[#09090b]">
                Notes
              </th>
              <th aria-hidden="true" />
            </tr>
          </thead>

          <tbody>
            {sections.map((section) => {
              const visibleRows = q
                ? section.rows.filter(
                    (r) =>
                      r.id === editingRowId ||
                      r.description.toLowerCase().includes(q)
                  )
                : section.rows;
              // When filtering, hide sections with no matching rows — but a
              // section holding the editing row keeps at least that row above,
              // so it (and the in-progress edit) stays mounted.
              if (q && visibleRows.length === 0) return null;

              return (
                <SectionGroup
                  key={section.id}
                  section={section}
                  visibleRows={visibleRows}
                  subtotal={subtotals[section.id]}
                  onEditingRowChange={setEditingRowId}
                  onAddLine={() => addLineItem(section.id)}
                  onEdit={(rowId, patch) =>
                    updateRow(section.id, rowId, patch)
                  }
                  onRateBlur={(rowId, raw) =>
                    reformatRate(section.id, rowId, raw)
                  }
                  onDuplicate={(rowId) => duplicateRow(section.id, rowId)}
                  onDelete={(rowId) => deleteRow(section.id, rowId)}
                />
              );
            })}

            {/* Project Total row (#edf3dc) */}
            <tr className="h-[52px] bg-[#edf3dc]">
              <td className="px-4 text-base font-semibold text-[#09090b]">
                PROJECT TOTAL
              </td>
              <td
                colSpan={5}
                className="px-6 text-right text-base font-semibold text-[#09090b]"
              >
                {fmtMoney(projectTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── section group: header row + data rows ─────────────────────────────── */

function SectionGroup({
  section,
  visibleRows,
  subtotal,
  onEditingRowChange,
  onAddLine,
  onEdit,
  onRateBlur,
  onDuplicate,
  onDelete,
}) {
  return (
    <>
      {/* Section header row (#edf3dc) */}
      <tr className="h-[52px] bg-[#edf3dc] [&>td]:border-b [&>td]:border-[#e0e0e0]">
        <td className="px-4">
          <div className="flex items-center">
            <span className="text-xs font-semibold uppercase text-[#09090b]">
              {section.label}
            </span>
            <button
              type="button"
              onClick={onAddLine}
              className="ml-auto mr-2 whitespace-nowrap text-sm font-medium text-[#09090b] hover:underline"
            >
              + Add line item
            </button>
          </div>
        </td>
        <td />
        <td />
        <td className="whitespace-nowrap px-4 text-right align-middle text-xs font-normal text-[#09090b]">
          Section subtotal
        </td>
        <td className="px-4 text-left align-middle text-sm font-semibold text-[#09090b]">
          {fmtMoney(subtotal)}
        </td>
        <td />
      </tr>

      {/* Data rows (white) */}
      {visibleRows.map((row) => (
        <tr
          key={row.id}
          onFocus={() => onEditingRowChange(row.id)}
          onBlur={(e) => {
            // Keep the edit "active" while focus hops between cells of the
            // same row; only release when focus leaves the row entirely.
            if (!e.currentTarget.contains(e.relatedTarget)) {
              onEditingRowChange((current) =>
                current === row.id ? null : current
              );
            }
          }}
          className="h-[52px] bg-white [&>td]:border-b [&>td]:border-[#e0e0e0]"
        >
          <td className="px-3">
            <CellInput
              value={row.description}
              placeholder="Description"
              onChange={(v) => onEdit(row.id, { description: v })}
            />
          </td>
          <td className="px-3">
            <CellInput
              value={row.qty}
              align="right"
              placeholder="Qty"
              onChange={(v) => onEdit(row.id, { qty: v })}
            />
          </td>
          <td className="px-3">
            <input
              type="text"
              value={row.rate}
              placeholder="Rate"
              onChange={(e) => onEdit(row.id, { rate: e.target.value })}
              onBlur={(e) => onRateBlur(row.id, e.target.value)}
              className="w-full rounded-sm bg-transparent px-1 py-0.5 text-right text-sm font-normal text-[#09090b] outline-none placeholder:text-[#71717a] focus:bg-[#f7f7f2] focus:ring-1 focus:ring-[#b5d400]"
            />
          </td>
          {/* Total — computed, read-only, bold (only bold cell in a data row) */}
          <td className="px-4 text-right text-sm font-semibold text-[#09090b]">
            {fmtMoney(rowTotal(row.qty, row.rate))}
          </td>
          <td className="px-3">
            <CellInput
              value={row.notes}
              placeholder="Notes"
              onChange={(v) => onEdit(row.id, { notes: v })}
            />
          </td>
          {/* Actions — "…" row menu (data rows only) */}
          <td className="text-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Row actions"
                  className="inline-flex size-7 items-center justify-center rounded-sm text-[#09090b] hover:bg-[#f2f2ec]"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onDuplicate(row.id)}>
                  <Copy className="size-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => toast.success("Line item link copied")}
                >
                  <Link2 className="size-4" />
                  Copy link
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(row.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </td>
        </tr>
      ))}
    </>
  );
}

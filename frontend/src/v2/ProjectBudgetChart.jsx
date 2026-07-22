/**
 * ProjectBudgetChart — Yina's editable production budget table. Now the whole
 * surface of the project's dedicated "Budget" tab (Figma frame
 * "Project  Production Budget" / node 7331:19825), no longer embedded on
 * Overview. Rendered from the spec:
 *
 *  - column-header row (#d1dfb4): Title (sortable, ⇅) | Qty | Rate | Total |
 *    Notes | trailing "+" (add-column affordance).
 *  - four collapsible section groups. Each = a section-header row (#f2f6e1,
 *    ▼ caret + Title-case label + right-aligned "Section Subtotal: $X"), then N
 *    editable data rows (white, leading checkbox, computed bold Total), then a
 *    muted "Add Item…" row.
 *  - a "+ Add section" row, then THREE project-level total rows (#f2f6e1):
 *    PROJECT TOTAL ESTIMATED BUDGET · PROJECT TOTAL ACTUAL COST · VARIANCE.
 *
 * Live math: each row's estimated Total is COMPUTED (percentage qty → that
 * percent of rate; else leadingNumber(qty) × rate). Estimated total = Σ row
 * totals; actual cost = Σ row `actual`; variance = actual − estimated. Editing a
 * Qty/Rate recomputes that row's Total, its section subtotal, the estimated
 * total AND the variance live (actual is a stored per-line figure; add / blank
 * rows shift it too). Seed = "no variance yet": actual == estimated, variance $0.
 *
 * Editable cells read as plain static text at rest (borderless/transparent) with
 * a light focus affordance. A filter (`query`) hides non-matching rows view-only
 * (subtotals/totals always reflect ALL rows); the row that owns focus stays
 * mounted so typing under a live filter can never unmount the input mid-edit.
 */
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, ChevronsUpDown, Plus } from "lucide-react";
import { Checkbox } from "@/components/shadcn/checkbox";
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

/** Signed, colour-coded variance (actual − estimated). Over budget reads red. */
const fmtVariance = (n) => {
  const body = Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (Math.abs(n) < 0.005) return { text: "$0.00", cls: "text-[#09090b]" };
  if (n > 0) return { text: `+$${body}`, cls: "text-[#b91c1c]" }; // over budget
  return { text: `−$${body}`, cls: "text-[#5b6f00]" }; // under budget
};

let addSeq = 0;
const nextRowId = () => `budget-added-${++addSeq}`;
const nextSectionId = () => `budget-section-${++addSeq}`;

/* ── editable cell ─────────────────────────────────────────────────────── */

function CellInput({ value, onChange, bold = false, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-sm bg-transparent px-1 py-0.5 text-left text-sm text-[#09090b] outline-none placeholder:text-[#71717a] focus:bg-[#f7f7f2] focus:ring-1 focus:ring-[#b5d400] ${
        bold ? "font-semibold" : "font-normal"
      }`}
    />
  );
}

/* ── component ─────────────────────────────────────────────────────────── */

export default function ProjectBudgetChart({ query = "" }) {
  const [sections, setSections] = useState(() =>
    PROJECT_BUDGET.sections.map((s) => ({
      ...s,
      open: true,
      rows: s.rows.map((r) => ({ ...r })),
    }))
  );

  const q = query.trim().toLowerCase();

  // Row that currently owns keyboard focus (any of its cells). Kept visible
  // even if its description stops matching the query, so typing under an active
  // filter can never unmount the focused input mid-edit.
  const [editingRowId, setEditingRowId] = useState(null);
  // Bulk-select checkboxes (design affordance; view-state only).
  const [selected, setSelected] = useState(() => new Set());
  // Title sort: null → asc → desc → null. View-only (never mutates stored order).
  const [sortDir, setSortDir] = useState(null);

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
              open: true,
              rows: [
                ...s.rows,
                {
                  id: nextRowId(),
                  description: "",
                  qty: "",
                  rate: "",
                  actual: "",
                  notes: "",
                },
              ],
            }
      )
    );

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      { id: nextSectionId(), label: "New section", open: true, rows: [] },
    ]);
    toast.success("Section added");
  };

  const toggleSection = (sectionId) =>
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, open: !s.open } : s))
    );

  const toggleSelect = (rowId) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(rowId) ? next.delete(rowId) : next.add(rowId);
      return next;
    });

  const cycleSort = () =>
    setSortDir((d) => (d === null ? "asc" : d === "asc" ? "desc" : null));

  const reformatRate = (sectionId, rowId, raw) => {
    if (!String(raw).trim()) return; // leave blank cells blank
    updateRow(sectionId, rowId, { rate: fmtMoney(parseMoney(raw)) });
  };

  // Subtotals + the three project totals derive from ALL rows (filtering and
  // sorting are view-only).
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
  const estimatedTotal = useMemo(
    () => Object.values(subtotals).reduce((a, b) => a + b, 0),
    [subtotals]
  );
  const actualTotal = useMemo(
    () =>
      sections.reduce(
        (sum, s) => sum + s.rows.reduce((a, r) => a + parseMoney(r.actual), 0),
        0
      ),
    [sections]
  );
  const variance = actualTotal - estimatedTotal;
  const varianceFmt = fmtVariance(variance);

  const sortRows = (rows) => {
    if (!sortDir) return rows;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...rows].sort(
      (a, b) => a.description.localeCompare(b.description) * dir
    );
  };

  return (
    <div className="overflow-x-auto">
      {q && (
        <p className="mb-2 text-xs text-neutral-500">
          Filtered view — subtotals and project totals reflect all items.
        </p>
      )}
      <div className="min-w-[900px] overflow-hidden rounded-md border border-[#e4e4e7] bg-white">
        <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "28%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "31%" }} />
            <col style={{ width: "6%" }} />
          </colgroup>

          {/* Column-header row (#d1dfb4) */}
          <thead>
            <tr className="h-[52px] bg-[#d1dfb4] [&>th]:px-4">
              <th className="text-left">
                <button
                  type="button"
                  onClick={cycleSort}
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#3f3f46]"
                  title="Sort by title"
                >
                  Title
                  <ChevronsUpDown
                    className={`size-3.5 ${
                      sortDir ? "text-[#5b6f00]" : "text-[#71717a]"
                    }`}
                  />
                </button>
              </th>
              <th className="text-left text-sm font-medium text-[#3f3f46]">Qty</th>
              <th className="text-left text-sm font-medium text-[#3f3f46]">Rate</th>
              <th className="text-left text-sm font-medium text-[#3f3f46]">Total</th>
              <th className="text-left text-sm font-medium text-[#3f3f46]">Notes</th>
              <th className="text-right">
                <button
                  type="button"
                  onClick={() => toast("Custom columns are coming soon")}
                  aria-label="Add column"
                  title="Add column"
                  className="inline-flex size-6 items-center justify-center rounded-sm text-[#3f3f46] hover:bg-[#c3d3a3]"
                >
                  <Plus className="size-4" />
                </button>
              </th>
            </tr>
          </thead>

          <tbody>
            {sections.map((section) => {
              const filtered = q
                ? section.rows.filter(
                    (r) =>
                      r.id === editingRowId ||
                      r.description.toLowerCase().includes(q)
                  )
                : section.rows;
              // When filtering, hide sections with no matching rows — but a
              // section holding the editing row keeps at least that row above,
              // so it (and the in-progress edit) stays mounted.
              if (q && filtered.length === 0) return null;
              const visibleRows = sortRows(filtered);

              return (
                <SectionGroup
                  key={section.id}
                  section={section}
                  visibleRows={visibleRows}
                  subtotal={subtotals[section.id]}
                  selected={selected}
                  onToggleSelect={toggleSelect}
                  onToggleSection={() => toggleSection(section.id)}
                  onEditingRowChange={setEditingRowId}
                  onAddLine={() => addLineItem(section.id)}
                  onEdit={(rowId, patch) => updateRow(section.id, rowId, patch)}
                  onRateBlur={(rowId, raw) =>
                    reformatRate(section.id, rowId, raw)
                  }
                />
              );
            })}

            {/* + Add section */}
            <tr className="h-[52px] bg-white [&>td]:border-b [&>td]:border-[#e4e4e7]">
              <td colSpan={6} className="px-4">
                <button
                  type="button"
                  onClick={addSection}
                  className="inline-flex items-center gap-2 text-sm text-[#71717a] hover:text-[#09090b]"
                >
                  <Plus className="size-4" />
                  Add section
                </button>
              </td>
            </tr>

            {/* Project-level totals (#f2f6e1) — estimated / actual / variance */}
            <TotalRow label="PROJECT TOTAL ESTIMATED BUDGET" value={fmtMoney(estimatedTotal)} />
            <TotalRow label="PROJECT TOTAL ACTUAL COST" value={fmtMoney(actualTotal)} />
            <TotalRow label="VARIANCE" value={varianceFmt.text} valueClass={varianceFmt.cls} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── project total row ─────────────────────────────────────────────────── */

function TotalRow({ label, value, valueClass = "text-[#09090b]" }) {
  return (
    <tr className="h-[52px] bg-[#f2f6e1] [&>td]:border-b [&>td]:border-[#e4e4e7]">
      <td colSpan={3} className="px-4 text-base font-semibold text-[#09090b]">
        {label}
      </td>
      <td className={`px-4 text-left text-base font-semibold ${valueClass}`}>
        {value}
      </td>
      <td colSpan={2} />
    </tr>
  );
}

/* ── section group: header row + data rows + add-item row ───────────────── */

function SectionGroup({
  section,
  visibleRows,
  subtotal,
  selected,
  onToggleSelect,
  onToggleSection,
  onEditingRowChange,
  onAddLine,
  onEdit,
  onRateBlur,
}) {
  return (
    <>
      {/* Section-header row (#f2f6e1) — caret + label · Section Subtotal */}
      <tr className="h-[52px] bg-[#f2f6e1] [&>td]:border-b [&>td]:border-[#e4e4e7]">
        <td className="px-4">
          <button
            type="button"
            onClick={onToggleSection}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#09090b]"
          >
            {section.open ? (
              <ChevronDown className="size-4 text-[#3f3f46]" />
            ) : (
              <ChevronRight className="size-4 text-[#3f3f46]" />
            )}
            {section.label}
          </button>
        </td>
        <td colSpan={3} className="whitespace-nowrap px-4 text-right text-sm text-[#09090b]">
          Section Subtotal:{" "}
          <span className="font-semibold">{fmtMoney(subtotal)}</span>
        </td>
        <td colSpan={2} />
      </tr>

      {/* Data rows (white, grid dividers) */}
      {section.open &&
        visibleRows.map((row) => (
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
            className="h-[52px] bg-white [&>td]:border-b [&>td]:border-[#e4e4e7]"
          >
            <td className="border-r px-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selected.has(row.id)}
                  onCheckedChange={() => onToggleSelect(row.id)}
                  className="size-4 shrink-0 border-[#a1a1aa]"
                  aria-label="Select line item"
                />
                <CellInput
                  value={row.description}
                  placeholder="Title"
                  onChange={(v) => onEdit(row.id, { description: v })}
                />
              </div>
            </td>
            <td className="border-r px-3">
              <CellInput
                value={row.qty}
                placeholder="Qty"
                onChange={(v) => onEdit(row.id, { qty: v })}
              />
            </td>
            <td className="border-r px-3">
              <input
                type="text"
                value={row.rate}
                placeholder="Rate"
                onChange={(e) => onEdit(row.id, { rate: e.target.value })}
                onBlur={(e) => onRateBlur(row.id, e.target.value)}
                className="w-full rounded-sm bg-transparent px-1 py-0.5 text-left text-sm font-normal text-[#09090b] outline-none placeholder:text-[#71717a] focus:bg-[#f7f7f2] focus:ring-1 focus:ring-[#b5d400]"
              />
            </td>
            {/* Total — computed, read-only, bold */}
            <td className="border-r px-4 text-left text-sm font-semibold text-[#09090b]">
              {fmtMoney(rowTotal(row.qty, row.rate))}
            </td>
            <td className="border-r px-3">
              <CellInput
                value={row.notes}
                placeholder="Notes"
                onChange={(v) => onEdit(row.id, { notes: v })}
              />
            </td>
            <td />
          </tr>
        ))}

      {/* Add Item… row (muted) */}
      {section.open && (
        <tr className="h-[52px] bg-white [&>td]:border-b [&>td]:border-[#e4e4e7]">
          <td colSpan={6} className="px-4">
            <button
              type="button"
              onClick={onAddLine}
              className="text-sm text-[#71717a] hover:text-[#09090b]"
            >
              Add Item…
            </button>
          </td>
        </tr>
      )}
    </>
  );
}

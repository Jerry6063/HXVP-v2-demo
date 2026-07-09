/**
 * TimeLogReview — shared admin time-log review workspace (Yina round-3 frames
 * tlGlobal 7085:14898 and tlProject 7224:24556, both "TIME LOG OVERVIEW").
 *
 * Master-detail: a status-tab bar (Pending approval / Exceptions / Change
 * requested / Approved / All logs, each with a count chip) filters the LEFT
 * "TIME LOGS" table. Every row carries a leading checkbox (bulk-select), an
 * INVOICE attachment badge, and a per-row "Review" button that loads the row
 * into the RIGHT "Selected Log" inspector — worker summary, Scheduled vs
 * Submitted card (+exception note), Payment Check card (submitted vs approved
 * hours vs invoice amount), Invoice Attachment card + amber Audit Note, and a
 * Request Change / View Invoice / Approve footer.
 *
 * Props:
 *   logs           — array of time-log rows (base shape per TIME_LOGS in
 *                    mockData). If they lack the round-3 fields the specs need
 *                    (INVOICE status, "Change requested" bucket, payment check),
 *                    the component falls back to the verbatim SPEC_ROWS below
 *                    (see buildRows) — mockData.js is owned by another agent this
 *                    phase, so we substitute locally, never mutate it.
 *   scopedProject  — string | null. When set (in-project tab) the PROJECT
 *                    column + inspector project line show this project; when
 *                    null (global page) each log shows its own project.
 *   externalQuery  — extra filter text (e.g. the project page's "Filter logs").
 *
 * Assumes it is rendered inside V2Layout (tokens scoped to .v2-root).
 */
import { useState } from "react";
import { toast } from "sonner";
import { FileText } from "lucide-react";

import { Button } from "@/components/shadcn/button";
import { Checkbox } from "@/components/shadcn/checkbox";

/* ── Design tokens (Figma variables) ────────────────────────────────────── */
const LIME = "#D8FF00"; // button-primary-green (Approve / Export-primary)
const SECONDARY_GREEN = "#eaffae"; // active nav / avatar fill
const DESTRUCTIVE = "#dc2626"; // Request Change

/* Status-tab pill palettes (bg / label / count-chip bg / count text). */
const TAB_STYLES = {
  pending: {
    active: { bg: "rgba(5,150,105,0.12)", label: "#09090b", chip: "#09090b", num: "#ffffff" },
    inactive: { bg: "#ffffff", label: "#71717a", chip: "#f8f9fa", num: "#71717a", border: "#e0e0e0" },
  },
  exception: {
    active: { bg: "rgba(234,179,8,0.1)", label: "#a16207", chip: "#ca8a04", num: "#ffffff" },
    inactive: { bg: "#ffffff", label: "#71717a", chip: "#f8f9fa", num: "#71717a", border: "#e0e0e0" },
  },
  change: {
    active: { bg: "rgba(231,110,80,0.1)", label: "#ef4444", chip: "#e76e50", num: "#ffffff" },
    inactive: { bg: "#ffffff", label: "#71717a", chip: "#f8f9fa", num: "#71717a", border: "#e0e0e0" },
  },
  approved: {
    active: { bg: "#edf3dc", label: "#71717a", chip: "#5b6f00", num: "#ffffff" },
    inactive: { bg: "#ffffff", label: "#71717a", chip: "#f8f9fa", num: "#71717a", border: "#e0e0e0" },
  },
  all: {
    active: { bg: "#ffffff", label: "#71717a", chip: "#f8f9fa", num: "#71717a", border: "#e0e0e0" },
    inactive: { bg: "#ffffff", label: "#71717a", chip: "#f8f9fa", num: "#71717a", border: "#e0e0e0" },
  },
};

const TABS = [
  { id: "pending", label: "Pending approval" },
  { id: "exception", label: "Exceptions" },
  { id: "change", label: "Change requested" },
  { id: "approved", label: "Approved" },
  { id: "all", label: "All logs" },
];

/* Row STATUS-badge palettes (bg / text). */
const STATUS_BADGE = {
  Exceptions: { bg: "#fde68a", text: "#a16207" },
  Pending: { bg: "rgba(98,195,244,0.1)", text: "#09090b" },
  "Change requested": { bg: "rgba(220,38,38,0.12)", text: "#ef4444" },
  Approved: { bg: "rgba(5,150,105,0.12)", text: "#047857" },
};

const INVOICE_BADGE = {
  Attached: { bg: "rgba(5,150,105,0.12)", text: "#047857" },
  Missing: { bg: "rgba(220,38,38,0.12)", text: "#ef4444" },
};

/**
 * Round-3 display rows — VERBATIM from specs tlGlobal (7085:14898) and tlProject
 * (7224:24556). These frames introduce a person (Maya Lee), an INVOICE column,
 * a "Change requested" status, and a payment-verification inspector that the
 * shipped mockData `TIME_LOGS` does not model. mockData.js is owned by another
 * agent this phase, so rather than edit it we carry the spec rows locally here
 * (per the "extend the shape via local enrichment" instruction).
 *
 * `mergeRows` prefers any round-3 fields the caller's `logs` already supply
 * (once mockData grows them, e.g. an exported TIME_LOGS_R3), matching by id;
 * otherwise the whole SPEC_ROWS set is shown. Each row also carries its own
 * `inspector` block so every row opens with faithful detail.
 */
const AUDIT_NOTE =
  "Admin review required: request a correction if lunch break, overtime, or invoice amount does not match the approved payable hours.";
const SCHEDULE_NOTE =
  "+45 min over estimated wrap. Admin should verify whether overtime is approved before payment.";
const PAYMENT_NOTE =
  "Payment can move forward only after hours are approved and invoice amount matches approved hours.";

const SPEC_ROWS = [
  {
    id: "TL-2026-0710",
    name: "Maya Lee",
    initials: "ML",
    displayRole: "Talent",
    project: "E-bike launch campaign",
    time: "Jul 7, 9:00-6:45",
    breakNote: "Break: 60m",
    hours: "8.75h",
    invoice: "Attached",
    total: "$612.50",
    status: "Exceptions",
    bucket: "exception",
    inspector: {
      role: "Model - E-Bike Launch Campaign",
      scheduled: "9:00 AM - 6:00 PM",
      submitted: "9:00 AM - 6:45 PM",
      scheduleNote: SCHEDULE_NOTE,
      submittedHours: "8.75 hrs",
      approvedHours: "Needs review",
      invoiceAmount: "$612.50",
      paymentNote: PAYMENT_NOTE,
      invoiceFile: "maya-lee-invoice-071026.pdf",
      invoiceSub: "Submitted Jul 8, 10:42 AM - ready for admin verification",
      auditNote: AUDIT_NOTE,
    },
  },
  {
    id: "TL-2026-0711",
    name: "Xinyi Zhang",
    initials: "XZ",
    displayRole: "Hair & Makeup",
    project: "Provision Furniture",
    time: "Jul 7, 9:00-6:45",
    breakNote: "Break: 60m",
    hours: "10.0h",
    invoice: "Attached",
    total: "$575.00",
    status: "Exceptions",
    bucket: "exception",
  },
  {
    id: "TL-2026-0712",
    name: "Maya Chen",
    initials: "MC",
    displayRole: "Talent",
    project: "Provision Furniture",
    time: "Jul 7, 9:00-6:45",
    breakNote: "Break: 60m",
    hours: "10.0h",
    invoice: "Attached",
    total: "$850.00",
    status: "Pending",
    bucket: "pending",
  },
  {
    id: "TL-2026-0713",
    name: "Andre Miller",
    initials: "AM",
    displayRole: "Talent",
    project: "Provision Furniture",
    time: "Jul 7, 9:00-6:45",
    breakNote: "Break: 60m",
    hours: "8.0h",
    invoice: "Missing",
    total: "$1008.00",
    status: "Change requested",
    bucket: "change",
  },
  {
    id: "TL-2026-0714",
    name: "Luis Romero",
    initials: "LR",
    displayRole: "Talent",
    project: "Provision Furniture",
    time: "Jul 7, 9:00-6:45",
    breakNote: "Break: 60m",
    hours: "12.0h",
    invoice: "Attached",
    total: "$960.00",
    status: "Approved",
    bucket: "approved",
  },
  {
    id: "TL-2026-0715",
    name: "Nina Patel",
    initials: "NP",
    displayRole: "Talent",
    project: "Provision Furniture",
    time: "Jul 7, 9:00-6:45",
    breakNote: "Break: 60m",
    hours: "9.5h",
    invoice: "Attached",
    total: "$712.00",
    status: "Approved",
    bucket: "approved",
  },
];

/**
 * Verbatim status-tab counts from the specs (Pending 2 / Exceptions 3 /
 * Change requested 2 / Approved 21 / All logs 31). The 6 SPEC_ROWS are the
 * sampled rows Yina drew; the chips show the fuller backlog totals. If the
 * caller supplies its own `logs` with round-3 buckets we count those instead.
 */
const SPEC_TAB_COUNTS = {
  pending: 2,
  exception: 3,
  change: 2,
  approved: 21,
  all: 31,
};

/** Inspector detail for a row: use its explicit `inspector` block (Maya Lee),
 *  else derive a faithful one from the row's own fields. */
function inspectorFor(row) {
  if (row.inspector) return row.inspector;
  const slug = row.name.trim().toLowerCase().replace(/\s+/g, "-");
  const approved = row.status === "Approved";
  return {
    role: `${row.displayRole} - ${row.project}`,
    scheduled: "9:00 AM - 6:00 PM",
    submitted: "9:00 AM - 6:45 PM",
    scheduleNote: SCHEDULE_NOTE,
    submittedHours: `${row.hours.replace("h", "")} hrs`,
    approvedHours: approved ? row.hours.replace("h", " hrs") : "Needs review",
    invoiceAmount: row.total,
    paymentNote: PAYMENT_NOTE,
    invoiceFile: row.invoice === "Missing" ? null : `${slug}-invoice-071026.pdf`,
    invoiceSub: "Submitted Jul 8, 10:42 AM - ready for admin verification",
    auditNote: AUDIT_NOTE,
  };
}

/**
 * Build display rows: if the caller's `logs` already carry round-3 fields
 * (`invoice` + `bucket` in {pending,exception,change,approved}), use them;
 * otherwise fall back to the verbatim SPEC_ROWS. Keeps forward-compat with a
 * future mockData export without editing mockData now.
 */
function buildRows(logs) {
  const hasR3 =
    Array.isArray(logs) &&
    logs.length > 0 &&
    logs.every((l) => l.invoice && l.displayRole);
  return hasR3 ? logs : SPEC_ROWS;
}

/* ── Badges ─────────────────────────────────────────────────────────────── */

function Pill({ palette, children }) {
  return (
    <span
      className="inline-flex h-[22px] items-center rounded px-2 text-xs font-semibold"
      style={{ backgroundColor: palette.bg, color: palette.text, opacity: 0.95 }}
    >
      {children}
    </span>
  );
}

/* ── Inspector (right rail) ─────────────────────────────────────────────── */

function SectionLabel({ children }) {
  return (
    <div className="mb-2 text-sm font-semibold text-neutral-900">{children}</div>
  );
}

function Inspector({ row, scopedProject }) {
  const d = inspectorFor(row);
  const project = scopedProject ?? row.project;
  const badge = STATUS_BADGE[row.status] ?? STATUS_BADGE.Pending;

  return (
    <div className="flex h-[810px] max-h-[calc(100vh-13rem)] flex-col overflow-hidden rounded-lg border border-[#e0e0e0] bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#e0e0e0] px-5 py-4">
        <div>
          <div className="text-base font-semibold text-neutral-900">
            Selected Log
          </div>
          <div className="text-xs text-neutral-500">{row.id}</div>
        </div>
        <Pill palette={badge}>{row.status}</Pill>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {/* Worker Summary */}
        <div className="flex items-center gap-3.5 rounded-lg border border-[#e0e0e0] bg-[#f8f9fa] px-4 py-3">
          <div
            className="flex size-[42px] shrink-0 items-center justify-center rounded-full text-xs font-semibold"
            style={{ backgroundColor: SECONDARY_GREEN, color: "#5b6f00" }}
          >
            {row.initials}
          </div>
          <div className="min-w-0">
            <div className="text-base font-semibold text-neutral-900">
              {row.name}
            </div>
            <div className="text-sm text-neutral-500">
              {scopedProject ? `${row.displayRole} - ${project}` : d.role}
            </div>
          </div>
        </div>

        {/* Scheduled vs Submitted */}
        <div className="mt-5">
          <SectionLabel>Scheduled vs Submitted</SectionLabel>
          <div className="rounded-lg border border-[#e0e0e0] bg-[#f8f9fa] p-4">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <div className="text-xs text-neutral-500">SCHEDULED</div>
                <div className="mt-1 text-sm text-neutral-900">{d.scheduled}</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500">SUBMITTED</div>
                <div className="mt-1 text-sm text-neutral-900">{d.submitted}</div>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-neutral-500">
              {d.scheduleNote}
            </p>
          </div>
        </div>

        {/* Payment Check */}
        <div className="mt-5">
          <SectionLabel>Payment Check</SectionLabel>
          <div className="rounded-lg border border-[#e0e0e0] bg-white p-4">
            <div className="flex flex-wrap gap-x-4 gap-y-4">
              <div className="min-w-[110px]">
                <div className="text-xs text-neutral-500">SUBMITTED HOURS</div>
                <div className="mt-1 text-sm text-neutral-900">
                  {d.submittedHours}
                </div>
              </div>
              <div className="min-w-[110px]">
                <div className="text-xs text-neutral-500">APPROVED HOURS</div>
                <div className="mt-1 text-sm text-neutral-900">
                  {d.approvedHours}
                </div>
              </div>
              <div className="min-w-[100px]">
                <div className="text-xs text-neutral-500">INVOICE AMOUNT</div>
                <div className="mt-1 text-sm text-neutral-900">
                  {d.invoiceAmount}
                </div>
              </div>
            </div>
            <div className="mt-4 border-t border-[#e0e0e0] pt-3">
              <p className="text-xs leading-relaxed text-neutral-500">
                {d.paymentNote}
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Attachment */}
        <div className="mt-5">
          <SectionLabel>Invoice Attachment</SectionLabel>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-[#e0e0e0] bg-[#f8f9fa] p-4">
            <div className="flex min-w-0 items-start gap-3">
              <FileText className="mt-0.5 size-5 shrink-0 text-neutral-500" />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-neutral-900">
                  {d.invoiceFile ?? "No invoice attached"}
                </div>
                <div className="truncate text-xs text-neutral-500">
                  {d.invoiceFile
                    ? d.invoiceSub
                    : "Request the crew member to submit an invoice."}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              className="h-10 shrink-0 bg-white shadow-none"
              disabled={!d.invoiceFile}
              onClick={() => toast.info(`Opening ${d.invoiceFile}`)}
            >
              View
            </Button>
          </div>

          {/* Audit Note */}
          <div
            className="mt-3 rounded-lg border border-[#e0e0e0] px-4 py-3 text-xs font-semibold leading-relaxed"
            style={{ backgroundColor: "#fde68a", color: "#713f12" }}
          >
            {d.auditNote}
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-3 border-t border-[#e0e0e0] px-5 py-4">
        <Button
          className="h-10 flex-1 text-white shadow-none hover:opacity-90"
          style={{ backgroundColor: DESTRUCTIVE }}
          onClick={() => toast.info("Change request sent")}
        >
          Request Change
        </Button>
        <Button
          variant="outline"
          className="h-10 flex-1 bg-white shadow-none"
          onClick={() =>
            d.invoiceFile
              ? toast.info(`Opening ${d.invoiceFile}`)
              : toast.error("No invoice to view")
          }
        >
          View Invoice
        </Button>
        <Button
          className="h-10 flex-1 text-neutral-900 shadow-none hover:opacity-90"
          style={{ backgroundColor: LIME }}
          onClick={() => toast.success(`Approved ${row.total}`)}
        >
          Approve
        </Button>
      </div>
    </div>
  );
}

/* ── Status tabs bar ────────────────────────────────────────────────────── */

function StatusTab({ tab, active, count, onClick }) {
  const s = TAB_STYLES[tab.id][active ? "active" : "inactive"];
  return (
    <button
      onClick={onClick}
      className="flex h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors"
      style={{
        backgroundColor: s.bg,
        color: s.label,
        border: s.border ? `1px solid ${s.border}` : "1px solid transparent",
      }}
    >
      <span>{tab.label}</span>
      <span
        className="inline-flex h-5 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold"
        style={{ backgroundColor: s.chip, color: s.num }}
      >
        {count}
      </span>
    </button>
  );
}

/* ── Shared workspace ───────────────────────────────────────────────────── */

export default function TimeLogReview({
  logs,
  scopedProject = null,
  externalQuery = "",
}) {
  const rows = buildRows(logs);
  const usingSpecRows = rows === SPEC_ROWS;

  const matchesText = (r, text) =>
    text.trim() === "" ||
    `${r.name} ${r.displayRole} ${r.project}`
      .toLowerCase()
      .includes(text.toLowerCase());

  // Rows visible under a given tab (+ the shared text filter).
  const rowsForTab = (tabId) =>
    rows.filter(
      (r) =>
        (tabId === "all" || r.bucket === tabId) && matchesText(r, externalQuery),
    );

  const [tab, setTab] = useState("pending");
  // Start on the first row of the DEFAULT tab's filtered set, not rows[0]
  // (which may sit in a different bucket than the default "pending" tab).
  const [activeId, setActiveId] = useState(
    () => rowsForTab("pending")[0]?.id ?? rows[0]?.id ?? null,
  );
  const [selectedIds, setSelectedIds] = useState([]);

  // Switch tabs; if the active row isn't in the new tab's filtered set,
  // select that tab's first row so the inspector always shows a visible row.
  const changeTab = (tabId) => {
    setTab(tabId);
    const next = rowsForTab(tabId);
    if (!next.some((r) => r.id === activeId)) {
      setActiveId(next[0]?.id ?? null);
    }
  };

  // With the sampled spec rows, show the verbatim backlog totals from the
  // design; with a real caller-supplied dataset, count the actual rows.
  const tabCount = (id) => {
    if (usingSpecRows) return SPEC_TAB_COUNTS[id] ?? 0;
    return id === "all"
      ? rows.length
      : rows.filter((r) => r.bucket === id).length;
  };

  const filtered = rowsForTab(tab);

  const active =
    rows.find((r) => r.id === activeId) ?? filtered[0] ?? rows[0] ?? null;

  const toggleSelected = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <div>
      {/* Status tabs bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-[18px]">
          {TABS.map((t) => (
            <StatusTab
              key={t.id}
              tab={t}
              active={tab === t.id}
              count={tabCount(t.id)}
              onClick={() => changeTab(t.id)}
            />
          ))}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <Button
            variant="outline"
            className="h-10 bg-white shadow-none"
            onClick={() => toast.success("Export started")}
          >
            Export
          </Button>
          <Button
            className="h-10 text-neutral-900 shadow-none hover:opacity-90"
            style={{ backgroundColor: LIME }}
            onClick={() =>
              toast.success(
                selectedIds.length > 0
                  ? `Approved ${selectedIds.length} log${selectedIds.length === 1 ? "" : "s"}`
                  : "All logs approved",
              )
            }
          >
            Approve
          </Button>
        </div>
      </div>

      {/* Two-pane body */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_500px]">
        {/* LEFT — TIME LOGS table */}
        <div className="flex h-[810px] max-h-[calc(100vh-13rem)] flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center border-b border-[#e0e0e0] px-6 py-4">
            <h2 className="text-base font-semibold text-neutral-900">
              TIME LOGS
            </h2>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-[820px] border-collapse text-sm">
              <thead>
                <tr className="bg-[#f8f9fa] text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                  <th className="px-6 py-4 font-medium">Person</th>
                  <th className="px-3 py-4 font-medium">Project</th>
                  <th className="px-3 py-4 font-medium">Time</th>
                  <th className="px-3 py-4 font-medium">Hours</th>
                  <th className="px-3 py-4 font-medium">Invoice</th>
                  <th className="px-3 py-4 font-medium">Total</th>
                  <th className="px-3 py-4 font-medium">Status</th>
                  <th className="px-3 py-4 font-medium" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-10 text-center text-sm text-neutral-400"
                    >
                      No time logs match this filter.
                    </td>
                  </tr>
                )}
                {filtered.map((r) => {
                  const isActive = active && r.id === active.id;
                  const inv = INVOICE_BADGE[r.invoice] ?? INVOICE_BADGE.Attached;
                  const st = STATUS_BADGE[r.status] ?? STATUS_BADGE.Pending;
                  return (
                    <tr
                      key={r.id}
                      className={`border-t border-[#e0e0e0] transition-colors ${
                        isActive ? "bg-[#f7f7f2]" : "hover:bg-neutral-50"
                      }`}
                    >
                      <td className="px-6 py-5 align-top">
                        <div className="flex items-start gap-3">
                          <span className="pt-0.5">
                            <Checkbox
                              checked={selectedIds.includes(r.id)}
                              onCheckedChange={() => toggleSelected(r.id)}
                              aria-label={`Select ${r.name}`}
                            />
                          </span>
                          <div className="min-w-0">
                            <div className="truncate font-medium text-neutral-900">
                              {r.name}
                            </div>
                            <div className="truncate text-xs text-neutral-500">
                              {r.displayRole}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-5 align-top text-neutral-700">
                        {scopedProject ?? r.project}
                      </td>
                      <td className="px-3 py-5 align-top">
                        <div className="text-neutral-900">{r.time}</div>
                        <div className="text-xs text-neutral-500">
                          {r.breakNote}
                        </div>
                      </td>
                      <td className="px-3 py-5 align-top font-medium text-neutral-900">
                        {r.hours}
                      </td>
                      <td className="px-3 py-5 align-top">
                        <Pill palette={inv}>{r.invoice}</Pill>
                      </td>
                      <td className="px-3 py-5 align-top font-semibold text-neutral-900">
                        {r.total}
                      </td>
                      <td className="px-3 py-5 align-top">
                        <Pill palette={st}>{r.status}</Pill>
                      </td>
                      <td className="px-3 py-5 align-top text-right">
                        <Button
                          variant="outline"
                          className="h-10 bg-white shadow-none"
                          onClick={() => setActiveId(r.id)}
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT — inspector */}
        {active && <Inspector row={active} scopedProject={scopedProject} />}
      </div>
    </div>
  );
}

/**
 * CrewCallSheetsV2 — Crew Portal "Call Sheets" page (route /crew-v2/call-sheets).
 *
 * Answers Jun requirement #3 / PRD §B (crew): view Call Sheet + confirm receipt.
 * This is the receipt-tracking loop the admin side wants — the same "Confirmed"
 * counter the production CallSheet tab (ProjectV2 → CallSheetTab) rings up per
 * sheet is what a crew member increments here by confirming receipt.
 *
 * Sections:
 *   - Upcoming: one card per sheet (title, date, call time, location).
 *       · Unconfirmed → amber "Receipt not confirmed" badge + lime "Confirm
 *         receipt" button. Click flips the card to Confirmed (local state) and
 *         fires a sonner success toast — no reload, mirrors the production
 *         optimistic-toast pattern.
 *       · Confirmed → green "Confirmed" badge + outline "View call sheet" (toast).
 *   - Archived: two compact rows (wrapped shoots), view-only.
 *
 * Rendered inside CrewV2Layout. Design system: white cards / border #e4e4e7 /
 * rounded-xl, lime #d8ff00 primary, League Gothic display title. Mirrors the
 * dashboard primitives (PrimaryBtn / OutlineBtn) copied locally per repo
 * convention rather than imported.
 */
import { useState } from "react";
import { toast } from "sonner";
import { Calendar, Clock, MapPin, FileText, Check } from "lucide-react";

import CrewV2Layout from "./CrewV2Layout";
import {
  CREW_CALL_SHEETS,
  CREW_CALL_SHEET_STATUS_STYLES,
} from "./mockData";

/* ── Local primitives (copied per repo convention, see CrewDashboardV2) ────── */

function PrimaryBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#d8ff00] px-4 text-sm font-medium text-[#09090b] transition-colors hover:bg-[#c2e600]"
    >
      {children}
    </button>
  );
}

function OutlineBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#e4e4e7] bg-white px-4 text-sm font-medium text-[#09090b] transition-colors hover:bg-neutral-50"
    >
      {children}
    </button>
  );
}

/* Status pill. Unconfirmed reads "Receipt not confirmed" for clarity; the other
 * two use the raw status label. Colors come from CREW_CALL_SHEET_STATUS_STYLES. */
function StatusPill({ status }) {
  const s = CREW_CALL_SHEET_STATUS_STYLES[status];
  if (!s) return null;
  const label = status === "Unconfirmed" ? "Receipt not confirmed" : status;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.bg} ${s.text}`}
    >
      <span className={`size-1.5 rounded-full ${s.dot}`} />
      {label}
    </span>
  );
}

/* A meta line (icon + text) for the call-sheet detail block. */
function Meta({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-[#71717a]">
      <Icon className="size-4 shrink-0 text-[#a1a1aa]" />
      {children}
    </span>
  );
}

/* ── Upcoming card ─────────────────────────────────────────────────────────
 * `status` is driven off local state (see the page component) so confirming
 * receipt flips this card in place without a data round-trip. */
function UpcomingCard({ cs, status, onConfirm }) {
  const confirmed = status === "Confirmed";
  return (
    <div className="rounded-xl border border-[#e4e4e7] bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <FileText className="size-4 shrink-0 text-[#a1a1aa]" />
            <span className="text-xs font-medium uppercase tracking-wide text-[#a1a1aa]">
              {cs.project}
            </span>
          </div>
          <h3 className="mt-2 text-base font-semibold text-[#09090b]">
            {cs.title}
          </h3>
        </div>
        <StatusPill status={status} />
      </div>

      {/* Call details */}
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        <Meta icon={Calendar}>{cs.date}</Meta>
        <Meta icon={Clock}>{cs.callTime} call</Meta>
        <Meta icon={MapPin}>{cs.location}</Meta>
      </div>

      {cs.note ? (
        <p className="mt-4 rounded-lg bg-[#f7f7f2] px-4 py-3 text-sm text-[#52525b]">
          {cs.note}
        </p>
      ) : null}

      {/* Actions */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {confirmed ? (
          <>
            <OutlineBtn onClick={() => toast.info("Opening call sheet")}>
              <FileText className="size-4" />
              View call sheet
            </OutlineBtn>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#65a30d]">
              <Check className="size-4" />
              Receipt confirmed
            </span>
          </>
        ) : (
          <>
            <PrimaryBtn onClick={onConfirm}>
              <Check className="size-4" />
              Confirm receipt
            </PrimaryBtn>
            <OutlineBtn onClick={() => toast.info("Opening call sheet")}>
              <FileText className="size-4" />
              View call sheet
            </OutlineBtn>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Archived compact row ──────────────────────────────────────────────────── */
function ArchivedRow({ cs }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-[#e4e4e7] px-6 py-4 first:border-t-0">
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-[#09090b]">
          {cs.title}
        </div>
        <div className="mt-0.5 truncate text-xs text-[#71717a]">
          {cs.date} · {cs.callTime} call · {cs.location}
        </div>
      </div>
      <button
        onClick={() => toast.info("Opening call sheet")}
        className="shrink-0 text-sm font-medium text-[#71717a] transition-colors hover:text-[#09090b]"
      >
        View call sheet
      </button>
    </div>
  );
}

export default function CrewCallSheetsV2() {
  const upcoming = CREW_CALL_SHEETS.filter((c) => c.group === "upcoming");
  const archived = CREW_CALL_SHEETS.filter((c) => c.group === "archived");

  // Receipt-confirmation state, keyed by call-sheet id. Seeded from each sheet's
  // mock status; confirming flips only that id to "Confirmed".
  const [statusById, setStatusById] = useState(() =>
    Object.fromEntries(upcoming.map((c) => [c.id, c.status]))
  );

  const confirmReceipt = (cs) => {
    if (statusById[cs.id] === "Confirmed") return;
    setStatusById((prev) => ({ ...prev, [cs.id]: "Confirmed" }));
    toast.success("Receipt confirmed", {
      description: `${cs.title} — production has been notified.`,
    });
  };

  const pendingCount = upcoming.filter(
    (c) => statusById[c.id] !== "Confirmed"
  ).length;

  return (
    <CrewV2Layout>
      <div className="px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl lg:text-5xl uppercase tracking-tight leading-none text-[#09090b]">
            Call Sheets
          </h1>
          <p className="mt-3 max-w-xl text-sm text-[#71717a]">
            Review call details for your upcoming shoots and confirm receipt so
            production knows you are set for the day.
          </p>
        </div>

        {/* Upcoming */}
        <section className="mb-10">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#71717a]">
              Upcoming
            </h2>
            {pendingCount > 0 ? (
              <span className="inline-flex items-center rounded-full bg-[#e8c468] px-2 py-0.5 text-xs font-semibold text-[#09090b]">
                {pendingCount} awaiting confirmation
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#d9f99d] px-2 py-0.5 text-xs font-semibold text-[#09090b]">
                <Check className="size-3" />
                All confirmed
              </span>
            )}
          </div>
          <div className="space-y-4">
            {upcoming.map((cs) => (
              <UpcomingCard
                key={cs.id}
                cs={cs}
                status={statusById[cs.id]}
                onConfirm={() => confirmReceipt(cs)}
              />
            ))}
          </div>
        </section>

        {/* Archived */}
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#71717a]">
            Archived ({archived.length})
          </h2>
          <div className="overflow-hidden rounded-xl border border-[#e4e4e7] bg-white">
            {archived.map((cs) => (
              <ArchivedRow key={cs.id} cs={cs} />
            ))}
          </div>
        </section>
      </div>
    </CrewV2Layout>
  );
}

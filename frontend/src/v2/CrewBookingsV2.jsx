/**
 * CrewBookingsV2 — Crew Portal "Bookings" page (route /crew-v2/bookings).
 *
 * Jun requirement #5 / PRD §B (Accept/Decline Booking). Two sections:
 *
 *   1. BOOKING REQUESTS — pending Accept/Decline decisions. Each request is a
 *      full card (project, client, dates, role, day rate, location, note) with a
 *      lime Accept + outline Decline. Accept → sonner toast + the card moves into
 *      the Confirmed section (session state). Decline → toast + card removed.
 *
 *   2. CONFIRMED BOOKINGS — rows (project / dates / role / rate + status pill).
 *      Seeded from CREW_CONFIRMED_BOOKINGS; anything accepted this session is
 *      prepended (status "Confirmed", flagged `justAccepted` for a subtle tint).
 *
 * Both sections have empty states. Rendered inside CrewV2Layout. Uses the
 * established design system: white cards / border #e4e4e7 / rounded-xl, lime
 * #d8ff00 primary, League Gothic display title, CREW_BOOKING_STATUS_STYLES pills.
 */
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Calendar,
  MapPin,
  Clock3,
  DollarSign,
  UserRound,
  Building2,
  CheckCircle2,
  Inbox,
} from "lucide-react";

import CrewV2Layout from "./CrewV2Layout";
import {
  CREW_BOOKING_REQUESTS,
  CREW_CONFIRMED_BOOKINGS,
  CREW_BOOKING_STATUS_STYLES,
} from "./mockData";

/* ---- Local primitives (copied from CrewDashboardV2 per the crew conventions;
 * page agents copy rather than import these). ------------------------------- */

function PrimaryBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-9 items-center justify-center rounded-md bg-[#d8ff00] px-4 text-sm font-medium text-[#09090b] transition-colors hover:bg-[#c2e600]"
    >
      {children}
    </button>
  );
}

function OutlineBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-9 items-center justify-center rounded-md border border-[#e4e4e7] bg-white px-4 text-sm font-medium text-[#09090b] transition-colors hover:bg-neutral-50"
    >
      {children}
    </button>
  );
}

function StatusPill({ status }) {
  const s = CREW_BOOKING_STATUS_STYLES[status] ?? CREW_BOOKING_STATUS_STYLES.Confirmed;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.bg} ${s.text}`}
    >
      <span className={`size-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

/* A single labelled meta line inside a request card. */
function MetaLine({ icon: Icon, children }) {
  return (
    <div className="flex items-start gap-2 text-sm text-[#71717a]">
      <Icon className="mt-0.5 size-4 shrink-0 text-[#a1a1aa]" />
      <span className="min-w-0">{children}</span>
    </div>
  );
}

/* ---- Request card — Accept / Decline. --------------------------------------- */

function RequestCard({ req, onAccept, onDecline }) {
  return (
    <div className="rounded-xl border border-[#e4e4e7] bg-white p-6">
      {/* Header: project + client + urgency pill */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-lg font-semibold text-[#09090b]">
            {req.project}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-sm text-[#71717a]">
            <Building2 className="size-3.5 shrink-0 text-[#a1a1aa]" />
            {req.client}
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            req.urgent
              ? "bg-[#e8c468] text-[#09090b]"
              : "bg-[#f4f4f5] text-[#71717a]"
          }`}
        >
          {req.respondBy}
        </span>
      </div>

      {/* Meta grid */}
      <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        <MetaLine icon={Calendar}>{req.dateRange}</MetaLine>
        <MetaLine icon={UserRound}>{req.role}</MetaLine>
        <MetaLine icon={DollarSign}>
          {req.dayRate}
          <span className="text-[#a1a1aa]"> · {req.hourlyRate}</span>
        </MetaLine>
        <MetaLine icon={Clock3}>{req.callTime} call time</MetaLine>
        <div className="sm:col-span-2">
          <MetaLine icon={MapPin}>{req.location}</MetaLine>
        </div>
      </div>

      {/* Note */}
      {req.note && (
        <p className="mt-4 rounded-lg bg-[#f7f7f2] p-3 text-sm leading-relaxed text-[#52525b]">
          {req.note}
        </p>
      )}

      {/* Actions */}
      <div className="mt-5 flex gap-3">
        <PrimaryBtn onClick={() => onAccept(req)}>Accept</PrimaryBtn>
        <OutlineBtn onClick={() => onDecline(req)}>Decline</OutlineBtn>
      </div>
    </div>
  );
}

/* ---- Confirmed row. --------------------------------------------------------- */

function ConfirmedRow({ bkg }) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between ${
        bkg.justAccepted
          ? "border-[#c2e600] bg-[#f9ffe0]"
          : "border-[#e4e4e7] bg-white"
      }`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-[#09090b]">
            {bkg.project}
          </span>
          {bkg.justAccepted && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#65a30d]">
              <CheckCircle2 className="size-3.5" />
              Just accepted
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-[#71717a]">
          <span>{bkg.dateRange}</span>
          <span className="text-[#d4d4d8]">·</span>
          <span>{bkg.role}</span>
          <span className="text-[#d4d4d8]">·</span>
          <span>{bkg.dayRate}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3 sm:justify-end">
        <StatusPill status={bkg.status} />
        <OutlineBtn onClick={() => toast.info("View Booking")}>View</OutlineBtn>
      </div>
    </div>
  );
}

/* ---- Empty state. ----------------------------------------------------------- */

function EmptyState({ icon: Icon, title, sub }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e4e4e7] bg-white px-6 py-12 text-center">
      <div className="flex size-11 items-center justify-center rounded-xl bg-[#f4f4f5] text-[#a1a1aa]">
        <Icon className="size-5" />
      </div>
      <div className="mt-3 text-sm font-semibold text-[#09090b]">{title}</div>
      <p className="mt-1 max-w-xs text-sm text-[#71717a]">{sub}</p>
    </div>
  );
}

/* ---- Page. ------------------------------------------------------------------ */

export default function CrewBookingsV2() {
  // Pending request queue (Accept moves out to confirmed; Decline removes).
  const [requests, setRequests] = useState(CREW_BOOKING_REQUESTS);
  // Bookings accepted this session, newest first; prepended to the seed list.
  const [acceptedThisSession, setAcceptedThisSession] = useState([]);

  const confirmed = useMemo(
    () => [...acceptedThisSession, ...CREW_CONFIRMED_BOOKINGS],
    [acceptedThisSession]
  );

  function handleAccept(req) {
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
    setAcceptedThisSession((prev) => [
      {
        ...req,
        id: `BKG-${req.id}`,
        status: "Confirmed",
        justAccepted: true,
      },
      ...prev,
    ]);
    toast.success("Booking accepted", {
      description: `${req.project} moved to your confirmed bookings.`,
    });
  }

  function handleDecline(req) {
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
    toast("Booking declined", {
      description: `You passed on ${req.project}.`,
    });
  }

  return (
    <CrewV2Layout>
      <div className="px-6 lg:px-8 py-8">
        {/* Header — League Gothic display title. */}
        <div className="mb-8">
          <h1 className="font-display text-4xl lg:text-5xl uppercase tracking-tight leading-none text-[#09090b]">
            Bookings
          </h1>
          <p className="mt-3 text-sm text-[#71717a]">
            Accept or decline new booking requests, and keep an eye on your
            confirmed shoots.
          </p>
        </div>

        {/* SECTION 1 — Booking requests */}
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-base font-bold uppercase tracking-tight text-[#09090b]">
              Booking requests
            </h2>
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#eaffae] px-1.5 text-xs font-semibold text-[#3f6212]">
              {requests.length}
            </span>
          </div>

          {requests.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No pending requests"
              sub="New booking requests from production will show up here for you to accept or decline."
            />
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <RequestCard
                  key={req.id}
                  req={req}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                />
              ))}
            </div>
          )}
        </section>

        {/* SECTION 2 — Confirmed bookings */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-base font-bold uppercase tracking-tight text-[#09090b]">
              Confirmed bookings
            </h2>
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f4f4f5] px-1.5 text-xs font-semibold text-[#71717a]">
              {confirmed.length}
            </span>
          </div>

          {confirmed.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No confirmed bookings yet"
              sub="Accept a booking request and it will appear here on your schedule."
            />
          ) : (
            <div className="space-y-3">
              {confirmed.map((bkg) => (
                <ConfirmedRow key={bkg.id} bkg={bkg} />
              ))}
            </div>
          )}
        </section>
      </div>
    </CrewV2Layout>
  );
}

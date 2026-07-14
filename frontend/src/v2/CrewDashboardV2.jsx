/**
 * CrewDashboardV2 — Crew Portal dashboard ("WELCOME BACK, XINYI").
 *
 * Mirrors TalentDashboardV2's card-grid patterns (Card / CardTitle / PrimaryBtn
 * / OutlineBtn / ViewAll + badge pills) but wired for the crew persona (Xinyi
 * Zhang, Hair & Makeup). Rendered inside CrewV2Layout. Route: /crew-v2.
 *
 * Answers PRD §B crew reqs at a glance (six-card 2×3 grid):
 *   1. NEW BOOKING REQUESTS — count + first pending request; inline
 *      Accept/Decline (in-memory) + "Review requests" → /crew-v2/bookings.
 *   2. NEXT CONFIRMED BOOKING — project/date/call-time/location + View Call
 *      Sheet → /crew-v2/call-sheets.
 *   3. PENDING ACTIONS — three rows (respond to booking / submit time log /
 *      confirm call-sheet receipt). Each row's button navigates to the page that
 *      completes it; the time-log row is the PRD "Time Log Reminder".
 *   4. BOOKING SCHEDULE — three rows with status badges.
 *   5. EARNINGS — total + detail + View time log → /crew-v2/time-log.
 *   6. CALENDAR — availability prompt.
 *
 * Primary/navigational buttons route with react-router (Link / useNavigate);
 * lightweight secondary actions fire sonner toasts (preview only). Booking
 * accept/decline + call-sheet receipt confirmation keep in-memory session state.
 */
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, Check, X, Clock3, MapPin } from "lucide-react";

import CrewV2Layout from "./CrewV2Layout";
import {
  CREW_DASHBOARD,
  CREW_BOOKING_REQUESTS,
  CREW_BOOKING_BADGE_STYLES,
} from "./mockData";

/* ── buttons ─────────────────────────────────────────────────────────────── */
function PrimaryBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-9 items-center rounded-md bg-[#d8ff00] px-4 text-sm font-medium text-[#09090b] transition-colors hover:bg-[#c2e600]"
    >
      {children}
    </button>
  );
}

function OutlineBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-9 items-center rounded-md border border-[#e4e4e7] bg-white px-4 text-sm font-medium text-[#09090b] transition-colors hover:bg-neutral-50"
    >
      {children}
    </button>
  );
}

/* Link that reads as a primary/outline button but performs client-side nav. */
function PrimaryLink({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex h-9 items-center rounded-md bg-[#d8ff00] px-4 text-sm font-medium text-[#09090b] transition-colors hover:bg-[#c2e600]"
    >
      {children}
    </Link>
  );
}

function OutlineLink({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex h-9 items-center rounded-md border border-[#e4e4e7] bg-white px-4 text-sm font-medium text-[#09090b] transition-colors hover:bg-neutral-50"
    >
      {children}
    </Link>
  );
}

/* ── card shell ──────────────────────────────────────────────────────────── */
function Card({ children }) {
  return (
    <div className="rounded-xl border border-[#e4e4e7] bg-white p-6">
      {children}
    </div>
  );
}

function CardTitle({ children }) {
  return (
    <h2 className="text-base font-bold uppercase tracking-tight text-[#09090b]">
      {children}
    </h2>
  );
}

/* "View all" link → routes to the given page (falls back to a toast). */
function ViewAll({ to }) {
  if (to) {
    return (
      <Link
        to={to}
        className="inline-flex items-center gap-1 text-sm text-[#71717a] hover:text-[#09090b]"
      >
        View all
        <ArrowRight className="size-4" />
      </Link>
    );
  }
  return (
    <button
      onClick={() => toast.info("View all")}
      className="inline-flex items-center gap-1 text-sm text-[#71717a] hover:text-[#09090b]"
    >
      View all
      <ArrowRight className="size-4" />
    </button>
  );
}

/* Maps each PENDING ACTIONS row to the page that completes it, keyed by the
 * row's title so the mapping stays correct regardless of
 * CREW_DASHBOARD.pendingActions.items ordering (they are content-, not
 * position-, matched). */
const PENDING_ACTION_ROUTES = {
  "Respond to booking request": "/crew-v2/bookings",
  "Submit time log": "/crew-v2/time-log",
  "Confirm call sheet receipt": "/crew-v2/call-sheets",
};

export default function CrewDashboardV2() {
  const d = CREW_DASHBOARD;
  const navigate = useNavigate();

  // In-memory booking-request queue (Accept/Decline). The dashboard surfaces the
  // first pending request; the full queue lives on /crew-v2/bookings.
  const [requests, setRequests] = useState(CREW_BOOKING_REQUESTS);
  const nextRequest = requests[0] ?? null;

  const acceptRequest = (req) => {
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
    toast.success("Booking accepted", {
      description: `${req.project} · ${req.dateRange}`,
    });
  };

  const declineRequest = (req) => {
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
    toast("Booking declined", {
      description: `${req.project} · ${req.dateRange}`,
    });
  };

  // Call-sheet receipt confirmation (PRD §B: confirm receipt).
  const [receiptConfirmed, setReceiptConfirmed] = useState(false);
  const confirmReceipt = () => {
    setReceiptConfirmed(true);
    toast.success("Call sheet receipt confirmed", {
      description: d.callSheet.emphasis,
    });
  };

  // Pending-action rows: map each to its completion route by title (see routes
  // map) so a reordering of the items never sends a row to the wrong page.
  const pendingRows = useMemo(
    () =>
      d.pendingActions.items.map((item) => ({
        ...item,
        to: PENDING_ACTION_ROUTES[item.title] ?? "/crew-v2",
      })),
    [d.pendingActions.items]
  );

  return (
    <CrewV2Layout>
      <div className="px-6 lg:px-8 py-8">
        {/* Header — League Gothic display title, matching the crew-portal system. */}
        <div className="mb-6">
          <h1 className="font-display text-4xl lg:text-5xl uppercase tracking-tight leading-none text-[#09090b]">
            {d.welcome}
          </h1>
          <p className="mt-3 text-sm text-[#71717a]">{d.subtitle}</p>
        </div>

        {/* 2 × 3 grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* CARD 1 — New Booking Requests (Accept/Decline) */}
          <Card>
            <div className="flex items-center justify-between">
              <CardTitle>New Booking Requests</CardTitle>
              <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[#eaffae] px-2 py-0.5 text-xs font-bold text-[#09090b]">
                {requests.length}
              </span>
            </div>

            {nextRequest ? (
              <>
                <p className="mt-1 text-sm text-[#71717a]">
                  {requests.length === 1
                    ? "One request is waiting on your response."
                    : `${requests.length} requests are waiting on your response.`}
                </p>
                <div className="mt-4 rounded-lg border border-[#e4e4e7] bg-neutral-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold text-[#09090b]">
                        {nextRequest.project}
                      </div>
                      <div className="mt-0.5 text-sm text-[#71717a]">
                        {nextRequest.client}
                      </div>
                    </div>
                    {nextRequest.urgent && (
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#e8c468] px-2.5 py-1 text-xs font-semibold text-[#09090b]">
                        <span className="size-1.5 rounded-full bg-[#b45309]" />
                        Urgent
                      </span>
                    )}
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-[#71717a]">
                    <div className="flex items-center gap-1.5">
                      <Clock3 className="size-3.5 shrink-0" />
                      {nextRequest.dateRange} · {nextRequest.callTime} call
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 shrink-0" />
                      {nextRequest.location}
                    </div>
                    <div>
                      {nextRequest.role} · {nextRequest.dayRate} ·{" "}
                      <span className="text-[#b45309]">
                        {nextRequest.respondBy}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => acceptRequest(nextRequest)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#d8ff00] px-4 text-sm font-medium text-[#09090b] transition-colors hover:bg-[#c2e600]"
                  >
                    <Check className="size-4" />
                    Accept
                  </button>
                  <button
                    onClick={() => declineRequest(nextRequest)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#e4e4e7] bg-white px-4 text-sm font-medium text-[#09090b] transition-colors hover:bg-neutral-50"
                  >
                    <X className="size-4" />
                    Decline
                  </button>
                  <Link
                    to="/crew-v2/bookings"
                    className="ml-auto inline-flex items-center gap-1 text-sm text-[#71717a] hover:text-[#09090b]"
                  >
                    Review requests
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm text-[#71717a]">
                  You are all caught up — no booking requests need a response
                  right now.
                </p>
                <div className="mt-4">
                  <OutlineLink to="/crew-v2/bookings">
                    View bookings
                  </OutlineLink>
                </div>
              </>
            )}
          </Card>

          {/* CARD 2 — Next Confirmed Booking */}
          <Card>
            <CardTitle>{d.nextBooking.title}</CardTitle>
            <p className="mt-1 text-sm text-[#71717a]">
              {d.nextBooking.description}
            </p>
            <div className="mt-4 text-base font-semibold text-[#09090b]">
              {d.nextBooking.project}
            </div>
            <p className="mt-1 text-sm text-[#71717a]">{d.nextBooking.when}</p>
            <p className="mt-1 text-sm text-[#71717a]">
              {d.nextBooking.roleRate}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <OutlineLink to="/crew-v2/bookings">View Booking</OutlineLink>
              <PrimaryLink to="/crew-v2/call-sheets">
                View Call Sheet
              </PrimaryLink>
            </div>
          </Card>

          {/* CARD 3 — Pending Actions (each row routes to its completion page) */}
          <Card>
            <div className="flex items-center justify-between">
              <CardTitle>{d.pendingActions.title}</CardTitle>
              <ViewAll to="/crew-v2/bookings" />
            </div>
            <div className="mt-4 divide-y divide-[#e4e4e7]">
              {pendingRows.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#09090b]">
                      {item.title}
                    </div>
                    <div className="text-sm text-[#71717a]">{item.sub}</div>
                  </div>
                  <OutlineBtn onClick={() => navigate(item.to)}>
                    {item.action}
                  </OutlineBtn>
                </div>
              ))}
            </div>
          </Card>

          {/* CARD 4 — Booking Schedule */}
          <Card>
            <div className="flex items-center justify-between">
              <CardTitle>{d.bookingSchedule.title}</CardTitle>
              <ViewAll to="/crew-v2/bookings" />
            </div>
            <div className="mt-4 divide-y divide-[#e4e4e7]">
              {d.bookingSchedule.items.map((item) => {
                const s = CREW_BOOKING_BADGE_STYLES[item.badge];
                return (
                  <div
                    key={item.project}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#09090b]">
                        {item.project}
                      </div>
                      <div className="text-sm text-[#71717a]">{item.detail}</div>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.bg} ${s.text}`}
                    >
                      <span className={`size-1.5 rounded-full ${s.dot}`} />
                      {item.badge}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* CARD 5 — Earnings */}
          <Card>
            <CardTitle>{d.earnings.title}</CardTitle>
            <p className="mt-1 text-sm text-[#71717a]">
              {d.earnings.description}
            </p>
            <div className="mt-4 text-2xl font-extrabold text-[#09090b]">
              {d.earnings.amount}
            </div>
            <div className="my-4 border-t border-[#e4e4e7]" />
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-[#71717a]">{d.earnings.footer}</span>
              <OutlineLink to="/crew-v2/time-log">View time log</OutlineLink>
            </div>
          </Card>

          {/* CARD 6 — Calendar prompt */}
          <Card>
            <CardTitle>Calendar</CardTitle>
            <p className="mt-1 text-sm text-[#71717a]">
              Keep your availability current so production books you on the right
              days.
            </p>
            <div className="mt-4 text-base font-semibold text-[#09090b]">
              2 shoots this month · 1 pending confirmation
            </div>
            <p className="mt-1 text-sm text-[#71717a]">
              Next call: {d.callSheet.emphasis} — Jul 18.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <PrimaryBtn onClick={() => toast.success("Availability updated")}>
                Update availability
              </PrimaryBtn>
              {receiptConfirmed ? (
                <span className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#e4e4e7] bg-neutral-50 px-4 text-sm font-medium text-[#65a30d]">
                  <Check className="size-4" />
                  Receipt confirmed
                </span>
              ) : (
                <OutlineBtn onClick={confirmReceipt}>
                  Confirm call sheet receipt
                </OutlineBtn>
              )}
            </div>
          </Card>
        </div>
      </div>
    </CrewV2Layout>
  );
}

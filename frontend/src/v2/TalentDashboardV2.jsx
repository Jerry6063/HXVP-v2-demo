/**
 * TalentDashboardV2 — Talent Portal dashboard ("WELCOME BACK, MAYA").
 *
 * Figma 7242:18001 (fileKey vuZ77RgLUVtzfJKAhb1EEX). Six-card grid (2×3):
 * Profile Completion / Next Confirmed Booking / Pending Actions / Booking
 * Schedule / Earnings / Calendar. Content is verbatim from the wf4 dash spec
 * via TALENT_DASHBOARD in mockData. Rendered inside TalentV2Layout.
 *
 * Route: /talent-v2. Secondary actions fire sonner toasts (preview only).
 */
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

import TalentV2Layout from "./TalentV2Layout";
import {
  TALENT_DASHBOARD,
  TALENT_BOOKING_BADGE_STYLES,
} from "./mockData";

const LIME = "#d8ff00";

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

function ViewAll() {
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

export default function TalentDashboardV2() {
  const d = TALENT_DASHBOARD;

  return (
    <TalentV2Layout>
      <div className="px-6 lg:px-8 py-8">
        {/* Header — League Gothic display title, matching the Profile/ComingSoon
            talent-portal pages and the dashVar spec (League Gothic 48px). */}
        <div className="mb-6">
          <h1 className="font-display text-4xl lg:text-5xl uppercase tracking-tight leading-none text-[#09090b]">
            {d.welcome}
          </h1>
          <p className="mt-3 text-sm text-[#71717a]">{d.subtitle}</p>
        </div>

        {/* 2 × 3 grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* CARD 1 — Profile Completion */}
          <Card>
            <CardTitle>{d.profileCompletion.title}</CardTitle>
            <p className="mt-1 text-sm text-[#71717a]">
              {d.profileCompletion.description}
            </p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[#09090b]">
                {d.profileCompletion.percent}%
              </span>
              <span className="text-sm text-[#71717a]">
                {d.profileCompletion.percentLabel}
              </span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-[#e4e4e7]">
              <div
                className="h-full rounded-full bg-[#d8ff00]"
                style={{ width: `${d.profileCompletion.percent}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-[#71717a]">
              {d.profileCompletion.helper}
            </p>
            <div className="mt-4 flex gap-3">
              <PrimaryBtn onClick={() => toast.success("Complete Profile")}>
                Complete Profile
              </PrimaryBtn>
              <OutlineBtn onClick={() => toast.info("Upload Media")}>
                Upload Media
              </OutlineBtn>
            </div>
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
            <div className="mt-4 flex gap-3">
              <PrimaryBtn onClick={() => toast.success("View Booking")}>
                View Booking
              </PrimaryBtn>
              <OutlineBtn onClick={() => toast.info("Open Call Sheet")}>
                Open Call Sheet
              </OutlineBtn>
            </div>
          </Card>

          {/* CARD 3 — Pending Actions */}
          <Card>
            <div className="flex items-center justify-between">
              <CardTitle>{d.pendingActions.title}</CardTitle>
              <ViewAll />
            </div>
            <div className="mt-4 divide-y divide-[#e4e4e7]">
              {d.pendingActions.items.map((item) => (
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
                  <OutlineBtn onClick={() => toast.info(item.action)}>
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
              <ViewAll />
            </div>
            <div className="mt-4 divide-y divide-[#e4e4e7]">
              {d.bookingSchedule.items.map((item) => {
                const s = TALENT_BOOKING_BADGE_STYLES[item.badge];
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
              <OutlineBtn onClick={() => toast.info("View Submission")}>
                View Submission
              </OutlineBtn>
            </div>
          </Card>

          {/* CARD 6 — Calendar */}
          <Card>
            <CardTitle>{d.calendar.title}</CardTitle>
            <p className="mt-1 text-sm text-[#71717a]">
              {d.calendar.description}
            </p>
            <div className="mt-4 text-base font-semibold text-[#09090b]">
              {d.calendar.emphasis}
            </div>
            <p className="mt-1 text-sm text-[#71717a]">{d.calendar.helper}</p>
            <div className="mt-4 flex gap-3">
              <PrimaryBtn onClick={() => toast.success("Update Calendar")}>
                Update Calendar
              </PrimaryBtn>
              <OutlineBtn onClick={() => toast.info("View Calendar")}>
                View Calendar
              </OutlineBtn>
            </div>
          </Card>
        </div>
      </div>
    </TalentV2Layout>
  );
}

export { LIME };

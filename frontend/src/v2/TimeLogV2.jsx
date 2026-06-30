/**
 * TimeLogV2 — "Time Log Review" screen. Mirrors /tmp/timelog_hi.png.
 *
 * Route: /production-v2/time-log (rendered inside V2Layout).
 * Header: display title + subtitle + breadcrumb line; top-right date-range pill,
 * outline "Export", lime "Approve all". Status tabs (Pending approval · Exceptions
 * · Approved · All logs) filter the LEFT "Time logs" table for one shoot day.
 * Clicking a row loads it into the RIGHT "Review time log" detail card (scheduled
 * vs actual, clock events, review note, payable breakdown, footer actions).
 * Additive preview only; wrapped by V2Layout so shadcn tokens stay scoped.
 */
import { useState } from "react";
import { toast } from "sonner";
import {
  Search,
  Download,
  ChevronDown,
  TriangleAlert,
  Check,
} from "lucide-react";

import V2Layout from "./V2Layout";
import { Input } from "@/components/shadcn/input";
import { Button } from "@/components/shadcn/button";
import { Badge } from "@/components/shadcn/badge";
import { TIME_LOGS, TIME_LOG_DAY, TIME_LOG_STATUS_STYLES } from "./mockData";

const LIME = "#D8FF00";

const TABS = [
  { id: "pending", label: "Pending approval" },
  { id: "exception", label: "Exceptions" },
  { id: "approved", label: "Approved" },
  { id: "all", label: "All logs" },
];

function StatusBadge({ status }) {
  return (
    <Badge
      variant="outline"
      className={`${TIME_LOG_STATUS_STYLES[status] ?? ""}`}
    >
      {status}
    </Badge>
  );
}

/* ── Right pane — detail card ───────────────────────────────────────────── */

function ReviewCard({ log }) {
  return (
    <div className="flex h-[calc(100vh-15rem)] flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5">
        <h2 className="text-base font-semibold">Review time log</h2>
        <span className="text-xs text-neutral-400">{log.id}</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {/* Person header */}
        <div className="flex items-center justify-between gap-3 rounded-lg bg-neutral-50 px-3 py-3">
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-neutral-900"
              style={{ backgroundColor: LIME }}
            >
              {log.initials}
            </div>
            <div>
              <div className="text-sm font-semibold text-neutral-900">
                {log.name}
              </div>
              <div className="text-xs text-neutral-500">
                {log.role} · {log.dateLong}
              </div>
              <div className="mt-0.5 text-xs text-neutral-500">
                Project · {log.project}
              </div>
            </div>
          </div>
          {log.exceptions > 0 && (
            <Badge
              variant="outline"
              className="border-amber-300 bg-amber-100 text-amber-800"
            >
              {log.exceptions} {log.exceptions === 1 ? "exception" : "exceptions"}
            </Badge>
          )}
        </div>

        {/* Scheduled vs actual */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-neutral-200 px-3 py-2.5">
            <div className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
              Scheduled
            </div>
            <div className="mt-1 text-sm font-semibold text-neutral-900">
              {log.scheduled}
            </div>
            <div className="text-xs text-neutral-500">
              {log.scheduledHours.replace("h", "")} hrs
            </div>
          </div>
          <div className="rounded-lg border border-neutral-200 px-3 py-2.5">
            <div className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
              Actual
            </div>
            <div className="mt-1 text-sm font-semibold text-neutral-900">
              {log.actual}
            </div>
            <div className="text-xs text-neutral-500">
              {log.actualHours.replace("h", "")} hrs
            </div>
          </div>
        </div>

        {/* Clock events */}
        <div className="mt-5">
          <div className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
            Clock events
          </div>
          <div className="mt-2.5 space-y-3">
            {log.clockEvents.map((ev, i) => (
              <div key={i} className="grid grid-cols-[140px_84px_1fr] items-center gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`size-2 shrink-0 rounded-full ${
                      ev.tone === "warn" ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                  />
                  <span className="text-sm text-neutral-800">{ev.label}</span>
                </div>
                <span className="text-sm font-semibold text-neutral-900">
                  {ev.time}
                </span>
                <span className="text-xs text-neutral-400">{ev.note}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Review note */}
        {log.reviewNote && (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
              <TriangleAlert className="size-4" />
              Review required
            </div>
            <p className="mt-1 text-xs leading-relaxed text-amber-700">
              {log.reviewNote}
            </p>
          </div>
        )}

        {/* Payable breakdown */}
        <div className="mt-5">
          <div className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
            Payable hours
          </div>
          <div className="mt-2 space-y-1.5">
            {log.payable.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-neutral-800">{p.label}</span>
                  <span className="ml-2 text-xs text-neutral-400">
                    {p.detail}
                  </span>
                </div>
                <span className="font-semibold text-neutral-900">
                  {p.amount}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-neutral-200 pt-2.5 text-sm">
            <span className="font-medium text-neutral-900">Total payable</span>
            <span className="font-semibold text-neutral-900">
              {log.totalPayable}
            </span>
          </div>
        </div>

        {/* Worker note */}
        <div className="mt-4">
          <div className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
            Worker note
          </div>
          <p className="mt-1 text-sm text-neutral-600">{log.workerNote}</p>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-3 border-t border-neutral-100 px-5 py-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => toast.info("Change request sent")}
        >
          Request changes
        </Button>
        <Button
          className="flex-1 bg-[#D8FF00] text-neutral-900 hover:bg-[#c2e600] shadow-none"
          onClick={() => toast.success(`Approved ${log.totalPayable}`)}
        >
          <Check className="size-4" />
          Approve {log.totalPayable}
        </Button>
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */

export default function TimeLogV2() {
  const [tab, setTab] = useState("exception");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(TIME_LOGS[0].id);

  const tabCount = (id) =>
    id === "all"
      ? TIME_LOGS.length
      : TIME_LOGS.filter((l) => l.bucket === id).length;

  const filtered = TIME_LOGS.filter((l) => {
    const matchesTab = tab === "all" || l.bucket === tab;
    const matchesQuery =
      query.trim() === "" ||
      `${l.name} ${l.role}`.toLowerCase().includes(query.toLowerCase());
    return matchesTab && matchesQuery;
  });

  const active =
    TIME_LOGS.find((l) => l.id === activeId) ?? filtered[0] ?? TIME_LOGS[0];

  return (
    <V2Layout>
      <div className="px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
              TAFT Commercial · Time Logs
            </div>
            <h1 className="mt-1.5 font-display text-4xl lg:text-5xl uppercase tracking-tight leading-none">
              Time Log Review
            </h1>
            <p className="mt-2 max-w-xl text-sm text-neutral-500">
              Review submitted hours, resolve exceptions, and approve
              payroll-ready time logs.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
              Jun 22 – Jul 5, 2026
              <ChevronDown className="size-4 text-neutral-400" />
            </button>
            <Button
              variant="outline"
              onClick={() => toast.success("Export started")}
            >
              <Download className="size-4" />
              Export
            </Button>
            <Button
              className="bg-[#D8FF00] text-neutral-900 hover:bg-[#c2e600] shadow-none"
              onClick={() => toast.success("All logs approved")}
            >
              Approve all
            </Button>
          </div>
        </div>

        {/* Status tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-1 border-b border-neutral-200">
          {TABS.map((t) => {
            const isActive = tab === t.id;
            const count = tabCount(t.id);
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-neutral-900 text-neutral-900"
                    : "border-transparent text-neutral-500 hover:text-neutral-800"
                }`}
              >
                {t.label}
                {count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                      isActive
                        ? "bg-[#eaffae] text-neutral-900"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
          <span className="ml-auto hidden py-2.5 text-xs text-neutral-400 lg:block">
            Focus on submissions that need review or contain exceptions.
          </span>
        </div>

        {/* Two-pane body */}
        <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_440px]">
          {/* LEFT — time logs table */}
          <div className="flex h-[calc(100vh-15rem)] flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-5 py-3.5">
              <div>
                <h2 className="text-base font-semibold">Time logs</h2>
                <div className="text-xs text-neutral-500">{TIME_LOG_DAY}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                  <Input
                    className="w-56 pl-9 bg-white"
                    placeholder="Search talent or crew"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <button className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                  All exceptions
                  <ChevronDown className="size-4 text-neutral-400" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 text-left text-[11px] uppercase tracking-wide text-neutral-400">
                    <th className="px-5 py-2.5 font-medium">Person</th>
                    <th className="px-3 py-2.5 font-medium">Project</th>
                    <th className="px-3 py-2.5 font-medium">Date</th>
                    <th className="px-3 py-2.5 font-medium">Scheduled</th>
                    <th className="px-3 py-2.5 font-medium">Actual</th>
                    <th className="px-3 py-2.5 font-medium">OT</th>
                    <th className="px-3 py-2.5 font-medium">Total</th>
                    <th className="px-3 py-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-10 text-center text-sm text-neutral-400"
                      >
                        No time logs match this filter.
                      </td>
                    </tr>
                  )}
                  {filtered.map((l) => {
                    const isActive = l.id === active.id;
                    return (
                      <tr
                        key={l.id}
                        onClick={() => setActiveId(l.id)}
                        className={`cursor-pointer border-b border-neutral-100 transition-colors ${
                          isActive ? "bg-[#eaffae]" : "hover:bg-neutral-50"
                        }`}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-neutral-900"
                              style={{ backgroundColor: LIME }}
                            >
                              {l.initials}
                            </div>
                            <div className="min-w-0">
                              <div className="truncate font-semibold text-neutral-900">
                                {l.name}
                              </div>
                              <div className="truncate text-xs text-neutral-500">
                                {l.role}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-neutral-600">
                          {l.project}
                        </td>
                        <td className="px-3 py-3 text-neutral-600">{l.date}</td>
                        <td className="px-3 py-3 text-neutral-700">
                          {l.scheduledHours}
                        </td>
                        <td className="px-3 py-3 text-neutral-700">
                          {l.actualHours}
                        </td>
                        <td
                          className={`px-3 py-3 ${
                            l.ot === "—"
                              ? "text-neutral-300"
                              : "font-medium text-amber-600"
                          }`}
                        >
                          {l.ot}
                        </td>
                        <td className="px-3 py-3 font-semibold text-neutral-900">
                          {l.total}
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge status={l.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT — review detail */}
          <ReviewCard log={active} />
        </div>
      </div>
    </V2Layout>
  );
}

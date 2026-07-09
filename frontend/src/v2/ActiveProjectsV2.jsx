/**
 * ActiveProjectsV2 — standalone "Active Projects" list page (Figma 7193:27176).
 *
 * Production-agency landing/overview: a filterable, paginated table of all
 * active projects. This is a LIST PAGE (not a tab of the in-project view).
 * Route: /production-v2/active-projects (rendered inside V2Layout, "Active
 * Projects" nav active).
 *
 * Header: League-Gothic "ACTIVE PROJECTS" title + subtitle; right-aligned lime
 * "New Project" CTA → /production-v2/new-project. Toolbar: search input + 6
 * single-select status filter pills ("All Active" active by default). Card:
 * "Projects" title bar, table (PROJECT / CLIENT / BUDGET / DEADLINE / LOCATION /
 * STATUS badge / progress bar / kebab), footer "Showing 11 of 48" + Previous /
 * Next. Row click → /production-v2/project. Additive preview only.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Search, MoreHorizontal, Eye, Copy, Trash2 } from "lucide-react";

import V2Layout from "./V2Layout";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/shadcn/dropdown-menu";
import {
  ACTIVE_PROJECTS,
  ACTIVE_PROJECT_FILTERS,
  ACTIVE_PROJECT_STATUS_STYLES,
  ACTIVE_PROJECTS_SHOWING,
  ACTIVE_PROJECTS_TOTAL,
} from "./mockData";

const LIME = "#D8FF00"; // primary CTA (button-primary-green)

/** Filled-dot lime status pill (spec: #d9f99d/80 bg, per-phase tint). */
function StatusBadge({ status }) {
  const s =
    ACTIVE_PROJECT_STATUS_STYLES[status] ??
    ACTIVE_PROJECT_STATUS_STYLES["Pre-production"];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-semibold ${s.badge}`}
    >
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: s.dot }}
      />
      {status}
    </span>
  );
}

/** Slim rounded progress track (spec: 56px track, #e0e0e0; #d9f99d fill). */
function ProgressBar({ value }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-14 overflow-hidden rounded-full bg-[#e0e0e0]">
      <div
        className="h-full rounded-full"
        style={{ width: `${pct}%`, backgroundColor: "#d9f99d" }}
      />
    </div>
  );
}

function RowMenu() {
  const stop = (e) => e.stopPropagation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={stop}>
        <button
          className="inline-flex size-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100"
          aria-label="Row actions"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44" onClick={stop}>
        <DropdownMenuItem onSelect={() => toast.success("Opening project")}>
          <Eye className="size-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast.success("Project duplicated")}>
          <Copy className="size-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => toast.success("Project archived")}
        >
          <Trash2 className="size-4" />
          Archive
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function ActiveProjectsV2() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Active");

  const q = query.trim().toLowerCase();
  const rows = ACTIVE_PROJECTS.filter((p) => {
    const matchesFilter =
      activeFilter === "All Active" || p.status === activeFilter;
    const matchesQuery =
      !q ||
      p.project.toLowerCase().includes(q) ||
      p.client.toLowerCase().includes(q) ||
      p.subtitle.toLowerCase().includes(q);
    return matchesFilter && matchesQuery;
  });

  return (
    <V2Layout>
      <div className="min-h-screen bg-[#f7f7f2]">
        <div className="px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="font-display text-4xl lg:text-5xl uppercase tracking-tight leading-none whitespace-nowrap">
                Active Projects
              </h1>
              <p className="mt-2 text-sm text-neutral-500">
                Welcome back — here's your agency at a glance
              </p>
            </div>
            <Button
              onClick={() => navigate("/production-v2/new-project")}
              className="h-12 px-4 text-base bg-[#D8FF00] text-neutral-900 hover:bg-[#c2e600] shadow-none"
            >
              New Project
            </Button>
          </div>

          {/* Toolbar: search + status filter pills */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-[360px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-10 pl-9 bg-white"
                placeholder="Search projects"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {ACTIVE_PROJECT_FILTERS.map((label) => {
                const active = activeFilter === label;
                return (
                  <button
                    key={label}
                    onClick={() => setActiveFilter(label)}
                    className={`h-9 rounded-md border px-4 text-sm font-medium transition-colors ${
                      active
                        ? "border-transparent bg-[#eaffae] text-[#5b6f00]"
                        : "border-[#e0e0e0] bg-white text-neutral-500 hover:bg-neutral-50"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Projects card */}
          <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            {/* Card title bar */}
            <div className="border-b border-neutral-100 px-6 py-4">
              <h2 className="text-base font-semibold text-neutral-900">
                Projects
              </h2>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#e0e0e0] bg-[#f8f9fa] text-xs font-medium uppercase tracking-wide text-neutral-500">
                    <th className="px-6 py-3 font-medium">Project</th>
                    <th className="px-4 py-3 font-medium">Client</th>
                    <th className="px-4 py-3 font-medium">Budget</th>
                    <th className="px-4 py-3 font-medium">Deadline</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Progress</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => navigate("/production-v2/project")}
                      className="cursor-pointer border-b border-[#e0e0e0] transition-colors last:border-0 hover:bg-neutral-50"
                    >
                      {/* PROJECT (two lines) */}
                      <td className="px-6 py-5">
                        <div className="text-sm font-medium text-neutral-900">
                          {p.project}
                        </div>
                        <div className="text-sm text-neutral-500">
                          {p.subtitle}
                        </div>
                      </td>
                      {/* CLIENT */}
                      <td className="px-4 py-5 font-medium text-neutral-900">
                        {p.client}
                      </td>
                      {/* BUDGET */}
                      <td className="px-4 py-5 font-semibold text-neutral-900">
                        {p.budget}
                      </td>
                      {/* DEADLINE */}
                      <td className="px-4 py-5 text-[#3f3f46]">{p.deadline}</td>
                      {/* LOCATION */}
                      <td className="px-4 py-5 text-neutral-900">
                        {p.location}
                      </td>
                      {/* STATUS badge */}
                      <td className="px-4 py-5">
                        <StatusBadge status={p.status} />
                      </td>
                      {/* STATUS progress bar */}
                      <td className="px-4 py-5">
                        <ProgressBar value={p.progress} />
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-5 text-right">
                        <RowMenu />
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-12 text-center text-sm text-neutral-400"
                      >
                        No projects match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination footer */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-neutral-500">
              Showing {ACTIVE_PROJECTS_SHOWING} of {ACTIVE_PROJECTS_TOTAL}{" "}
              projects
            </div>
            <div className="flex items-center gap-2.5">
              <Button variant="outline" className="h-10 bg-white" disabled>
                Previous
              </Button>
              <Button variant="outline" className="h-10 bg-white">
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </V2Layout>
  );
}

export { LIME };

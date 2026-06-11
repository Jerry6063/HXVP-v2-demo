/** DashboardV2 — Production Dashboard (light). Mirrors /tmp/hxvp_desktop.png. */
import { useNavigate } from "react-router-dom";
import { Search, PlusCircle, ClipboardList, ArrowRight } from "lucide-react";

import V2Layout from "./V2Layout";
import { Input } from "@/components/shadcn/input";
import { Button } from "@/components/shadcn/button";
import { Card } from "@/components/shadcn/card";
import { Badge } from "@/components/shadcn/badge";
import { PROJECTS, STATUS_STYLES, TASKS } from "./mockData";

const KPIS = [
  { label: "Active Projects", value: "16", badge: "↑ 3 this month" },
  { label: "Revenue", value: "$45,530", badge: "↑ 19.3%" },
  { label: "Upcoming Shoots", value: "4", badge: "Next: July 2" },
];

function ProgressBar({ value }) {
  return (
    <div className="h-1.5 w-24 rounded-full bg-neutral-200">
      <div
        className="h-full rounded-full"
        style={{ width: `${value}%`, backgroundColor: "#D8FF00" }}
      />
    </div>
  );
}

export default function DashboardV2() {
  const navigate = useNavigate();
  return (
    <V2Layout>
      <div className="px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="font-display text-4xl lg:text-5xl tracking-tight leading-none">
              Production Dashboard
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Welcome back — here's your agency at a glance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-64 max-w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <Input
                className="pl-9 bg-white"
                placeholder="Search projects, clients, talents..."
              />
            </div>
            <Button
              onClick={() => navigate("/production-v2/new-project")}
              className="bg-[#D8FF00] text-neutral-900 hover:bg-[#c2e600] shadow-none"
            >
              <PlusCircle className="size-4" />
              New Project
            </Button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {KPIS.map((kpi) => (
            <Card key={kpi.label} className="gap-0 py-0">
              <div className="flex items-start justify-between px-5 pt-5">
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  {kpi.label}
                </span>
                <ClipboardList className="size-4 text-neutral-300" />
              </div>
              <div className="px-5 pb-5">
                <div className="mt-2 font-display text-4xl leading-none">
                  {kpi.value}
                </div>
                <Badge
                  variant="outline"
                  className="mt-3 border-emerald-200 bg-emerald-50 text-emerald-700"
                >
                  {kpi.badge}
                </Badge>
              </div>
            </Card>
          ))}
        </div>

        {/* Two-column: Active Projects + Daily Tasks */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Active Projects */}
          <Card className="lg:col-span-2 gap-0 py-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-700">
                Active Projects
              </h2>
              <button className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900">
                View all <ArrowRight className="size-3" />
              </button>
            </div>
            <div className="divide-y divide-neutral-100">
              {PROJECTS.map((p, i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 items-center gap-3 px-5 py-3.5 hover:bg-neutral-50"
                >
                  <div className="col-span-4 min-w-0">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                    <div className="truncate text-xs text-neutral-500">
                      {p.desc}
                    </div>
                  </div>
                  <div className="col-span-2 truncate text-sm text-neutral-600">
                    {p.client}
                  </div>
                  <div className="col-span-2 text-sm text-neutral-500">
                    {p.date}
                  </div>
                  <div className="col-span-2">
                    <Badge
                      variant="outline"
                      className={`gap-1.5 ${STATUS_STYLES[p.status]}`}
                    >
                      <span className="size-1.5 rounded-full bg-current opacity-70" />
                      {p.status}
                    </Badge>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <ProgressBar value={p.progress} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Daily Tasks */}
          <Card className="gap-0 py-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-700">
                Daily Tasks
              </h2>
              <button className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900">
                View all <ArrowRight className="size-3" />
              </button>
            </div>
            <div className="divide-y divide-neutral-100">
              {TASKS.map((t, i) => (
                <div key={i} className="px-5 py-3.5">
                  <div className="text-sm">{t.text}</div>
                  <div className="mt-0.5 text-xs text-neutral-400">{t.due}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </V2Layout>
  );
}

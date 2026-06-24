/**
 * CallSheetCreateV2 — "Create call sheet" wizard. Mirrors /tmp/cs_create.png.
 *
 * Route: /production-v2/project/call-sheet/new (rendered inside V2Layout).
 * A 7-step stepper ("CALL SHEET WORKFLOW") with a two-column body: the active
 * step's form on the left, a sticky "Live preview" call-sheet card on the right
 * (Desktop / PDF toggle). Footer Cancel / Save draft / Continue; Continue on the
 * final step fires a sonner success toast and navigates back to the Call Sheet
 * tab. Additive preview only; wrapped by V2Layout so shadcn tokens stay scoped.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import V2Layout from "./V2Layout";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Textarea } from "@/components/shadcn/textarea";
import { Label } from "@/components/shadcn/label";
import { Checkbox } from "@/components/shadcn/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import { TALENTS, CREW } from "./mockData";

const STEPS = [
  "Choose shoot",
  "Schedule & location",
  "Talents & crew",
  "Build schedule",
  "Production details",
  "Review",
  "Send",
];

const PROJECT_OPTIONS = [
  "E-Bike Launch Campaign Commercial Day 1",
  "Spring Lifestyle Collection",
  "Smart Home Product Reveal",
];

// A few talent / crew names for the recipient picker (Jun wants both lists).
const SHORTLIST_PEOPLE = TALENTS.slice(0, 5);
const CREW_PEOPLE = CREW.slice(0, 5);

const SCHEDULE_ROWS = [
  { time: "7:00 AM", label: "Crew call / load-in" },
  { time: "7:30 AM", label: "Talent call / HMU" },
  { time: "9:00 AM", label: "First shot" },
  { time: "12:30 PM", label: "Lunch" },
  { time: "6:30 PM", label: "Estimated wrap" },
];

/* ── Stepper ────────────────────────────────────────────────────────────── */

function Stepper({ current }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
          Call Sheet Workflow
        </span>
        <span className="text-xs text-neutral-400">
          Step {current + 1} of {STEPS.length} · Your work is autosaved
        </span>
      </div>
      <div className="mt-4 flex items-center">
        {STEPS.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex min-w-0 flex-col items-center">
                <div
                  className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${
                    active
                      ? "bg-[#D8FF00] text-neutral-900"
                      : done
                      ? "bg-emerald-500 text-white"
                      : "bg-neutral-100 text-neutral-400"
                  }`}
                >
                  {done ? <Check className="size-4" /> : i + 1}
                </div>
                <span
                  className={`mt-1.5 hidden whitespace-nowrap text-[11px] md:block ${
                    active
                      ? "font-medium text-neutral-900"
                      : "text-neutral-400"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-2 h-px flex-1 ${
                    done ? "bg-emerald-400" : "bg-neutral-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Live preview call-sheet card ───────────────────────────────────────── */

function PreviewField({ label, children, className = "" }) {
  return (
    <div className={className}>
      <div className="text-[9px] font-medium uppercase tracking-wide text-neutral-400">
        {label}
      </div>
      <div className="text-[11px] font-semibold text-neutral-800">{children}</div>
    </div>
  );
}

function LivePreview({ recipientCount }) {
  const [tab, setTab] = useState("desktop");
  return (
    <div className="sticky top-6 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">Live preview</h3>
          <p className="text-xs text-neutral-400">
            What talents and crew will receive
          </p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 p-0.5">
          {[
            { key: "desktop", label: "Desktop" },
            { key: "pdf", label: "PDF" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                tab === t.key
                  ? "bg-white font-medium text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mock call sheet */}
      <div className="mt-4 overflow-hidden rounded-lg border border-neutral-200">
        <div className="h-1 w-full bg-[#D8FF00]" />
        <div className="space-y-3 p-4">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
            <div className="flex size-7 items-center justify-center rounded bg-neutral-900 text-[8px] font-bold text-white">
              HXVP
            </div>
            <div>
              <div className="text-[8px] font-medium uppercase tracking-wide text-neutral-400">
                Call Sheet
              </div>
              <div className="text-xs font-bold text-neutral-900">
                E-Bike Launch Campaign Commercial Day 1
              </div>
            </div>
          </div>

          {/* Shoot date / production day */}
          <div className="grid grid-cols-2 gap-3">
            <PreviewField label="Shoot Date">THU JUL 02, 2026</PreviewField>
            <PreviewField label="Production Day">DAY 1 OF 2</PreviewField>
          </div>

          {/* Crew call / wrap */}
          <div className="flex items-center justify-between rounded-md bg-neutral-50 px-3 py-2">
            <div>
              <div className="text-[9px] font-medium uppercase tracking-wide text-neutral-400">
                General Crew Call
              </div>
              <div className="text-base font-bold text-neutral-900">7:00 AM</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-medium uppercase tracking-wide text-neutral-400">
                Est. Wrap
              </div>
              <div className="text-sm font-semibold text-neutral-800">
                6:30 PM
              </div>
            </div>
          </div>

          {/* Location */}
          <PreviewField label="Location">
            STAGE 4 — GRAVITY STUDIOS
            <div className="text-[10px] font-normal text-neutral-500">
              1820 Industrial Way, Los Angeles, CA 90021
            </div>
          </PreviewField>

          {/* Schedule */}
          <div>
            <div className="text-[9px] font-medium uppercase tracking-wide text-neutral-400">
              Today's Schedule
            </div>
            <div className="mt-1.5 space-y-1.5">
              {SCHEDULE_ROWS.map((r) => (
                <div key={r.time} className="flex gap-3 text-[10px]">
                  <span className="w-14 shrink-0 font-semibold text-neutral-800">
                    {r.time}
                  </span>
                  <span className="text-neutral-500">{r.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Arrival note */}
          <div className="rounded-md border border-neutral-100 bg-neutral-50 px-3 py-2">
            <div className="text-[9px] font-medium uppercase tracking-wide text-neutral-400">
              Arrival Note
            </div>
            <div className="text-[10px] text-neutral-600">
              Enter through Gate B. Parking is in Lot 3.
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-2 text-[9px] text-neutral-400">
            Will be sent to {recipientCount} recipient
            {recipientCount === 1 ? "" : "s"}.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Step bodies ────────────────────────────────────────────────────────── */

function StepHeader({ title, subtitle, current }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
        <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
      </div>
      <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-neutral-400">
        Step {current + 1} of {STEPS.length}
      </span>
    </div>
  );
}

function PersonRow({ person, checked, onToggle }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm hover:bg-neutral-50">
      <Checkbox checked={checked} onCheckedChange={onToggle} />
      <span className="flex size-7 items-center justify-center rounded-full bg-orange-200 text-[10px] font-semibold text-orange-800">
        {person.name
          .split(" ")
          .map((p) => p[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-neutral-900">
          {person.name}
        </span>
        <span className="block truncate text-xs text-neutral-400">
          {person.role}
        </span>
      </span>
    </label>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */

export default function CallSheetCreateV2() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState(() => new Set());

  const goBackToTab = () => navigate("/production-v2/project");

  const togglePicked = (id) =>
    setPicked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const recipientCount = picked.size;

  const handleContinue = () => {
    if (step === STEPS.length - 1) {
      toast.success("Call sheet sent");
      goBackToTab();
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  return (
    <V2Layout>
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-neutral-200 px-6 lg:px-8 py-4">
          <Button variant="outline" size="sm" onClick={goBackToTab}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <h1 className="text-xl font-semibold tracking-tight">
            Create call sheet
          </h1>
        </div>

        {/* Stepper */}
        <div className="px-6 lg:px-8 pt-5">
          <Stepper current={step} />
        </div>

        {/* Two-column body */}
        <div className="grid flex-1 grid-cols-1 gap-6 px-6 lg:px-8 py-6 lg:grid-cols-[1fr_360px]">
          {/* LEFT — active step form */}
          <div className="min-w-0">
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              {step === 0 && (
                <div className="space-y-5">
                  <StepHeader
                    title="Choose shoot"
                    subtitle="Set the production context for this call sheet. You can adjust every detail later."
                    current={step}
                  />
                  <div className="space-y-1.5">
                    <Label>Project</Label>
                    <Select defaultValue={PROJECT_OPTIONS[0]}>
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROJECT_OPTIONS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Shoot Date</Label>
                      <Select defaultValue="2026-07-02">
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2026-07-02">
                            Thursday, July 2, 2026
                          </SelectItem>
                          <SelectItem value="2026-07-03">
                            Friday, July 3, 2026
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Production Day</Label>
                      <Select defaultValue="day1">
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day1">Day 1 of 2</SelectItem>
                          <SelectItem value="day2">Day 2 of 2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Starting Point</Label>
                    <Select defaultValue="scratch">
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scratch">Start from scratch</SelectItem>
                        <SelectItem value="template">Use a template</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <label className="flex items-start gap-3 rounded-md border border-neutral-200 px-3 py-3 text-sm">
                    <Checkbox className="mt-0.5" />
                    <span>
                      <span className="block font-medium text-neutral-900">
                        Duplicate a previous call sheet
                      </span>
                      <span className="block text-xs text-neutral-400">
                        Reuse recipients, schedule blocks, locations, and
                        production notes.
                      </span>
                    </span>
                  </label>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <StepHeader
                    title="Schedule & location"
                    subtitle="Set call times and where the team should arrive."
                    current={step}
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>General Crew Call</Label>
                      <Input className="bg-white" defaultValue="7:00 AM" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Estimated Wrap</Label>
                      <Input className="bg-white" defaultValue="6:30 PM" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Location name</Label>
                    <Input
                      className="bg-white"
                      defaultValue="Stage 4 — Gravity Studios"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Address</Label>
                    <Input
                      className="bg-white"
                      defaultValue="1820 Industrial Way, Los Angeles, CA 90021"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Arrival note</Label>
                    <Textarea
                      rows={2}
                      className="bg-white"
                      defaultValue="Enter through Gate B. Parking is in Lot 3."
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <StepHeader
                    title="Talents & crew"
                    subtitle="Choose who receives this call sheet from your shortlist and crew list."
                    current={step}
                  />
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-neutral-900">
                        From talent shortlist
                      </div>
                      <div className="space-y-2">
                        {SHORTLIST_PEOPLE.map((p) => (
                          <PersonRow
                            key={p.id}
                            person={p}
                            checked={picked.has(p.id)}
                            onToggle={() => togglePicked(p.id)}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-neutral-900">
                        From crew list
                      </div>
                      <div className="space-y-2">
                        {CREW_PEOPLE.map((p) => (
                          <PersonRow
                            key={p.id}
                            person={p}
                            checked={picked.has(p.id)}
                            onToggle={() => togglePicked(p.id)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-500">
                    {recipientCount} recipient
                    {recipientCount === 1 ? "" : "s"} selected.
                  </p>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <StepHeader
                    title="Build schedule"
                    subtitle="Add the day's schedule blocks. Drag to reorder (preview)."
                    current={step}
                  />
                  <div className="space-y-2">
                    {SCHEDULE_ROWS.map((r, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-[120px_1fr] gap-3"
                      >
                        <Input className="bg-white" defaultValue={r.time} />
                        <Input className="bg-white" defaultValue={r.label} />
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm">
                    + Add row
                  </Button>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5">
                  <StepHeader
                    title="Production details"
                    subtitle="Notes, weather, and any extra instructions for the team."
                    current={step}
                  />
                  <div className="space-y-1.5">
                    <Label>Notes</Label>
                    <Textarea
                      rows={5}
                      className="bg-white"
                      placeholder="Add wardrobe, parking, safety, or weather notes…"
                    />
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-5">
                  <StepHeader
                    title="Review"
                    subtitle="Confirm everything looks right before sending."
                    current={step}
                  />
                  <dl className="divide-y divide-neutral-100 rounded-md border border-neutral-200">
                    {[
                      ["Project", "E-Bike Launch Campaign Commercial Day 1"],
                      ["Shoot date", "Thursday, July 2, 2026"],
                      ["Production day", "Day 1 of 2"],
                      ["Crew call", "7:00 AM"],
                      ["Location", "Stage 4 — Gravity Studios"],
                      ["Recipients", `${recipientCount} selected`],
                    ].map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-center justify-between px-4 py-2.5 text-sm"
                      >
                        <dt className="text-neutral-500">{k}</dt>
                        <dd className="font-medium text-neutral-900">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-5">
                  <StepHeader
                    title="Send"
                    subtitle="Deliver this call sheet to the selected talents and crew."
                    current={step}
                  />
                  <div className="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-5 text-center">
                    <div className="text-2xl font-semibold text-neutral-900">
                      {recipientCount}
                    </div>
                    <div className="text-sm text-neutral-500">
                      recipient{recipientCount === 1 ? "" : "s"} will receive
                      this call sheet
                    </div>
                  </div>
                  <p className="text-sm text-neutral-500">
                    Press <span className="font-medium">Continue</span> to send.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — live preview */}
          <div className="min-w-0">
            <LivePreview recipientCount={recipientCount} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-200 px-6 lg:px-8 py-4">
          <span className="text-xs text-neutral-400">Last saved just now</span>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button
                variant="outline"
                onClick={() => setStep((s) => Math.max(s - 1, 0))}
              >
                Back
              </Button>
            )}
            <Button variant="outline" onClick={goBackToTab}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.success("Draft saved")}
            >
              Save draft
            </Button>
            <Button
              onClick={handleContinue}
              className="bg-[#D8FF00] text-neutral-900 hover:bg-[#c2e600] shadow-none"
            >
              {step === STEPS.length - 1 ? "Send" : "Continue"}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </V2Layout>
  );
}

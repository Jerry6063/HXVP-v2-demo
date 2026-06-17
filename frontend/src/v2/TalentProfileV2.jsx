/**
 * TalentProfileV2 — Sofia Lin demo profile. Mirrors /tmp/nm_profile.png.
 * Header card + info grid, "Message Me" dialog, September 2026 availability
 * calendar, and stacked right-column cards. All inside V2Layout.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Lock,
} from "lucide-react";

import V2Layout from "./V2Layout";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { Textarea } from "@/components/shadcn/textarea";
import { Card } from "@/components/shadcn/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shadcn/dialog";

const TALENT = {
  name: "Sofia Lin",
  img: "https://i.pravatar.cc/300?img=5",
  fields: [
    { label: "Gender", value: "Female" },
    { label: "Age", value: "33" },
    { label: "Rate", value: "$130/hr" },
    { label: "Height", value: "5'6\" / 173cm" },
    { label: "Ethnicity", value: "Mixed-race" },
    { label: "Location", value: "San Francisco" },
    { label: "Type", value: "Model" },
    { label: "Email", value: "sofia1993@gmail.com" },
    { label: "Phone", value: "214-952-9876" },
    { label: "Languages", value: "English, Spanish" },
    { label: "Skills", value: "Yoga, Valid Driver's License" },
    { label: "Instagram", value: "@sofialin" },
  ],
};

const EXPERIENCE = [
  "20+ commercial shoots across lifestyle and beauty",
  "Featured in national TV campaign",
  "Experienced with outdoors and family shoots",
  "Comfortable speaking on camera",
];

const CAMPAIGNS = [
  "Holiday Campaign 2025",
  "Healthcare TV Commercial",
  "Lifestyle Photography Campaign",
];

const PRODUCER_NOTE = [
  "Always on time",
  "Takes direction well",
  "Great with children",
  "Strong improvisation skills",
];

// September 2026 starts on a Tuesday (Mon-first layout → 1 leading blank).
const LEADING_BLANKS = 1;
const DAYS_IN_MONTH = 30;
// id → status chip
const AVAILABILITY = {
  8: "Booked",
  9: "Available",
  17: "Available",
  24: "Booked",
};
const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function CalendarCell({ day }) {
  if (day == null) return <div className="min-h-16 rounded-md" />;
  const status = AVAILABILITY[day];
  return (
    <div className="min-h-16 rounded-md border border-neutral-100 p-1.5">
      <div className="text-xs text-neutral-500">{day}</div>
      {status && (
        <span
          className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${
            status === "Booked"
              ? "bg-orange-100 text-orange-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {status}
        </span>
      )}
    </div>
  );
}

export default function TalentProfileV2() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSend = () => {
    setDialogOpen(false);
    toast.success("Message sent to Sofia Lin");
  };

  const cells = [
    ...Array(LEADING_BLANKS).fill(null),
    ...Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1),
  ];

  return (
    <V2Layout>
      <div className="px-6 lg:px-8 py-6">
        <Link
          to="/production-v2/talents"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
        >
          <ArrowLeft className="size-4" />
          Back to talents
        </Link>

        {/* Header card */}
        <Card className="mt-4 gap-0 py-0 overflow-hidden">
          <div className="flex flex-col gap-5 p-5 sm:flex-row">
            <img
              src={TALENT.img}
              alt={TALENT.name}
              className="size-36 shrink-0 rounded-xl bg-neutral-100 object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-4">
                <h1 className="font-display text-4xl uppercase tracking-tight leading-none">
                  {TALENT.name}
                </h1>
                <Button
                  onClick={() => setDialogOpen(true)}
                  className="shrink-0 bg-[#D8FF00] text-neutral-900 hover:bg-[#c2e600] shadow-none"
                >
                  Message Me
                </Button>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                {TALENT.fields.map((f) => (
                  <div key={f.label}>
                    <div className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                      {f.label}
                    </div>
                    <div className="mt-0.5 truncate text-sm text-neutral-800">
                      {f.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Main grid: calendar + right column */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Availability calendar */}
          <Card className="lg:col-span-2 gap-0 py-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
              <h2 className="text-sm font-semibold">
                Availability — September 2026
              </h2>
              <div className="flex items-center gap-1">
                <button className="flex size-7 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100">
                  <ChevronLeft className="size-4" />
                </button>
                <button className="flex size-7 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100">
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-7 gap-1.5">
                {WEEKDAYS.map((d) => (
                  <div
                    key={d}
                    className="pb-1 text-center text-[11px] font-medium text-neutral-400"
                  >
                    {d}
                  </div>
                ))}
                {cells.map((day, i) => (
                  <CalendarCell key={i} day={day} />
                ))}
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-orange-300" />
                  Booked
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-emerald-300" />
                  Available
                </span>
              </div>
            </div>
          </Card>

          {/* Right column */}
          <div className="space-y-4">
            <Card className="gap-0 py-0">
              <div className="border-b border-neutral-100 px-5 py-3">
                <h3 className="text-sm font-semibold">Experience Highlights</h3>
              </div>
              <ul className="list-disc space-y-1.5 px-8 py-4 text-sm text-neutral-700">
                {EXPERIENCE.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </Card>

            <Card className="gap-0 py-0">
              <div className="border-b border-neutral-100 px-5 py-3">
                <h3 className="text-sm font-semibold">Notable Campaigns</h3>
              </div>
              <ul className="list-disc space-y-1.5 px-8 py-4 text-sm text-neutral-700">
                {CAMPAIGNS.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </Card>

            <Card className="gap-0 py-0 border-amber-200 bg-amber-50/40">
              <div className="flex items-center justify-between border-b border-amber-200/70 px-5 py-3">
                <h3 className="text-sm font-semibold">Producer Note:</h3>
                <span className="flex items-center gap-1 text-[11px] text-amber-700">
                  <Lock className="size-3" />
                  internal only
                </span>
              </div>
              <ul className="list-disc space-y-1.5 px-8 py-4 text-sm text-neutral-700">
                {PRODUCER_NOTE.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>

      {/* Message Me dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Message {TALENT.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label>To</Label>
              <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-800">
                {TALENT.name}
              </span>
            </div>
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Input className="bg-white" placeholder="Subject" />
            </div>
            <div className="space-y-1.5">
              <Label>Message</Label>
              <Textarea
                className="bg-white"
                rows={4}
                placeholder={`Write a message to ${TALENT.name}...`}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              className="bg-[#D8FF00] text-neutral-900 hover:bg-[#c2e600] shadow-none"
            >
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </V2Layout>
  );
}

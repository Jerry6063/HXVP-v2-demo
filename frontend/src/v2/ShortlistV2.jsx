/**
 * ShortlistV2 — shortlist workflow page. Mirrors /tmp/nv_workflow.png.
 * Left: shortlisted talent grid. Right: fixed "Please confirm your
 * availability" panel (inline column, not a modal sheet) with assignee chips,
 * due-date chip, message, attachments, Cancel/Send.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { X, Calendar as CalendarIcon, Maximize2, PanelRight } from "lucide-react";

import V2Layout from "./V2Layout";
import TalentCard from "./TalentCard";
import { Button } from "@/components/shadcn/button";
import { Textarea } from "@/components/shadcn/textarea";
import { Label } from "@/components/shadcn/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/shadcn/avatar";
import { TALENTS, SHORTLIST_IDS } from "./mockData";

const TITLE = "Sports Commercial Photo Talents Shortlist";
const DEFAULT_MESSAGE =
  "This project is a sport commercial photo shooting project, please confirm your availability before 06/20/2026. Attached are some project info.";

function AssigneeChip({ t, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white py-0.5 pl-0.5 pr-2 text-xs">
      <Avatar className="size-5">
        <AvatarImage src={`https://i.pravatar.cc/100?img=${t.img}`} alt={t.name} />
        <AvatarFallback>{t.name[0]}</AvatarFallback>
      </Avatar>
      {t.name}
      <button
        onClick={onRemove}
        className="text-neutral-400 hover:text-neutral-700"
      >
        <X className="size-3.5" />
      </button>
    </span>
  );
}

export default function ShortlistV2() {
  const navigate = useNavigate();
  const shortlisted = TALENTS.filter((t) => SHORTLIST_IDS.includes(t.id));
  const [assignees, setAssignees] = useState(shortlisted);
  const [hasDate, setHasDate] = useState(true);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);

  const removeAssignee = (id) =>
    setAssignees((prev) => prev.filter((a) => a.id !== id));

  const handleSend = () => {
    toast.success("Availability request sent", {
      description: `Sent to ${assignees.length} talent${
        assignees.length === 1 ? "" : "s"
      }.`,
    });
  };

  return (
    <V2Layout>
      <div className="flex min-h-screen">
        {/* Left: title + grid */}
        <div className="flex-1 min-w-0 px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-semibold tracking-tight">{TITLE}</h1>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
            {shortlisted.map((t) => (
              <TalentCard key={t.id} t={t} />
            ))}
          </div>
        </div>

        {/* Right: confirm-availability panel */}
        <aside className="hidden lg:flex w-[380px] shrink-0 flex-col border-l border-neutral-200 bg-white">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="text-base font-semibold">
              Please confirm your availability
            </h2>
            <div className="flex items-center gap-2 text-neutral-400">
              <Maximize2 className="size-4" />
              <PanelRight className="size-4" />
            </div>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-4">
            {/* Assignee */}
            <div className="space-y-2">
              <Label className="text-neutral-500">Assignee</Label>
              <div className="flex flex-wrap gap-2">
                {assignees.map((a) => (
                  <AssigneeChip
                    key={a.id}
                    t={a}
                    onRemove={() => removeAssignee(a.id)}
                  />
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label className="text-neutral-500">Due Date</Label>
              {hasDate && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-xs">
                  <CalendarIcon className="size-3.5 text-neutral-500" />
                  07/26/2026
                  <button
                    onClick={() => setHasDate(false)}
                    className="text-neutral-400 hover:text-neutral-700"
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              )}
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label className="text-neutral-500">Message</Label>
              <Textarea
                rows={5}
                className="bg-white"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {/* Attachments */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-neutral-500">Attachments</Label>
                <button className="text-xs font-medium text-lime-600 hover:underline">
                  + Add Document
                </button>
              </div>
              <p className="text-sm text-neutral-400">No attachment added yet</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-neutral-200 px-5 py-4">
            <Button variant="outline" onClick={() => navigate("/production-v2/talents")}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              className="bg-[#D8FF00] text-neutral-900 hover:bg-[#c2e600] shadow-none"
            >
              Send
            </Button>
          </div>
        </aside>
      </div>
    </V2Layout>
  );
}

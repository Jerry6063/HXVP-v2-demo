/**
 * SavedShortlistV2 — saved shortlist detail page. Mirrors /tmp/wf7.png.
 * Breadcrumb-style title, share / check-availability / delete actions, and the
 * shortlisted talent grid (reuses TalentCard + mockData). "Share with Client"
 * opens an inline right-side send panel (Figma 6986:16273). Additive preview;
 * wrapped by V2Layout (Talents nav active via route).
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Share,
  CheckCircle2,
  Trash2,
  X,
  Calendar as CalendarIcon,
  PanelRight,
} from "lucide-react";

import V2Layout from "./V2Layout";
import TalentCard from "./TalentCard";
import { Button } from "@/components/shadcn/button";
import { Badge } from "@/components/shadcn/badge";
import { Textarea } from "@/components/shadcn/textarea";
import { Label } from "@/components/shadcn/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/shadcn/avatar";
import { TALENTS, SHORTLIST_IDS, CLIENT_RECIPIENTS } from "./mockData";

const SHORTLIST_TITLE = "Spring Lifestyle Talent Shortlist";
const DEFAULT_MESSAGE =
  "Here is the talent shortlist to be confirmed for this project. Please let us know if you have any questions.";

function RecipientChip({ r, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white py-0.5 pl-0.5 pr-2 text-xs">
      <Avatar className="size-5">
        <AvatarImage src={`https://i.pravatar.cc/100?img=${r.img}`} alt={r.name} />
        <AvatarFallback>{r.name[0]}</AvatarFallback>
      </Avatar>
      {r.name}
      <button
        onClick={onRemove}
        className="text-neutral-400 hover:text-neutral-700"
      >
        <X className="size-3.5" />
      </button>
    </span>
  );
}

export default function SavedShortlistV2() {
  const navigate = useNavigate();
  const shortlisted = TALENTS.filter((t) => SHORTLIST_IDS.includes(t.id));
  const [preferences, setPreferences] = useState({}); // talentId -> 'forward' | 'pass' | null

  const [shareOpen, setShareOpen] = useState(false);
  const [recipients, setRecipients] = useState(CLIENT_RECIPIENTS);
  const [hasDate, setHasDate] = useState(true);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);

  const setPreference = (id, value) =>
    setPreferences((prev) => ({ ...prev, [id]: value }));

  const removeRecipient = (id) =>
    setRecipients((prev) => prev.filter((r) => r.id !== id));

  const handleSend = () => {
    toast.success("Shortlist shared with client", {
      description: "Sent to 2 recipients.",
    });
    setShareOpen(false);
  };

  const handleDelete = () => {
    toast.success("Shortlist deleted");
    navigate("/production-v2/talents");
  };

  return (
    <V2Layout>
      <div className="flex min-h-screen">
        {/* Left: title + grid */}
        <div className="flex-1 min-w-0 px-6 lg:px-8 py-6">
          {/* Title row */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h1 className="text-xl tracking-tight">
              <span className="text-neutral-400">Spring Lifestyle Collection</span>
              <span className="text-neutral-400"> / </span>
              <span className="font-semibold text-neutral-900">
                {SHORTLIST_TITLE}
              </span>
            </h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setShareOpen(true)}>
                <Share className="size-4" />
                Share with Client
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/production-v2/shortlist")}
              >
                <CheckCircle2 className="size-4" />
                Check Availability
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-neutral-500 hover:text-neutral-900"
                onClick={handleDelete}
              >
                <Trash2 className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-neutral-500 hover:text-neutral-900"
                onClick={() => navigate("/production-v2/talents")}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* Talent grid */}
          <div className="mt-6 grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(240px,300px))]">
            {shortlisted.map((t) => (
              <TalentCard
                key={t.id}
                t={t}
                review
                preference={preferences[t.id] ?? null}
                onPreference={(value) => setPreference(t.id, value)}
              />
            ))}
          </div>
        </div>

        {/* Right: share-with-client send panel */}
        {shareOpen && (
          <aside className="hidden lg:flex w-[380px] shrink-0 flex-col border-l border-neutral-200 bg-white">
            <div className="flex items-start justify-between gap-2 px-5 py-4">
              <div className="flex flex-col gap-1.5">
                <h2 className="text-base font-semibold">{SHORTLIST_TITLE}</h2>
                <Badge
                  variant="outline"
                  className="w-fit border-amber-300 bg-amber-50 text-amber-700"
                >
                  Pending Approval
                </Badge>
              </div>
              <button
                onClick={() => setShareOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <PanelRight className="size-4" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-4">
              {/* To */}
              <div className="space-y-2">
                <Label className="text-neutral-500">To</Label>
                <div className="flex flex-wrap gap-2">
                  {recipients.map((r) => (
                    <RecipientChip
                      key={r.id}
                      r={r}
                      onRemove={() => removeRecipient(r.id)}
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
              <Button variant="outline" onClick={() => setShareOpen(false)}>
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
        )}
      </div>
    </V2Layout>
  );
}

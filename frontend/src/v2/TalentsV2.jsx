/** TalentsV2 — talent pool with multi-select + create-shortlist dialog. */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Search, PlusCircle, Star, ChevronRight } from "lucide-react";

import V2Layout from "./V2Layout";
import TalentCard from "./TalentCard";
import { Input } from "@/components/shadcn/input";
import { Button } from "@/components/shadcn/button";
import { Label } from "@/components/shadcn/label";
import { Separator } from "@/components/shadcn/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/shadcn/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shadcn/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import {
  TALENTS,
  TALENT_SUBMISSIONS,
  SUBMISSION_STATUS_STYLES,
} from "./mockData";

const FILTERS = [
  { ph: "All types", opts: ["Actor", "Model", "Dancer", "Hand Model"] },
  { ph: "All Genders", opts: ["Man", "Woman", "Non-binary"] },
  { ph: "All Ethnicities", opts: ["White", "Black", "Asian", "Mixed", "Indian"] },
  { ph: "All Ages", opts: ["18-25", "26-35", "36-45", "46+"] },
  { ph: "All Heights", opts: ["< 5ft 6in", "5ft 6in - 6ft", "> 6ft"] },
  { ph: "Available time", opts: ["This week", "This month", "Custom"] },
];

const SHORTLIST_NAME = "Sports Commercial Photo Talents Shortlist";

/* ── Tab-trigger styling — underline-accent bar per the wf5 spec. Inactive:
 * no fill, rounded-sm, medium label. Active: #eaffae fill, 4px #5b6f00 bottom
 * border, semibold label. Applied on each trigger so pool/saved read the same. */
const TAB_TRIGGER =
  "h-10 flex-none rounded-sm border border-transparent px-4 py-2 text-sm font-medium text-[#09090b] shadow-none data-[state=active]:bg-[#eaffae] data-[state=active]:border-b-4 data-[state=active]:border-b-[#5b6f00] data-[state=active]:rounded-b-none data-[state=active]:font-semibold data-[state=active]:shadow-none";

/* ── Review Queue row ── */
function QueueRow({ sub, selected, onSelect }) {
  const badge = SUBMISSION_STATUS_STYLES[sub.status] || SUBMISSION_STATUS_STYLES.Review;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-[8px] border border-[#e0e0e0] px-4 py-3 text-left transition-colors ${
        selected ? "bg-[#f7f7f2]" : "bg-white hover:bg-[#edf3dc]"
      }`}
    >
      <div className="flex items-start gap-3">
        <img
          src={sub.avatar}
          alt={sub.name}
          className="size-9 shrink-0 rounded-full object-cover"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-[#09090b]">
            {sub.name}
          </div>
          <div className="truncate text-xs text-[#71717a]">{sub.role}</div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-[#71717a]">{sub.ago}</span>
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${badge}`}
            >
              {sub.status}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

/* ── Detail field cell (label over value) ──
 * Row separators are drawn with a per-cell bottom border and suppressed for the
 * last row at each breakpoint via nth-last-child variants (breakpoint-correct,
 * no index math): 2 cols on mobile → hide the last 2; 4 cols at md → re-show
 * those 2, hide the last 4. FieldCell must stay a *direct* grid child for the
 * nth-child selectors to count against the grid. */
function FieldCell({ label, value }) {
  return (
    <div className="border-b border-[#e0e0e0] py-3 [&:nth-last-child(-n+2)]:border-b-0 md:[&:nth-last-child(-n+2)]:border-b md:[&:nth-last-child(-n+4)]:border-b-0">
      <div className="text-sm text-[#71717a]">{label}</div>
      <div className="mt-0.5 text-base text-[#09090b]">{value}</div>
    </div>
  );
}

export default function TalentsV2() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(() => new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState(SHORTLIST_NAME);

  // Review-queue state (in-memory for this session).
  const [queue, setQueue] = useState(TALENT_SUBMISSIONS);
  const [activeId, setActiveId] = useState(TALENT_SUBMISSIONS[0]?.id ?? null);
  const [reviewSearch, setReviewSearch] = useState("");
  // Talents approved this session — appended to the Talent Pool grid.
  const [approved, setApproved] = useState([]);

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleSave = () => {
    setDialogOpen(false);
    toast.success("Shortlist saved", { description: name });
    navigate("/production-v2/shortlist");
  };

  // Pool grid = base talents + this-session approvals.
  const poolTalents = useMemo(() => [...approved, ...TALENTS], [approved]);

  const filteredQueue = useMemo(() => {
    const q = reviewSearch.trim().toLowerCase();
    if (!q) return queue;
    return queue.filter((s) => s.name.toLowerCase().includes(q));
  }, [queue, reviewSearch]);

  // Single source of truth: `active` is *strictly* the submission whose id ===
  // activeId within the current filtered list — never a silent fallback. This
  // guarantees selection and the Reject/Approve actions can never diverge.
  const active = filteredQueue.find((s) => s.id === activeId) ?? null;

  // Keep activeId valid against the filtered list. When a search (or a queue
  // mutation) removes the selected submission from view, snap the selection to
  // the first visible row (or null when empty) so the detail panel and footer
  // actions always target what the reviewer can actually see.
  useEffect(() => {
    if (filteredQueue.some((s) => s.id === activeId)) return;
    setActiveId(filteredQueue[0]?.id ?? null);
  }, [filteredQueue, activeId]);

  // Remove a submission from the queue and select the next one. The effect
  // above is the ultimate safety net, but advancing here keeps focus on a
  // sensible neighbour rather than jumping to the top of the list.
  const removeAndAdvance = (id) => {
    setQueue((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      const next = prev.filter((s) => s.id !== id);
      const fallback = next[idx] || next[idx - 1] || next[0] || null;
      setActiveId(fallback?.id ?? null);
      return next;
    });
  };

  const handleApprove = () => {
    if (!active) return;
    toast.success(`${active.name} approved — added to talent pool`);
    if (active.poolCard) setApproved((prev) => [active.poolCard, ...prev]);
    removeAndAdvance(active.id);
  };

  const handleReject = () => {
    if (!active) return;
    toast(`${active.name}'s submission rejected`);
    removeAndAdvance(active.id);
  };

  const handleRequestChanges = () => {
    if (!active) return;
    toast.info(`Changes requested from ${active.name}`);
    setQueue((prev) =>
      prev.map((s) =>
        s.id === active.id ? { ...s, status: "Changes requested" } : s
      )
    );
  };

  return (
    <V2Layout>
      <div className="px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="font-display text-4xl lg:text-5xl tracking-tight leading-none">
              Talents
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Browse availability, rates, and casting fit across portfolios
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-56 max-w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <Input className="pl-9 bg-white" placeholder="Search talents..." />
            </div>
            <Button variant="outline">
              <PlusCircle className="size-4" />
              Add talent
            </Button>
            <Button
              disabled={selected.size === 0}
              onClick={() => setDialogOpen(true)}
              className="bg-[#D8FF00] text-neutral-900 hover:bg-[#c2e600] shadow-none disabled:opacity-50"
            >
              Create Shortlist
              {selected.size > 0 ? ` (${selected.size})` : ""}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pool" className="mt-5">
          <TabsList className="h-auto w-fit gap-2 rounded-none bg-transparent p-0">
            <TabsTrigger value="pool" className={TAB_TRIGGER}>
              Talent Pool
            </TabsTrigger>
            <TabsTrigger value="saved" className={TAB_TRIGGER}>
              Saved Shortlists
            </TabsTrigger>
            <TabsTrigger value="review" className={TAB_TRIGGER}>
              Review Talents Submissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pool" className="mt-4">
            {/* Filter row */}
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {FILTERS.map((f) => (
                <Select key={f.ph}>
                  <SelectTrigger className="h-8 bg-white text-xs">
                    <SelectValue placeholder={f.ph} />
                  </SelectTrigger>
                  <SelectContent>
                    {f.opts.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-neutral-500"
                onClick={() => setSelected(new Set())}
              >
                reset
              </Button>
            </div>

            {/* Grid */}
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(240px,300px))]">
              {poolTalents.map((t) => (
                <TalentCard
                  key={t.id}
                  t={t}
                  selectable
                  selected={selected.has(t.id)}
                  onToggle={() => toggle(t.id)}
                  onOpen={() => navigate("/production-v2/talent-profile")}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="saved" className="mt-4">
            <Link
              to="/production-v2/saved-shortlist"
              className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:bg-neutral-50"
            >
              <span className="flex size-9 items-center justify-center rounded-md bg-[#eaffae] text-neutral-900">
                <Star className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">
                  Spring Lifestyle Talent Shortlist
                </div>
                <div className="text-xs text-neutral-500">
                  4 talents · Spring Lifestyle Collection
                </div>
              </div>
              <ChevronRight className="size-4 text-neutral-400" />
            </Link>
          </TabsContent>

          {/* ── Review Talents Submissions ── */}
          <TabsContent value="review" className="mt-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[286px_minmax(0,1fr)]">
              {/* LEFT — Review Queue */}
              <div className="rounded-xl border border-[#e0e0e0] bg-white p-4">
                <div className="text-base font-semibold text-[#09090b]">
                  Review Queue
                </div>
                <div className="text-sm text-[#71717a]">
                  {queue.length} pending
                </div>
                <div className="relative mt-3">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                  <Input
                    value={reviewSearch}
                    onChange={(e) => setReviewSearch(e.target.value)}
                    placeholder="Search…"
                    className="border-[#e4e4e7] bg-white pl-9"
                  />
                </div>
                <div className="mt-3 max-h-[560px] space-y-2 overflow-y-auto pr-1">
                  {filteredQueue.length === 0 ? (
                    <div className="py-8 text-center text-sm text-[#71717a]">
                      No submissions
                    </div>
                  ) : (
                    filteredQueue.map((sub) => (
                      <QueueRow
                        key={sub.id}
                        sub={sub}
                        selected={active?.id === sub.id}
                        onSelect={() => setActiveId(sub.id)}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* RIGHT — Detail panel + footer */}
              {active ? (
                <div className="min-w-0 space-y-6">
                  <div className="rounded-xl border border-[#e4e4e7] bg-white p-6">
                    {/* Header row: photo + name + Message Me */}
                    <div className="flex flex-col gap-6 lg:flex-row">
                      <img
                        src={active.photo}
                        alt={active.name}
                        className="size-[270px] shrink-0 rounded-md object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="font-display text-4xl lg:text-5xl uppercase tracking-tight leading-none text-[#09090b]">
                            {active.name}
                          </div>
                          <button
                            type="button"
                            onClick={() => toast.info("Message Me")}
                            className="inline-flex h-10 w-[142px] shrink-0 items-center justify-center rounded-md border border-[#e4e4e7] bg-[#fafafa] px-4 text-sm font-medium text-[#18181b] transition-colors hover:bg-neutral-100"
                          >
                            Message Me
                          </button>
                        </div>

                        {/* 4 × 3 field grid */}
                        <div className="mt-4 grid grid-cols-2 gap-x-6 md:grid-cols-4">
                          {active.fields.map((f) => (
                            <FieldCell
                              key={f.label}
                              label={f.label}
                              value={f.value}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Two sub-cards */}
                    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {/* Experience and campaigns */}
                      <div className="rounded-lg border border-[#e0e0e0] bg-white p-6">
                        <div className="text-base font-semibold text-[#09090b]">
                          Experience and campaigns
                        </div>
                        <p className="mt-1 text-sm text-[#71717a]">
                          Highlights admins can use when matching you to
                          production needs.
                        </p>
                        <Separator className="my-5 bg-[#e0e0e0]" />
                        <div className="text-xs font-semibold text-[#3f3f46]">
                          Experience highlights
                        </div>
                        <p className="mt-2 text-sm text-[#09090b]">
                          {active.experience.highlights}
                        </p>
                        <Separator className="my-5 bg-[#e0e0e0]" />
                        <div className="text-xs font-semibold text-[#3f3f46]">
                          Notable campaigns
                        </div>
                        <p className="mt-2 text-sm text-[#09090b]">
                          {active.experience.campaigns}
                        </p>
                      </div>

                      {/* Casting media */}
                      <div className="rounded-lg border border-[#e0e0e0] bg-white p-6">
                        <div className="text-base font-semibold text-[#09090b]">
                          Casting media
                        </div>
                        <p className="mt-1 text-sm text-[#71717a]">
                          Media used by admins for casting review and client
                          shortlist submissions.
                        </p>
                        <Separator className="my-5 bg-[#e0e0e0]" />
                        <div className="grid grid-cols-3 gap-4">
                          {active.castingMedia.map((src, i) => (
                            <img
                              key={i}
                              src={src}
                              alt={`${active.name} casting media ${i + 1}`}
                              className="aspect-square w-full rounded-lg border border-[#e0e0e0] object-cover"
                              loading="lazy"
                            />
                          ))}
                          <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-[#f2f2ec] p-2 text-center text-sm text-[#09090b]">
                            Portfolio PDF
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer action bar */}
                  <div className="flex flex-col gap-4 rounded-xl border border-[#e0e0e0] bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="text-base font-semibold text-[#09090b]">
                        Review profile submission
                      </div>
                      <div className="text-sm text-[#71717a]">
                        Submitted by {active.submittedBy} on {active.submittedAt}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={handleReject}
                        className="inline-flex h-10 items-center justify-center rounded-md border border-[#ef4444] bg-white px-4 text-sm font-medium text-[#ef4444] transition-colors hover:bg-red-50"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={handleRequestChanges}
                        className="inline-flex h-10 items-center justify-center rounded-md border border-[#e4e4e7] bg-white px-4 text-sm font-medium text-[#09090b] transition-colors hover:bg-neutral-50"
                      >
                        Request Changes
                      </button>
                      <button
                        type="button"
                        onClick={handleApprove}
                        className="inline-flex h-10 items-center justify-center rounded-md bg-[#d8ff00] px-4 text-sm font-medium text-[#09090b] transition-colors hover:bg-[#c2e600]"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-[#e0e0e0] bg-white text-sm text-[#71717a]">
                  No submission selected — the review queue is clear.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Save as a new shortlist dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save as a new shortlist</DialogTitle>
            <p className="text-sm text-neutral-500">
              save and retrieve talents shortlist easily
            </p>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                className="bg-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Save to project</Label>
              <Select defaultValue={SHORTLIST_NAME}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SHORTLIST_NAME}>
                    {SHORTLIST_NAME}
                  </SelectItem>
                  <SelectItem value="E-Bike Launch Campaign">
                    E-Bike Launch Campaign
                  </SelectItem>
                  <SelectItem value="Smart Home Product Reveal">
                    Smart Home Product Reveal
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-[#D8FF00] text-neutral-900 hover:bg-[#c2e600] shadow-none"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </V2Layout>
  );
}

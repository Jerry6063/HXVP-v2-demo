/**
 * ProjectV2 — Project detail / Production Workflow page. Mirrors /tmp/wf1.png.
 *
 * Phased, collapsible task table with inline add-task / add-section, per-row
 * "···" dropdown (duplicate / copy link / delete), and a docked right-side task
 * detail panel that can expand to a full-page view (/tmp/wf5, wf6). Sending the
 * email panel fires a sonner success toast (/tmp/wf3). Additive preview only;
 * wrapped by V2Layout so shadcn tokens + light bg stay scoped to `.v2-root`.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronRight,
  Share2,
  Plus,
  PlusCircle,
  ChevronsUpDown,
  MoreHorizontal,
  Copy,
  Link2,
  Trash2,
  Check,
  Eye,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Calendar as CalendarIcon,
  PanelRight,
  MessageSquare,
  X,
} from "lucide-react";

import V2Layout from "./V2Layout";
import TimeLogReview from "./TimeLogReview";
import ProjectBudgetChart from "./ProjectBudgetChart";
import { Button } from "@/components/shadcn/button";
import { Card } from "@/components/shadcn/card";
import { Input } from "@/components/shadcn/input";
import { Textarea } from "@/components/shadcn/textarea";
import { Label } from "@/components/shadcn/label";
import { Checkbox } from "@/components/shadcn/checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/shadcn/dropdown-menu";
// The Talents tab IS frame 7457:20858 and opening a shortlist IS frame
// 7537:20115, so both surfaces are IMPORTED from the files that own them
// rather than re-drawn here. Nothing below forks that UI.
import { ShortlistBuilder, ShortlistDetailHeader } from "./ShortlistV2";
import {
  ShortlistSortRow,
  SavedShortlistList,
  newShortlistName,
} from "./SavedShortlistV2";
import {
  PROJECT_PHASES,
  TASK_COMMENTS,
  DEFAULT_ASSIGNEE,
  DEFAULT_DUE,
  TASK_DESCRIPTIONS,
  GENERIC_DESCRIPTION,
  CALL_SHEETS,
  CALL_SHEET_STATUS_STYLES,
  SHORTLIST_DETAIL,
  shortlistRoleForProjectRole,
  PROJECT_ROLE_REQUIREMENTS,
  TIME_LOGS,
} from "./mockData";

const PROJECT_TITLE = "E-Bike Launch Campaign";
// Frame 7457:20864 / 7540:20612 (the same Nav Bar instance on every project
// frame) draws these eight in this order — Budget is 3rd, at nav-relative
// x=300, not last. Tab widths there are text + 16px of horizontal padding with
// a 16px gap, which is what `px-4` + `gap-4` reproduce.
const TABS = [
  "Overview",
  "Production Workflow",
  "Budget",
  "Talents",
  "Crew",
  "Contract",
  "Call Sheet",
  "Time Log",
];

/**
 * Overview-tab content (Yina frame 7189:24086). Reintroduces the read-only
 * "Overview" tab she removed on Jenni's request but deliberately brought back
 * WITH content. Flat local shape (client/budget/deadline at the top level);
 * mockData's PROJECT_OVERVIEW nests those under `details`, so the two are not
 * drop-in swappable — left local until someone reconciles the two shapes.
 * The Talent/Crew requirement BODIES no longer live here: Yina restructured
 * both cards into role tables, which come from PROJECT_ROLE_REQUIREMENTS.
 */
const PROJECT_OVERVIEW = {
  description:
    "E-Bike Launch campaign covering social, e-commerce, and short-form video deliverables for E-bike 2026 seasonal launch.",
  approvedBudget: "$46,000.00",
  client: "Nike",
  budget: "$46,000.00",
  deadline: "May 29, 2026",
  primaryLocation: "Los Angeles, CA",
  internalNotes:
    "Confirm final shortlist with client before call sheet creation. Keep talent availability, crew holds, and budget changes synced before sending production documents.",
};

/**
 * Shortlist fill state for one Overview talent row, or null if that row has no
 * shortlist role yet. The join is mockData's `projectRoleId` foreign key — the
 * hand-written ROLE_TO_SHORTLIST_ROLE map that used to live here is gone, so
 * the two tables can no longer drift apart. `rowId` already IS the `treq-…` id.
 */
function shortlistProgress(rowId) {
  const role = shortlistRoleForProjectRole(rowId);
  if (!role) return null;
  return {
    roleId: role.id,
    candidates: role.candidates.length,
    confirmed: role.candidates.filter((c) => c.status === "Confirmed").length,
  };
}

/** Stable empty seed for a brand-new shortlist (roles are created first). */
const NO_ROLES = [];

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

let uid = 0;
const nextId = () => `task-${++uid}`;

let reqUid = 0;
const nextReqId = (prefix) => `${prefix}-new-${++reqUid}`;

/** Editable copy of one side of PROJECT_ROLE_REQUIREMENTS ("talent" | "crew"). */
function initialRequirements(side) {
  const spec = PROJECT_ROLE_REQUIREMENTS[side];
  return { rows: spec.rows.map((row) => ({ ...row })), direction: spec.direction };
}

/** Build initial phase/task state from the static phase list. */
function buildInitialPhases() {
  return PROJECT_PHASES.map((phase) => ({
    id: phase.id,
    title: phase.title,
    open: true,
    tasks: phase.tasks.map((title) => ({
      id: nextId(),
      title,
      done: false,
      assignee: DEFAULT_ASSIGNEE,
      due: DEFAULT_DUE,
      comments: TASK_COMMENTS[title]?.count ?? 0,
      unread: TASK_COMMENTS[title]?.unread ?? false,
    })),
  }));
}

function descriptionFor(title) {
  return TASK_DESCRIPTIONS[title] || GENERIC_DESCRIPTION;
}

/**
 * Small circular progress ring (Call Sheet Views / Confirmed columns).
 * Lime/green stroke fills proportional to n/total; "{n}" centered with
 * a muted "of {total}" beneath. Full rings (n === total) read as solid green.
 */
function CircularProgress({ value, total, size = 52 }) {
  const pct = total > 0 ? Math.min(value / total, 1) : 0;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const filled = pct >= 1;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#e5e5e5"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={filled ? "#65a30d" : "#84cc16"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-sm font-semibold text-neutral-800">{value}</span>
        <span className="text-[9px] text-neutral-400">of {total}</span>
      </div>
    </div>
  );
}

function AssigneeChip({ assignee }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-neutral-700">
      <span className="flex size-5 items-center justify-center rounded-full bg-orange-200 text-[10px] font-semibold text-orange-800">
        {assignee.initials}
      </span>
      {assignee.name}
    </span>
  );
}

export default function ProjectV2() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [phases, setPhases] = useState(buildInitialPhases);
  const [activeTab, setActiveTab] = useState("Overview");
  const [filter, setFilter] = useState("");
  const [addingTo, setAddingTo] = useState(null); // phaseId with an open add-task input
  const [addTaskText, setAddTaskText] = useState("");
  const [addingSection, setAddingSection] = useState(false);
  const [sectionText, setSectionText] = useState("");

  // Editable-in-place requirements (Jun/Jenni request — the in-place edit and
  // its toast survive Yina's restructure, they just moved from one free-text
  // body to per-role rows + the general-direction textarea). Seeded from the
  // static PROJECT_ROLE_REQUIREMENTS; lifted here so edits persist across tab
  // switches while ProjectV2 stays mounted.
  const [talentReq, setTalentReq] = useState(() => initialRequirements("talent"));
  const [crewReq, setCrewReq] = useState(() => initialRequirements("crew"));

  // selected task detail: { phaseId, taskId } | null, plus full-page flag
  const [openTask, setOpenTask] = useState(null);
  const [fullPage, setFullPage] = useState(false);

  // Talents tab: 'list' is frame 7457:20858 (the saved-shortlist list), and
  // opening/creating one swaps in ShortlistBuilder — frame 7537:20115 — in
  // place. `openShortlist` is null on the list and {name, isNew} in the builder.
  // The old flat TalentCard picker steps ('create' / 'pick' / the review grid)
  // are gone: roles are first class now, so candidates are added per role
  // INSIDE the builder, not from a page-wide checkbox grid.
  const [openShortlist, setOpenShortlist] = useState(null);
  const [talentPanel, setTalentPanel] = useState(null); // 'confirm' | 'share' | null

  // Live mirror of the open builder's role list (ShortlistBuilder reports its
  // own state via onRolesChange — the setter's stable identity keeps that
  // effect quiet). "Check availability" derives its "To" chips from THIS, not
  // a module-scope snapshot of SHORTLIST_DETAIL, so a candidate removed in the
  // builder is gone from the panel too.
  const [builderRoles, setBuilderRoles] = useState(NO_ROLES);

  // Create-card field, owned here so "Add talents" can carry the typed name
  // into the shortlist it opens. Defaults to the authored stem dated today.
  const [newName, setNewName] = useState(() => newShortlistName());
  const resetNewName = () => setNewName(newShortlistName());

  // simulate a brief load before showing content (/tmp/wf2)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Switch tabs and reset the shared filter, so a query typed on one tab
  // (e.g. Production Workflow) doesn't silently hide rows on another
  // (e.g. the Budget tab's line items) that reuse the same `filter` state.
  const selectTab = (tab) => {
    setActiveTab(tab);
    setFilter("");
  };

  const togglePhase = (phaseId) =>
    setPhases((prev) =>
      prev.map((p) => (p.id === phaseId ? { ...p, open: !p.open } : p))
    );

  const toggleTaskDone = (phaseId, taskId) =>
    setPhases((prev) =>
      prev.map((p) =>
        p.id !== phaseId
          ? p
          : {
              ...p,
              tasks: p.tasks.map((t) =>
                t.id === taskId ? { ...t, done: !t.done } : t
              ),
            }
      )
    );

  const setTaskDone = (phaseId, taskId, done) =>
    setPhases((prev) =>
      prev.map((p) =>
        p.id !== phaseId
          ? p
          : {
              ...p,
              tasks: p.tasks.map((t) =>
                t.id === taskId ? { ...t, done } : t
              ),
            }
      )
    );

  const markRead = (phaseId, taskId) =>
    setPhases((prev) =>
      prev.map((p) =>
        p.id !== phaseId
          ? p
          : {
              ...p,
              tasks: p.tasks.map((t) =>
                t.id === taskId ? { ...t, unread: false } : t
              ),
            }
      )
    );

  const addTask = (phaseId) => {
    const title = addTaskText.trim();
    if (!title) return;
    setPhases((prev) =>
      prev.map((p) =>
        p.id !== phaseId
          ? p
          : {
              ...p,
              tasks: [
                ...p.tasks,
                {
                  id: nextId(),
                  title,
                  done: false,
                  assignee: DEFAULT_ASSIGNEE,
                  due: DEFAULT_DUE,
                  comments: 0,
                  unread: false,
                },
              ],
            }
      )
    );
    setAddTaskText("");
    setAddingTo(null);
  };

  const addSection = () => {
    const title = sectionText.trim();
    if (!title) return;
    setPhases((prev) => [
      ...prev,
      { id: `section-${nextId()}`, title, open: true, tasks: [] },
    ]);
    setSectionText("");
    setAddingSection(false);
  };

  const duplicateTask = (phaseId, taskId) =>
    setPhases((prev) =>
      prev.map((p) => {
        if (p.id !== phaseId) return p;
        const idx = p.tasks.findIndex((t) => t.id === taskId);
        if (idx === -1) return p;
        const copy = { ...p.tasks[idx], id: nextId() };
        const tasks = [...p.tasks];
        tasks.splice(idx + 1, 0, copy);
        return { ...p, tasks };
      })
    );

  const deleteTask = (phaseId, taskId) => {
    setPhases((prev) =>
      prev.map((p) =>
        p.id !== phaseId
          ? p
          : { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) }
      )
    );
    if (openTask && openTask.taskId === taskId) closeTask();
  };

  const copyTaskLink = (task) => {
    const link = `${window.location.origin}${window.location.pathname}#${slugify(
      task.title
    )}`;
    navigator.clipboard?.writeText(link).catch(() => {});
    toast.success("Link copied");
  };

  const findTask = (sel) => {
    if (!sel) return null;
    const phase = phases.find((p) => p.id === sel.phaseId);
    const task = phase?.tasks.find((t) => t.id === sel.taskId);
    return task ? { phase, task } : null;
  };

  const closeTask = () => {
    setOpenTask(null);
    setFullPage(false);
  };

  const q = filter.trim().toLowerCase();
  const matches = (t) => !q || t.title.toLowerCase().includes(q);

  const selected = findTask(openTask);

  return (
    <V2Layout>
      <div className="flex min-h-screen">
        {/* Main content column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          {/* Frame 7457/7540: the Template frame pads 32, the 32-tall page
              title sits at y=32 and the Nav Bar at y=88 — i.e. a 24px gap. The
              old 24/16 pair floated every tab's content 16px above the frame. */}
          <div className="border-b border-neutral-200 px-6 lg:px-8 pt-8">
            <h1 className="text-2xl font-semibold tracking-tight">
              {PROJECT_TITLE}
            </h1>
            {/* Nav Bar — frame 7457:20864. Every tab is a 40-tall box with 16px
                of horizontal padding, 16px apart; the active one is a SQUARE
                #eaffae block underlined by a 4px #5b6f00 rule (pixel-scanned:
                bg rows 0–35, rule rows 36–39, no corner antialiasing). Inactive
                tabs are transparent with a 4px radius and 500 weight. */}
            <div className="mt-6 flex items-end justify-between gap-4">
              <div className="flex items-end gap-4 overflow-x-auto">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => selectTab(tab)}
                    className={`-mb-px inline-flex h-10 items-center whitespace-nowrap border-b-4 px-4 text-sm leading-5 transition-colors ${
                      activeTab === tab
                        ? "rounded-none border-[#5b6f00] bg-[#eaffae] font-semibold text-[#09090b]"
                        : "rounded-[4px] border-transparent font-medium text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {activeTab === "Budget" ? (
                <div className="flex shrink-0 items-center gap-2 pb-2">
                  <Input
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="h-9 w-44 bg-white text-sm"
                    placeholder="Filter budget items"
                  />
                  <Button
                    onClick={() => toast.success("Share link copied")}
                    variant="outline"
                    className="h-9 bg-white shadow-none"
                  >
                    Share
                  </Button>
                </div>
              ) : activeTab === "Production Workflow" ? (
                <div className="flex shrink-0 items-center gap-3 pb-2">
                  <Input
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="h-8 w-44 bg-white text-sm"
                    placeholder="Filter tasks"
                  />
                  <Button
                    onClick={() => toast.success("Share link copied")}
                    className="h-8 bg-[#D8FF00] text-neutral-900 hover:bg-[#c2e600] shadow-none"
                  >
                    <Share2 className="size-4" />
                    Share
                  </Button>
                </div>
              ) : activeTab === "Talents" && !openShortlist ? (
                // Frame 7457:20865 puts a 250×40 Input in the Filters row, at
                // the nav bar's own y — so it bottom-aligns with the tabs and
                // the panel below starts with the sort row, not a second search.
                // LIST VIEW ONLY: the builder frame (7537:20115) draws no
                // shortlist filter, and the input filters nothing there.
                // Its placeholder reads "Filter tasks" in 7457:20866 too — an
                // un-overridden Input default inside a frame named
                // "Template / Task", on a page with no tasks. Kept as "Filter
                // shortlists"; on her review list, NOT copied verbatim.
                <div className="flex shrink-0 items-center">
                  <Input
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="h-10 w-[250px] rounded-[6px] border-[#e4e4e7] bg-white px-3 text-[14px] leading-5 shadow-none"
                    placeholder="Filter shortlists"
                  />
                </div>
              ) : activeTab === "Overview" ? (
                // Frame 7540:20606's Filters row: a 353-wide block flush with
                // the content right edge — Input 250x40 (radius 6, #e4e4e7) +
                // gap 8 + Share 95x40 (radius 8 — the two radii really do
                // differ). Share is a plain white outline button here, with NO
                // icon; the lime iconed one above belongs to another frame.
                // The placeholder is hers verbatim, template default and all.
                <div className="flex shrink-0 items-center gap-2">
                  <Input
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="h-10 w-[250px] rounded-[6px] border-[#e4e4e7] bg-white px-3 text-[14px] leading-5 shadow-none"
                    placeholder="Filter tasks"
                  />
                  <Button
                    onClick={() => toast.success("Share link copied")}
                    variant="outline"
                    className="h-10 w-[95px] rounded-[8px] border-[#e4e4e7] bg-white px-4 text-[14px] font-medium leading-5 text-[#09090b] shadow-none"
                  >
                    Share
                  </Button>
                </div>
              ) : activeTab === "Call Sheet" || activeTab === "Time Log" ? (
                <div className="flex shrink-0 items-center pb-2">
                  <Input
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="h-8 w-44 bg-white text-sm"
                    placeholder={
                      activeTab === "Time Log" ? "Filter logs" : "Filter tasks"
                    }
                  />
                </div>
              ) : null}
            </div>
          </div>

          {/* Body */}
          {activeTab === "Overview" ? (
            <OverviewTab
              data={PROJECT_OVERVIEW}
              talentReq={talentReq}
              crewReq={crewReq}
              onSaveTalent={setTalentReq}
              onSaveCrew={setCrewReq}
              onOpenShortlist={(roleId) => {
                // The role-grouped builder now lives IN the Talents tab, so the
                // Overview deep link switches tabs and scrolls to that group
                // instead of leaving the project page. `roleId` is already the
                // SHORTLIST role id (shortlistProgress resolved the FK).
                selectTab("Talents");
                setOpenShortlist({
                  name: SHORTLIST_DETAIL.name,
                  isNew: false,
                  focusRoleId: roleId,
                });
              }}
            />
          ) : activeTab === "Talents" ? (
            <TalentsTab
              open={openShortlist}
              onOpen={setOpenShortlist}
              onBack={() => setOpenShortlist(null)}
              newName={newName}
              onNewNameChange={setNewName}
              onResetNewName={resetNewName}
              onOpenPanel={setTalentPanel}
              onRolesChange={setBuilderRoles}
            />
          ) : activeTab === "Call Sheet" ? (
            <CallSheetTab
              onNew={() =>
                navigate("/production-v2/project/call-sheet/new")
              }
            />
          ) : activeTab === "Time Log" ? (
            <div className="flex-1 px-6 lg:px-8 py-6">
              <TimeLogReview
                logs={TIME_LOGS}
                scopedProject="E-Bike Launch"
                externalQuery={filter}
              />
            </div>
          ) : activeTab === "Budget" ? (
            <div className="flex-1 px-6 lg:px-8 py-6">
              <ProjectBudgetChart query={filter} />
            </div>
          ) : activeTab !== "Production Workflow" ? (
            <div className="flex flex-1 items-center justify-center px-6 py-20 text-sm text-neutral-400">
              Coming soon in this preview
            </div>
          ) : loading ? (
            <div className="flex flex-1 items-center justify-center py-24">
              <div
                className="size-8 animate-spin rounded-full border-2 border-neutral-200"
                style={{ borderTopColor: "#D8FF00" }}
              />
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto">
              {/* Column header row */}
              <div className="flex items-center border-b border-neutral-200 px-6 lg:px-8 py-2.5 text-xs font-medium text-neutral-500">
                <div className="flex flex-1 items-center gap-1">
                  Title
                  <ChevronsUpDown className="size-3.5 text-neutral-400" />
                </div>
                <div className="w-40 shrink-0">Assignee</div>
                <div className="flex w-28 shrink-0 items-center gap-1">
                  Due Date
                  <ChevronsUpDown className="size-3.5 text-neutral-400" />
                </div>
                <div className="w-28 shrink-0">Comments</div>
                <div className="flex w-10 shrink-0 justify-center text-neutral-400">
                  <Plus className="size-3.5" />
                </div>
              </div>

              {phases.map((phase) => (
                <div
                  key={phase.id}
                  className="border-b border-neutral-200"
                >
                  {/* Phase header */}
                  <button
                    onClick={() => togglePhase(phase.id)}
                    className="flex w-full items-center gap-2 px-6 lg:px-8 py-3 text-left text-sm font-semibold"
                  >
                    {phase.open ? (
                      <ChevronDown className="size-4 text-neutral-500" />
                    ) : (
                      <ChevronRight className="size-4 text-neutral-500" />
                    )}
                    {phase.title}
                  </button>

                  {phase.open && (
                    <div>
                      {phase.tasks.filter(matches).map((task) => (
                        <div
                          key={task.id}
                          id={slugify(task.title)}
                          onClick={() => {
                            setOpenTask({ phaseId: phase.id, taskId: task.id });
                            markRead(phase.id, task.id);
                          }}
                          className={`group flex cursor-pointer items-center border-t border-neutral-100 px-6 lg:px-8 py-3 hover:bg-neutral-50 ${
                            openTask?.taskId === task.id ? "bg-neutral-50" : ""
                          }`}
                        >
                          <div className="flex flex-1 items-center gap-3 min-w-0">
                            <span onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={task.done}
                                onCheckedChange={() =>
                                  toggleTaskDone(phase.id, task.id)
                                }
                              />
                            </span>
                            <span
                              className={`truncate text-sm ${
                                task.done
                                  ? "text-neutral-400 line-through"
                                  : "text-neutral-800"
                              }`}
                            >
                              {task.title}
                            </span>
                          </div>
                          <div className="w-40 shrink-0">
                            <AssigneeChip assignee={task.assignee} />
                          </div>
                          <div className="w-28 shrink-0 text-sm text-neutral-600">
                            {task.due}
                          </div>
                          <div className="w-28 shrink-0">
                            {task.comments > 0 ? (
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 ${task.unread ? "bg-amber-100" : "bg-neutral-100"}`}>
                                <MessageSquare className={`size-3.5 ${task.unread ? "text-neutral-700" : "text-neutral-500"}`} />
                                <span className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[11px] font-medium leading-none text-white ${task.unread ? "bg-[#ef4444]" : "bg-neutral-500"}`}>
                                  {task.comments}
                                </span>
                              </span>
                            ) : (
                              <span className="text-sm text-neutral-400">No comment</span>
                            )}
                          </div>
                          <div
                            className="flex w-10 shrink-0 justify-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="rounded p-1 text-neutral-400 opacity-0 transition-opacity hover:bg-neutral-200 hover:text-neutral-700 group-hover:opacity-100 data-[state=open]:opacity-100">
                                  <MoreHorizontal className="size-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem
                                  onClick={() =>
                                    duplicateTask(phase.id, task.id)
                                  }
                                >
                                  <Copy className="size-4" />
                                  Duplicate task
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => copyTaskLink(task)}
                                >
                                  <Link2 className="size-4" />
                                  Copy task link
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => deleteTask(phase.id, task.id)}
                                >
                                  <Trash2 className="size-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}

                      {/* Add task row */}
                      <div className="border-t border-neutral-100 px-6 lg:px-8 py-2.5 pl-[3.5rem]">
                        {addingTo === phase.id ? (
                          <Input
                            autoFocus
                            value={addTaskText}
                            onChange={(e) => setAddTaskText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") addTask(phase.id);
                              if (e.key === "Escape") {
                                setAddTaskText("");
                                setAddingTo(null);
                              }
                            }}
                            onBlur={() => {
                              setAddTaskText("");
                              setAddingTo(null);
                            }}
                            className="h-8 max-w-md bg-white text-sm"
                            placeholder="Task title, then Enter"
                          />
                        ) : (
                          <button
                            onClick={() => {
                              setAddingTo(phase.id);
                              setAddTaskText("");
                            }}
                            className="text-sm text-neutral-400 hover:text-neutral-700"
                          >
                            Add Task...
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Add section */}
              <div className="px-6 lg:px-8 py-3">
                {addingSection ? (
                  <Input
                    autoFocus
                    value={sectionText}
                    onChange={(e) => setSectionText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addSection();
                      if (e.key === "Escape") {
                        setSectionText("");
                        setAddingSection(false);
                      }
                    }}
                    onBlur={() => {
                      setSectionText("");
                      setAddingSection(false);
                    }}
                    className="h-8 max-w-md bg-white text-sm"
                    placeholder="Section name, then Enter"
                  />
                ) : (
                  <button
                    onClick={() => {
                      setAddingSection(true);
                      setSectionText("");
                    }}
                    className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800"
                  >
                    <Plus className="size-4" />
                    Add section
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Docked task detail panel (drawer mode) */}
        {selected && !fullPage && (
          <TaskDetail
            phase={selected.phase}
            task={selected.task}
            fullPage={false}
            onClose={closeTask}
            onExpand={() => setFullPage(true)}
            onCollapse={() => setFullPage(false)}
            onMarkComplete={() => {
              setTaskDone(selected.phase.id, selected.task.id, true);
              closeTask();
            }}
            onCopyLink={() => copyTaskLink(selected.task)}
            onDelete={() => deleteTask(selected.phase.id, selected.task.id)}
            onSend={() => {
              toast.success("Your email has been successfully sent.");
              closeTask();
            }}
          />
        )}

        {/* Talents tab right-side overlay panels (confirm / share). Opened by
            the builder header's "Check availability" / "Send to Client"; the
            "To" chips are the open builder's LIVE candidates (builderRoles
            mirror), so a talent removed in the builder never reappears here —
            and a brand-new shortlist correctly has none yet. */}
        {talentPanel && (
          <TalentSharePanel
            mode={talentPanel}
            shortlistName={openShortlist?.name ?? newName}
            talents={builderRoles.flatMap((r) => r.candidates)}
            onClose={() => setTalentPanel(null)}
          />
        )}
      </div>

      {/* Full-page task detail overlay (covers content, sidebar stays) */}
      {selected && fullPage && (
        <div className="fixed inset-y-0 right-0 left-0 z-30 overflow-y-auto bg-white md:left-64">
          <TaskDetail
            phase={selected.phase}
            task={selected.task}
            fullPage
            onClose={closeTask}
            onExpand={() => setFullPage(true)}
            onCollapse={() => setFullPage(false)}
            onMarkComplete={() => {
              setTaskDone(selected.phase.id, selected.task.id, true);
              closeTask();
            }}
            onCopyLink={() => copyTaskLink(selected.task)}
            onDelete={() => deleteTask(selected.phase.id, selected.task.id)}
            onSend={() => {
              toast.success("Your email has been successfully sent.");
              closeTask();
            }}
          />
        </div>
      )}
    </V2Layout>
  );
}

/* ── Overview tab (Yina frame 7189:24086) ───────────────────────────────── */

function OverviewField({ label, value }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {label}
      </div>
      <div className="mt-1 text-base font-semibold text-neutral-900">
        {value}
      </div>
    </div>
  );
}

function OverviewTab({
  data,
  talentReq,
  crewReq,
  onSaveTalent,
  onSaveCrew,
  onOpenShortlist,
}) {
  return (
    // Frame 7540:20628 stacks the five card rows 32px apart, and the two gaps
    // INSIDE a row (Description→Budget, Talent→Crew) are 32 as well — one value
    // everywhere, not the 16 this page used to use.
    <div className="flex-1 space-y-8 px-6 lg:px-8 py-6">
      {/* Row A — Description (wide) + Approved Budget (narrow). The frame
          splits the row 1166 / 32 / 372, i.e. 3:1 — a 4-col grid at col-span-3,
          not the 2:1 this used to guess (which ran the budget card ~140 wide). */}
      <div className="grid gap-8 lg:grid-cols-4">
        <Card className={`${OV_CARD} gap-3 py-5 lg:col-span-3`}>
          <div className="px-6">
            <h2 className={OV_CARD_TITLE}>Description</h2>
            <p className="mt-2 text-base leading-relaxed text-neutral-500">
              {data.description}
            </p>
          </div>
        </Card>
        <Card className={`${OV_CARD} gap-3 bg-[#f8f9fa] py-5`}>
          <div className="px-6">
            <h2 className={OV_CARD_TITLE}>Approved Budget</h2>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
              {data.approvedBudget}
            </div>
          </div>
        </Card>
      </div>

      {/* Row B — Project Details (full width) */}
      <Card className={`${OV_CARD} gap-0 py-5`}>
        <div className="border-b border-[#e0e0e0] px-6 pb-4">
          <h2 className={OV_CARD_TITLE}>Project Details</h2>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 px-6 pt-4 md:grid-cols-4">
          <OverviewField label="Client" value={data.client} />
          <OverviewField label="Budget" value={data.budget} />
          <OverviewField label="Deadline" value={data.deadline} />
          <OverviewField label="Primary Location" value={data.primaryLocation} />
        </div>
      </Card>

      {/* Row C — Talent Requirements + Crew Requirements (equal halves, editable) */}
      <div className="grid gap-8 md:grid-cols-2">
        <RoleRequirementsCard
          title="Talent Requirements"
          spec={PROJECT_ROLE_REQUIREMENTS.talent}
          idPrefix="treq"
          value={talentReq}
          onChange={onSaveTalent}
          toastMessage="Talent requirements updated"
          progressFor={shortlistProgress}
          onOpenShortlist={onOpenShortlist}
        />
        <RoleRequirementsCard
          title="Crew Requirements"
          spec={PROJECT_ROLE_REQUIREMENTS.crew}
          idPrefix="creq"
          value={crewReq}
          onChange={onSaveCrew}
          toastMessage="Crew requirements updated"
        />
      </div>

      {/* Row D — Internal Notes (full width, tinted) */}
      <Card className={`${OV_CARD} gap-3 bg-[#f8f9fa] py-5`}>
        <div className="px-6">
          <h2 className={OV_CARD_TITLE}>Internal Notes</h2>
          <p className="mt-2 text-base leading-relaxed text-neutral-500">
            {data.internalNotes}
          </p>
        </div>
      </Card>
    </div>
  );
}

/* ── Requirements role table (Yina frames 7540:20646 + 7542:20853) ───────── */

// Every Overview card: 8px radius (shadcn's Card default is rounded-xl = 12,
// which computed to 14 here) and the frame's #e0e0e0 hairline.
const OV_CARD = "rounded-[8px] border-[#e0e0e0]";

// Card section title — the frame's Section Title text nodes are all 24 tall at
// 16px SemiBold, not the 18px this page used to render.
const OV_CARD_TITLE = "text-[16px] font-semibold leading-6 text-neutral-900";

// Frame column widths 324 / 72 / 233 / 68 with an 8px gap, written as fr so the
// card stays fluid: at the frame's 721px content width they resolve to exactly
// 324 and 233. Labels and cells share ONE grid — the frame builds them as two
// independent rows whose columns 2 and 3 sit 4px / 8px out of alignment.
const REQ_COLS =
  "grid grid-cols-[minmax(0,324fr)_72px_minmax(0,233fr)_68px] items-center gap-2";

// Resting cell — styled as the input it turns into when the row is edited.
const REQ_CELL =
  "flex h-8 items-center rounded-[8px] border border-[#e0e0e0] bg-white px-2.5 text-sm text-neutral-900";

const REQ_INPUT = "h-8 rounded-[8px] border-[#e0e0e0] bg-white px-2.5 text-sm shadow-none";

const REQ_BUTTON =
  "h-8 rounded-[8px] border border-[#e0e0e0] bg-white px-3 text-xs font-semibold text-neutral-900 hover:bg-neutral-50";

const REQ_SAVE_BUTTON =
  "h-8 rounded-[8px] bg-[#D8FF00] px-3 text-xs font-semibold text-neutral-900 hover:bg-[#c2e600]";

/**
 * One requirements card (Talent / Crew). Yina replaced the old free-text body
 * with a role table: title + lime "N roles"/"N crews" chip + "+ Add" button, an
 * inset divider, a Role / Qty / Type-Specialty / (deliberately unlabelled
 * action) table, then a full-width general-direction textarea. The two cards
 * are geometrically identical, so both render here and only `spec` differs.
 *
 *   ── geometry (frames 7540:20646 / 7542:20853, card 769x356, padding 24) ──
 *   header 40 (title 24 top-aligned; chip 24 + gap 8 + button 32, both
 *   centred on the 32-tall action box) · 12 · divider · 12 · column labels 14 ·
 *   12 · rows: 3 x 36 with a 6px gap (pitch 42) · 16 · label 16 · 6 ·
 *   textarea 60 · 24. That sums to the frame's 356 exactly; we land on 357
 *   because the frame's divider is a zero-height line and ours is a real 1px
 *   rule.
 *
 * In-place editing survives the restructure (Jun/Jenni asked for it): a row's
 * "Edit" swaps its three cells for real inputs and the action button for
 * "Save" (Enter saves, Escape cancels); Save lifts the row to ProjectV2 state
 * and fires the card's toast. The textarea edits directly and only reveals
 * Cancel/Save once it is dirty, so the resting card stays as drawn.
 *
 * "+ Add Role" / "+ Add Crew" no longer commit on click. The new row is a LOCAL
 * draft (`newRow`) that is only lifted to parent state by Save, so Escape,
 * Cancel and switching tabs all really cancel it instead of leaving a blank,
 * unremovable row behind — and the chip counts what is on screen either way.
 *
 * `progressFor` is the shortlist→Overview reflection (talent card only). It is
 * OUR addition — see RoleProgressChip — and is absent from every frame.
 */
function RoleRequirementsCard({
  title,
  spec,
  idPrefix,
  value,
  onChange,
  toastMessage,
  progressFor,
  onOpenShortlist,
}) {
  const { rows, direction } = value;
  const [editingId, setEditingId] = useState(null);
  const [rowDraft, setRowDraft] = useState(null);
  // The uncommitted "+ Add Role" row. Null unless one is being created.
  const [newRow, setNewRow] = useState(null);
  const [directionDraft, setDirectionDraft] = useState(direction);

  // What the table shows: the saved rows plus the draft one, if any.
  const displayRows = newRow ? [...rows, newRow] : rows;

  function startEdit(row) {
    // Only saved rows reach here (the draft row shows Save, not Edit), so
    // starting an edit DISCARDS any open "+ Add Role" draft — exactly like
    // cancelEdit. Without this the blank draft lingered as a phantom extra
    // row (and inflated the chip) until the other row was saved. addRow sets
    // its own edit state instead of routing through here, so this can never
    // cancel the draft it just created.
    setNewRow(null);
    setRowDraft({ ...row, qty: String(row.qty) });
    setEditingId(row.id);
  }
  function cancelEdit() {
    setEditingId(null);
    setRowDraft(null);
    setNewRow(null);
  }
  function saveRow() {
    const qty = Number.parseInt(rowDraft.qty, 10);
    const saved = {
      ...rowDraft,
      role: rowDraft.role.trim(),
      type: rowDraft.type.trim(),
      qty: Number.isFinite(qty) && qty > 0 ? qty : 1,
    };
    onChange({
      ...value,
      rows:
        newRow && newRow.id === saved.id
          ? [...rows, saved]
          : rows.map((r) => (r.id === saved.id ? saved : r)),
    });
    cancelEdit();
    toast.success(toastMessage);
  }
  function addRow() {
    // No blank-row / empty-table state is drawn, so a new role opens straight
    // into edit mode instead of sitting there as three empty boxes. Edit state
    // is set inline, NOT via startEdit — startEdit discards the open draft,
    // which here would cancel the very row being created.
    const row = { id: nextReqId(idPrefix), role: "", qty: 1, type: "" };
    setNewRow(row);
    setRowDraft({ ...row, qty: String(row.qty) });
    setEditingId(row.id);
  }
  function saveDirection() {
    onChange({ ...value, direction: directionDraft });
    toast.success(toastMessage);
  }

  return (
    <Card className={`${OV_CARD} gap-0 py-6`}>
      {/* flex-col so the direction block can bottom-align when the two cards
          hold a different number of rows; at equal row counts `mt-auto`
          resolves to 0 and the frame's 16px gap is all that is left. */}
      <div className="flex flex-1 flex-col px-6">
        {/* Header — 40 tall: title top-aligned, actions centred in a 32 box */}
        <div className="flex h-10 items-start justify-between gap-3">
          <h2 className={OV_CARD_TITLE}>{title}</h2>
          <div className="flex h-8 shrink-0 items-center gap-2">
            {/* Chip 72x24, button 98x32 in both frames — fixed boxes, not hug,
                so min-w pins them there and still grows past two digits. The
                noun is per-card ("3 roles" / "3 crews", 7542:20859 renders
                "crews" under a layer NAMED "3 roles"); the count is the rows on
                screen, since the frame's crew badge says "4" over 3 rows. */}
            <span className="inline-flex h-6 min-w-[72px] items-center justify-center rounded-full bg-[#eaffae] px-2.5 text-xs font-semibold text-[#5b6f00]">
              {displayRows.length} {spec.chipNoun}
            </span>
            <button onClick={addRow} className={`${REQ_BUTTON} min-w-[98px]`}>
              {spec.addLabel}
            </button>
          </div>
        </div>

        {/* Inset divider — unlike the Project Details one, it is not full-bleed */}
        <div className="mt-3 h-px bg-[#e0e0e0]" />

        {/* Column labels — the 4th header is blank on purpose in the frame */}
        <div
          className={`mt-3 ${REQ_COLS} h-[14px] text-xs font-semibold leading-[14px] text-[#71717a]`}
        >
          <span>Role</span>
          <span>Qty</span>
          <span>Type / Specialty</span>
          <span />
        </div>

        {/* Requirement rows — 36 tall, 6 apart (the frame's 42px pitch) */}
        <div className="mt-3 space-y-1.5">
          {displayRows.map((row) => {
            const editing = editingId === row.id;
            const progress = progressFor?.(row.id);
            const onRowKey = (e) => {
              if (e.key === "Enter") saveRow();
              if (e.key === "Escape") cancelEdit();
            };
            return (
              <div key={row.id} className={`h-9 ${REQ_COLS}`}>
                {editing ? (
                  <>
                    <Input
                      className={REQ_INPUT}
                      value={rowDraft.role}
                      autoFocus
                      placeholder="Role"
                      onChange={(e) =>
                        setRowDraft((d) => ({ ...d, role: e.target.value }))
                      }
                      onKeyDown={onRowKey}
                    />
                    <Input
                      className={REQ_INPUT}
                      value={rowDraft.qty}
                      inputMode="numeric"
                      onChange={(e) =>
                        setRowDraft((d) => ({ ...d, qty: e.target.value }))
                      }
                      onKeyDown={onRowKey}
                    />
                    <Input
                      className={REQ_INPUT}
                      value={rowDraft.type}
                      placeholder="Type / Specialty"
                      onChange={(e) =>
                        setRowDraft((d) => ({ ...d, type: e.target.value }))
                      }
                      onKeyDown={onRowKey}
                    />
                    <button onClick={saveRow} className={REQ_SAVE_BUTTON}>
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <div className={REQ_CELL}>
                      <span className="truncate">{row.role}</span>
                      {progress && (
                        <RoleProgressChip
                          candidates={progress.candidates}
                          confirmed={progress.confirmed}
                          role={row.role}
                          onOpen={() => onOpenShortlist(progress.roleId)}
                        />
                      )}
                    </div>
                    <div className={REQ_CELL}>{row.qty}</div>
                    <div className={REQ_CELL}>
                      <span className="truncate">{row.type}</span>
                    </div>
                    <button
                      onClick={() => startEdit(row)}
                      className={REQ_BUTTON}
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>
            );
          })}

          {/* Mouse-visible exit for the uncommitted "+ Add Role" draft —
              Escape already cancels but is keyboard-only. A ghost "Cancel"
              (row-button geometry, no border/fill) right-aligned directly
              under the draft row's lime Save; it cannot live NEXT to Save
              inside the row because the action column is a fixed 68px. */}
          {newRow && (
            <div className="flex justify-end">
              <button
                onClick={cancelEdit}
                className="h-8 cursor-pointer rounded-[8px] px-3 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* General direction / notes — sized for exactly 2 lines in the frame */}
        <div className="mt-auto pt-4">
          <div className="h-4 text-xs font-semibold leading-4 text-[#71717a]">
            {spec.directionLabel}
          </div>
          <Textarea
            rows={2}
            className="mt-1.5 h-[60px] min-h-[60px] resize-none rounded-[8px] border-[#e0e0e0] bg-white px-3 py-2.5 text-sm shadow-none"
            value={directionDraft}
            onChange={(e) => setDirectionDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setDirectionDraft(direction);
            }}
          />
          {directionDraft !== direction && (
            <div className="mt-2 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDirectionDraft(direction)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={saveDirection}
                className="bg-[#D8FF00] text-neutral-900 hover:bg-[#c2e600] shadow-none"
              >
                Save
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

/**
 * Shortlist → Overview progress reflection. NOT IN ANY FRAME — kept because Jun
 * asked to see how each casting role is filling without leaving Overview, but
 * moved INSIDE the Role cell so it costs the row no height: the frame's row
 * pitch is 42 (36 + 6) and the old block-level RoleProgressLine pushed it to
 * 76.5, which is the single reason the card ran ~100px tall.
 *
 * It rides in the Role cell's horizontal slack (the frame gives that column 324
 * for names that measure ~115-145), right-aligned, 20 tall inside the 32-tall
 * cell. Both numbers ride in ONE pill as `confirmed/candidates` so the chip
 * stays ~100px and the role name is never the thing that truncates — the two
 * counts as separate labelled pills measured 169px, which clipped "Male Urban
 * Commuter". "N needed" is NOT repeated here: that is the Qty column two cells
 * over. Clicking opens the shortlist at this role.
 */
function RoleProgressChip({ candidates, confirmed, role, onOpen }) {
  return (
    <button
      onClick={onOpen}
      title={`${candidates} candidates, ${confirmed} confirmed`}
      aria-label={`Open shortlist for ${role}: ${candidates} candidates, ${confirmed} confirmed`}
      className="ml-auto flex h-5 shrink-0 items-center gap-1 rounded-[4px] pl-2 text-[11px] leading-4 hover:bg-neutral-50"
    >
      <span className="rounded-full bg-[#eaffae] px-2 font-semibold text-[#5b6f00]">
        {confirmed}/{candidates} confirmed
      </span>
      <ChevronRight className="size-3 shrink-0 text-neutral-400" />
    </button>
  );
}

/* ── Task detail (shared by drawer + full-page) ─────────────────────────── */

// Stable, module-level wrappers so TaskDetail can switch presentation without
// remounting its subtree. Defining these inside render (as a `const Wrapper`)
// would mint a new component identity every render, unmounting the children and
// wiping their state (comment draft, focus) on each keystroke.
function FullPageWrapper({ children }) {
  return <div className="flex min-h-screen flex-col">{children}</div>;
}

function PanelWrapper({ onClose, children }) {
  return (
    <>
      {/* light backdrop — keeps the list visible, click to close */}
      <div className="fixed inset-0 z-30 bg-black/10" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-40 flex w-[700px] max-w-full flex-col overflow-y-auto border-l border-neutral-200 bg-white shadow-2xl">
        {children}
      </aside>
    </>
  );
}

function TaskDetail({
  task,
  fullPage,
  onClose,
  onExpand,
  onCollapse,
  onMarkComplete,
  onCopyLink,
  onDelete,
  onSend,
}) {
  const [hasAssignee, setHasAssignee] = useState(true);
  const [hasDate, setHasDate] = useState(true);
  const [toChip, setToChip] = useState(true);

  // Bottom Comments | Email tabbed section
  const [bottomTab, setBottomTab] = useState("comments"); // 'comments' | 'email'
  const [bottomOpen, setBottomOpen] = useState(true);
  const [comments, setComments] = useState([
    { id: "c-seed", author: "Yina Dong", initials: "YD", when: "just now", text: "This is a comment test." },
  ]);
  const [newComment, setNewComment] = useState("");
  const [subject, setSubject] = useState("Confirm Talents Booking Task");

  const submitComment = () => {
    const text = newComment.trim();
    if (!text) return;
    setComments((prev) => [
      ...prev,
      { id: `c-${Date.now()}-${prev.length}`, author: "Yina Dong", initials: "YD", when: "just now", text },
    ]);
    setNewComment("");
    toast.success("Comment added");
  };

  const Wrapper = fullPage ? FullPageWrapper : PanelWrapper;

  return (
    <Wrapper onClose={onClose}>
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3">
        <Button variant="outline" size="sm" onClick={onMarkComplete}>
          <Check className="size-4" />
          Mark Complete
        </Button>
        <div className="flex items-center gap-1 text-neutral-400">
          {fullPage ? (
            <button
              onClick={onCollapse}
              className="rounded p-1.5 hover:bg-neutral-100 hover:text-neutral-700"
              title="Collapse"
            >
              <Minimize2 className="size-4" />
            </button>
          ) : (
            <button
              onClick={onExpand}
              className="rounded p-1.5 hover:bg-neutral-100 hover:text-neutral-700"
              title="Expand"
            >
              <Maximize2 className="size-4" />
            </button>
          )}
          <button
            onClick={onCopyLink}
            className="rounded p-1.5 hover:bg-neutral-100 hover:text-neutral-700"
            title="Copy link"
          >
            <Link2 className="size-4" />
          </button>
          {fullPage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="rounded p-1.5 hover:bg-neutral-100 hover:text-neutral-700"
                  title="More"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={onCopyLink}>
                  <Link2 className="size-4" />
                  Copy task link
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    onDelete();
                    onClose();
                  }}
                >
                  <Trash2 className="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <button
            onClick={onClose}
            className="rounded p-1.5 hover:bg-neutral-100 hover:text-neutral-700"
            title="Close"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Scrollable detail content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-5 px-5 py-5">
          <h2 className="text-xl font-semibold tracking-tight">{task.title}</h2>

          {/* Assignee */}
          <div className="flex items-center gap-3 text-sm">
            <span className="w-20 shrink-0 text-neutral-500">Assignee</span>
            {hasAssignee && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white py-0.5 pl-1 pr-2 text-xs">
                <span className="flex size-5 items-center justify-center rounded-full bg-orange-200 text-[10px] font-semibold text-orange-800">
                  {task.assignee.initials}
                </span>
                {task.assignee.name}
                <button
                  onClick={() => setHasAssignee(false)}
                  className="text-neutral-400 hover:text-neutral-700"
                >
                  <X className="size-3.5" />
                </button>
              </span>
            )}
          </div>

          {/* Due Date */}
          <div className="flex items-center gap-3 text-sm">
            <span className="w-20 shrink-0 text-neutral-500">Due Date</span>
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

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-neutral-500">Description</Label>
            <div className="rounded-md border border-neutral-200 bg-white p-3 text-sm text-neutral-700">
              {descriptionFor(task.title)}
            </div>
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

        {/* Comments | Email tabbed section */}
        <div className="border-t border-neutral-200 bg-neutral-50/60">
          {/* Header: segmented control + collapse chevron */}
          <div className="flex items-center justify-between px-5 py-3">
            <div className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 p-0.5">
              {[
                { key: "comments", label: "Comments" },
                { key: "email", label: "Email" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setBottomTab(t.key)}
                  className={`rounded-md px-3 py-1 text-sm transition-colors ${
                    bottomTab === t.key
                      ? "border border-neutral-200 bg-white font-medium text-neutral-900 shadow-sm"
                      : "border border-transparent text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setBottomOpen((v) => !v)}
              className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
              title={bottomOpen ? "Collapse" : "Expand"}
            >
              <ChevronDown
                className={`size-4 transition-transform ${
                  bottomOpen ? "" : "rotate-180"
                }`}
              />
            </button>
          </div>

          {/* Comments tab body */}
          {bottomOpen && bottomTab === "comments" && (
            <div className="space-y-4 px-5 pb-5">
              <div className="space-y-4">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-2.5">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-orange-200 text-[10px] font-semibold text-orange-800">
                      {c.initials}
                    </span>
                    <div className="min-w-0 text-sm">
                      <div>
                        <span className="font-medium text-neutral-900">
                          {c.author}
                        </span>
                        <span className="text-neutral-400"> · {c.when}</span>
                      </div>
                      <p className="mt-0.5 text-neutral-700">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Textarea
                rows={3}
                className="bg-white"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment"
              />

              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => setNewComment("")}>
                  Cancel
                </Button>
                <Button
                  onClick={submitComment}
                  className="bg-[#D8FF00] text-neutral-900 hover:bg-[#c2e600] shadow-none"
                >
                  Submit
                </Button>
              </div>
            </div>
          )}

          {/* Email tab body */}
          {bottomOpen && bottomTab === "email" && (
            <div className="space-y-3 px-5 pb-5">
              {/* To */}
              <div className="flex flex-wrap items-center gap-2 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-sm">
                <span className="text-neutral-500">To:</span>
                {toChip && (
                  <span className="inline-flex items-center gap-1 rounded bg-[#eaffae] px-1.5 py-0.5 text-xs text-neutral-800">
                    Zhengrui Hao
                    <button
                      onClick={() => setToChip(false)}
                      className="text-neutral-500 hover:text-neutral-800"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                )}
                <input
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
                  placeholder="Type to search people"
                />
              </div>

              {/* Subject */}
              <div className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-sm">
                <span className="shrink-0 text-neutral-500">Subject:</span>
                <input
                  className="flex-1 bg-transparent text-sm font-medium text-neutral-900 outline-none placeholder:text-neutral-400"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              {/* Body */}
              <Textarea
                rows={4}
                className="bg-white"
                defaultValue="Please confirm the talent availability."
              />

              <p className="text-xs text-neutral-400">
                Note: the general information will be included in the body of
                this email.
              </p>

              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={onSend}
                  className="bg-[#D8FF00] text-neutral-900 hover:bg-[#c2e600] shadow-none"
                >
                  Send
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
}

/* ── Call Sheet tab (/tmp/cs_list.png) ──────────────────────────────────── */

function CallSheetRow({ cs }) {
  const isDraft = cs.status === "Editing";
  return (
    <div className="flex items-center border-t border-neutral-100 px-6 py-4">
      {/* Name + subtitle */}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-neutral-900">
          {cs.title}
        </div>
        <div className="truncate text-xs text-neutral-400">{cs.subtitle}</div>
      </div>

      {/* Date */}
      <div className="hidden w-32 shrink-0 text-sm font-medium text-neutral-700 md:block">
        {cs.date}
      </div>

      {/* Status badge */}
      <div className="hidden w-28 shrink-0 md:block">
        <span
          className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${CALL_SHEET_STATUS_STYLES[cs.status]}`}
        >
          <span className="size-1.5 rounded-full bg-current opacity-70" />
          {cs.status}
        </span>
      </div>

      {/* Views */}
      <div className="flex w-24 shrink-0 justify-center">
        {isDraft ? (
          <span className="rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-500">
            Draft unsent
          </span>
        ) : (
          <CircularProgress value={cs.views} total={cs.total} />
        )}
      </div>

      {/* Confirmed */}
      <div className="flex w-24 shrink-0 justify-center">
        {isDraft ? (
          <span className="rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-500">
            Draft unsent
          </span>
        ) : (
          <CircularProgress value={cs.confirmed} total={cs.total} />
        )}
      </div>

      {/* "..." menu */}
      <div className="flex w-10 shrink-0 justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => toast.success("Opening call sheet")}>
              <Eye className="size-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.success("Call sheet duplicated")}>
              <Copy className="size-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => toast.success("Call sheet deleted")}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function CallSheetSection({ title, rows }) {
  return (
    <div>
      <h2 className="mb-3 text-base font-semibold text-neutral-900">{title}</h2>
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        {/* Column header */}
        <div className="flex items-center px-6 py-3 text-xs font-medium text-neutral-500">
          <div className="min-w-0 flex-1">Name</div>
          <div className="hidden w-32 shrink-0 md:block" />
          <div className="hidden w-28 shrink-0 md:block" />
          <div className="flex w-24 shrink-0 items-center justify-center gap-1">
            Views
            <Eye className="size-3.5 text-neutral-400" />
          </div>
          <div className="flex w-24 shrink-0 items-center justify-center gap-1">
            Confirmed
            <CheckCircle2 className="size-3.5 text-neutral-400" />
          </div>
          <div className="w-10 shrink-0" />
        </div>
        {rows.map((cs) => (
          <CallSheetRow key={cs.id} cs={cs} />
        ))}
      </div>
    </div>
  );
}

function CallSheetTab({ onNew }) {
  return (
    <div className="flex-1 space-y-7 px-6 lg:px-8 py-6">
      <Button
        onClick={onNew}
        className="bg-[#D8FF00] text-neutral-900 hover:bg-[#c2e600] shadow-none"
      >
        <PlusCircle className="size-4" />
        New Call Sheet
      </Button>

      <CallSheetSection title="Upcoming Callsheets" rows={CALL_SHEETS.upcoming} />
      <CallSheetSection title="Archived Callsheets" rows={CALL_SHEETS.archived} />
    </div>
  );
}

/* ── Talents tab — frame 7457:20858 (list) + 7537:20115 (builder) ────────── */

/**
 * The Talents tab. Frame 7457:20858 IS this tab — tab strip and all — so the
 * list is not re-drawn here: it is `ShortlistSortRow` + `SavedShortlistList`
 * imported from SavedShortlistV2, the same components the standalone
 * /production-v2/saved-shortlist page renders. (SavedShortlistPanel is the
 * usual drop-in, but it also renders the 250x40 search input, which on THIS
 * surface belongs to the Filters row beside the tab strip — frame 7457:20865 —
 * so the two lower pieces are composed directly instead.)
 *
 * Opening a row, or "Add talents" on the create card, swaps the list for
 * ShortlistBuilder — the role-grouped board of frame 7537:20115 — with the
 * header rendered separately so Back returns to the list (rather than the
 * standalone page's /saved-shortlist) and so "Check availability" / "Send to
 * Client" open TalentSharePanel instead of only toasting.
 *
 * The pre-redesign flow (a flat, checkbox TalentCard grid, then a review grid)
 * is gone: roles are first class, so candidates are added under a role inside
 * the builder.
 *
 * FLAG FOR YINA: no frame draws the builder INSIDE the project page, so the
 * project tab strip stays visible above it and the frame's own Back button is
 * kept as the way out. The alternative reading is that opening a shortlist
 * leaves the project page entirely (which is what the standalone frame, with
 * no tab strip, literally draws) — but that strands Back on a different page.
 *
 * @param {object} props
 * @param {{name: string, isNew: boolean, focusRoleId?: string}|null} props.open
 * @param {(open) => void} props.onOpen        open a shortlist (null = list)
 * @param {() => void}     props.onBack        builder Back
 * @param {string}         props.newName       create-card field value
 * @param {(name: string) => void} props.onNewNameChange
 * @param {() => void}     props.onResetNewName  create-card Cancel
 * @param {(mode: 'confirm'|'share') => void} props.onOpenPanel
 * @param {(roles) => void} props.onRolesChange  builder's live role list (the
 *        Check-availability panel derives its recipients from it)
 */
function TalentsTab({
  open,
  onOpen,
  onBack,
  newName,
  onNewNameChange,
  onResetNewName,
  onOpenPanel,
  onRolesChange,
}) {
  if (open) {
    return (
      <div className="flex-1 px-6 lg:px-8 py-6">
        {/* titleAs="h2": ProjectV2's page title is this page's ONE h1; the
            embedded builder header demotes its own to keep the outline sane. */}
        <ShortlistDetailHeader
          titleAs="h2"
          name={open.name}
          onBack={onBack}
          onCheckAvailability={() => onOpenPanel("confirm")}
          onSendToClient={() => onOpenPanel("share")}
        />
        {/* key: initialRoles seeds ShortlistBuilder's state once, so remount
            when a different shortlist is opened. */}
        <ShortlistBuilder
          key={open.name}
          className="mt-6"
          showHeader={false}
          name={open.name}
          initialRoles={open.isNew ? NO_ROLES : SHORTLIST_DETAIL.roles}
          focusRoleId={open.focusRoleId}
          onRolesChange={onRolesChange}
        />
      </div>
    );
  }

  // Frame 7457: sort row at y=152 (24 below the 40-tall Filters row), rows at
  // y=216 (24 below it), then 72-tall cards 8px apart and the create card last.
  return (
    <div className="flex-1 px-6 lg:px-8 py-6">
      <ShortlistSortRow />
      <SavedShortlistList
        className="mt-6"
        onOpen={(sl) => onOpen({ name: sl.name, isNew: false })}
        name={newName}
        onNameChange={onNewNameChange}
        onCancel={onResetNewName}
        onCreate={(name) =>
          onOpen({ name: name || newShortlistName(), isNew: true })
        }
      />
    </div>
  );
}

/* ── Talents share / confirm right-side overlay panel ───────────────────── */

function TalentSharePanel({ mode, shortlistName, talents, onClose }) {
  const isConfirm = mode === "confirm";
  const title = isConfirm ? "Please confirm your availability" : shortlistName;

  // Confirm → assignee chips are the shortlisted talents; Share → client contacts.
  const seedRecipients = isConfirm
    ? talents.map((t) => ({ id: t.id, name: t.name, initials: initialsOf(t.name) }))
    : [
        { id: "kaleb", name: "Kaleb Jensen", initials: "KJ" },
        { id: "tim", name: "Tim Wang", initials: "TW" },
      ];

  const [recipients, setRecipients] = useState(seedRecipients);
  const [hasDate, setHasDate] = useState(true);
  const [message, setMessage] = useState(
    isConfirm
      ? "This project is a sport commercial photo shooting project, please confirm your availability before 06/20/2026."
      : "Here is the talent shortlist to be confirmed for this project. Please let us know if you have any questions."
  );

  const removeRecipient = (id) =>
    setRecipients((prev) => prev.filter((r) => r.id !== id));

  const handleSend = () => {
    toast.success(
      isConfirm ? "Availability request sent." : "Shortlist shared with client."
    );
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/10" onClick={onClose} />
      <aside className="fixed inset-y-0 right-0 z-40 flex w-[700px] max-w-full flex-col overflow-y-auto border-l border-neutral-200 bg-white shadow-2xl">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3">
          <h2 className="truncate pr-3 text-lg font-semibold tracking-tight">
            {title}
          </h2>
          <div className="flex shrink-0 items-center gap-1 text-neutral-400">
            <Maximize2 className="size-4" />
            <Link2 className="size-4" />
            <button
              onClick={onClose}
              className="rounded p-1.5 hover:bg-neutral-100 hover:text-neutral-700"
              title="Close"
            >
              <PanelRight className="size-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {/* To / Assignee */}
          <div className="flex items-start gap-3 text-sm">
            <span className="mt-1 w-16 shrink-0 text-neutral-500">To</span>
            <div className="flex flex-wrap gap-2">
              {recipients.map((r) => (
                <span
                  key={r.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white py-0.5 pl-1 pr-2 text-xs"
                >
                  <span className="flex size-5 items-center justify-center rounded-full bg-orange-200 text-[10px] font-semibold text-orange-800">
                    {r.initials}
                  </span>
                  {r.name}
                  <button
                    onClick={() => removeRecipient(r.id)}
                    className="text-neutral-400 hover:text-neutral-700"
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div className="flex items-center gap-3 text-sm">
            <span className="w-16 shrink-0 text-neutral-500">Due Date</span>
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
              rows={4}
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

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-neutral-200 px-5 py-4">
          <Button variant="outline" onClick={onClose}>
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
    </>
  );
}

function initialsOf(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

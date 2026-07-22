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
import TalentCard from "./TalentCard";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import {
  PROJECT_PHASES,
  TASK_COMMENTS,
  DEFAULT_ASSIGNEE,
  DEFAULT_DUE,
  TASK_DESCRIPTIONS,
  GENERIC_DESCRIPTION,
  TALENTS,
  CALL_SHEETS,
  CALL_SHEET_STATUS_STYLES,
  SAVED_SHORTLISTS,
  SHORTLIST_STATUS_STYLES,
  TIME_LOGS,
} from "./mockData";

const PROJECT_TITLE = "E-Bike Launch Campaign";
const TABS = [
  "Overview",
  "Production Workflow",
  "Talents",
  "Crew",
  "Contract",
  "Call Sheet",
  "Time Log",
  "Budget",
];

/**
 * Overview-tab content (Yina frame 7189:24086). Reintroduces the read-only
 * "Overview" tab she removed on Jenni's request but deliberately brought back
 * WITH content. Kept as a local fallback constant because mockData.js does not
 * yet export a project-overview record (scaffold agent owns that file); import
 * it from "./mockData" once PROJECT_OVERVIEW lands there.
 */
const PROJECT_OVERVIEW = {
  description:
    "E-Bike Launch campaign covering social, e-commerce, and short-form video deliverables for E-bike 2026 seasonal launch.",
  approvedBudget: "$46,000.00",
  client: "Nike",
  budget: "$46,000.00",
  deadline: "May 29, 2026",
  primaryLocation: "Los Angeles, CA",
  talentRequirements: {
    subline: "Admin-entered casting description for this project.",
    body: "Seeking confident lifestyle talent for an E-bike launch campaign, with a natural, approachable look and comfortable on-camera presence. Talent should feel authentic riding or posing with an E-bike in urban and outdoor lifestyle settings. Ideal profiles include active adults, commuters, students, and young professionals who can convey ease, movement, and everyday mobility. Must be comfortable with light riding direction, helmet styling, and candid interaction shots. LA-based talent preferred; availability required for fitting and full shoot day.",
  },
  crewRequirements: {
    subline: "Staffing needs for production day.",
    body: "Required roles include photographer or DP, camera assistant, producer or production coordinator, production assistants, hair and makeup, wardrobe stylist, and location support. Crew should be comfortable working across multiple exterior locations, managing talent movement safely around E-bikes, and keeping the shoot efficient during natural-light windows. LA-based crew preferred; must be available for prep, shoot day, and wrap.",
  },
  internalNotes:
    "Confirm final shortlist with client before call sheet creation. Keep talent availability, crew holds, and budget changes synced before sending production documents.",
};

const TALENT_FILTERS = [
  { ph: "All types", opts: ["Actor", "Model", "Dancer", "Hand Model"] },
  { ph: "All Genders", opts: ["Man", "Woman", "Non-binary"] },
  { ph: "All Ethnicities", opts: ["White", "Black", "Asian", "Mixed", "Indian"] },
  { ph: "All Ages", opts: ["18-25", "26-35", "36-45", "46+"] },
  { ph: "All Heights", opts: ["< 5ft 6in", "5ft 6in - 6ft", "> 6ft"] },
  { ph: "Available time", opts: ["This week", "This month", "Custom"] },
];

const SHORTLIST_DEFAULT_NAME =
  "E-Bike Launch Campaign Photoshoot Talent Shortlist";

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

let uid = 0;
const nextId = () => `task-${++uid}`;

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

  // selected task detail: { phaseId, taskId } | null, plus full-page flag
  const [openTask, setOpenTask] = useState(null);
  const [fullPage, setFullPage] = useState(false);

  // Talents tab flow: 'list' (new landing) | 'create' | 'pick' | 'shortlist'
  const [talentStep, setTalentStep] = useState("list");
  const [shortlistName, setShortlistName] = useState(SHORTLIST_DEFAULT_NAME);
  const [picked, setPicked] = useState(() => new Set());
  const [preferences, setPreferences] = useState({}); // talentId -> 'forward' | 'pass' | null
  const [talentPanel, setTalentPanel] = useState(null); // 'confirm' | 'share' | null

  const togglePicked = (id) =>
    setPicked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const setPreference = (id, value) =>
    setPreferences((prev) => ({ ...prev, [id]: value }));

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
          <div className="border-b border-neutral-200 px-6 lg:px-8 pt-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              {PROJECT_TITLE}
            </h1>
            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-1 overflow-x-auto">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => selectTab(tab)}
                    className={`-mb-px whitespace-nowrap rounded-t-md border-b-2 px-2.5 pb-2.5 pt-1.5 text-sm transition-colors ${
                      activeTab === tab
                        ? "border-[#5b6f00] bg-[#eaffae] font-semibold text-[#09090b]"
                        : "border-transparent text-neutral-500 hover:text-neutral-800"
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
              ) : activeTab === "Call Sheet" ||
                activeTab === "Talents" ||
                activeTab === "Time Log" ? (
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
            <OverviewTab data={PROJECT_OVERVIEW} />
          ) : activeTab === "Talents" ? (
            <TalentsTab
              step={talentStep}
              setStep={setTalentStep}
              name={shortlistName}
              setName={setShortlistName}
              picked={picked}
              togglePicked={togglePicked}
              preferences={preferences}
              setPreference={setPreference}
              onSaveShortlist={() => setTalentStep("shortlist")}
              onOpenPanel={setTalentPanel}
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

        {/* Talents tab right-side overlay panels (confirm / share) */}
        {talentPanel && (
          <TalentSharePanel
            mode={talentPanel}
            shortlistName={shortlistName}
            talents={TALENTS.filter((t) => picked.has(t.id))}
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

function OverviewTab({ data }) {
  return (
    <div className="flex-1 space-y-4 px-6 lg:px-8 py-6">
      {/* Row A — Description (wide) + Approved Budget (narrow) */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="gap-3 border-neutral-200 py-5 lg:col-span-2">
          <div className="px-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              Description
            </h2>
            <p className="mt-2 text-base leading-relaxed text-neutral-500">
              {data.description}
            </p>
          </div>
        </Card>
        <Card className="gap-3 border-neutral-200 bg-[#f8f9fa] py-5">
          <div className="px-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              Approved Budget
            </h2>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
              {data.approvedBudget}
            </div>
          </div>
        </Card>
      </div>

      {/* Row B — Project Details (full width) */}
      <Card className="gap-0 border-neutral-200 py-5">
        <div className="border-b border-neutral-200 px-6 pb-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            Project Details
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 px-6 pt-4 md:grid-cols-4">
          <OverviewField label="Client" value={data.client} />
          <OverviewField label="Budget" value={data.budget} />
          <OverviewField label="Deadline" value={data.deadline} />
          <OverviewField label="Primary Location" value={data.primaryLocation} />
        </div>
      </Card>

      {/* Row C — Talent Requirements + Crew Requirements (equal halves) */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="gap-2 border-neutral-200 py-5">
          <div className="px-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              Talent Requirements
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              {data.talentRequirements.subline}
            </p>
            <p className="mt-3 text-base leading-relaxed text-neutral-500">
              {data.talentRequirements.body}
            </p>
          </div>
        </Card>
        <Card className="gap-2 border-neutral-200 py-5">
          <div className="px-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              Crew Requirements
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              {data.crewRequirements.subline}
            </p>
            <p className="mt-3 text-base leading-relaxed text-neutral-500">
              {data.crewRequirements.body}
            </p>
          </div>
        </Card>
      </div>

      {/* Row D — Internal Notes (full width, tinted) */}
      <Card className="gap-3 border-neutral-200 bg-[#f8f9fa] py-5">
        <div className="px-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Internal Notes
          </h2>
          <p className="mt-2 text-base leading-relaxed text-neutral-500">
            {data.internalNotes}
          </p>
        </div>
      </Card>
    </div>
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

/* ── Talents tab flow (list → create → pick → shortlist) ─────────────────── */

function TalentsTab({
  step,
  setStep,
  name,
  setName,
  picked,
  togglePicked,
  preferences,
  setPreference,
  onSaveShortlist,
  onOpenPanel,
}) {
  const selectedTalents = TALENTS.filter((t) => picked.has(t.id));

  // The "Create a new talent shortlist" card — shown standalone in `create`
  // and beneath the saved-shortlist list in `list`.
  const createCard = (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Create a new talent shortlist</h2>
      <div className="mt-5 space-y-1.5">
        <Label>Name</Label>
        <Input
          className="bg-white"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mt-5 flex items-center justify-end gap-2">
        <Button variant="outline" onClick={() => setName(SHORTLIST_DEFAULT_NAME)}>
          Cancel
        </Button>
        <Button
          onClick={() => setStep("pick")}
          className="bg-[#D8FF00] text-neutral-900 hover:bg-[#c2e600] shadow-none"
        >
          <Plus className="size-4" />
          Add talents
        </Button>
      </div>
    </div>
  );

  // Step 0 (new landing): list of saved shortlists + the create card below.
  if (step === "list") {
    return (
      <div className="flex-1 space-y-4 px-6 lg:px-8 py-6">
        {/* Sort + reset row */}
        <div className="flex items-center gap-2">
          <Select defaultValue="time">
            <SelectTrigger className="h-9 w-40 bg-white text-sm">
              <SelectValue placeholder="By time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time">By time</SelectItem>
              <SelectItem value="name">By name</SelectItem>
              <SelectItem value="status">By status</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-9">
            reset
          </Button>
        </div>

        {/* Saved shortlist rows */}
        <div className="space-y-3">
          {SAVED_SHORTLISTS.map((sl) => (
            <div
              key={sl.id}
              className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white px-6 py-5 shadow-sm"
            >
              <div className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-900">
                {sl.name}
              </div>
              <div className="hidden shrink-0 text-sm font-medium text-neutral-700 sm:block">
                {sl.date}
              </div>
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${SHORTLIST_STATUS_STYLES[sl.status]}`}
              >
                <span className="size-1.5 rounded-full bg-current opacity-70" />
                {sl.status}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="shrink-0 rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
                    <MoreHorizontal className="size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => setStep("shortlist")}>
                    <Eye className="size-4" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.success("Shortlist duplicated")}>
                    <Copy className="size-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => toast.success("Shortlist deleted")}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>

        {/* Create-new card */}
        {createCard}
      </div>
    );
  }

  // Step 1: create a new talent shortlist (standalone card)
  if (step === "create") {
    return (
      <div className="flex-1 px-6 lg:px-8 py-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Create a new talent shortlist</h2>
          <div className="mt-5 space-y-1.5">
            <Label>Name</Label>
            <Input
              className="bg-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mt-5 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setName(SHORTLIST_DEFAULT_NAME)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => setStep("pick")}
              className="bg-[#D8FF00] text-neutral-900 hover:bg-[#c2e600] shadow-none"
            >
              <Plus className="size-4" />
              Add talents
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: pick talents from the pool
  if (step === "pick") {
    return (
      <div className="flex-1 px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="truncate text-lg font-semibold">{name}</h2>
          <Button
            disabled={picked.size === 0}
            onClick={onSaveShortlist}
            className="bg-[#D8FF00] text-neutral-900 hover:bg-[#c2e600] shadow-none disabled:opacity-50"
          >
            Save shortlist{picked.size > 0 ? ` (${picked.size})` : ""}
          </Button>
        </div>

        {/* Filter row */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {TALENT_FILTERS.map((f) => (
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
            onClick={() => TALENTS.forEach((t) => picked.has(t.id) && togglePicked(t.id))}
          >
            reset
          </Button>
        </div>

        {/* Grid */}
        <div className="mt-5 grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(240px,300px))]">
          {TALENTS.map((t) => (
            <TalentCard
              key={t.id}
              t={t}
              selectable
              selected={picked.has(t.id)}
              onToggle={() => togglePicked(t.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  // Step 3: review shortlist + share / confirm
  return (
    <div className="flex-1 px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="truncate text-lg font-semibold">{name}</h2>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" onClick={() => onOpenPanel("share")}>
            Share with Client
          </Button>
          <Button
            onClick={() => onOpenPanel("confirm")}
            className="bg-[#D8FF00] text-neutral-900 hover:bg-[#c2e600] shadow-none"
          >
            Confirm Availability
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(240px,300px))]">
        {selectedTalents.map((t) => (
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

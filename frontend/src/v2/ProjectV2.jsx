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
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronRight,
  Share2,
  Plus,
  ChevronsUpDown,
  MoreHorizontal,
  Copy,
  Link2,
  Trash2,
  Check,
  Maximize2,
  Minimize2,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";

import V2Layout from "./V2Layout";
import { Button } from "@/components/shadcn/button";
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
  PROJECT_PHASES,
  DEFAULT_ASSIGNEE,
  DEFAULT_DUE,
  TASK_DESCRIPTIONS,
  GENERIC_DESCRIPTION,
} from "./mockData";

const PROJECT_TITLE = "E-Bike Launch Campaign";
const TABS = [
  "Overview",
  "Production Workflow",
  "Talents",
  "Crew",
  "Contract",
  "Shoot Schedule",
];

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
    })),
  }));
}

function descriptionFor(title) {
  return TASK_DESCRIPTIONS[title] || GENERIC_DESCRIPTION;
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
  const [loading, setLoading] = useState(true);
  const [phases, setPhases] = useState(buildInitialPhases);
  const [activeTab, setActiveTab] = useState("Production Workflow");
  const [filter, setFilter] = useState("");
  const [addingTo, setAddingTo] = useState(null); // phaseId with an open add-task input
  const [addTaskText, setAddTaskText] = useState("");
  const [addingSection, setAddingSection] = useState(false);
  const [sectionText, setSectionText] = useState("");

  // selected task detail: { phaseId, taskId } | null, plus full-page flag
  const [openTask, setOpenTask] = useState(null);
  const [fullPage, setFullPage] = useState(false);

  // simulate a brief load before showing content (/tmp/wf2)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

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
              <div className="flex items-center gap-6 overflow-x-auto">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`-mb-px whitespace-nowrap border-b-2 pb-3 text-sm transition-colors ${
                      activeTab === tab
                        ? "border-[#b5d400] font-medium text-neutral-900"
                        : "border-transparent text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {activeTab === "Production Workflow" && (
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
              )}
            </div>
          </div>

          {/* Body */}
          {activeTab !== "Production Workflow" ? (
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
                          onClick={() =>
                            setOpenTask({ phaseId: phase.id, taskId: task.id })
                          }
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

/* ── Task detail (shared by drawer + full-page) ─────────────────────────── */

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
  const [messageOpen, setMessageOpen] = useState(true);
  const [toChip, setToChip] = useState(true);
  const [subject, setSubject] = useState(task.title);
  const [comment, setComment] = useState("");

  const Wrapper = fullPage
    ? ({ children }) => (
        <div className="flex min-h-screen flex-col">{children}</div>
      )
    : ({ children }) => (
        <aside className="hidden lg:flex w-[440px] shrink-0 flex-col border-l border-neutral-200 bg-white">
          {children}
        </aside>
      );

  return (
    <Wrapper>
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

        {/* New Message section */}
        <div className="border-t border-neutral-200 bg-neutral-50/60">
          <button
            onClick={() => setMessageOpen((v) => !v)}
            className="flex w-full items-center justify-between px-5 py-3 text-left"
          >
            <span className="text-sm font-semibold">New Message</span>
            <ChevronDown
              className={`size-4 text-neutral-500 transition-transform ${
                messageOpen ? "" : "-rotate-90"
              }`}
            />
          </button>

          {messageOpen && (
            <div className="space-y-4 px-5 pb-5">
              {/* To */}
              <div className="space-y-1.5">
                <Label>
                  To<span className="text-rose-500"> *</span>
                </Label>
                <div className="flex flex-wrap items-center gap-2 rounded-md border border-neutral-200 bg-white px-2 py-1.5">
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
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <Label>
                  Subject<span className="text-rose-500"> *</span>
                </Label>
                <Input
                  className="bg-white"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              {/* Comment */}
              <Textarea
                rows={4}
                className="bg-white"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add any additional comments"
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

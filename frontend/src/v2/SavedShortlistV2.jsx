/**
 * SavedShortlistV2 — the OUTER talent-shortlist list (Yina's redesign, Figma
 * vuZ77RgLUVtzfJKAhb1EEX frame 7457:20858 "Project Production Talent shorlist
 * LIST VIEW"). Sort row → one 72px card per saved shortlist → the inline
 * "Create a new talent shortlist" card as the last row. Opening a row lands on
 * the role-grouped builder (ShortlistV2); "Add talents" lands on it empty.
 *
 * That frame IS the project page's Talents tab, so everything below the page
 * title is exported as reusable pieces and ProjectV2 renders the SAME UI
 * instead of a second copy:
 *
 *   SavedShortlistList   the 8px-gap stack: rows + create card
 *   ShortlistListRow     one 72px row card + its two-action "…" menu
 *   CreateShortlistCard  the always-expanded create card
 *   ShortlistStatusBadge the status pill
 *   ShortlistSortRow / newShortlistName / SHORTLIST_NAME_BASE
 *
 * SavedShortlistPanel and ShortlistFilterRow are FILE-LOCAL (not exported):
 * only this page composes them — ProjectV2's Talents tab renders its filter
 * input in the tab strip's Filters row, so it imports the lower pieces and
 * skips the panel wrapper.
 *
 * This file owns the page chrome only (V2Layout, the h1, and the routing);
 * every piece above is presentational and takes its data + handlers as props.
 *
 *   ── geometry model (1920, NOT 1440) ──
 *   content rail 1570 at x 318 (32 gutters). combobox 200×40 r6 #e4e4e7 · reset
 *   67×40 r8 #fafafa with NO border · row card 72 tall, r12, 1px #e4e4e7,
 *   padding 24, content row = [name flex-1] gap 40 [meta 312] gap 40 [… 20].
 *   Inside meta: date 96 + gap 48 + badge, and the badge is LEFT-aligned (the
 *   312 column keeps ~37px of trailing slack — do not right-align it).
 *   Rows are stacked with an 8px gap; the create card is 212 tall, padding 24,
 *   gap 16, with two fixed 142×40 buttons.
 *
 *   ── authoritative decision ──
 *   The row "…" has EXACTLY TWO actions: "Create a copy" and "Delete". No View,
 *   no Duplicate, and no send-to-talent / send-to-client — those live INSIDE a
 *   shortlist (ShortlistV2's header), not on the outer list.
 *
 *   ── fidelity ──
 *   Row 1 in the frame has its menu open and is styled identically to rows 2/3,
 *   so there is no open/active row highlight and none is invented; no hover,
 *   focus or pressed state is drawn for anything on this page either.
 */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Copy, MoreHorizontal, Trash2 } from "lucide-react";

import V2Layout from "./V2Layout";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/shadcn/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import { SAVED_SHORTLISTS } from "./mockData";

/**
 * The authored shortlist-name stem. Every row in SAVED_SHORTLISTS is this stem
 * plus the date it was created ("… Talent Shortlist 06/22/2026"), so a NEW
 * shortlist defaults to the same pattern dated today.
 *
 * It used to default to SHORTLIST_DETAIL.name — i.e. the verbatim title of an
 * EXISTING saved row — which guaranteed a duplicate name on every create.
 */
export const SHORTLIST_NAME_BASE =
  "E-Bike Launch Campaign Photoshoot Talent Shortlist";

/** Default name for a new shortlist: the authored stem dated `date` (today). */
// eslint-disable-next-line react-refresh/only-export-components -- shared with ProjectV2's Talents tab; a components-only module split is not worth the churn for this demo
export function newShortlistName(date = new Date()) {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${SHORTLIST_NAME_BASE} ${mm}/${dd}/${date.getFullYear()}`;
}

/**
 * Shortlist-level status fills, composited from the frame's 80%-opacity pills
 * (#e8c468 / #e76e50 over white). These are a DIFFERENT axis from a candidate's
 * Client Review values. (mockData's old SHORTLIST_STATUS_STYLES outline map is
 * gone — nothing imported it once this map took over.)
 * Only the two values the frame draws exist; the invented lime "Confirmed" is
 * gone from here and from mockData.
 */
const LIST_STATUS_STYLES = {
  "Pending Approval": "bg-[#edd086]",
  "Needs Revision": "bg-[#ec8b73]",
};

/** Neutral fallback so an undrawn status still renders a pill, not `undefined`. */
const LIST_STATUS_FALLBACK = "bg-[#f4f4f5]";

/**
 * Status pill on a saved-shortlist row.
 * @param {{ status: string }} props
 */
export function ShortlistStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex h-[22px] shrink-0 items-center gap-1 rounded-[4px] px-2 text-[12px] font-semibold leading-4 text-[#09090b] ${
        LIST_STATUS_STYLES[status] ?? LIST_STATUS_FALLBACK
      }`}
    >
      <span className="size-2 rounded-full bg-current" />
      {status}
    </span>
  );
}

/**
 * One saved-shortlist row card + its two-action "…" menu.
 *
 * @param {object} props
 * @param {{id,name,date,status}} props.shortlist  row data (SAVED_SHORTLISTS item)
 * @param {(shortlist) => void}   [props.onOpen]   row click / Enter / Space
 * @param {(shortlist) => void}   [props.onCopy]   "Create a copy"
 * @param {(shortlist) => void}   [props.onDelete] "Delete"
 * @param {string}                [props.className]
 */
export function ShortlistListRow({
  shortlist,
  onOpen,
  onCopy,
  onDelete,
  className = "",
}) {
  const open = () => onOpen?.(shortlist);

  return (
    <div
      role="button"
      tabIndex={0}
      // The row itself opens the shortlist — the "…" menu has no View item.
      // Two guards: (1) Radix portals the menu items to document.body, OUTSIDE
      // this row's DOM subtree, yet their clicks still bubble here through the
      // React tree — so a click that did not originate inside the row's real
      // DOM must never open it (else "…" → Delete navigates into the shortlist
      // and "…" → Create a copy swaps the list for the builder). (2) Clicks on
      // the row's own "…" trigger button belong to the menu, not the row.
      onClick={(e) => {
        if (!e.currentTarget.contains(e.target)) return;
        if (e.target.closest("button")) return;
        open();
      }}
      // Only the row's OWN key events open it. Without this guard, Enter on the
      // descendant "…" trigger bubbles up here and navigates away, so a keyboard
      // user could never reach Create a copy / Delete.
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      className={`flex h-[72px] cursor-pointer items-center gap-10 rounded-[12px] border border-[#e4e4e7] bg-white px-6 ${className}`}
    >
      <div className="min-w-0 flex-1 truncate text-[16px] font-medium leading-6">
        {shortlist.name}
      </div>

      <div className="hidden w-[312px] shrink-0 items-center gap-12 lg:flex">
        <div className="w-24 shrink-0 text-[14px] font-medium leading-5">
          {shortlist.date}
        </div>
        <ShortlistStatusBadge status={shortlist.status} />
      </div>

      {/* Exactly two actions — send-to-talent / send-to-client live inside a
          shortlist, not here. */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`${shortlist.name} actions`}
            className="flex size-5 shrink-0 cursor-pointer items-center justify-center text-[#09090b]"
          >
            <MoreHorizontal className="size-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={1}
          className="w-[220px] rounded-[8px] border-[#e4e4e7] p-1"
        >
          <DropdownMenuItem
            className="h-9 rounded-[4px] px-2 text-[16px] leading-6 text-[#18181b]"
            onClick={() =>
              onCopy
                ? onCopy(shortlist)
                : toast.success("Copy created", { description: shortlist.name })
            }
          >
            <Copy className="size-5" />
            Create a copy
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#f1f1f3]" />
          <DropdownMenuItem
            variant="destructive"
            className="h-9 rounded-[4px] px-2 text-[16px] leading-6"
            onClick={() =>
              onDelete
                ? onDelete(shortlist)
                : toast.success("Shortlist deleted", {
                    description: shortlist.name,
                  })
            }
          >
            <Trash2 className="size-5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/**
 * The always-expanded "Create a new talent shortlist" card (last row of the
 * list). Controlled: the typed name is the caller's state so it can be carried
 * into the shortlist that gets created.
 *
 * @param {object} props
 * @param {string} props.name
 * @param {(name: string) => void} props.onNameChange
 * @param {() => void}             [props.onCancel]           resets the field
 * @param {(name: string) => void} [props.onCreate]           "Add talents"
 */
export function CreateShortlistCard({ name, onNameChange, onCancel, onCreate }) {
  return (
    <div className="flex flex-col gap-4 rounded-[12px] border border-[#e4e4e7] bg-white p-6">
      <h2 className="text-[18px] font-semibold leading-7">
        Create a new talent shortlist
      </h2>
      <div className="flex flex-col gap-1">
        <Label className="text-[14px] font-medium leading-5">Name</Label>
        <Input
          className="h-10 rounded-[6px] border-[#e4e4e7] bg-white px-3 text-[14px] leading-5 shadow-none"
          value={name}
          onChange={(e) => onNameChange?.(e.target.value)}
        />
      </div>
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => onCancel?.()}
          className="h-10 w-[142px] cursor-pointer rounded-[8px] border border-[#e4e4e7] bg-white text-[14px] font-medium leading-5"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onCreate?.(name.trim())}
          className="h-10 w-[142px] cursor-pointer rounded-[8px] bg-[#d8ff00] text-[14px] font-medium leading-5"
        >
          Add talents
        </button>
      </div>
    </div>
  );
}

/** Filters row — search input alone, right-aligned (40 tall). File-local. */
function ShortlistFilterRow({ value, onValueChange, className = "" }) {
  return (
    <div className={`flex h-10 items-center justify-end ${className}`}>
      <Input
        className="h-10 w-[250px] rounded-[6px] border-[#e4e4e7] bg-white px-3 text-[14px] leading-5 shadow-none"
        placeholder="Filter shortlists"
        value={value}
        onChange={onValueChange ? (e) => onValueChange(e.target.value) : undefined}
      />
    </div>
  );
}

/** Sort row — 200×40 combobox + the borderless 67×40 "reset". */
export function ShortlistSortRow({
  value,
  defaultValue = "time",
  onValueChange,
  onReset,
  className = "",
}) {
  return (
    <div className={`flex h-10 items-center gap-4 ${className}`}>
      <Select
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        onValueChange={onValueChange}
      >
        <SelectTrigger className="w-[200px] rounded-[6px] border-[#e4e4e7] bg-white px-4 text-[14px] font-medium leading-5 shadow-none data-[size=default]:h-10">
          <SelectValue placeholder="By time" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="time">By time</SelectItem>
          <SelectItem value="name">By name</SelectItem>
          <SelectItem value="status">By status</SelectItem>
        </SelectContent>
      </Select>
      <button
        type="button"
        onClick={() => onReset?.()}
        className="h-10 w-[67px] cursor-pointer rounded-[8px] bg-[#fafafa] text-[14px] font-medium leading-5 text-[#18181b]"
      >
        reset
      </button>
    </div>
  );
}

/**
 * The list body: one row per saved shortlist (8px gap) with the create card as
 * the last row. Fully controlled — no state of its own.
 *
 * @param {object} props
 * @param {Array}  [props.shortlists=SAVED_SHORTLISTS]
 * @param {(shortlist) => void}    [props.onOpen]
 * @param {(shortlist) => void}    [props.onCopy]
 * @param {(shortlist) => void}    [props.onDelete]
 * @param {string}                 props.name          create-card field value
 * @param {(name: string) => void} props.onNameChange
 * @param {() => void}             [props.onCancel]
 * @param {(name: string) => void} [props.onCreate]
 */
export function SavedShortlistList({
  shortlists = SAVED_SHORTLISTS,
  onOpen,
  onCopy,
  onDelete,
  name,
  onNameChange,
  onCancel,
  onCreate,
  className = "",
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {shortlists.map((sl) => (
        <ShortlistListRow
          key={sl.id}
          shortlist={sl}
          onOpen={onOpen}
          onCopy={onCopy}
          onDelete={onDelete}
        />
      ))}

      <CreateShortlistCard
        name={name}
        onNameChange={onNameChange}
        onCancel={onCancel}
        onCreate={onCreate}
      />
    </div>
  );
}

/**
 * Everything frame 7457:20858 draws below the page title: filters row → sort
 * row → list → create card. Owns ONLY the create-card name field. File-local:
 * the project page's Talents tab puts the filter input in its own tab strip,
 * so it composes ShortlistSortRow + SavedShortlistList directly instead.
 *
 * @param {object} props
 * @param {Array}  [props.shortlists=SAVED_SHORTLISTS]
 * @param {(shortlist) => void} [props.onOpen]    row opened
 * @param {(shortlist) => void} [props.onCopy]
 * @param {(shortlist) => void} [props.onDelete]
 * @param {(name: string) => void} [props.onCreate]  "Add talents", typed name
 * @param {string} [props.initialName]  defaults to newShortlistName()
 */
function SavedShortlistPanel({
  shortlists = SAVED_SHORTLISTS,
  onOpen,
  onCopy,
  onDelete,
  onCreate,
  initialName,
  className = "",
}) {
  const defaultName = useMemo(
    () => initialName ?? newShortlistName(),
    [initialName]
  );
  const [name, setName] = useState(defaultName);

  return (
    <div className={className}>
      {/* Filters row — the nav-tab strip lives on ProjectV2's Talents tab. */}
      <ShortlistFilterRow />

      <ShortlistSortRow className="mt-6" />

      {/* Saved shortlists — 8px gap, then the always-expanded create card. */}
      <SavedShortlistList
        className="mt-6"
        shortlists={shortlists}
        onOpen={onOpen}
        onCopy={onCopy}
        onDelete={onDelete}
        name={name}
        onNameChange={setName}
        onCancel={() => setName(defaultName)}
        onCreate={onCreate}
      />
    </div>
  );
}

export default function SavedShortlistV2() {
  const navigate = useNavigate();

  return (
    <V2Layout>
      {/* bg-lime-50 — the frame's page ground. Without it the #fafafa "reset"
          button is invisible against V2Layout's neutral-50 shell. */}
      <div className="min-h-screen bg-[#f7f7f2] p-8">
        <h1 className="text-[24px] font-semibold leading-8 tracking-[-0.144px]">
          E-Bike Launch Campaign
        </h1>

        <SavedShortlistPanel
          className="mt-6"
          // The detail page renders whatever name it is handed, so the row you
          // opened — and the name you typed — survives the navigation.
          onOpen={(sl) =>
            navigate(
              `/production-v2/shortlist?name=${encodeURIComponent(sl.name)}`
            )
          }
          onCreate={(name) =>
            navigate(
              `/production-v2/shortlist?new=1&name=${encodeURIComponent(name)}`
            )
          }
        />
      </div>
    </V2Layout>
  );
}

/* ── FLAGS FOR YINA ─────────────────────────────────────────────────────────
 *  1. "Create a copy" is drawn with a CALENDAR glyph (node data agrees with the
 *     pixels), which reads as an unswapped default — shipped with a copy icon.
 *  2. No empty state exists for the outer list (zero shortlists) — frame
 *     7517:20697 is the empty state INSIDE a shortlist, not this surface.
 *  3. No collapsed state for the create card: no "+ New shortlist" trigger is
 *     drawn anywhere, so the card stays expanded as the last row, as designed.
 *  4. No validation / placeholder / disabled state for the Name field or the
 *     "Add talents" button, and no confirm dialog for the destructive Delete.
 *     The field now defaults to the authored stem dated TODAY (it used to
 *     default to an existing row's exact title, which always collided). No
 *     de-duplication rule is designed, so creating two shortlists on the same
 *     day still yields two identical names — needs her call.
 *  5. Badge fills use the composited 80%-opacity values so the label stays full
 *     ink; the frame drops the whole pill to 80%. Only "Pending Approval" and
 *     "Needs Revision" are drawn, so the enum is those two.
 *  6. No row-open affordance is designed (the "…" menu has no View), so the row
 *     itself opens the shortlist — with no hover state, per the frame. Keyboard:
 *     Enter/Space on the row opens it, and keys inside the "…" trigger are left
 *     to the menu (no focus ring is drawn for either — see flag 4 on fidelity).
 *  7. Search placeholder reads "Filter tasks" in the frame — a copy slip carried
 *     from the task list; shipped as "Filter shortlists". Neither the search nor
 *     the sort combobox is wired to real filtering (no result/empty state drawn).
 *  8. Two border tokens drift between surfaces: this list uses #e4e4e7
 *     throughout while the detail page uses #e0e0e0. Which is canonical?
 *  9. The popover's right edge sits 5px past the "…" box in the frame, which
 *     reads as hand placement; shipped right-aligned to the trigger.
 */

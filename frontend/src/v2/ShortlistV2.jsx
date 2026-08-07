/**
 * ShortlistV2 — Talent Shortlist DETAIL / builder (Yina's redesign, Figma file
 * vuZ77RgLUVtzfJKAhb1EEX). Roles are FIRST-CLASS: a shortlist creates roles
 * first, then candidates are added under each role.
 *
 *   left rail  "Roles / Characters" — help, "+ Add Role", inline add-role form,
 *              one 112px card per role, "Next step" note while a role is empty.
 *   right board one card per role: 84px header (needed / candidates pills +
 *              ghost "Add Talent" + "…"), 44px column band, 72px candidate rows.
 *
 * The project page's Talents tab renders this same builder, so the pieces are
 * exported presentationally (data + handlers in, no routing, no V2Layout):
 *
 *   ShortlistBuilder      header + rail + board, owns the role/form state
 *   RoleGroupBoard        the role-grouped candidate board (one card per role)
 *   RoleGroupCard         one role card: header + column band + candidate rows
 *   ShortlistCandidateRow / ShortlistCandidateHead
 *   ShortlistRolesPanel / ShortlistRoleCard / ShortlistAddRoleForm
 *   ShortlistDetailHeader / ShortlistEmptyBoard
 *
 * Frames read: 7537:20115 (filled, canonical) · 7516:20178 (steady, 3 roles) ·
 * 7525:22478 (zero roles, form open) · 7524:22017 (role created, no candidates)
 * · 7517:20697 (fresh shortlist — zero roles, form CLOSED) · 7505:20030 (oldest).
 * All are 1920×1080 (NOT 1440); every metric below is pixel-scanned from the
 * renders, colors/fonts from node data.
 *
 *   ── geometry model (1920) ──
 *   content 32 padding → rail 310 + gutter 24 + board 1236. header row 40.
 *   rail: px 12 / py 16, gap 12; role card 286×112 (#e4e4e7); form 286 (#e4e4e7).
 *   board card #e0e0e0 r8; group header 84 (px 20); column band 44 #f8f9fa;
 *   row 72 (px 16, gap 16) with columns 350 / 110 / 160 / 160 / 160 / 174 — the
 *   row is a FIXED-width flex that does not stretch (trailing slack stays right).
 *   pills 160×24 r999 12/16 semibold centered. Two border families coexist and
 *   are NOT interchangeable: #e0e0e0 (panels, separators, row buttons, inputs)
 *   vs #e4e4e7 (role card, inline form, page-header buttons).
 *   NOTE: Figma strokes do not consume layout, CSS borders do — every card is
 *   therefore 2px narrower inside than the Figma content box (286 → 284).
 *
 *   ── authoritative decisions (override the frames) ──
 *   Row actions are "Remind" + "Remove" ONLY — no Edit; replacing a talent =
 *   Remove then add. Both render on EVERY row, as all nine rows of 7537:20115
 *   draw them; the Thu 18:29 "Pending only" rule is superseded by her 8/5
 *   re-confirmation ("Remind button has been added back"). Client Review ships
 *   the frames' SENTENCE case ("Move forward" / "Keep for review" / "Pass for
 *   now"); Talent Request and Status stay Title Case, as those same rows draw
 *   them ("Not Started", capital S).
 *
 *   ── fidelity ──
 *   No invented hover / focus / pressed / disabled / loading states — the frames
 *   draw ZERO interaction states, so controls carry cursor-pointer only (the
 *   inputs keep the shadcn focus ring for a11y). No role-card selected state and
 *   no Role Card "Variant2" (square-pen + trash-2): it is unlabelled and never
 *   instanced, so its trigger is unknown. Both "…" triggers render but open
 *   nothing — their menu contents are undrawn. See FLAGS at the bottom.
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { MoreHorizontal, Plus } from "lucide-react";

import V2Layout from "./V2Layout";
import { Input } from "@/components/shadcn/input";
import { Textarea } from "@/components/shadcn/textarea";
import { Label } from "@/components/shadcn/label";
import {
  SHORTLIST_DETAIL,
  SHORTLIST_CLIENT_REVIEW_STYLES,
  SHORTLIST_TALENT_REQUEST_STYLES,
  SHORTLIST_CANDIDATE_STATUS_STYLES,
  shortlistRoleForProjectRole,
} from "./mockData";

/** Stable identity for a shortlist with no roles yet (?new=1). */
const NO_ROLES = [];

// ── Button families (exact per spec — the two border tokens are different) ────
const BTN_BASE =
  "inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[8px] text-[14px] font-medium leading-5 text-[#09090b]";
const BTN_HEADER = `${BTN_BASE} border border-[#e4e4e7] bg-white px-4`; // Back / Export
const BTN_LIME = `${BTN_BASE} bg-[#d8ff00] px-4`; // Check availability / Send to Client / Add Talent
const BTN_GHOST = `${BTN_BASE} px-4`; // role-group "Add Talent" — no fill, no border
const BTN_ROW = `${BTN_BASE} border border-[#e0e0e0] bg-white`; // Remind / Remove (#e0e0e0, not #e4e4e7)

// The board's zero-role explainer. Layer names for steps 4–5 are stale copies of
// step 3's; the numerals and text are correct.
const WORKFLOW_STEPS = [
  ["Create role", "Define the character or talent type needed for the project."],
  ["Add candidates", "Attach talent options under that role for client comparison."],
  ["Send to client", "Client reviews each role group and marks preferences."],
  [
    "Check availability with talents",
    "Send availability requests to talents and collect their responses before final confirmation.",
  ],
  [
    "Finalize Shortlist",
    "Finalize confirmed talents and prepare the shortlist for project booking.",
  ],
];

/** 56px lime circle with an ExtraBold "+" — shared by both empty states. */
function EmptyIcon() {
  return (
    <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#eaffae] text-[24px] font-extrabold leading-none tracking-[-0.72px] text-[#5b6f00]">
      +
    </span>
  );
}

/** Candidate-row status pill — one box for all three columns: 160×24. */
function Pill({ className = "", children }) {
  return (
    <span
      className={`flex h-6 w-[160px] shrink-0 items-center justify-center rounded-full px-2.5 text-[12px] font-semibold leading-4 ${className}`}
    >
      {children}
    </span>
  );
}

/** Counter pill in a board / role-group header (fixed widths per the frames). */
function CountPill({ className = "", children }) {
  return (
    <span
      className={`flex h-6 shrink-0 items-center justify-center rounded-full px-2.5 text-[12px] font-semibold leading-4 ${className}`}
    >
      {children}
    </span>
  );
}

/** 20×20 ellipsis trigger. Menu contents are undrawn — see FLAGS. */
function EllipsisButton({ label }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex size-5 shrink-0 cursor-pointer items-center justify-center text-[#09090b]"
    >
      <MoreHorizontal className="size-5" />
    </button>
  );
}

/* ── Left rail ──────────────────────────────────────────────────────────── */

/**
 * Rail card for one role, 286×112.
 *
 * The rail line is `railLabel` — the SHORT string the frame draws here ("Main
 * commercial hero"), NOT the long group-header sentence. Roles created in-app
 * collect only one string, so they fall back to `description`; either way the
 * line truncates instead of wrapping out of the fixed 112px box.
 *
 * @param {{ role: object, onFocus?: () => void }} props
 */
export function ShortlistRoleCard({ role, onFocus }) {
  return (
    <button
      type="button"
      onClick={onFocus}
      className="flex h-[112px] w-full cursor-pointer flex-col items-start gap-2.5 overflow-hidden rounded-[8px] border border-[#e4e4e7] bg-white px-4 py-3.5 text-left"
    >
      <div className="flex w-full items-center justify-between gap-2">
        <span className="w-[172px] truncate text-[14px] font-semibold leading-5">
          {role.name}
        </span>
        <CountPill className="bg-[#eaffae] text-[#5b6f00]">
          {role.needed} needed
        </CountPill>
      </div>
      <span className="w-full truncate text-[14px] leading-5 text-[#71717a]">
        {role.railLabel ?? role.description}
      </span>
    </button>
  );
}

/** Inline "New Role / Character" form (rail, form-open mode). */
export function ShortlistAddRoleForm({ onCancel, onCreate }) {
  const [name, setName] = useState("");
  const [needed, setNeeded] = useState("1"); // real default value, not a placeholder
  const [description, setDescription] = useState("");

  return (
    <div className="flex w-full flex-col gap-3.5 rounded-[8px] border border-[#e4e4e7] bg-white p-4">
      <div className="text-[14px] font-semibold leading-5">
        New Role / Character
      </div>

      <div className="flex w-full flex-col gap-2">
        <Label className="text-[14px] font-medium leading-5">Role Name</Label>
        <Input
          className="h-10 rounded-[8px] border-[#e0e0e0] bg-white px-3 text-[14px] leading-5 shadow-none"
          placeholder="Enter role name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="flex w-full flex-col gap-2">
        <Label className="text-[14px] font-medium leading-5">Talent Needed</Label>
        <Input
          inputMode="numeric"
          className="h-10 rounded-[8px] border-[#e0e0e0] bg-white px-3 text-[14px] leading-5 shadow-none"
          value={needed}
          onChange={(e) => setNeeded(e.target.value)}
        />
      </div>

      <div className="flex w-full flex-col gap-2">
        <Label className="text-[14px] font-medium leading-5">
          Role Description
        </Label>
        <Textarea
          className="h-[76px] min-h-0 resize-none rounded-[8px] border-[#e0e0e0] bg-white px-3 pt-2.5 pb-0 text-[14px] leading-5 shadow-none"
          placeholder="Describe this role"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Both form buttons are 36 tall — every other button on the page is 40. */}
      <div className="flex w-full items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 w-[86px] cursor-pointer rounded-[8px] border border-[#e0e0e0] bg-white text-[14px] font-medium leading-5"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onCreate({ name, needed, description })}
          className="h-9 w-[132px] cursor-pointer rounded-[8px] bg-[#d8ff00] text-[14px] font-medium leading-5"
        >
          Create Role
        </button>
      </div>
    </div>
  );
}

function PanelEmpty() {
  return (
    <div className="flex h-[260px] w-full flex-col items-center justify-center gap-3.5 rounded-[8px] border border-[#e0e0e0] bg-[#f8f9fa] px-5 py-8 text-center">
      <EmptyIcon />
      <div className="text-[14px] font-semibold leading-5">No roles yet</div>
      <p className="text-[14px] leading-5 text-[#71717a]">
        Start by adding the first role or character the client needs to review.
      </p>
    </div>
  );
}

function PanelNote() {
  return (
    <div className="w-full rounded-[8px] border border-[#e0e0e0] bg-[#f9fafb] p-3">
      <div className="text-[12px] font-semibold leading-4">Next step</div>
      <p className="mt-1.5 text-[12px] leading-4 text-[#71717a]">
        Add candidate options for this role. The client shortlist should not be
        sent while a role has no candidates.
      </p>
    </div>
  );
}

/**
 * Left rail — "Roles / Characters": help copy, "+ Add Role", the inline form,
 * one card per role, and the "Next step" note while any role is empty.
 *
 * @param {object} props
 * @param {Array}  props.roles
 * @param {boolean} props.formOpen
 * @param {() => void} props.onOpenForm
 * @param {() => void} props.onCancelForm
 * @param {(draft: {name: string, needed: string, description: string}) => void} props.onCreateRole
 * @param {(roleId: string) => void} props.onFocusRole
 */
export function ShortlistRolesPanel({
  roles,
  formOpen,
  onOpenForm,
  onCancelForm,
  onCreateRole,
  onFocusRole,
}) {
  const hasEmptyRole = roles.some((r) => r.candidates.length === 0);
  return (
    <aside className="flex w-[310px] shrink-0 flex-col items-start gap-3 rounded-[8px] border border-[#e0e0e0] bg-white px-3 py-4">
      <h2 className="text-[16px] font-semibold leading-6">Roles / Characters</h2>
      <p className="text-[14px] leading-5 text-[#71717a]">
        Create casting roles first, then add candidate talents under each role.
      </p>

      {/* Form-open mode drops the "+ Add Role" button entirely — the separator
          moves up and the form takes its place above the role cards. */}
      {!formOpen && (
        <button
          type="button"
          onClick={onOpenForm}
          className="h-10 w-full cursor-pointer rounded-[8px] bg-[#d8ff00] text-center text-[14px] font-medium leading-5"
        >
          + Add Role
        </button>
      )}

      <div className="h-px w-full bg-[#e0e0e0]" />

      {formOpen && (
        <ShortlistAddRoleForm onCancel={onCancelForm} onCreate={onCreateRole} />
      )}

      {roles.map((role) => (
        <ShortlistRoleCard
          key={role.id}
          role={role}
          onFocus={() => onFocusRole?.(role.id)}
        />
      ))}

      {roles.length === 0 && !formOpen && <PanelEmpty />}
      {hasEmptyRole && <PanelNote />}
    </aside>
  );
}

/* ── Right board ────────────────────────────────────────────────────────── */

/** Board with zero roles: "Shortlist Builder" header + the 5-step explainer. */
export function ShortlistEmptyBoard() {
  return (
    <section className="flex flex-1 flex-col rounded-[8px] border border-[#e0e0e0] bg-white">
      <header className="flex h-[84px] shrink-0 items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="text-[16px] font-semibold leading-6">Shortlist Builder</h3>
          <p className="truncate text-[14px] leading-5 text-[#71717a]">
            Roles organize candidate options for client review. Add a role to
            begin building this shortlist.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <CountPill className="w-[78px] bg-[#f8f9fa] text-[#71717a]">
            0 roles
          </CountPill>
          <CountPill className="w-[112px] bg-[#f8f9fa] text-[#71717a]">
            0 candidates
          </CountPill>
        </div>
      </header>

      <div className="flex flex-1 justify-center border-t border-[#e0e0e0] px-8 pt-16 pb-8">
        {/* No CTA on this card by design — the rail's form is the only entry. */}
        <div className="flex h-fit w-[640px] max-w-full flex-col items-center gap-[22px] rounded-[8px] bg-white p-10 text-center">
          <EmptyIcon />
          <h4 className="text-[24px] font-medium leading-[1.35] tracking-[-0.72px]">
            Add your first role
          </h4>
          <p className="text-[14px] leading-5 text-[#71717a]">
            Create roles such as Hero Female Rider, Male Commuter, or Lifestyle
            Friend. After a role is created, you can add multiple talent
            candidates for the client to compare.
          </p>
          <div className="flex w-full flex-col gap-2.5 rounded-[8px] border border-[#e0e0e0] bg-[#f8f9fa] px-5 py-[18px] text-left">
            {WORKFLOW_STEPS.map(([title, body], i) => (
              <div key={title} className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#d8ff00] text-[12px] font-semibold leading-4">
                  {i + 1}
                </span>
                <div className="flex flex-col gap-[3px]">
                  <div className="text-[14px] font-semibold leading-5">{title}</div>
                  <p className="text-[14px] leading-5 text-[#71717a]">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Column band — 350 / 110 / 160 / 160 / 160 / 174, gap 16, px 16. */
export function ShortlistCandidateHead() {
  return (
    <div className="flex h-11 items-center gap-4 bg-[#f8f9fa] px-4 text-[12px] font-semibold leading-4 text-[#71717a]">
      <div className="w-[350px] shrink-0">Candidate</div>
      <div className="w-[110px] shrink-0">Rate</div>
      <div className="w-[160px] shrink-0">Client Review</div>
      <div className="w-[160px] shrink-0">Talent Request</div>
      {/* Status is 130 in some frames, which pushes "Actions" 30px off the
          Remind button. 160 (frame 7537 group 1) is the correct one. */}
      <div className="w-[160px] shrink-0">Status</div>
      <div className="w-[174px] shrink-0">Actions</div>
      <div className="flex-1" />
    </div>
  );
}

/**
 * One 72px candidate row. Every row carries both actions — Remind and Remove.
 *
 * @param {object} props
 * @param {object} props.candidate
 * @param {boolean} [props.separated]  draws the 1px top separator (not row 0)
 * @param {(candidate) => void} [props.onRemind]
 * @param {(candidate) => void} [props.onRemove]
 */
export function ShortlistCandidateRow({
  candidate,
  separated,
  onRemind,
  onRemove,
}) {
  return (
    <div
      className={`flex h-[72px] items-center gap-4 px-4 ${
        separated ? "shadow-[0_-1px_0_#e0e0e0]" : ""
      }`}
    >
      <div className="flex w-[350px] shrink-0 items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#d8ff00] text-[12px] font-semibold leading-4">
          {candidate.initials}
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="truncate text-[14px] font-semibold leading-5">
            {candidate.name}
          </div>
          <div className="truncate text-[12px] leading-4 text-[#71717a]">
            {`${candidate.gender} · ${candidate.height} · ${candidate.specialty}`}
          </div>
        </div>
      </div>

      <div className="w-[110px] shrink-0 text-[14px] leading-5">
        {candidate.rate}
      </div>

      <Pill className={SHORTLIST_CLIENT_REVIEW_STYLES[candidate.clientReview]}>
        {candidate.clientReview}
      </Pill>
      <Pill className={SHORTLIST_TALENT_REQUEST_STYLES[candidate.talentRequest]}>
        {candidate.talentRequest}
      </Pill>
      <Pill className={SHORTLIST_CANDIDATE_STATUS_STYLES[candidate.status]}>
        {candidate.status}
      </Pill>

      {/* Remind + Remove on EVERY row — the 166px Actions cell the frame draws
          nine times over (72 + gap 8 + 86). No talentRequest gate. */}
      <div className="flex w-[174px] shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => onRemind?.(candidate)}
          className={`${BTN_ROW} w-[72px]`}
        >
          Remind
        </button>
        <button
          type="button"
          onClick={() => onRemove?.(candidate)}
          className={`${BTN_ROW} w-[86px]`}
        >
          Remove
        </button>
      </div>
      <div className="flex-1" />
    </div>
  );
}

function EmptyCandidates({ onAddTalent }) {
  return (
    <div className="flex flex-col items-center gap-5 px-8 py-16 text-center">
      <EmptyIcon />
      <div className="text-[16px] font-semibold leading-6">
        No talents added yet
      </div>
      <p className="max-w-[560px] text-[14px] leading-5 text-[#71717a]">
        Add talent candidates under this role so the client can compare options
        before the shortlist is sent for review.
      </p>
      <button type="button" onClick={onAddTalent} className={BTN_LIME}>
        <Plus className="size-4" />
        Add Talent
      </button>
    </div>
  );
}

function ReadinessNotice({ roleName }) {
  return (
    <div className="flex h-[72px] items-center gap-3 bg-[#fffef0] px-5">
      <span className="size-2.5 shrink-0 rounded-full bg-[#d8ff00]" />
      <div className="flex flex-col gap-0.5">
        <div className="text-[14px] font-semibold leading-5">
          Shortlist is not ready to send
        </div>
        <p className="text-[12px] leading-4 text-[#71717a]">
          Add at least one candidate for {roleName}. For a stronger client
          review, add 2-5 candidates per role.
        </p>
      </div>
    </div>
  );
}

/**
 * One role group card: 84px header (needed / candidates pills + ghost "Add
 * Talent" + "…"), the 44px column band, and its candidate rows. Empty roles get
 * the "No talents added yet" state plus the readiness notice.
 *
 * @param {object} props
 * @param {object} props.role                       SHORTLIST_DETAIL.roles item
 * @param {(role) => void} [props.onAddTalent]
 * @param {(candidate, role) => void} [props.onRemind]
 * @param {(candidate, role) => void} [props.onRemove]
 * @param {Function|object} [props.cardRef]         ref to the <section>
 */
export function RoleGroupCard({ role, onAddTalent, onRemind, onRemove, cardRef }) {
  const empty = role.candidates.length === 0;
  const addTalent = () => onAddTalent?.(role);
  return (
    <section
      ref={cardRef}
      className="overflow-hidden rounded-[8px] border border-[#e0e0e0] bg-white"
    >
      <header className="flex h-[84px] items-center justify-between gap-4 px-5">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="truncate text-[16px] font-semibold leading-6">
            {role.name}
          </h3>
          <p className="truncate text-[14px] leading-5 text-[#71717a]">
            {role.description}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <CountPill className="w-[112px] bg-[#eaffae] text-[#5b6f00]">
            {role.needed} needed
          </CountPill>
          <CountPill className="w-[116px] bg-[#f8f9fa] text-[#71717a]">
            {role.candidates.length} candidates
          </CountPill>
          <button type="button" onClick={addTalent} className={BTN_GHOST}>
            <Plus className="size-4" />
            Add Talent
          </button>
          <EllipsisButton label={`${role.name} actions`} />
        </div>
      </header>

      {/* Column band + rows share one fixed 1226 track so the columns never
          drift; the card scrolls horizontally below that width. Separators are
          1px box-shadows, not borders, so they sit ON the block boundary the way
          Figma draws them instead of adding 4px to the card (84 + 44 + n*72). */}
      <div className="overflow-x-auto shadow-[0_-1px_0_#e0e0e0]">
        <div className="min-w-[1226px]">
          <ShortlistCandidateHead />
          <div className="shadow-[0_-1px_0_#e0e0e0]">
            {role.candidates.map((candidate, i) => (
              <ShortlistCandidateRow
                key={candidate.id}
                candidate={candidate}
                separated={i > 0}
                onRemind={(c) => onRemind?.(c, role)}
                onRemove={(c) => onRemove?.(c, role)}
              />
            ))}
          </div>
        </div>
      </div>

      {empty && (
        <>
          <EmptyCandidates onAddTalent={addTalent} />
          <ReadinessNotice roleName={role.name} />
        </>
      )}
    </section>
  );
}

/**
 * The role-grouped candidate board: one RoleGroupCard per role, 24px apart,
 * falling back to the zero-role explainer. This is the whole right column of
 * the builder and the piece the Talents tab reuses verbatim.
 *
 * @param {object} props
 * @param {Array}  props.roles
 * @param {(role) => void} [props.onAddTalent]
 * @param {(candidate, role) => void} [props.onRemind]
 * @param {(candidate, role) => void} [props.onRemove]
 * @param {(roleId: string, node: HTMLElement|null) => void} [props.registerGroupRef]
 *        called per card so the caller can scroll a group into view
 * @param {React.ReactNode} [props.emptyState=<ShortlistEmptyBoard />]
 * @param {string} [props.className]
 */
export function RoleGroupBoard({
  roles,
  onAddTalent,
  onRemind,
  onRemove,
  registerGroupRef,
  emptyState,
  className = "",
}) {
  return (
    <div className={`flex min-w-0 flex-1 flex-col gap-6 ${className}`}>
      {roles.length === 0
        ? (emptyState ?? <ShortlistEmptyBoard />)
        : roles.map((role) => (
            <RoleGroupCard
              key={role.id}
              role={role}
              cardRef={
                registerGroupRef
                  ? (node) => registerGroupRef(role.id, node)
                  : undefined
              }
              onAddTalent={onAddTalent}
              onRemind={onRemind}
              onRemove={onRemove}
            />
          ))}
    </div>
  );
}

/* ── Builder ────────────────────────────────────────────────────────────── */

/**
 * Detail header row (40 tall). The Back button renders only when `onBack` is
 * given, so an embedded builder (project Talents tab) can drop it.
 *
 * @param {object} props
 * @param {string} props.name                        title, as typed/opened
 * @param {() => void} [props.onBack]
 * @param {() => void} [props.onExport]
 * @param {() => void} [props.onCheckAvailability]
 * @param {() => void} [props.onSendToClient]
 * @param {"h1"|"h2"} [props.titleAs="h1"]  heading level for the name — the
 *        standalone page keeps h1; embedded hosts that already render a page
 *        h1 (project Talents tab) pass "h2" so exactly one h1 exists.
 */
export function ShortlistDetailHeader({
  name,
  onBack,
  onExport,
  onCheckAvailability,
  onSendToClient,
  titleAs = "h1",
}) {
  // Uppercase local so JSX treats it as a component-ish tag. A destructured
  // `titleAs: TitleTag` alias trips no-unused-vars here: JSX references are
  // invisible to the core rule (no react plugin) and varsIgnorePattern ^[A-Z_]
  // only covers variables, not function args.
  const TitleTag = titleAs;
  return (
    <div className="flex h-10 items-center justify-between gap-5">
      <div className="flex min-w-0 items-center gap-5">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className={`${BTN_HEADER} w-[89px]`}
          >
            Back
          </button>
        )}
        <TitleTag className="truncate text-[24px] font-semibold leading-8 tracking-[-0.144px]">
          {name}
        </TitleTag>
      </div>
      <div className="flex shrink-0 items-center gap-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              onExport ? onExport() : toast.success("Shortlist exported")
            }
            className={BTN_HEADER}
          >
            Export
          </button>
          <button
            type="button"
            onClick={() =>
              onCheckAvailability
                ? onCheckAvailability()
                : toast.success("Availability requests sent")
            }
            className={BTN_LIME}
          >
            Check availability
          </button>
          <button
            type="button"
            onClick={() =>
              onSendToClient
                ? onSendToClient()
                : toast.success("Shortlist sent to client")
            }
            className={BTN_LIME}
          >
            Send to Client
          </button>
        </div>
        <EllipsisButton label="Shortlist actions" />
      </div>
    </div>
  );
}

/**
 * The whole shortlist builder: header + rail + role-grouped board. Owns the
 * role list and the add-role form so a host only has to hand it a name and a
 * seed; no routing and no V2Layout, so the project page's Talents tab can drop
 * it straight into its tab panel.
 *
 * `initialRoles` seeds state ONCE — remount with a `key` to swap shortlists.
 *
 * @param {object} props
 * @param {string} [props.name=SHORTLIST_DETAIL.name]   header title
 * @param {Array}  [props.initialRoles=SHORTLIST_DETAIL.roles]
 * @param {string} [props.focusRoleId]   scroll this role's card into view on mount
 * @param {() => void} [props.onBack]    renders the Back button when provided
 * @param {(roles: Array) => void} [props.onRolesChange]  fired with the LIVE
 *        role list (on mount and after every change) so a host can derive from
 *        the builder's actual state — e.g. the project page's Check-availability
 *        recipients. Pass a stable function (a setState setter is ideal).
 * @param {boolean} [props.showHeader=true]
 * @param {string} [props.className]
 */
export function ShortlistBuilder({
  name = SHORTLIST_DETAIL.name,
  initialRoles = SHORTLIST_DETAIL.roles,
  focusRoleId,
  onBack,
  onRolesChange,
  showHeader = true,
  className = "",
}) {
  const [roles, setRoles] = useState(() => initialRoles);
  const [formOpen, setFormOpen] = useState(false);
  const groupRefs = useRef({});

  // Mirror the live role list up to the host. Effect, not render-phase call,
  // so the parent's setState never fires while this component is rendering.
  useEffect(() => {
    onRolesChange?.(roles);
  }, [roles, onRolesChange]);

  const createRole = (draft) => {
    const roleName = draft.name.trim();
    if (!roleName) {
      toast.error("Role name is required");
      return;
    }
    // No railLabel: the form collects ONE string, so ShortlistRoleCard falls
    // back to `description` for the rail line (truncated to one line there).
    setRoles((prev) => [
      ...prev,
      {
        id: `role-${Date.now()}`,
        name: roleName,
        description: draft.description.trim(),
        needed: Math.max(1, parseInt(draft.needed, 10) || 1),
        candidates: [],
      },
    ]);
    setFormOpen(false);
    toast.success("Role created", { description: roleName });
  };

  const removeCandidate = (roleId, candidate) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.id === roleId
          ? { ...r, candidates: r.candidates.filter((c) => c.id !== candidate.id) }
          : r
      )
    );
    toast.success("Talent removed", { description: candidate.name });
  };

  const focusRole = (roleId) =>
    groupRefs.current[roleId]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

  // Deep link from the Overview role tables (?role=…): land on that group.
  // Mount-only on purpose; the exhaustive-deps warning anchors to the deps
  // array, so the disable must sit on THAT line, not above useEffect.
  useEffect(() => {
    if (focusRoleId) focusRole(focusRoleId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={className}>
      {/* Header row — 40 tall; left cluster gap 20, right cluster gap 12/24. */}
      {showHeader && <ShortlistDetailHeader name={name} onBack={onBack} />}

      {/* Builder workspace — rail 310 + gutter 24 + board; both stretch. The
          min-height is the frame's 952 at 1080 (viewport − 32 − 40 − 24 − 32);
          past that the page scrolls, since nothing designs the scroll owner. */}
      <div className="mt-6 flex min-h-[calc(100svh-128px)] items-stretch gap-6">
        <ShortlistRolesPanel
          roles={roles}
          formOpen={formOpen}
          onOpenForm={() => setFormOpen(true)}
          onCancelForm={() => setFormOpen(false)}
          onCreateRole={createRole}
          onFocusRole={focusRole}
        />

        <RoleGroupBoard
          roles={roles}
          registerGroupRef={(roleId, node) => {
            groupRefs.current[roleId] = node;
          }}
          onAddTalent={(role) =>
            toast.success("Add Talent", {
              description: `Talent picker for "${role.name}" opens here.`,
            })
          }
          onRemind={(candidate) =>
            toast.success("Reminder sent", { description: candidate.name })
          }
          onRemove={(candidate, role) => removeCandidate(role.id, candidate)}
        />
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */

export default function ShortlistV2() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // ?new=1 → a freshly created shortlist (zero roles); otherwise the seeded one.
  const isNew = Boolean(params.get("new"));
  // ?name=… → the name typed into "Create a new talent shortlist", or the row
  // that was opened. It used to be dropped on the floor and this page always
  // rendered the seed's title.
  const typedName = params.get("name")?.trim();
  // ?role=… → a PROJECT role id (treq-…) from the Overview requirement tables;
  // resolve it over the foreign key to the shortlist role that fills it.
  const roleParam = params.get("role");
  const focusRoleId = roleParam
    ? (shortlistRoleForProjectRole(roleParam)?.id ?? roleParam)
    : undefined;

  return (
    <V2Layout>
      {/* bg-lime-50 — the frame's page ground behind the two columns. */}
      <div className="min-h-screen bg-[#f7f7f2] p-8">
        <ShortlistBuilder
          name={typedName || SHORTLIST_DETAIL.name}
          initialRoles={isNew ? NO_ROLES : SHORTLIST_DETAIL.roles}
          focusRoleId={isNew ? undefined : focusRoleId}
          onBack={() => navigate("/production-v2/saved-shortlist")}
        />
      </div>
    </V2Layout>
  );
}

/* ── FLAGS FOR YINA — absent from every frame, implemented as noted ──────────
 *  1. INTERACTION STATES. No hover / focus / pressed / disabled / loading is
 *     drawn for ANY control (header buttons, + Add Role, Create Role, Cancel,
 *     Add Talent, Remind, Remove, role cards, pills, either "…"). We ship
 *     cursor-pointer only; the three form fields keep the shadcn focus ring.
 *  2. "…" MENUS. Neither the page-level nor the role-group ellipsis has an open
 *     state, and the two-action rule ("Create a copy" / "Delete") belongs to the
 *     OUTER list. Both triggers render and open nothing.
 *  3. ROLE CARD "Variant2" (square-pen + trash-2) is unlabelled and never
 *     instanced — hover? selected? always-on? — so it is NOT implemented, and a
 *     role therefore cannot be edited or deleted here yet.
 *  4. ROLE CARD CLICK. Roles are first-class and the rail invites clicking, but
 *     no selected/active treatment exists. We scroll the board to that group and
 *     add no visual state.
 *  5. "Keep for review" (neutral) and "Declined" (red) pills are undrawn; the
 *     colors come from mockData's placeholders and need her call, as does the
 *     one Client Review value still in Title Case ("Not Sent", drawn that way
 *     by the older base frames only).
 *  6. PANEL NOTE trigger: shown while ANY role has zero candidates. The frames
 *     only ever show it with exactly one role on screen, so "per shortlist" vs
 *     "per role" vs "exactly one role" cannot be disambiguated.
 *  7. NEW ROLES APPEND to the bottom of the rail (the form always sits above the
 *     cards, but creation order is not derivable from the frames).
 *  8. CREATE ROLE stays enabled with an empty Role Name (as drawn) and toasts an
 *     error — no validation, disabled, or saving state is designed.
 *  9. CANCEL at zero roles returns to frame 7517:20697's closed state ("+ Add
 *     Role" + "No roles yet" box), which resolves the "Cancel would leave
 *     nothing" question.
 * 10. ZERO-CANDIDATE COUNTER reads "0 candidates" (the frames leave a stale "3
 *     candidates" pill) and keeps the neutral treatment.
 * 11. WORKFLOW STEPS all hug (the frame locks steps 1–3 at 56 with 13px of dead
 *     space, which reads as a Figma artifact), so the preview box is ~311 not
 *     350. Likewise the empty candidate list hugs at ~348 instead of 388.
 * 12. SCROLLING. The board overflows its 952px viewport by 13.4% at three roles
 *     and nothing says what scrolls; the whole page scrolls and the rail
 *     stretches to the board's height (which also settles the zero-role board's
 *     936-vs-952 discrepancy at equal heights).
 * 13. TRUNCATION. No rule anywhere; role card titles, group titles/descriptions
 *     and candidate name/meta truncate with an ellipsis.
 * 14. "Check availability" / "Send to Client" stay enabled on a shortlist with
 *     zero candidates — no disabled token exists.
 * 15. ADD TALENT opens the designed modal (7525:22978), which is outside this
 *     pass; the button toasts for now.
 * 16. SHORTLIST_CANDIDATE_OPTIONS is unused: no dropdown affordance is drawn on
 *     the three pills, so they render as static badges.
 * 17. RAIL vs HEADER DESCRIPTION — RESOLVED in data: the rail card now renders
 *     the short `railLabel` ("Main commercial hero") and the group header the
 *     long `description` ("Lead rider for opening and product close-up
 *     scenes."), as the frames draw. Two open items remain: "Lifestyle Friend"
 *     is the only role whose two strings are identical ("Support group scene" —
 *     copied, never authored), and the in-app Add Role form still collects ONE
 *     string, so a role created here reuses it for both lines.
 * 18. SHELL DRIFT (outside these two files): V2Layout's sidebar is 256 wide, not
 *     the frame's 286, so the content rail is 1600 instead of 1570 — everything
 *     right-anchored (page "…", the whole candidate table's right edge) lands on
 *     the frame x, and left-anchored blocks sit 30px left of it. And the app
 *     font stack is Helvetica Neue, not Inter, so hug-width buttons come out
 *     3–5px narrower than spec. Both are index.css / V2Layout fixes.
 */

# Plan: Availability Calendar UX Redesign (Talent + Crew)

**TL;DR:** Replace the awkward AM/PM half-cell clicking with a "full-day-first" calendar that supports click-and-drag range selection. AM/PM refinement moves to the side panel. No backend changes needed.

---

**Steps**

### Phase 1 — Day-level grid with drag-to-select
1. Replace the internal AM/PM split buttons inside each day cell with a **single unified day cell** that selects the full day on click
2. Add **mouse event handlers** (`onMouseDown` → `onMouseEnter` while held → `onMouseUp`) so users can **click-and-drag across a range of days** in one gesture — e.g., drag from the 1st to the 15th = 15 days selected instantly
3. Support **Shift+click** to extend selection from the last-clicked day to the new one
4. If a day already has **mixed AM/PM data** (e.g., AM=available, PM=unavailable), show a subtle **diagonal split** or **two-dot indicator** inside the cell — but the default view is a clean single-color fill

### Phase 2 — Side panel improvements
5. Add a **Period selector** to the bulk-update panel: `Full Day` (default) | `Morning Only (AM)` | `Afternoon Only (PM)` — this controls what gets saved, not what gets clicked
6. Add **quick-select buttons**: `All Weekdays` | `Whole Month` | `Clear Selection`
7. Optionally make **week-row headers clickable** to select an entire calendar row (7 days)
8. Change count label from "24 half-days" to **"12 days selected"**

### Phase 3 — Visual polish
9. Day cells get clean rounded fills with status color — no internal borders or stacked micro-buttons
10. Booked/assigned days show a small **lock icon**, remain non-selectable
11. Selected days get a prominent **sky-blue fill with a checkmark** overlay
12. Today ring preserved (amber for talent, indigo for crew)

---

**Relevant files**
- `frontend/src/portals/talent/Calendar.jsx` — full rewrite of grid section + new drag state logic + side panel period selector
- `frontend/src/portals/crew/Calendar.jsx` — mirror of above (nearly identical component, different hooks/colors)
- Backend `bulk_update` in `backend/apps/talent/views.py` and `backend/apps/crew/views.py` — add period-conflict cleanup (delete stale AM/PM entries when saving FULL, and vice versa)

**Verification**
1. Open Talent Calendar → click a single day → confirm it highlights as "selected" (full day)
2. Click-and-drag from day 3 to day 10 → confirm 8 days are selected
3. Set period to "AM Only" in side panel → Save → confirm only AM entries created in DB
4. Save "Full Day: Available" on a date that previously had separate AM+PM entries → confirm the AM/PM entries are deleted and only a FULL entry remains
5. Save "AM Only" on a date that previously had a FULL entry → confirm the FULL entry is deleted and only an AM entry exists
6. Navigate to a month with existing mixed AM/PM data → confirm cells show split indicator
7. Confirm booked days are not selectable
8. `npx vite build` passes with no errors

**Decisions**
- AM/PM is an opt-in refinement, not the primary interaction — vast majority of use cases are full-day
- No backend migration or schema change needed — the `period: "full"` value already exists
- Both portals get identical UX, just different accent colors (amber vs sky)

**Further Considerations — Resolved**
1. **Mobile/touch support** — Add `onTouchStart`/`onTouchMove`/`onTouchEnd` handlers for drag-to-select on touch devices. To avoid interfering with normal scroll, use a **deliberate-gesture gate**: require a short press-and-hold (~200ms) on a day cell before entering drag-select mode. If the finger moves significantly before the hold threshold, treat it as a normal scroll and don't enter selection mode. This way casual swiping scrolls the page as expected, but a deliberate press-then-drag selects a range.
2. **Clearing existing half-day entries** — When `bulk_update` receives `period=full`, after the `update_or_create` for the FULL entry, also **delete any existing AM-only or PM-only entries** for the same (talent/crew, date) pair. This prevents stale half-day records from conflicting with the new full-day entry. Conversely, when saving `period=am` or `period=pm`, delete any existing `full` entry for that date first. Add this cleanup logic to both `TalentAvailabilityViewSet.bulk_update` and `CrewAvailabilityViewSet.bulk_update`.
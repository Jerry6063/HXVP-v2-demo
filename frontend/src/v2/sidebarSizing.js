/**
 * sidebarSizing — shared fluid sizing tokens for the v2 portal sidebars
 * (V2Layout, TalentV2Layout, CrewV2Layout).
 *
 * GOAL (designer request): the sidebar width AND its vertical rhythm / text
 * sizes scale down on short or narrow viewports so every nav item stays visible
 * without the sidebar itself scrolling — across mainstream screens and common
 * zoom levels. An extreme fallback (very short viewports) lets the nav region
 * scroll internally with the user chip pinned at the bottom.
 *
 * REFERENCE FIDELITY — zero visual change on big screens:
 *   Every vertical value is clamp(min, k·vh, MAX) where MAX equals today's
 *   pixel value and the coefficient k is chosen so k·(900/100) >= MAX. That
 *   guarantees at viewport height >= 900px every value is pinned to its MAX =
 *   the current design exactly. Compression only begins below ~900px tall.
 *   (vh, not svh: the sidebar is `hidden md:flex` so it never renders on the
 *   mobile viewports where svh differs from vh, and vh has universal support.)
 *
 * Baseline values reproduced at the maxima (measured from production sidebar):
 *   width 256 (w-64) · nav item py 8 / font 14 / icon 16 · group label font 11
 *   / pb 6 · group gap 20 (space-y-5) · item gap 2 (space-y-0.5) · nav py 8 ·
 *   wordmark pt 24 / pb 16 · chip pad 12 · chip button py 8.
 *
 * WIDTH is viewport-WIDTH driven (independent of height): clamp(216, 18vw, 256).
 *   18vw keeps the full 256px for widths >= ~1422px (so 1440-wide and Yina's
 *   1920 frame are pixel-identical), shrinking toward a 216px floor only on
 *   genuinely narrow windows. The 216px floor (13.5rem) keeps the longest label
 *   ("Revenue & Expenses", ~136px at 14px) fully on one line WITHOUT ellipsis at
 *   viewport widths down to 900px: label box = floor - 1(border) - 48(nav+item
 *   px-3) - 16(icon) - 10(gap) ≈ 141px > 136px. (208px was ~3px short and
 *   tripped the truncate guard.) To trim the max instead (e.g. a 240px / 15vw
 *   design), edit the single `--hx-sb-w` line below.
 *
 * USAGE: spread SIDEBAR_VARS onto the <aside style> (it also sets width), then
 * apply the named style objects to the matching elements. All non-size styling
 * (colors, flex, borders, radius, transitions) stays in the existing Tailwind
 * classNames — only the responsive size properties move here.
 */

// CSS custom properties. Spread onto the <aside> so every descendant can read
// them. `width` is included directly on the aside style (see sbAsideStyle).
export const SIDEBAR_VARS = {
  "--hx-sb-w": "clamp(216px, 18vw, 256px)",
  "--hx-nav-py": "clamp(4px, 0.95vh, 8px)",
  "--hx-nav-font": "clamp(12px, 1.8vh, 14px)",
  "--hx-icon": "clamp(14px, 2vh, 16px)",
  "--hx-label-font": "clamp(9px, 1.4vh, 11px)",
  "--hx-label-pb": "clamp(3px, 0.75vh, 6px)",
  "--hx-group-gap": "clamp(10px, 2.25vh, 20px)",
  "--hx-item-gap": "clamp(1px, 0.3vh, 2px)",
  "--hx-nav-pad": "clamp(2px, 0.95vh, 8px)",
  "--hx-wm-pt": "clamp(10px, 2.7vh, 24px)",
  "--hx-wm-pb": "clamp(6px, 1.8vh, 16px)",
  "--hx-chip-pad": "clamp(4px, 1.4vh, 12px)",
  "--hx-chip-py": "clamp(2px, 0.95vh, 8px)",
};

// <aside> — width from the responsive token (replaces the fixed w-64). Height
// (h-svh) + sticky + self-start are applied via className in each layout so the
// nav-region overflow fallback has a viewport-bounded box to scroll within.
export const sbAsideStyle = { ...SIDEBAR_VARS, width: "var(--hx-sb-w)" };

// Wordmark block: compress only the vertical paddings (pt-6 / pb-4). Horizontal
// px-5 and the brand type stay as-is via className.
export const sbWordmarkStyle = {
  paddingTop: "var(--hx-wm-pt)",
  paddingBottom: "var(--hx-wm-pb)",
};

// <nav> scroll region: compress its own vertical padding (was py-2).
export const sbNavStyle = {
  paddingTop: "var(--hx-nav-pad)",
  paddingBottom: "var(--hx-nav-pad)",
};

// Wrapper around the nav groups — replaces space-y-5 with a fluid gap.
export const sbGroupsStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--hx-group-gap)",
};

// Group label (was text-[11px] pb-1.5).
export const sbLabelStyle = {
  fontSize: "var(--hx-label-font)",
  paddingBottom: "var(--hx-label-pb)",
};

// Items container within a group — replaces space-y-0.5 with a fluid gap.
export const sbItemsStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--hx-item-gap)",
};

// Nav item row (was py-2 text-sm). Horizontal px-3, gap-2.5, radius, colors
// stay in className. lineHeight is the unitless equivalent of Tailwind's
// text-sm (20px at the 14px max font) so the line box is exactly 20px at the
// maximum and scales down proportionally with the font as the row compresses —
// restoring the fidelity lost when fontSize moved out of the text-sm class.
export const sbNavItemStyle = {
  paddingTop: "var(--hx-nav-py)",
  paddingBottom: "var(--hx-nav-py)",
  fontSize: "var(--hx-nav-font)",
  lineHeight: 20 / 14,
};

// Nav item icon (was size-4 = 16px).
export const sbIconStyle = {
  width: "var(--hx-icon)",
  height: "var(--hx-icon)",
};

// User-chip wrapper (was p-3) — compress padding on all sides.
export const sbChipWrapStyle = { padding: "var(--hx-chip-pad)" };

// User-chip button vertical padding (was py-2). Horizontal px-2 stays.
export const sbChipBtnStyle = {
  paddingTop: "var(--hx-chip-py)",
  paddingBottom: "var(--hx-chip-py)",
};

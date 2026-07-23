/**
 * sidebarSizing — shared fluid sizing tokens for the v2 portal sidebars
 * (V2Layout, TalentV2Layout, CrewV2Layout).
 *
 * GOAL (designer request): the sidebar must read at designer Yina's proportion
 * on every screen. Her 1920 canvas draws the sidebar at a fixed FRACTION of the
 * viewport; a browser at 1440/1512 should therefore render a proportionally
 * smaller sidebar — not the same pixels. Our previous fixed ~256px/14px looked
 * "very large" on laptops precisely because it did NOT shrink with the viewport
 * (Yina's Figma auto-fits her 1920 frame to ~75% on a 1440 laptop, so her
 * sidebar appears at ~214px there while our app rigidly showed 256px).
 *
 * ── MEASURED FROM YINA'S 1920 DESIGN (pixel truth; file vuZ77RgLUVtzfJKAhb1EEX,
 *    "Admin Sidebar" instance 7331:19826, verified across 60+ sidebar instances
 *    on the "New Version 07/20/2026" page — ALL 286px wide):
 *      sidebar width ........ 286px  → 286/1920 = 14.9% of viewport
 *      nav item cap-height .. 11px   (≈ 15.6px font)   left pad to icon 17px
 *      nav icon ............. ~18px            icon→text gap ~10px
 *      item pitch ........... ~40px            group label cap 10px (~11px font)
 *      active highlight ..... #EAFFAE (matches app)    nav horiz pad ~8px
 *    NOTE: Yina's 1920 design is actually LARGER than our shipped maxima in
 *    every dimension (286>256, ~15.6>14, ~18>16). Our shipped design already IS
 *    her design at ~0.895 scale (256/286). So we keep today's maxima as the CAP
 *    and scale the whole unit DOWN below the pivot width — we never grow past
 *    today's 256px, we only slim on smaller viewports (which is the fix Yina
 *    asked for).
 *
 * ── WIDTH-PROPORTIONAL MODEL (the rework)
 *   The sidebar width follows Yina's ratio: clamp(184px, 14.9vw, 256px).
 *   14.9vw == 286/1920, so the 256px cap is reached at viewport width
 *   ≈ 1718px (the "pivot"). At every width ≥ 1718px (incl. 1920) the sidebar is
 *   pinned to today's exact design; below it, width scales linearly with the
 *   viewport toward a 184px legibility floor. 1440 → ~214px, 1512 → ~225px.
 *
 *   Every INTERNAL token scales by the SAME viewport fraction so the sidebar
 *   shrinks as one rigid, proportional copy. Each token carries a width-driven
 *   term  c·vw  with  c = max/17.18  (17.18 = pivot/100), so all caps engage
 *   together at the pivot and every token is pinned to its MAX at ≥1718px wide.
 *
 * ── COMBINED WITH HEIGHT COMPRESSION (kept from the prior system)
 *   Short-but-wide windows (e.g. 1920×648) must still compress by HEIGHT, while
 *   narrow-but-tall windows follow WIDTH. So each token takes the tighter of the
 *   two:   value = clamp(floor, min(c_w·vw, c_h·vh), max).
 *   The vh coefficients are unchanged: each c_h·(900/100) ≥ max, guaranteeing
 *   that at viewport height ≥ 900px the height term is pinned to max — so at
 *   1920×1080 BOTH terms are at max and the sidebar is pixel-identical to before.
 *   (Width has no height term — a short window keeps full width; only the
 *   vertical rhythm and text compress.) An extreme fallback (very short
 *   viewports) still lets the nav region scroll internally with the user chip
 *   pinned at the bottom — that is layout-level (aside h-svh + nav overflow), not
 *   a token, and is untouched here.
 *
 * ── LABEL FIT: because the font scales DOWN with the width, the longest label
 *   ("Revenue & Expenses") stays on one line without ellipsis at every width
 *   down to the 184px floor — the text budget shrinks slower than the glyphs.
 *   (Verified in-browser by asserting scrollWidth ≤ clientWidth on that span.)
 *   Horizontal item paddings remain their Tailwind values (px-3 / gap-2.5); they
 *   are only ~a few px generous at the smallest sizes and never cause truncation.
 *
 * USAGE: spread SIDEBAR_VARS onto the <aside style> (it also sets width), then
 * apply the named style objects to the matching elements. All non-size styling
 * (colors, flex, borders, radius, transitions) stays in the existing Tailwind
 * classNames — only the responsive size properties live here.
 */

// CSS custom properties. Spread onto the <aside> so every descendant can read
// them. `width` is included directly on the aside style (see sbAsideStyle).
//
// Per token:  clamp(FLOOR, min(WIDTH·vw, HEIGHT·vh), MAX)
//   MAX      = today's 1920×900+ value (unchanged on big screens)
//   WIDTH·vw = Yina-proportional width term, coefficient = MAX / 17.18
//   HEIGHT·vh= prior height-compression term (pins to MAX at height ≥ 900px)
//   FLOOR    = legibility floor
// Width itself is width-only (no height term).
export const SIDEBAR_VARS = {
  "--hx-sb-w": "clamp(184px, 14.9vw, 256px)",
  "--hx-nav-py": "clamp(4px, min(0.466vw, 0.95vh), 8px)",
  "--hx-nav-font": "clamp(10.5px, min(0.815vw, 1.8vh), 14px)",
  "--hx-icon": "clamp(12px, min(0.931vw, 2vh), 16px)",
  "--hx-label-font": "clamp(9px, min(0.64vw, 1.4vh), 11px)",
  "--hx-label-pb": "clamp(3px, min(0.349vw, 0.75vh), 6px)",
  "--hx-group-gap": "clamp(10px, min(1.164vw, 2.25vh), 20px)",
  "--hx-item-gap": "clamp(1px, min(0.116vw, 0.3vh), 2px)",
  "--hx-nav-pad": "clamp(2px, min(0.466vw, 0.95vh), 8px)",
  "--hx-wm-pt": "clamp(10px, min(1.397vw, 2.7vh), 24px)",
  "--hx-wm-pb": "clamp(6px, min(0.931vw, 1.8vh), 16px)",
  "--hx-chip-pad": "clamp(4px, min(0.699vw, 1.4vh), 12px)",
  "--hx-chip-py": "clamp(2px, min(0.466vw, 0.95vh), 8px)",
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

/**
 * LandingV2 — HXVP v2 "Portal Entry Gateway" (route /v2, also the site root).
 *
 * 1:1 rebuild of Yina's Figma frame "Portal Entry Gateway — Light Theme"
 * (node 7344:19791, a 1920×1080 canvas). Full-bleed warm off-white page: header
 * wordmark + nav, hero (eyebrow / League Gothic title / full-bleed lime accent
 * bar / description), a horizontal row of FOUR skewed parallelogram portal cards
 * each with a lime #d8ff00 offset shadow, and a footer (status dot + links).
 *
 * ── Geometry & scaling (see NOTE 7 / NOTE 8) ────────────────────────────────
 * The frame is a FIXED 1920×1080 canvas — margins 160, container 1600, card
 * surface 388×408 with 16px gaps, title/number 48px, description 14px. A fixed
 * px port of that overflows real laptop viewports (which are ~790–860px tall at
 * 100%). So the whole page is now FLUID:
 *   • One shared container width `--content = min(1600px, 84.17vw)` feeds header,
 *     hero, description, cards and footer, so every section shares the frame's
 *     left/right edges and the layout scales with viewport width. At 1920 it is
 *     exactly the frame (1600 container / 160 margins / 388 cards); at 1440 it is
 *     the frame ×0.75 (1212 container / 291 cards).
 *   • Cards fill the container 4-across with 16px gaps and take their height from
 *     `aspect-ratio: 388/408`, so they stay square-ish like the frame instead of
 *     the old fixed 416px tower.
 *   • Card typography/padding scale with each card's OWN width via container-query
 *     units (cqw), so "same content scale" holds at any card size (48px title =
 *     12.371cqw = 48/388, etc.).
 *   • Vertical rhythm reproduces the frame's 1920×1080 section y-positions: the
 *     top block (header row 64 / eyebrow / title / lime / subtitle) uses fixed
 *     `--content`-scaled gaps that hit the frame's y-list at 1920, then TWO
 *     flex-grow spacers (ratio 75 : 148.5 = subtitle→cards : cards→footer, the
 *     frame's own distribution) sit above and below the card row. So at 1920 the
 *     cards land at the frame's y=440 and taller viewports spread the extra
 *     height in that ratio (card block stays balanced) instead of dumping it all
 *     below the cards; the footer rides the lower spacer to the viewport bottom.
 *
 * Parallelogram = CSS skewX(-6deg) on the interactive element (the measured
 * lime-shadow right edge slopes -6.1deg), with the content counter-skewed
 * skewX(6deg) so it reads upright — the italic lean comes from the fonts.
 *
 * Cards & routes (frame order 01–04): Production → /production-v2,
 * Client → (no route; inert "coming soon"), Talent → /talent-v2,
 * Crew → /crew-v2. See the divergence/decision notes at the bottom of this file.
 *
 * Fonts: League Gothic, Inter, and Roboto Condensed (Italic) all ship from
 * index.html (see NOTE 1). Wrapped in `.v2-root`; no sidebar.
 */
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Toaster } from "@/components/shadcn/sonner";

// Roboto Condensed (card numbers/titles) + Inter (everything else). Fallbacks
// keep the demo legible if the Google Fonts request is blocked: Arial Narrow is
// a widely-present condensed face standing in for Roboto Condensed.
const FONT_COND = '"Roboto Condensed", "Arial Narrow", "Helvetica Neue", sans-serif';
const FONT_INTER = '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif';
const FONT_DISPLAY = '"League Gothic", "Bebas Neue", "Arial Narrow", sans-serif';

const INK = "#111827";
const LIME = "#d8ff00"; // button-primary-green — offset shadow + accent bar + dot
const TILE = "#eaffae"; // button-secondary-green — CTA arrow tile (NOTE 4)
const GHOST = "#e0e0e0"; // line-default — ghost numbers + rules

// Shared container width. Reproduces the frame's 1600-in-1920 proportion but
// tuned so a 1440-wide viewport yields a 1212px container → 291px cards, i.e. the
// frame's 388px card ×0.75 (matches the DOM-assert target within ±2px). Capped at
// the frame's native 1600 for ≥1900px-wide screens.
const CONTENT = "min(1600px, 84.17vw)";

// container-query typography for the card interior, expressed as % of the card's
// own width (cqw) against the frame's 388px card so the content scale is exact:
//   48/388 = 12.371 · 14/388 = 3.608 · 12/388 = 3.093 · 16/388 = 4.124
// Small text keeps a px floor via clamp() so it stays legible on narrow laptops.
const CARDS = [
  {
    n: "01",
    title: "PRODUCTION",
    desc: "Project management, call sheets, and contracts.",
    to: "/production-v2",
  },
  {
    n: "02",
    title: "CLIENT",
    // Kept enterable-looking to match the frame, but inert: there is no
    // /client-v2 route (NOTE 2). Clicking surfaces a "coming soon" toast
    // instead of dead-ending.
    desc: "Project progress, talent shortlists, approvals, deliverables.",
    to: null,
  },
  {
    n: "03",
    title: "TALENT",
    desc: "Profile, portfolio, bookings, calendar, contracts, time logs, and invoices.",
    to: "/talent-v2",
  },
  {
    n: "04",
    title: "CREW",
    desc: "Bookings, call sheets, tasks, documents, time logs, invoices, and payment status.",
    to: "/crew-v2",
  },
];

function CardFace({ n, title, desc }) {
  return (
    <>
      {/* Purely decorative layers — pointer-events-none so the ONLY hit target is
          the skewed <a>/<button>, i.e. the parallelogram itself. Without this the
          counter-skewed (upright) content layer would form a rectangle at the grid
          cell that overlaps the neighbour's slanted tip and steals its clicks. */}
      {/* lime #d8ff00 offset shadow, 12px(388-scale) down-right, behind the surface */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: LIME, transform: "translate(3.093cqw, 3.093cqw)" }}
        aria-hidden="true"
      />
      {/* white parallelogram surface. Drop shadow matches the frame's surface
          bleed geometry (offset 0/18px, ~26px blur) at the 25% opacity Yina
          specced (TWEAK 2). On hover the surface flips white → bright green
          #d8ff00 with a deeper shadow (TWEAK 5) — gated on `group` so only the
          enterable Link (not the inert CLIENT button) turns green. */}
      <div className="pointer-events-none absolute inset-0 bg-white shadow-[0_18px_26px_rgba(0,0,0,0.25)] transition duration-200 group-hover:bg-[#d8ff00] group-hover:shadow-[0_30px_50px_rgba(0,0,0,0.30)]" />
      {/* content, counter-skewed back to upright. All sizes are cqw (share of the
          card's own width) so they scale 1:1 with the card at any viewport. */}
      <div className="pointer-events-none absolute inset-0 [transform:skewX(6deg)]">
        <div
          className="flex h-full flex-col"
          style={{ padding: "14.4cqw 13.4cqw 8cqw" }}
        >
          <span
            style={{
              fontFamily: FONT_COND,
              fontStyle: "italic",
              fontWeight: 600,
              color: GHOST,
              fontSize: "12.371cqw",
              lineHeight: 1.05,
            }}
          >
            {n}
          </span>
          <span
            style={{
              fontFamily: FONT_COND,
              fontStyle: "italic",
              fontWeight: 700,
              color: INK,
              fontSize: "12.371cqw",
              lineHeight: 1.05,
              marginTop: "6.2cqw",
            }}
          >
            {title}
          </span>
          <p
            style={{
              fontFamily: FONT_INTER,
              fontStyle: "italic",
              color: INK,
              fontSize: "clamp(9px, 3.608cqw, 14px)",
              lineHeight: 1.571,
              marginTop: "4.8cqw",
              maxWidth: "69.07cqw",
            }}
          >
            {desc}
          </p>
          <span className="mt-auto flex items-center justify-end gap-2">
            <span
              style={{
                fontFamily: FONT_INTER,
                fontStyle: "italic",
                fontWeight: 600,
                color: INK,
                fontSize: "clamp(9px, 3.093cqw, 12px)",
                letterSpacing: "0.12em",
              }}
            >
              ENTER
            </span>
            <span
              className="flex items-center justify-center"
              style={{ background: TILE, width: "11.727cqw", height: "9.794cqw" }}
            >
              <span
                style={{
                  fontFamily: FONT_INTER,
                  fontWeight: 600,
                  color: INK,
                  fontSize: "clamp(11px, 4.124cqw, 16px)",
                  lineHeight: 1,
                }}
              >
                &rarr;
              </span>
            </span>
          </span>
        </div>
      </div>
    </>
  );
}

function PortalCard({ n, title, desc, to }) {
  const enterable = Boolean(to);
  const face = <CardFace n={n} title={title} desc={desc} />;

  // The skew lives on the interactive element itself so the clickable/focusable
  // area IS the parallelogram (CSS transforms affect hit-testing) — no slanted
  // tip bleeding into a neighbouring card's rectangle. CardFace counter-skews its
  // content back to upright. `container-type: inline-size` makes the card the
  // query container the cqw content scales against; `aspect-ratio: 388/408` gives
  // it the frame's square-ish shape from its fluid width. Enterable cards lift on
  // hover.
  const shared = {
    containerType: "inline-size",
    aspectRatio: "388 / 408",
  };

  if (enterable) {
    return (
      <Link
        to={to}
        aria-label={`Enter ${title} portal`}
        className="group relative block w-full outline-none [transform:skewX(-6deg)] transition-transform duration-200 hover:[transform:skewX(-6deg)_translateY(-12px)] focus-visible:ring-2 focus-visible:ring-[#111827]/40"
        style={shared}
      >
        {face}
      </Link>
    );
  }

  // CLIENT — no route yet. Inert, not-allowed cursor, "coming soon" feedback.
  return (
    <button
      type="button"
      aria-label={`${title} portal — coming soon`}
      onClick={() => toast(`${title} portal is coming soon.`)}
      className="relative block w-full cursor-not-allowed text-left outline-none [transform:skewX(-6deg)] focus-visible:ring-2 focus-visible:ring-[#111827]/40"
      style={shared}
    >
      {face}
    </button>
  );
}

export default function LandingV2() {
  return (
    <div
      className="v2-root flex w-full flex-col overflow-x-hidden text-[#111827]"
      style={{ background: "#f7f7f2", minHeight: "100svh", "--content": CONTENT }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      {/* Frame's header ROW is 64px tall (y 32→96) with the wordmark vertically
          centred — reserve that row (height) so downstream section tops line up
          with the frame, and offset it 32 from the page top with marginTop. */}
      <header
        className="mx-auto flex w-full items-center justify-between"
        style={{
          width: "var(--content)",
          marginTop: "clamp(16px, calc(var(--content) * 0.02), 32px)",
          height: "clamp(40px, calc(var(--content) * 0.04), 64px)",
        }}
      >
        <span
          style={{
            fontFamily: FONT_DISPLAY,
            color: INK,
            fontSize: "clamp(16px, calc(var(--content) * 0.015), 24px)",
            lineHeight: 1,
          }}
        >
          HXVP / STUDIO
        </span>
        <nav className="flex items-center gap-6 sm:gap-10">
          <Link
            to="/"
            className="tracking-[0.04em] text-[#111827] transition-opacity hover:opacity-60"
            style={{
              fontFamily: FONT_INTER,
              fontWeight: 500,
              fontSize: "clamp(11px, calc(var(--content) * 0.00875), 14px)",
            }}
          >
            &larr; MAIN SITE
          </Link>
          <span
            className="tracking-[0.04em] text-[#111827]"
            style={{
              fontFamily: FONT_INTER,
              fontWeight: 600,
              fontSize: "clamp(11px, calc(var(--content) * 0.00875), 14px)",
            }}
          >
            INTERNAL PORTAL
          </span>
        </nav>
      </header>

      {/* ── Hero (eyebrow + title) ─────────────────────────────────────── */}
      <div
        className="mx-auto w-full"
        style={{
          width: "var(--content)",
          paddingTop: "clamp(26px, calc(var(--content) * 0.0375), 60px)",
        }}
      >
        <p
          className="tracking-[0.12em]"
          style={{
            fontFamily: FONT_INTER,
            fontWeight: 600,
            color: INK,
            fontSize: "clamp(10px, calc(var(--content) * 0.0075), 12px)",
          }}
        >
          STUDIO OPERATIONS &middot; ROLE-BASED ACCESS
        </p>
        <h1
          style={{
            fontFamily: FONT_DISPLAY,
            color: INK,
            fontSize: "clamp(40px, calc(var(--content) * 0.06), 96px)",
            lineHeight: 0.92,
            maxWidth: "calc(var(--content) * 0.66)",
            // eyebrow→title gap: frame 46 (eyebrow box bottom 174 → title top 220)
            marginTop: "clamp(22px, calc(var(--content) * 0.02875), 46px)",
          }}
        >
          Choose Your HXVP Workspace
        </h1>
      </div>

      {/* ── Full-bleed lime accent bar ─────────────────────────────────── */}
      <div
        className="w-full opacity-50"
        style={{
          background: LIME,
          height: "clamp(9px, calc(var(--content) * 0.01), 16px)",
          // title→lime gap: frame 8 (title box bottom 308 → lime top 316)
          marginTop: "clamp(5px, calc(var(--content) * 0.005), 8px)",
        }}
        aria-hidden="true"
      />

      {/* ── Description ────────────────────────────────────────────────── */}
      <div
        className="mx-auto w-full"
        style={{
          width: "var(--content)",
          // lime→subtitle gap: frame 9 (lime bottom 332 → subtitle top 341)
          paddingTop: "clamp(6px, calc(var(--content) * 0.005625), 9px)",
        }}
      >
        <p
          style={{
            fontFamily: FONT_INTER,
            color: INK,
            fontSize: "clamp(12px, calc(var(--content) * 0.01), 16px)",
            lineHeight: 1.5,
          }}
        >
          Select the portal that matches your role.
        </p>
      </div>

      {/* ── Spacer A (subtitle → cards) ────────────────────────────────────
          The frame does NOT center the card block in the leftover height — it
          sits high-of-center: 75px above the cards vs 148.5px below (surface
          bottom 848 → footer divider 996.5). Instead of one mt-auto that dumps
          ALL slack below the cards, TWO flex-grow spacers split the free space
          in the frame's 75 : 148.5 ratio, so at 1920×1080 the cards land at the
          frame's y=440 and taller viewports distribute the extra proportionally
          (card block stays balanced, no dead band hugging the footer). */}
      <div aria-hidden="true" style={{ flex: "75 0 0" }} />

      {/* ── Portal cards ───────────────────────────────────────────────── */}
      <div className="mx-auto w-full" style={{ width: "var(--content)" }}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {CARDS.map((c) => (
            <PortalCard key={c.n} {...c} />
          ))}
        </div>
      </div>

      {/* ── Spacer B (cards → footer) — frame ratio 148.5 (see Spacer A) ─── */}
      <div aria-hidden="true" style={{ flex: "148.5 0 0" }} />

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      {/* No mt-auto: Spacer B above already pins the footer to the bottom. The
          footer block occupies the frame's 83.5px (divider y 996.5 → page bottom
          1080): divider→content 37.5 + content + 24 bottom margin. */}
      <footer
        className="mx-auto w-full"
        style={{
          width: "var(--content)",
          paddingBottom: "clamp(16px, calc(var(--content) * 0.015), 24px)",
        }}
      >
        <div
          className="flex flex-col gap-4 border-t sm:flex-row sm:items-center sm:justify-between"
          style={{
            borderColor: GHOST,
            paddingTop: "clamp(22px, calc(var(--content) * 0.0234), 37.5px)",
          }}
        >
          <span className="flex items-center gap-3">
            <span
              className="h-2 w-2 rounded-[4px]"
              style={{ background: LIME }}
              aria-hidden="true"
            />
            <span
              className="tracking-[0.08em]"
              style={{
                fontFamily: FONT_INTER,
                fontWeight: 600,
                color: INK,
                fontSize: "clamp(10px, calc(var(--content) * 0.0075), 12px)",
              }}
            >
              SECURE ROLE-BASED PORTAL
            </span>
          </span>
          <span
            className="flex items-center gap-6"
            style={{
              fontFamily: FONT_INTER,
              color: INK,
              fontSize: "clamp(11px, calc(var(--content) * 0.00875), 14px)",
            }}
          >
            <span>Need access? Contact admin</span>
            {/* Privacy / Support read as links in the frame but have no targets
                (NOTE 3) — rendered as inert link-styled text for the demo. */}
            <span className="cursor-pointer underline-offset-4 hover:underline">Privacy</span>
            <span className="cursor-pointer underline-offset-4 hover:underline">Support</span>
          </span>
        </div>
      </footer>

      <Toaster richColors position="top-right" />
    </div>
  );
}

/*
 * ── Divergence / decisions to reconcile with Yina & the team ─────────────────
 * These are flagged, NOT silently normalized (per repo convention).
 *
 * NOTE 1 — Fonts. The frame uses Inter (body/nav/CTA) and Roboto Condensed Italic
 *   (card numbers/titles) alongside League Gothic. All three now load from a single
 *   <link> in index.html (`.v2-root` otherwise falls back to a Helvetica stack), so
 *   there is no runtime font injection in this file; the FONT_* fallbacks below keep
 *   the demo legible if the Google Fonts request is blocked.
 *
 * NOTE 2 — CLIENT card. The frame shows Client fully enterable (ghost 02, ENTER →,
 *   no disabled state), but there is NO /client-v2 route and the shipped landing
 *   disabled Client. Per the "don't ship an active card that dead-ends" rule, this
 *   card is rendered looking identical to the frame but is INERT: cursor-not-allowed
 *   + a "coming soon" toast, no navigation. Team to decide: build /client-v2, or
 *   keep it disabled (and if so, whether the frame should show a disabled state).
 *
 * NOTE 3 — No link targets in Figma. Card destinations are ours (mapped above).
 *   MAIN SITE points at "/" (the public site root). Footer Privacy/Support have no
 *   targets, so they're inert link-styled text. "Need access? Contact admin" is a
 *   non-link prompt, per the frame.
 *
 * NOTE 4 — Colors read from the render, not tokenized. The full-bleed accent bar's
 *   fill is not in get_variable_defs; the rendered PNG sits between #d8ff00 and
 *   #eaffae. Used #d8ff00 (brand token, matches card shadows + footer dot) — confirm
 *   with Yina. The CTA arrow tile uses #eaffae (button-secondary-green, "likely" per
 *   spec, not visually confirmed).
 *
 * NOTE 5 — Copy slip corrected. Yina's frame reads "Projects management, call
 *   sheets, and contracts." — a typo for "Project management." Per our convention
 *   (never copy a slip verbatim), the code says "Project management…"; flag the
 *   frame to Yina so the source gets fixed too.
 *
 * NOTE 6 — Hover states on enterable cards. The Portal Card component in Figma
 *   ships only a `property1="Default"` variant — no hover/pressed variant exists —
 *   so these are added affordances built to Yina's written direction: the card
 *   lifts higher on hover (translateY -12px) and the white surface flips to bright
 *   green #d8ff00 (button-primary-green token) with a deeper shadow, all on a 200ms
 *   transition. Applied only to the enterable Link (gated on the `group` class),
 *   never the inert CLIENT button.
 *
 * NOTE 7 — Card geometry reconciled to the frame's Portal Card component
 *   (node 7344:19940): white surface 388×408, lime offset shape +12/+12, four
 *   instances on a 404px pitch → 16px surface-to-surface gap. Interior at 388-scale:
 *   number/title Roboto Condensed Italic 48px, description Inter Italic 14px/22px,
 *   ENTER 12px, CTA arrow tile 45.5×38, arrow 16px. These are the source of the cqw
 *   ratios above. Surface drop shadow 0/18px offset, ~26px blur, black @ 25%; top
 *   lime divider #d8ff00 @ 50% opacity — both pixel-confirmed against the render.
 *
 * NOTE 8 — Single-viewport fit. The frame is a fixed 1920×1080 artboard; ported at
 *   fixed px it overflowed real laptops (~790–860px tall at 100%). The page is now
 *   fluid (see the header comment): one `--content` container drives every section,
 *   cards derive height from aspect-ratio 388/408, interior type scales via cqw, and
 *   vertical rhythm reproduces the frame's y-list via `--content`-scaled top-block
 *   gaps plus the 75 : 148.5 flex-grow spacers around the card row (footer rides the
 *   lower spacer to the viewport bottom). Result is a faithful scaling of Yina's
 *   frame — same proportions AND the same vertical distribution, no redesign — that
 *   fits 1440×790 / 1512×860 / 1280×700 without vertical scroll, pixel-matches the
 *   frame's section y-positions at 1920×1080, and spreads extra height on taller
 *   viewports in the frame's ratio. Confirm the fluid behaviour with Yina; the frame
 *   itself remains the fixed-canvas source of truth.
 */

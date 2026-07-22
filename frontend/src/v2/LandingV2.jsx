/**
 * LandingV2 — HXVP v2 "Portal Entry Gateway" (route /v2).
 *
 * 1:1 rebuild of Yina's Figma frame "Portal Entry Gateway — Light Theme"
 * (node 7344:19791). Full-bleed warm off-white page: header wordmark + nav,
 * hero (eyebrow / League Gothic 96px title / full-bleed lime accent bar /
 * description), a horizontal row of FOUR skewed parallelogram portal cards each
 * with a lime #d8ff00 offset shadow, and a footer (status dot + links).
 *
 * Parallelogram = CSS skewX(-6deg) on the card wrapper (measured off the frame:
 * lime-shadow right edge slopes -6.1deg), with the text content counter-skewed
 * skewX(6deg) so it reads upright — the italic lean comes from the fonts, not
 * the shear.
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
      {/* lime #d8ff00 offset shadow, 12px down-right, behind the white surface */}
      <div
        className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3"
        style={{ background: LIME }}
        aria-hidden="true"
      />
      {/* white parallelogram surface */}
      <div className="pointer-events-none absolute inset-0 bg-white shadow-[0_12px_30px_rgba(0,0,0,0.12)]" />
      {/* content, counter-skewed back to upright */}
      <div className="pointer-events-none absolute inset-0 [transform:skewX(6deg)]">
        <div className="flex h-full flex-col px-12 pb-8 pt-[76px] sm:px-14">
          <span
            className="text-[44px] leading-none xl:text-[48px]"
            style={{ fontFamily: FONT_COND, fontStyle: "italic", fontWeight: 600, color: GHOST }}
          >
            {n}
          </span>
          <span
            className="mt-5 text-[40px] leading-none xl:text-[48px]"
            style={{ fontFamily: FONT_COND, fontStyle: "italic", fontWeight: 700, color: INK }}
          >
            {title}
          </span>
          <p
            className="mt-5 max-w-[268px] text-[14px] leading-[22px]"
            style={{ fontFamily: FONT_INTER, fontStyle: "italic", color: INK }}
          >
            {desc}
          </p>
          <span className="mt-auto flex items-center justify-end gap-2">
            <span
              className="text-[12px] tracking-[0.12em]"
              style={{ fontFamily: FONT_INTER, fontStyle: "italic", fontWeight: 600, color: INK }}
            >
              ENTER
            </span>
            <span
              className="flex h-[38px] w-[46px] items-center justify-center"
              style={{ background: TILE }}
            >
              <span
                className="text-[16px] leading-none"
                style={{ fontFamily: FONT_INTER, fontWeight: 600, color: INK }}
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
  // content back to upright. Enterable cards lift slightly on hover.
  if (enterable) {
    return (
      <Link
        to={to}
        aria-label={`Enter ${title} portal`}
        className="relative block h-[416px] w-full outline-none [transform:skewX(-6deg)] transition-transform duration-200 hover:[transform:skewX(-6deg)_translateY(-8px)] focus-visible:ring-2 focus-visible:ring-[#111827]/40"
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
      className="relative block h-[416px] w-full cursor-not-allowed text-left outline-none [transform:skewX(-6deg)] focus-visible:ring-2 focus-visible:ring-[#111827]/40"
    >
      {face}
    </button>
  );
}

export default function LandingV2() {
  return (
    <div
      className="v2-root flex min-h-screen w-full flex-col overflow-x-hidden text-[#111827]"
      style={{ background: "#f7f7f2" }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-6 pt-8 lg:px-10">
        <span
          className="text-[24px] leading-none"
          style={{ fontFamily: FONT_DISPLAY, color: INK }}
        >
          HXVP / STUDIO
        </span>
        <nav className="flex items-center gap-6 sm:gap-10">
          <Link
            to="/"
            className="text-[14px] tracking-[0.04em] text-[#111827] transition-opacity hover:opacity-60"
            style={{ fontFamily: FONT_INTER, fontWeight: 500 }}
          >
            &larr; MAIN SITE
          </Link>
          <span
            className="text-[14px] tracking-[0.04em] text-[#111827]"
            style={{ fontFamily: FONT_INTER, fontWeight: 600 }}
          >
            INTERNAL PORTAL
          </span>
        </nav>
      </header>

      {/* ── Hero (eyebrow + title) ─────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-[1600px] px-6 pt-20 lg:px-10 lg:pt-28">
        <p
          className="text-[12px] tracking-[0.12em]"
          style={{ fontFamily: FONT_INTER, fontWeight: 600, color: INK }}
        >
          STUDIO OPERATIONS &middot; ROLE-BASED ACCESS
        </p>
        <h1
          className="mt-6 max-w-[1040px] text-[56px] leading-[0.92] sm:text-[72px] lg:text-[88px] xl:text-[96px]"
          style={{ fontFamily: FONT_DISPLAY, color: INK }}
        >
          Choose Your HXVP Workspace
        </h1>
      </div>

      {/* ── Full-bleed lime accent bar ─────────────────────────────────── */}
      <div className="mt-7 h-4 w-full" style={{ background: LIME }} aria-hidden="true" />

      {/* ── Description ────────────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-[1600px] px-6 pt-6 lg:px-10">
        <p className="text-[16px] leading-6" style={{ fontFamily: FONT_INTER, color: INK }}>
          Select the portal that matches your role.
        </p>
      </div>

      {/* ── Portal cards ───────────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-[1600px] px-6 pt-14 lg:px-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4 xl:gap-3">
          {CARDS.map((c) => (
            <PortalCard key={c.n} {...c} />
          ))}
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="mx-auto mt-auto w-full max-w-[1600px] px-6 pb-8 pt-16 lg:px-10">
        <div
          className="flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: GHOST }}
        >
          <span className="flex items-center gap-3">
            <span
              className="h-2 w-2 rounded-[4px]"
              style={{ background: LIME }}
              aria-hidden="true"
            />
            <span
              className="text-[12px] tracking-[0.08em]"
              style={{ fontFamily: FONT_INTER, fontWeight: 600, color: INK }}
            >
              SECURE ROLE-BASED PORTAL
            </span>
          </span>
          <span
            className="flex items-center gap-6 text-[14px]"
            style={{ fontFamily: FONT_INTER, color: INK }}
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
 * NOTE 6 — Hover lift on enterable cards is an added affordance (the static frame
 *   specifies no hover/pressed states).
 */

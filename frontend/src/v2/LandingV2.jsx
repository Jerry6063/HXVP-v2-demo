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
 * The frame is a FIXED 1920×1080 canvas. All exterior card geometry below is
 * PIXEL-MEASURED from a 1920-wide render of Yina's frame (node metadata was wrong
 * twice — it claimed 388px surfaces / 16px gaps / margin 160; the pixels say
 * otherwise). A fixed-px port also overflows real laptops (~790–860px tall at
 * 100%), so the whole page is FLUID:
 *   • TWO measured containers, both centred, because the frame does NOT share one
 *     edge for everything: the text sections (header, hero, lime-bar span,
 *     description, footer) start at design x≈160 → `--content = min(1600px,
 *     84.17vw)` (margin 160); the CARD ROW is a narrower, separately-measured
 *     column — white surfaces span design x 182→1737 → `--cardw = min(1554px,
 *     80.94vw)` (margin 183), i.e. the cards sit ~23px inside the text margin.
 *   • Cards fill --cardw 4-across with a proportional gap (62px at 1920 → the
 *     frame's 404px pitch) and take their height from `aspect-ratio: 342/407`
 *     (measured 342px wide × 407px tall, aspect 0.841 — noticeably more portrait
 *     than the metadata's near-square 388×408). Height is unchanged (~407) so the
 *     vertical rhythm carries over untouched; only width/gap/margin move.
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
const LIME = "#d8ff00"; // button-primary-green — accent bar + footer dot + HOVER surface
const TILE = "#eaffae"; // button-secondary-green — CTA arrow tile (component fill, confirmed)
// Card offset backdrop / sliver. READ FROM THE COMPONENT (node "Lime Offset Shape /
// button-primary-green"): its true paint is button-primary-green #d8ff00 at 25% opacity —
// NOT the opaque pale #f1fbb9 the code sampled off the render. That earlier sample
// (~(232,242,176) top / ~(224,234,172) mid) was this same paint ALREADY darkened by the
// white surface's drop-shadow: #d8ff00@25% over the page (#f7f7f2) → (239,249,182), then
// the surface shadow (rgba(15,20,31,0.16)) over it → the (203–239, 212–249, 158–182)
// gradient the pixels showed. So we now render the component's TRUE fill and let our
// (now component-matched) surface shadow darken the visible sliver. See NOTE 7 / TWEAK 6.
const SHADOW_LIME = "rgba(216, 255, 0, 0.25)"; // #d8ff00 @ 25% — component fill
const GHOST = "#e0e0e0"; // line-default — ghost "01" numbers
const RULE = "#e5e7eb"; // gray-200 — footer divider + card surface stroke (component uses #E5E7EB, NOT line-default)

// Text/section container width (header, hero, lime bar span, description, footer).
// Pixel-measured from Yina's render: the wordmark / eyebrow / title / footer all
// start at design x≈160 at 1920 → a 1600 container (margin 160). Capped at 1600 for
// ≥1900px screens; below that it scales at 84.17vw (1440 → 1212).
const CONTENT = "min(1600px, 84.17vw)";

// Card-row container width — MEASURED SEPARATELY from the text container. Scanline
// pixel measurement of the frame (do NOT trust node metadata: it claimed 388px
// surfaces / 16px gaps / margin 160, all wrong) gives the white card surfaces at
// design x 182→1737 at 1920: four 342px surfaces on a 404px pitch → 62px gaps, a
// 1554px card span centred in 1920 (margin 183). So the cards sit ~23px INSIDE the
// text margin and get their own, narrower centred container. 1554/1920 = 80.94vw,
// capped at the frame's native 1554 for wide screens.
const CARDW = "min(1554px, 80.94vw)";
// Card grid gap as a fraction of CARDW so it tracks the container: 62/1554 = 0.0397.
// With 4 columns this yields card = (CARDW − 3·gap)/4 = 0.2202·CARDW = 342 at 1920.
const CARD_GAP = "calc(var(--cardw) * 0.03970)";

// container-query typography for the card interior, expressed as % of the card's
// own width (cqw). REBASED 388→342 (×388/342 = 1.1345): a pixel comparison of card 1
// against the frame at 1920 showed the frame keeps the interior at its ORIGINAL
// ABSOLUTE px on the real 342-wide surface, so the earlier /388 denominators had
// shrunk everything ~12% (title 42px vs the frame's 48). Denominators are now /342 so
// each interior px lands at the frame value at 1920: title/01 48/342 = 14.035cqw;
// desc 14/342 = 4.093cqw; ENTER 12/342 = 3.509cqw; arrow 16/342 = 4.679cqw; tile
// 45/342 = 13.302cqw × 38/342 = 11.111cqw; offset backdrop 12/342 = 3.509cqw. Small
// text keeps a px floor via clamp() for narrow laptops. Vertical rhythm also rebased,
// with the 01→title gap opened a touch beyond the pure rebase (title marginTop 8.8cqw)
// to match the frame's measured 48px cap-to-cap gap (mismatch b).
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
      {/* lime offset backdrop, ~12px down-right, behind the white surface. Only a thin
          sliver shows past the surface's right/bottom edges (frame: 13px right / 12px
          bottom). Color is the COMPONENT'S true fill — #d8ff00 @ 25% (SHADOW_LIME); the
          surface's drop-shadow darkens the visible sliver onto the frame's gradient
          (see TWEAK 6). Offset 3.509cqw = 12px at the measured 342px card. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: SHADOW_LIME, transform: "translate(3.509cqw, 3.509cqw)" }}
        aria-hidden="true"
      />
      {/* white parallelogram surface. Fill #fff + 1px stroke #e5e7eb, plus a drop shadow
          READ FROM THE COMPONENT: 0/18px offset, 40px blur, −14px spread,
          rgba(15,20,31,0.16) (Figma feDropShadow — the earlier "black @ 25% / 26px blur"
          was a misread). On hover the surface flips white → bright green #d8ff00 with a
          deeper lift shadow (added affordance, NOTE 6) — gated on `group` so only the
          enterable Link (not the inert CLIENT button) turns green. */}
      <div className="pointer-events-none absolute inset-0 box-border border border-[#e5e7eb] bg-white shadow-[0_18px_40px_-14px_rgba(15,20,31,0.16)] transition duration-200 group-hover:bg-[#d8ff00] group-hover:shadow-[0_30px_50px_rgba(0,0,0,0.30)]" />
      {/* content, counter-skewed back to upright. All sizes are cqw (share of the
          card's own width) so they scale 1:1 with the card at any viewport. */}
      <div className="pointer-events-none absolute inset-0 [transform:skewX(6deg)]">
        <div
          className="flex h-full flex-col"
          // Asymmetric padding: left 11.1cqw (≈38px) — the frame insets 01/title/desc
          // ~34px from the surface's left edge, NOT the 7.31cqw (~25px) the symmetric
          // padding gave (measured frame PRODUCTION design-x 221 vs our old 208). Right
          // stays 7.31cqw so the right-aligned ENTER/tile keep matching (frame tile-left
          // 457 ≈ ours). Top 16.9cqw pins "01" centre at design y≈524.
          style={{ padding: "16.9cqw 7.31cqw 2.34cqw 11.1cqw" }}
        >
          {/* The frame staggers the three left edges (component left: 01=66, title=59,
              desc=50 → measured design-x 01≈228, title 221, desc 212): each higher
              element sits ~7-9px further right, echoing the italic lean. Base padding
              places the title; 01 nudges right +7px (2.05cqw), desc left −9px below. */}
          <span
            style={{
              fontFamily: FONT_COND,
              fontStyle: "italic",
              fontWeight: 600,
              color: GHOST,
              fontSize: "14.035cqw",
              lineHeight: 1.05,
              marginLeft: "2.05cqw",
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
              fontSize: "14.035cqw",
              lineHeight: 1.05,
              marginTop: "8.8cqw",
            }}
          >
            {title}
          </span>
          <p
            style={{
              fontFamily: FONT_INTER,
              fontStyle: "italic",
              color: INK,
              fontSize: "clamp(9px, 4.093cqw, 14px)",
              lineHeight: 1.571,
              marginTop: "5.446cqw",
              maxWidth: "78.35cqw",
              marginLeft: "-2.63cqw",
            }}
          >
            {desc}
          </p>
          <span className="mt-auto flex items-center justify-end gap-2">
            {/* ENTER — Inter SemiBold Italic 12px, NO letter-spacing (frame run 38px,
                not the tracked 46px). The italic face (1,600) now ships from index.html;
                before, italic-600 was being synthesised from the 1,400 italic. */}
            <span
              style={{
                fontFamily: FONT_INTER,
                fontStyle: "italic",
                fontWeight: 600,
                color: INK,
                fontSize: "clamp(9px, 3.509cqw, 12px)",
              }}
            >
              ENTER
            </span>
            {/* CTA arrow tile — a PARALLELOGRAM leaning left like the card, per the
                component (node "CTA Arrow Tile", path M5 0H45.5L41 38H0L5 0Z → corners
                TL(5,0) TR(45.5,0) BR(41,38) BL(0,38): bottom edge shifted left, same lean
                as the card). The tile's own path measures ~-7deg (a touch steeper than the
                card's -6.1deg), so we use the COMPONENT's actual value skewX(-7deg). Width
                12cqw≈41px so the skewed horizontal extent lands on the component's 45.5px
                box; the arrow glyph is counter-skewed skewX(7deg) to read upright.
                Non-interactive (the parent Link/button owns the click) — hit/click unchanged. */}
            <span
              className="flex items-center justify-center"
              style={{ background: TILE, width: "12cqw", height: "11.111cqw", transform: "skewX(-7deg)" }}
            >
              <span
                style={{
                  fontFamily: FONT_INTER,
                  fontWeight: 600,
                  color: INK,
                  fontSize: "clamp(11px, 4.679cqw, 16px)",
                  lineHeight: 1,
                  transform: "skewX(7deg)",
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
    // MEASURED card shape: 342px wide × 407px tall at 1920 (aspect 0.841) — much
    // more portrait than the metadata's 388×408 (0.951). Height is essentially
    // unchanged (408→407) so the vertical rhythm is preserved; only the width and
    // therefore the aspect narrow.
    aspectRatio: "342 / 407",
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
      style={{ background: "#f7f7f2", minHeight: "100svh", "--content": CONTENT, "--cardw": CARDW }}
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
        {/* Nav — Figma has NO letter-spacing on either item (text-sm styles,
            letterSpacing 0). The frame separates them by ~137px at 1920 (MAIN SITE
            right edge design 1498 → INTERNAL PORTAL left 1635), a product of Yina's
            fixed 156/260 right-aligned boxes; reproduced here as a --content-scaled
            gap (137/1600 = 0.0856) with INTERNAL PORTAL riding the content right edge. */}
        <nav className="flex items-center" style={{ gap: "calc(var(--content) * 0.0856)" }}>
          <Link
            to="/"
            className="text-[#111827] transition-opacity hover:opacity-60"
            style={{
              fontFamily: FONT_INTER,
              fontWeight: 500,
              fontSize: "clamp(11px, calc(var(--content) * 0.00875), 14px)",
              lineHeight: 1.43,
            }}
          >
            &larr; MAIN SITE
          </Link>
          <span
            className="text-[#111827]"
            style={{
              fontFamily: FONT_INTER,
              fontWeight: 600,
              fontSize: "clamp(11px, calc(var(--content) * 0.00875), 14px)",
              lineHeight: 1.43,
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
          // paddingTop opened 60→73 so the eyebrow lands where Yina centres it inside
          // its 40px box (glyph centre design y≈176) instead of ~10px high. The title
          // marginTop closes and the lime marginTop opens by the matching amounts
          // (below), so the whole header→lime-bar block spans the same total height —
          // nothing below the lime bar shifts (laptop-fit preserved).
          paddingTop: "clamp(31px, calc(var(--content) * 0.045625), 73px)",
        }}
      >
        {/* Eyebrow — Inter SemiBold 12/16, NO letter-spacing (text-xs/semibold,
            letterSpacing 0; measured frame run width 261px, not the tracked 318px). */}
        <p
          style={{
            fontFamily: FONT_INTER,
            fontWeight: 600,
            color: INK,
            fontSize: "clamp(10px, calc(var(--content) * 0.0075), 12px)",
            lineHeight: 1.3333,
          }}
        >
          STUDIO OPERATIONS &middot; ROLE-BASED ACCESS
        </p>
        <h1
          style={{
            fontFamily: FONT_DISPLAY,
            color: INK,
            fontSize: "clamp(40px, calc(var(--content) * 0.06), 96px)",
            // lineHeight 0.92 is deliberate: Figma's 64px leading is trimmed
            // (text-box-trim) to cap height, and 0.92 reproduces the frame's cap-top
            // (design y≈225) / baseline (≈295) on a single line — pixel-verified.
            lineHeight: 0.92,
            maxWidth: "calc(var(--content) * 0.66)",
            // eyebrow→title gap. Sized so the title CAP lands at the frame's design
            // y≈225 (element top 216, cap sits +9 inside the 0.92 line box): 96 header
            // + 73 pad + 16 eyebrow + 31 = 216. Pixel-verified cap-top/baseline.
            marginTop: "clamp(15px, calc(var(--content) * 0.019375), 31px)",
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
          // title→lime gap opened to keep the lime bar pinned at frame y=316 after the
          // title moved up 4px above (title bottom 304 + 12 = 316).
          marginTop: "clamp(7px, calc(var(--content) * 0.0075), 12px)",
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

      {/* ── Portal cards ───────────────────────────────────────────────────
          Own container (--cardw = 1554 at 1920, margin 183) — NARROWER than the
          text container (--content), matching the measured card span. Gap is a
          fraction of --cardw (62px at 1920) so the four 342px surfaces reproduce
          the frame's 404px pitch. */}
      <div className="mx-auto w-full" style={{ width: "var(--cardw)" }}>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
          style={{ gap: CARD_GAP }}
        >
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
            borderColor: RULE,
            paddingTop: "clamp(22px, calc(var(--content) * 0.0234), 37.5px)",
          }}
        >
          <span className="flex items-center gap-3">
            <span
              className="h-2 w-2 rounded-[4px]"
              style={{ background: LIME }}
              aria-hidden="true"
            />
            {/* SECURE — Inter SemiBold 12/16, NO letter-spacing (frame run 176px,
                not the tracked 201px). */}
            <span
              style={{
                fontFamily: FONT_INTER,
                fontWeight: 600,
                color: INK,
                fontSize: "clamp(10px, calc(var(--content) * 0.0075), 12px)",
                lineHeight: 1.3333,
              }}
            >
              SECURE ROLE-BASED PORTAL
            </span>
          </span>
          <span
            className="flex items-center"
            style={{
              fontFamily: FONT_INTER,
              color: INK,
              fontSize: "clamp(11px, calc(var(--content) * 0.00875), 14px)",
              // frame separates the three segments by ~22px (Yina's 5-space runs),
              // not gap-6's 24px; scaled off --content (22/1600 = 0.01375).
              gap: "calc(var(--content) * 0.01375)",
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
 * NOTE 4 — Colors now READ FROM THE COMPONENT fills (not the render). Every colored
 *   element was checked against Yina's component SVG paths / node fills:
 *     • page bg #f7f7f2 (bg-lime-50) · wordmark/nav/eyebrow/title/subtitle/card
 *       title/desc/ENTER/arrow/footer texts all #111827 · "01" ghost #e0e0e0
 *       (line-default) — all already matched, unchanged.
 *     • accent bar: Vector 1 stroke #d8ff00 @ 0.5 opacity — confirmed, unchanged.
 *     • CTA arrow tile: #eaffae (button-secondary-green) — CONFIRMED by the tile's
 *       own SVG fill, unchanged.
 *     • footer dot #d8ff00 — confirmed, unchanged.
 *     • CHANGED to match the component: lime offset sliver #d8ff00 @ 25% (was opaque
 *       #f1fbb9 — see TWEAK 6); footer divider + card surface stroke #e5e7eb (was
 *       #e0e0e0 — the component uses gray-200 for rules, NOT the line-default token);
 *       surface drop shadow rgba(15,20,31,0.16) 0/18/40/−14 (was black @ 25% / 26px).
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
 * NOTE 7 — Card geometry is PIXEL-MEASURED from a 1920 render, NOT node metadata
 *   (the component reported 388×408 / 16px gap / margin 160 — all wrong, and it had
 *   misled the team twice). A horizontal scanline at the card mid-height (skew ≈ 0
 *   there) classifying white-surface / lime / background runs, plus a white-count
 *   row profile for the top/bottom edges, gives at the 1920 design reference:
 *     white surface 342 × 407 (aspect 0.841) · surface-to-surface gap 62 · pitch
 *     404 · card row design x 182→1737, span 1554, centred → margin 183 · card row
 *     top y ≈ 440, bottom y ≈ 847. (Text sections measure at margin 160 separately.)
 *   Interior type/padding are ALSO pixel-measured now (see the CARDS comment + TWEAK 6):
 *   the frame keeps the interior at its original absolute px on the real 342 surface, so
 *   the cqw denominators are /342 (title/01 48px, desc 14px, ENTER 12px, arrow 16px,
 *   tile 45×38px, side padding ~25px, offset backdrop 12px), reproducing the frame's
 *   card-1 interior to ≤3px at 1920. Surface drop shadow is now the COMPONENT'S own
 *   Figma effect — 0/18px offset, 40px blur, −14px spread, rgba(15,20,31,0.16) — plus a
 *   1px #e5e7eb stroke; top lime divider #d8ff00 @ 50% opacity — preserved.
 *
 * TWEAK 6 — Card offset sliver IS #d8ff00, at 25% opacity (CORRECTED from the component).
 *   The component node "Lime Offset Shape / button-primary-green" has fill #d8ff00 with
 *   fill-opacity 0.25 — the saturated brand tone IS the sliver's paint, just at low alpha.
 *   The earlier reading (opaque pale #f1fbb9) mistook the SHADOWED render for the paint:
 *   the pixel sample (~(232,242,176) top / ~(224,234,172) mid) is #d8ff00@25% composited
 *   over the page (#f7f7f2 → (239,249,182)) and then darkened by the surface's drop-shadow.
 *   We now set SHADOW_LIME = rgba(216,255,0,0.25) (the true fill) and let the (also
 *   component-matched) surface shadow reproduce that gradient over the visible sliver.
 *   The ENTER tile stays the paler #eaffae (button-secondary-green) — a different token.
 *
 * NOTE 8 — Single-viewport fit. The frame is a fixed 1920×1080 artboard; ported at
 *   fixed px it overflowed real laptops (~790–860px tall at 100%). The page is now
 *   fluid (see the header comment): a `--content` container drives the text sections
 *   and a separate narrower `--cardw` drives the card row; cards derive height from
 *   aspect-ratio 342/407 (measured), interior type scales via cqw, and
 *   vertical rhythm reproduces the frame's y-list via `--content`-scaled top-block
 *   gaps plus the 75 : 148.5 flex-grow spacers around the card row (footer rides the
 *   lower spacer to the viewport bottom). Result is a faithful scaling of Yina's
 *   frame — same proportions AND the same vertical distribution, no redesign — that
 *   fits 1440×790 / 1512×860 / 1280×700 without vertical scroll, pixel-matches the
 *   frame's section y-positions at 1920×1080, and spreads extra height on taller
 *   viewports in the frame's ratio. Confirm the fluid behaviour with Yina; the frame
 *   itself remains the fixed-canvas source of truth.
 */

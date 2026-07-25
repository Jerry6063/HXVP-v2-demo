/**
 * AuthV2 — HXVP v2 auth flow (4 frames, 1:1 from Yina's Figma file vuZ77RgLUVtzfJKAhb1EEX).
 *
 *   [1] /v2/login          — split: gateway hero (left) + SIGN IN card (right)
 *   [2] /v2/create-account — centered CREATE ACCOUNT card (identity, no password)
 *   [3] /v2/check-email     — centered CHECK YOUR EMAIL card (link sent; no button)
 *   [4] /v2/verified        — centered EMAIL VERIFIED! card (set + confirm password)
 *
 * All four share the gateway chrome (header wordmark + nav, footer) — the SAME
 * constants as LandingV2 (imported below), with nav item 2 = "ALL PORTALS" on
 * auth pages (vs the gateway's "INTERNAL PORTAL"). Geometry is pixel-measured
 * from the 1920 renders and reconciled against get_metadata canvas coords:
 *
 *   ── card model (spec §3, closes to every frame's exact card height) ──
 *   card 440px · 1px #e4e4e7 · radius 8 · shadow 0/1/3 .10 + 0/1/2 .06 ·
 *   padding 32 · flex-col gap 24 · lime offset sliver #d8ff00@25% at +20x/+30y.
 *   input block 64px = label(Inter Med 14/20) + 4px gap + field(40px, r6, #e4e4e7);
 *   stacked pitch 88 = 64 + 24. primary button #d8ff00 h40 r8.
 *   header blocks: login 106 (SIGN IN 36 + 18 + [Welcome 28 + 4 + sub 20]);
 *   create/verified 74; check-email 102. Card heights: 456 / 510 / 254 / 378.
 *   check-email uses 12px bottom padding (Figma sized its body box to 1 line → 254).
 *
 * Two inks coexist (spec §2): shell chrome #111827 vs card-component #09090b;
 * muted #71717a. Titles: League Gothic 48/lh36 tracking 1.92 (wdth 100).
 *
 * FIDELITY: uses only the components Yina drew — social "OR CONTINUE WITH" +
 * providers stay ABSENT (hidden in every frame, spec §3/§10 FLAG 10); login has
 * NO create-account link; check-email has NO resend + NO primary button (only
 * "Wrong email? Go back"); no invented hover/focus (spec §8 — none designed),
 * only cursor-pointer on real links/controls. Copy-slips are corrected per repo
 * convention (NOT copied verbatim): email "example@gmail.com" (no stray space,
 * FLAG 1), body gains the missing period (FLAG 2), and the verified greeting uses
 * the DYNAMIC {firstName} from the create form, fallback "there" (FLAG 4) — never
 * the hardcoded "Yina".
 *
 * Laptop fit: cards are fixed-px (small) and stay pixel-exact; only the shell
 * scales with --content. Vertical placement uses LandingV2's flex-grow spacer
 * pattern (frame top:bottom ratios) so cards land at the frame y at 1920×1080 and
 * compress proportionally on shorter viewports — no scroll at 1440×790.
 */
import { useState } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { INK, LIME, SHADOW_LIME, RULE, FONT_INTER, FONT_DISPLAY, CONTENT } from "./LandingV2";

// ── Card-component tokens (distinct from the #111827 shell chrome) ───────────
const CARD_INK = "#09090b"; // fg-default — card text
const MUTED = "#71717a"; // fg-muted
const STROKE = "#e4e4e7"; // Border/default — input + card stroke (NOT the shell's #e5e7eb rule)
const CARD_SHADOW = "0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)"; // Shadows/shadow
const WDTH = '"wdth" 100'; // League Gothic default width axis

// ── Portal context (?portal=) ───────────────────────────────────────────────
// name = hero title · label = create/verified context line · sub = login card
// sub-sentence tail · home = login/verified destination (client has none).
const PORTALS = {
  production: { name: "PRODUCTION", label: "Production Portal", sub: "production operations", home: "/production-v2" },
  talent: { name: "TALENT", label: "Talent Portal", sub: "talent operations", home: "/talent-v2" },
  crew: { name: "CREW", label: "Crew Portal", sub: "crew operations", home: "/crew-v2" },
  client: { name: "CLIENT", label: "Client Portal", sub: "client operations", home: null },
};
// Portal list shown on the login left column (spec §4), in frame order 01–04.
const PORTAL_LIST = [
  ["production", "01 PRODUCTION"],
  ["client", "02 CLIENT"],
  ["talent", "03 TALENT"],
  ["crew", "04 CREW"],
];

function usePortal() {
  const [params] = useSearchParams();
  const key = params.get("portal");
  return PORTALS[key] ? key : "production";
}

// ── Shared shell — gateway header + footer, page body between ─────────────────
function Shell({ children }) {
  return (
    <div
      className="v2-root flex w-full flex-col overflow-x-hidden text-[#111827]"
      style={{ background: "#f7f7f2", minHeight: "100svh", "--content": CONTENT }}
    >
      {/* Header — identical to LandingV2, nav item 2 swapped to "ALL PORTALS". */}
      <header
        className="mx-auto flex w-full items-center justify-between"
        style={{
          width: "var(--content)",
          marginTop: "clamp(16px, calc(var(--content) * 0.02), 32px)",
          height: "clamp(40px, calc(var(--content) * 0.04), 64px)",
        }}
      >
        <Link
          to="/"
          className="transition-opacity hover:opacity-60"
          style={{ fontFamily: FONT_DISPLAY, color: INK, fontSize: "clamp(16px, calc(var(--content) * 0.015), 24px)", lineHeight: 1, fontVariationSettings: WDTH }}
        >
          HXVP / STUDIO
        </Link>
        <nav className="flex items-center" style={{ gap: "calc(var(--content) * 0.0856)" }}>
          <Link
            to="/"
            className="text-[#111827] transition-opacity hover:opacity-60"
            style={{ fontFamily: FONT_INTER, fontWeight: 500, fontSize: "clamp(11px, calc(var(--content) * 0.00875), 14px)", lineHeight: 1.43 }}
          >
            &larr; MAIN SITE
          </Link>
          <span
            className="text-[#111827]"
            style={{ fontFamily: FONT_INTER, fontWeight: 600, fontSize: "clamp(11px, calc(var(--content) * 0.00875), 14px)", lineHeight: 1.43 }}
          >
            ALL PORTALS
          </span>
        </nav>
      </header>

      {children}

      {/* Footer — identical to LandingV2. */}
      <footer
        className="mx-auto w-full"
        style={{ width: "var(--content)", paddingBottom: "clamp(16px, calc(var(--content) * 0.015), 24px)" }}
      >
        <div
          className="flex flex-col gap-4 border-t sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: RULE, paddingTop: "clamp(22px, calc(var(--content) * 0.0234), 37.5px)" }}
        >
          <span className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-[4px]" style={{ background: LIME }} aria-hidden="true" />
            <span style={{ fontFamily: FONT_INTER, fontWeight: 600, color: INK, fontSize: "clamp(10px, calc(var(--content) * 0.0075), 12px)", lineHeight: 1.3333 }}>
              SECURE ROLE-BASED PORTAL
            </span>
          </span>
          <span
            className="flex items-center"
            style={{ fontFamily: FONT_INTER, color: INK, fontSize: "clamp(11px, calc(var(--content) * 0.00875), 14px)", gap: "calc(var(--content) * 0.01375)" }}
          >
            <span>Need access? Contact admin</span>
            <span className="cursor-pointer underline-offset-4 hover:underline">Privacy</span>
            <span className="cursor-pointer underline-offset-4 hover:underline">Support</span>
          </span>
        </div>
      </footer>
    </div>
  );
}

// ── Auth card: white surface + lime offset sliver (+20x/+30y), spec §3 ────────
function AuthCard({ children, padBottom = 32 }) {
  return (
    <div className="relative" style={{ width: 440 }}>
      {/* lime offset sliver — same size as the card, low-right. Absolute inset-0
          + translate matches the card box exactly at any height. */}
      <div className="pointer-events-none absolute inset-0" style={{ background: SHADOW_LIME, transform: "translate(20px, 30px)" }} aria-hidden="true" />
      <div
        className="relative flex flex-col"
        style={{
          width: 440,
          boxSizing: "border-box",
          background: "#ffffff",
          border: `1px solid ${STROKE}`,
          borderRadius: 8,
          boxShadow: CARD_SHADOW,
          padding: `32px 32px ${padBottom}px 32px`,
          gap: 24,
          overflow: "clip",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// League Gothic card title — 48/lh36, tracking 1.92, wdth 100.
function CardTitle({ children, align = "left" }) {
  return (
    <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 400, fontSize: 48, lineHeight: "36px", letterSpacing: "1.92px", color: CARD_INK, fontVariationSettings: WDTH, textAlign: align, margin: 0 }}>
      {children}
    </h1>
  );
}

// Input block — 64px (label 20 + 4 gap + field 40). grow => flex:1 (name row).
function Field({ label, type = "text", placeholder = "", value, onChange, autoComplete, grow = false }) {
  return (
    <div className="flex flex-col" style={{ gap: 4, flex: grow ? "1 1 0" : undefined, minWidth: 0 }}>
      <label style={{ fontFamily: FONT_INTER, fontWeight: 500, fontSize: 14, lineHeight: "20px", color: CARD_INK }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full outline-none placeholder:text-[#71717a]"
        style={{ boxSizing: "border-box", height: 40, borderRadius: 6, border: `1px solid ${STROKE}`, background: "#ffffff", padding: "0 12px", fontFamily: FONT_INTER, fontWeight: 400, fontSize: 14, lineHeight: "20px", color: CARD_INK }}
      />
    </div>
  );
}

// Primary button — #d8ff00, h40, r8, Inter Medium 14/20 ink.
function PrimaryButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center justify-center outline-none"
      style={{ height: 40, borderRadius: 8, background: LIME, border: "none", padding: "0 16px", fontFamily: FONT_INTER, fontWeight: 500, fontSize: 14, lineHeight: "20px", color: CARD_INK }}
    >
      {children}
    </button>
  );
}

// Muted weight-only "link" — SemiBold on the same #71717a as its lead-in (spec
// §9.5): NO distinct link color, NO invented hover. cursor-pointer only.
function WeightLink({ children, onClick, to }) {
  const style = { fontFamily: FONT_INTER, fontWeight: 600, fontSize: 14, lineHeight: "20px", color: MUTED, cursor: "pointer" };
  if (to) return <Link to={to} style={style}>{children}</Link>;
  return <span onClick={onClick} style={style}>{children}</span>;
}

// Card+sliver centered on the viewport, vertically placed by frame ratios.
// translateX(-10px) centers the card+sliver visual mass (sliver overhangs +20 right).
function CenteredCard({ topRatio, botRatio, children }) {
  return (
    <>
      <div aria-hidden="true" style={{ flex: `${topRatio} 0 0` }} />
      <div className="flex w-full justify-center">
        <div style={{ transform: "translateX(-10px)" }}>{children}</div>
      </div>
      <div aria-hidden="true" style={{ flex: `${botRatio} 0 0` }} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// [1] LOGIN — split layout
// ═══════════════════════════════════════════════════════════════════════════
export function LoginV2() {
  const portal = usePortal();
  const p = PORTALS[portal];
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const enter = () => {
    // Mock: no field validation. Route to the portal home (client has none).
    if (p.home) nav(p.home);
  };

  return (
    <Shell>
      {/* frame row top ≈ eyebrow y316; card bottom y780 → ratios 220 : 216.5 */}
      <div aria-hidden="true" style={{ flex: "220 0 0" }} />
      <div className="mx-auto flex w-full items-start justify-between" style={{ width: "var(--content)" }}>
        {/* ── LEFT: hero column ── */}
        <div className="flex flex-col" style={{ maxWidth: "calc(var(--content) * 0.4375)" }}>
          <p style={{ fontFamily: FONT_INTER, fontWeight: 600, color: INK, fontSize: "clamp(10px, calc(var(--content) * 0.0075), 12px)", lineHeight: 1.3333 }}>
            STUDIO OPERATIONS &middot; ROLE-BASED ACCESS
          </p>
          <h1
            style={{
              fontFamily: FONT_DISPLAY,
              color: INK,
              fontSize: "clamp(40px, calc(var(--content) * 0.06), 96px)",
              lineHeight: 0.667,
              fontVariationSettings: WDTH,
              margin: 0,
              marginTop: "clamp(26px, calc(var(--content) * 0.033125), 53px)",
            }}
          >
            {p.name}
          </h1>
          <p
            style={{
              fontFamily: FONT_INTER,
              fontWeight: 500,
              color: MUTED,
              fontSize: "clamp(13px, calc(var(--content) * 0.01), 16px)",
              lineHeight: 1.5,
              margin: 0,
              marginTop: "clamp(18px, calc(var(--content) * 0.021875), 35px)",
              maxWidth: "calc(var(--content) * 0.4375)",
            }}
          >
            Sign in to manage productions, talent, crew, call sheets, budgets, invoices, approvals, and project operations from one role-based workspace.
          </p>
          <div
            className="opacity-50"
            style={{ background: LIME, height: "clamp(9px, calc(var(--content) * 0.01), 16px)", width: "calc(var(--content) * 0.4375)", marginTop: "clamp(15px, calc(var(--content) * 0.01875), 30px)" }}
            aria-hidden="true"
          />
          <div className="flex flex-wrap" style={{ marginTop: "clamp(17px, calc(var(--content) * 0.02125), 34px)", gap: "calc(var(--content) * 0.04)" }}>
            {PORTAL_LIST.map(([key, label]) => (
              <Link
                key={key}
                to={`/v2/login?portal=${key}`}
                style={{ fontFamily: FONT_INTER, fontWeight: 600, fontSize: "clamp(15px, calc(var(--content) * 0.01125), 18px)", lineHeight: 1.556, color: key === portal ? CARD_INK : MUTED, whiteSpace: "nowrap" }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── RIGHT: SIGN IN card — frame x1200 → right edge 120px inside content ── */}
        <div style={{ marginRight: "calc(var(--content) * 0.075)", marginTop: 8 }}>
          <AuthCard>
            {/* header block 106 = title36 + gap18 + [welcome28 + gap4 + sub20] */}
            <div className="flex flex-col items-start" style={{ gap: 18 }}>
              <CardTitle align="left">SIGN IN</CardTitle>
              <div className="flex flex-col" style={{ gap: 4 }}>
                <p style={{ fontFamily: FONT_INTER, fontWeight: 500, fontSize: 18, lineHeight: "28px", color: CARD_INK, margin: 0 }}>Welcome back!</p>
                <p style={{ fontFamily: FONT_INTER, fontWeight: 400, fontSize: 14, lineHeight: "20px", color: MUTED, margin: 0 }}>Use your credentials to access {p.sub}.</p>
              </div>
            </div>
            <Field label="Email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            <Field label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            {/* Form options row h22 justify-between */}
            <div className="flex items-center justify-between" style={{ height: 22 }}>
              <label className="flex cursor-pointer items-center" style={{ gap: 8 }}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="cursor-pointer appearance-none"
                  style={{ width: 16, height: 16, borderRadius: 8, border: `1px solid ${STROKE}`, background: remember ? LIME : "#ffffff" }}
                />
                <span style={{ fontFamily: FONT_INTER, fontWeight: 400, fontSize: 14, lineHeight: "20px", color: CARD_INK }}>Remember me</span>
              </label>
              {/* Forgot password — static link (no target in this frame set). */}
              <span className="cursor-pointer" style={{ fontFamily: FONT_INTER, fontWeight: 400, fontSize: 14, lineHeight: "20px", color: CARD_INK }}>Forgot password?</span>
            </div>
            <PrimaryButton onClick={enter}>ENTER PORTAL</PrimaryButton>
          </AuthCard>
        </div>
      </div>
      <div aria-hidden="true" style={{ flex: "216.5 0 0" }} />
    </Shell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// [2] CREATE ACCOUNT — centered, identity only (no password)
// ═══════════════════════════════════════════════════════════════════════════
export function CreateAccountV2() {
  const portal = usePortal();
  const p = PORTALS[portal];
  const nav = useNavigate();
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const submit = () => {
    const em = email.trim() || "example@gmail.com";
    const firstName = first.trim();
    // Session-only carry for the passwordless flow (check-email + verified).
    sessionStorage.setItem("hxvp_auth", JSON.stringify({ email: em, firstName, portal }));
    nav(`/v2/check-email?portal=${portal}`, { state: { email: em, firstName } });
  };

  return (
    <Shell>
      {/* card y270→780 → ratios 174 : 216.5 */}
      <CenteredCard topRatio={174} botRatio={216.5}>
        <AuthCard>
          {/* header 74 = title36 + gap18 + label20 */}
          <div className="flex flex-col items-center" style={{ gap: 18 }}>
            <CardTitle align="center">CREATE ACCOUNT</CardTitle>
            <p style={{ fontFamily: FONT_INTER, fontWeight: 400, fontSize: 14, lineHeight: "20px", color: MUTED, margin: 0, textAlign: "center" }}>{p.label}</p>
          </div>
          <div className="flex" style={{ gap: 24 }}>
            <Field label="First Name" value={first} onChange={(e) => setFirst(e.target.value)} autoComplete="given-name" grow />
            <Field label="Last Name" value={last} onChange={(e) => setLast(e.target.value)} autoComplete="family-name" grow />
          </div>
          <Field label="Email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <Field label="Phone (optional)" type="tel" placeholder="+1(555)000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
          <PrimaryButton onClick={submit}>Create Account</PrimaryButton>
          <p style={{ fontFamily: FONT_INTER, fontWeight: 400, fontSize: 14, lineHeight: "20px", color: MUTED, margin: 0, textAlign: "center" }}>
            Already have an account? <WeightLink to={`/v2/login?portal=${portal}`}>Sign in</WeightLink>
          </p>
        </AuthCard>
      </CenteredCard>
    </Shell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// [3] CHECK YOUR EMAIL — no button, only "Go back"
// ═══════════════════════════════════════════════════════════════════════════
export function CheckEmailV2() {
  const portal = usePortal();
  const nav = useNavigate();
  const loc = useLocation();
  let stored = {};
  try { stored = JSON.parse(sessionStorage.getItem("hxvp_auth")) || {}; } catch { stored = {}; }
  // Corrected copy: "example@gmail.com" (NO stray space — FLAG 1).
  const email = loc.state?.email || stored.email || "example@gmail.com";

  return (
    <Shell>
      {/* card y378→632 → ratios 282 : 364.5 · body sized to 254 via 12px bottom pad */}
      <CenteredCard topRatio={282} botRatio={364.5}>
        <AuthCard padBottom={12}>
          {/* header 102 = title36 + gap18 + [line1 20 + gap8 + email 20] */}
          <div className="flex flex-col items-center" style={{ gap: 18 }}>
            <CardTitle align="center">CHECK YOUR EMAIL</CardTitle>
            <div className="flex flex-col items-center" style={{ gap: 8 }}>
              <p style={{ fontFamily: FONT_INTER, fontWeight: 400, fontSize: 14, lineHeight: "20px", color: MUTED, margin: 0, textAlign: "center" }}>We sent a verification link to</p>
              <p style={{ fontFamily: FONT_INTER, fontWeight: 600, fontSize: 14, lineHeight: "20px", color: CARD_INK, margin: 0, textAlign: "center" }}>{email}</p>
            </div>
          </div>
          <p style={{ fontFamily: FONT_INTER, fontWeight: 400, fontSize: 14, lineHeight: "20px", color: MUTED, margin: 0, textAlign: "center" }}>
            Wrong email? <WeightLink onClick={() => nav(`/v2/create-account?portal=${portal}`)}>Go back</WeightLink>
          </p>
          {/* Corrected copy: trailing period added (FLAG 2). */}
          <p style={{ fontFamily: FONT_INTER, fontWeight: 400, fontSize: 14, lineHeight: "20px", color: MUTED, margin: 0, textAlign: "center" }}>
            Click the link to set your password and activate your account. The link expires in 24 hours.
          </p>
        </AuthCard>
      </CenteredCard>
    </Shell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// [4] EMAIL VERIFIED — set + confirm password → portal home
// ═══════════════════════════════════════════════════════════════════════════
export function VerifiedV2() {
  const nav = useNavigate();
  const loc = useLocation();
  const [params] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  let stored = {};
  try { stored = JSON.parse(sessionStorage.getItem("hxvp_auth")) || {}; } catch { stored = {}; }
  // Reached out-of-band (the email link has no query), so portal falls back to the
  // session-stored context (set at create), then default — unlike login/create
  // which are strictly ?portal=-driven.
  const qp = params.get("portal");
  const portal = PORTALS[qp] ? qp : PORTALS[stored.portal] ? stored.portal : "production";
  const p = PORTALS[portal];
  // Dynamic first name — NEVER the hardcoded "Yina" (FLAG 4). Fallback "there".
  const firstName = params.get("name") || loc.state?.firstName || stored.firstName || "there";

  const activate = () => {
    // Mock: no validation. Activate + sign in → portal home (client has none → gateway).
    nav(p.home || "/v2");
  };

  return (
    <Shell>
      {/* card y350→728 → ratios 254 : 268.5 */}
      <CenteredCard topRatio={254} botRatio={268.5}>
        <AuthCard>
          {/* header 74 = title36 + gap18 + greeting20 */}
          <div className="flex flex-col items-center" style={{ gap: 18 }}>
            <CardTitle align="center">EMAIL VERIFIED!</CardTitle>
            {/* Single line to match the frame (card height 378). Figma budgeted one
                line for this greeting; nowrap keeps short names (the create-form
                first name, fallback "there") on one line as designed. */}
            <p style={{ fontFamily: FONT_INTER, fontWeight: 400, fontSize: 14, lineHeight: "20px", color: MUTED, margin: 0, textAlign: "center", whiteSpace: "nowrap" }}>Welcome, {firstName}, set a password to activate your account.</p>
          </div>
          <Field label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          <Field label="Confirm Password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
          <PrimaryButton onClick={activate}>Set password and Sign In</PrimaryButton>
        </AuthCard>
      </CenteredCard>
    </Shell>
  );
}

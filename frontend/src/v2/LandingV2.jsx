/**
 * LandingV2 — HXVP v2 portal selector (route /v2).
 *
 * No Figma frame exists for this; designed in-system in the LIGHT v2 style.
 * Centered HXVP wordmark + "Choose your portal" subline, then four portal cards
 * in a responsive grid. Two live portals (Production, Talent) link out and carry
 * a lime accent + hover ring; two (Client, Crew) are disabled with a
 * "Coming soon" badge. Wrapped in `.v2-root` on a warm off-white full-height bg,
 * NO sidebar.
 */
import { Link } from "react-router-dom";
import {
  LayoutGrid,
  Star,
  MessageSquare,
  HardHat,
  ArrowRight,
} from "lucide-react";

const PORTALS = [
  {
    name: "Production Portal",
    desc: "Run projects, talents, call sheets and finances",
    to: "/production-v2",
    icon: LayoutGrid,
    live: true,
  },
  {
    name: "Talent Portal",
    desc: "Your bookings, availability, time logs and invoices",
    to: "/talent-v2",
    icon: Star,
    live: true,
  },
  {
    name: "Client Portal",
    desc: "Submit requests, track progress, review and approve",
    icon: MessageSquare,
    live: false,
  },
  {
    name: "Crew Portal",
    desc: "Your bookings, call sheets and time logs",
    icon: HardHat,
    live: false,
  },
];

function PortalCard({ name, desc, to, icon: Icon, live }) {
  const inner = (
    <>
      <div className="flex items-start justify-between">
        <div
          className={`flex size-11 items-center justify-center rounded-lg ${
            live ? "bg-[#eaffae] text-neutral-900" : "bg-neutral-100 text-neutral-400"
          }`}
        >
          <Icon className="size-5" />
        </div>
        {live ? (
          <ArrowRight className="size-5 text-neutral-300 transition-colors group-hover:text-neutral-900" />
        ) : (
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-500">
            Coming soon
          </span>
        )}
      </div>
      <div className="mt-5">
        <div className="text-lg font-semibold text-neutral-900">{name}</div>
        <p className="mt-1 text-sm text-neutral-500">{desc}</p>
      </div>
    </>
  );

  const base =
    "group block rounded-xl border border-neutral-200 bg-white p-6 text-left transition-all";

  if (live) {
    return (
      <Link
        to={to}
        className={`${base} hover:-translate-y-0.5 hover:border-[#d8ff00] hover:ring-2 hover:ring-[#d8ff00]/40 hover:shadow-sm`}
      >
        {inner}
      </Link>
    );
  }
  return (
    <div className={`${base} cursor-not-allowed opacity-70`} aria-disabled="true">
      {inner}
    </div>
  );
}

export default function LandingV2() {
  return (
    <div className="v2-root min-h-screen bg-[#f7f7f2] text-neutral-900">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16">
        <div className="text-center">
          <div className="font-display text-6xl uppercase tracking-tight leading-none sm:text-7xl">
            HXVP
          </div>
          <p className="mt-3 text-base text-neutral-500">Choose your portal</p>
        </div>

        <div className="mt-12 grid w-full grid-cols-1 gap-5 sm:grid-cols-2">
          {PORTALS.map((p) => (
            <PortalCard key={p.name} {...p} />
          ))}
        </div>
      </div>
    </div>
  );
}

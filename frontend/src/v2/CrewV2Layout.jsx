/**
 * CrewV2Layout — light-theme sidebar shell for the CREW PORTAL (crew-facing).
 *
 * Structurally cloned from TalentV2Layout.jsx (same `.v2-root` scoping + nav
 * pattern) but with the crew sidebar:
 *   - brand: HXVP + "Crew Portal"
 *   - three nav groups: Overview / Production / Finance
 *   - lime (#eaffae) active-nav tint; user chip = Xinyi (x@example.com)
 *
 * Nav items WITHOUT a design yet (Messages) navigate to
 * /crew-v2/coming-soon?section=<name> which renders CrewComingSoon. Items WITH
 * pages route to real crew-portal screens (Dashboard, Bookings, Call Sheets,
 * Time Log, Invoices).
 *
 * Additive preview only; wraps everything in `.v2-root` so shadcn light tokens
 * apply here without touching the legacy dark pages.
 */
import { Link, NavLink, useLocation, useSearchParams } from "react-router-dom";
import {
  LayoutGrid,
  ClipboardList,
  FileText,
  MessageCircleMore,
  Clock,
  ReceiptText,
  ChevronsUpDown,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn/avatar";
import { Toaster } from "@/components/shadcn/sonner";
import { CREW_PROFILE } from "./mockData";

/* Items with `to` route to a real page. Items with `section` are not designed
 * yet and route to the shared /crew-v2/coming-soon page. */
const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { to: "/crew-v2", label: "Dashboard", icon: LayoutGrid, end: true },
    ],
  },
  {
    label: "Production",
    items: [
      { to: "/crew-v2/bookings", label: "Bookings", icon: ClipboardList },
      { to: "/crew-v2/call-sheets", label: "Call Sheets", icon: FileText },
      { section: "Messages", label: "Messages", icon: MessageCircleMore },
    ],
  },
  {
    label: "Finance",
    items: [
      { to: "/crew-v2/time-log", label: "Time Log", icon: Clock },
      { to: "/crew-v2/invoices", label: "Invoices", icon: ReceiptText },
    ],
  },
];

function NavItem({ to, section, label, icon: Icon, end, activeSection }) {
  const base =
    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors";
  const activeCls = "bg-[#eaffae] text-neutral-900";
  const idleCls = "text-neutral-600 hover:bg-neutral-100";

  // Undesigned section items all share the /crew-v2/coming-soon path and differ
  // only by ?section=, so NavLink's pathname-based isActive can't tell them
  // apart. Resolve active state from the ?section= query param instead.
  if (section) {
    const isActive = activeSection === section;
    return (
      <NavLink
        to={`/crew-v2/coming-soon?section=${encodeURIComponent(section)}`}
        className={`${base} ${isActive ? activeCls : idleCls}`}
      >
        <Icon className="size-4 shrink-0" />
        {label}
      </NavLink>
    );
  }

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `${base} ${isActive ? activeCls : idleCls}`
      }
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </NavLink>
  );
}

export default function CrewV2Layout({ children }) {
  const location = useLocation();
  const [params] = useSearchParams();
  // Only meaningful on /crew-v2/coming-soon; null elsewhere so no section item
  // highlights on real pages.
  const activeSection =
    location.pathname === "/crew-v2/coming-soon"
      ? params.get("section")
      : null;
  return (
    <div className="v2-root flex min-h-screen bg-neutral-50 text-neutral-900">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-neutral-200 bg-white">
        <Link
          to="/v2"
          aria-label="Back to portal selector"
          className="block px-5 pt-6 pb-4 transition-opacity hover:opacity-70"
        >
          <div className="font-display text-2xl tracking-tight leading-none">
            HXVP
          </div>
          <div className="text-xs text-neutral-500 mt-1">Crew Portal</div>
        </Link>
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="px-3 pb-1.5 text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItem key={item.label} {...item} activeSection={activeSection} />
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-neutral-200 p-3">
          <button className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-neutral-100">
            <Avatar className="size-9 rounded-md">
              <AvatarImage src={CREW_PROFILE.avatar} alt={CREW_PROFILE.chipName} />
              <AvatarFallback className="rounded-md">
                {CREW_PROFILE.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">
                {CREW_PROFILE.chipName}
              </div>
              <div className="truncate text-xs text-neutral-500">
                {CREW_PROFILE.chipEmail}
              </div>
            </div>
            <ChevronsUpDown className="size-4 text-neutral-400" />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main key={location.pathname} className="flex-1 min-w-0">
        {children}
      </main>

      <Toaster richColors position="top-right" />
    </div>
  );
}

/**
 * CrewComingSoon — placeholder page for crew-portal nav items with no design yet
 * (Messages). Mirrors TalentComingSoon; reads ?section= for the heading and
 * renders inside CrewV2Layout so the sidebar stays consistent.
 * Route: /crew-v2/coming-soon.
 */
export function CrewComingSoon() {
  const [params] = useSearchParams();
  const section = params.get("section") || "This section";

  return (
    <CrewV2Layout>
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-xl bg-[#eaffae] text-neutral-900">
          <Clock className="size-6" />
        </div>
        <h1 className="mt-6 font-display text-4xl uppercase tracking-tight leading-none">
          {section}
        </h1>
        <p className="mt-3 max-w-md text-sm text-neutral-500">
          This part of the Crew Portal is coming soon. Check back shortly — it is
          on the way.
        </p>
        <span className="mt-6 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500">
          Coming soon
        </span>
      </div>
    </CrewV2Layout>
  );
}

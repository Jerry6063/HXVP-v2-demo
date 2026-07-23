/**
 * TalentV2Layout — light-theme sidebar shell for the TALENT PORTAL (model-facing).
 *
 * Structurally modeled on V2Layout.jsx (same `.v2-root` scoping + pattern) but
 * with the Talent sidebar from the wf4 dash/profile/edit specs:
 *   - brand: HXVP + "Talent Portal"
 *   - three nav groups: Overview / Production / Finance
 *   - lime (#eaffae) active-nav tint; user chip = Maya (m@example.com)
 *
 * Nav items WITHOUT a design yet (Bookings, Calendar, Documents, Messages,
 * Revenue) navigate to /talent-v2/coming-soon?section=<name> which renders the
 * TalentComingSoon page. Items WITH pages route to real talent-portal screens.
 *
 * NOTE: the Figma source spells the third group label "Finanace" — corrected to
 * "Finance" here (flagged to team). "Calendar" uses a Star icon verbatim per spec.
 *
 * Additive preview only; wraps everything in `.v2-root` so shadcn light tokens
 * apply here without touching the legacy dark pages.
 */
import { Link, NavLink, useLocation, useSearchParams } from "react-router-dom";
import {
  LayoutGrid,
  CircleUser,
  ClipboardList,
  Star,
  Files,
  MessageCircleMore,
  Clock,
  DollarSign,
  ReceiptText,
  ChevronsUpDown,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn/avatar";
import { Toaster } from "@/components/shadcn/sonner";
import { TALENT_PROFILE } from "./mockData";
import {
  sbAsideStyle,
  sbWordmarkStyle,
  sbNavStyle,
  sbGroupsStyle,
  sbLabelStyle,
  sbItemsStyle,
  sbNavItemStyle,
  sbIconStyle,
  sbChipWrapStyle,
  sbChipBtnStyle,
} from "./sidebarSizing";

const LIME = "#d8ff00";

/* Items with `to` route to a real page. Items with `section` are not designed
 * yet and route to the shared /talent-v2/coming-soon page. */
const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { to: "/talent-v2", label: "Dashboard", icon: LayoutGrid, end: true },
      { to: "/talent-v2/profile", label: "Profile", icon: CircleUser },
    ],
  },
  {
    label: "Production",
    items: [
      { section: "Bookings", label: "Bookings", icon: ClipboardList },
      { section: "Calendar", label: "Calendar", icon: Star },
      { section: "Documents", label: "Documents", icon: Files },
      { section: "Messages", label: "Messages", icon: MessageCircleMore },
    ],
  },
  {
    // Figma source misspells this "Finanace"; corrected to "Finance" (flagged).
    label: "Finance",
    items: [
      { to: "/talent-v2/time-log", label: "Time Log", icon: Clock },
      { section: "Revenue", label: "Revenue", icon: DollarSign },
      { to: "/talent-v2/invoices", label: "Invoices", icon: ReceiptText },
    ],
  },
];

function NavItem({ to, section, label, icon: Icon, end, activeSection }) {
  const base =
    "flex items-center gap-2.5 rounded-md px-3 font-medium transition-colors";
  const activeCls = "bg-[#eaffae] text-neutral-900";
  const idleCls = "text-neutral-600 hover:bg-neutral-100";

  // Undesigned section items all share the /talent-v2/coming-soon path and
  // differ only by ?section=, so NavLink's pathname-based isActive can't tell
  // them apart. Resolve active state from the ?section= query param instead.
  if (section) {
    const isActive = activeSection === section;
    return (
      <NavLink
        to={`/talent-v2/coming-soon?section=${encodeURIComponent(section)}`}
        style={sbNavItemStyle}
        className={`${base} ${isActive ? activeCls : idleCls}`}
      >
        <Icon style={sbIconStyle} className="shrink-0" />
        <span className="min-w-0 flex-1 truncate whitespace-nowrap">{label}</span>
      </NavLink>
    );
  }

  return (
    <NavLink
      to={to}
      end={end}
      style={sbNavItemStyle}
      className={({ isActive }) =>
        `${base} ${isActive ? activeCls : idleCls}`
      }
    >
      <Icon style={sbIconStyle} className="shrink-0" />
      <span className="min-w-0 flex-1 truncate whitespace-nowrap">{label}</span>
    </NavLink>
  );
}

export default function TalentV2Layout({ children }) {
  const location = useLocation();
  const [params] = useSearchParams();
  // Only meaningful on /talent-v2/coming-soon; null elsewhere so no section
  // item highlights on real pages.
  const activeSection =
    location.pathname === "/talent-v2/coming-soon"
      ? params.get("section")
      : null;
  return (
    <div className="v2-root flex min-h-screen bg-neutral-50 text-neutral-900">
      {/* Sidebar */}
      <aside
        style={sbAsideStyle}
        className="hidden md:flex shrink-0 self-start sticky top-0 h-svh flex-col border-r border-neutral-200 bg-white"
      >
        <Link
          to="/v2"
          aria-label="Back to portal selector"
          style={sbWordmarkStyle}
          className="block shrink-0 px-5 transition-opacity hover:opacity-70"
        >
          <div className="font-display text-2xl tracking-tight leading-none">
            HXVP
          </div>
          <div className="text-xs text-neutral-500 mt-1">Talent Portal</div>
        </Link>
        <nav
          style={sbNavStyle}
          className="flex-1 min-h-0 overflow-y-auto px-3"
        >
          <div style={sbGroupsStyle}>
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <div
                  style={sbLabelStyle}
                  className="px-3 font-medium uppercase tracking-wide text-neutral-400"
                >
                  {group.label}
                </div>
                <div style={sbItemsStyle}>
                  {group.items.map((item) => (
                    <NavItem
                      key={item.label}
                      {...item}
                      activeSection={activeSection}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>
        <div style={sbChipWrapStyle} className="shrink-0 border-t border-neutral-200">
          <button
            style={sbChipBtnStyle}
            className="flex w-full items-center gap-3 rounded-md px-2 text-left hover:bg-neutral-100"
          >
            <Avatar className="size-9 rounded-md">
              <AvatarImage src={TALENT_PROFILE.avatar} alt={TALENT_PROFILE.chipName} />
              <AvatarFallback className="rounded-md">MA</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">
                {TALENT_PROFILE.chipName}
              </div>
              <div className="truncate text-xs text-neutral-500">
                {TALENT_PROFILE.chipEmail}
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

export { LIME };

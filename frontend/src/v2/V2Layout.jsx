/**
 * V2Layout — light-theme sidebar shell shared by all "v2 preview" screens.
 *
 * Additive preview only. Faithful to /tmp/hxvp_desktop.png:
 *   - left sidebar: HXVP logo + "Production Portal"; grouped nav; bottom user.
 *   - lime (#D8FF00) accent for primary actions + active-nav tint.
 *   - wraps everything in `.v2-root` so shadcn tokens + light bg apply here
 *     only, leaving the legacy dark pages untouched.
 */
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  PlusCircle,
  ClipboardList,
  Star,
  Users,
  Mail,
  UserRound,
  HardHat,
  DollarSign,
  Clock,
  ReceiptText,
  ChevronsUpDown,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn/avatar";
import { Toaster } from "@/components/shadcn/sonner";
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

const LIME = "#D8FF00";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { to: "/production-v2", label: "Dashboard", icon: LayoutGrid, end: true },
      { to: "/production-v2/new-project", label: "New Project", icon: PlusCircle },
    ],
  },
  {
    label: "Production",
    items: [
      { to: "/production-v2/active-projects", label: "Active Projects", icon: ClipboardList },
      { to: "/production-v2/talents", label: "Talents", icon: Star },
      { to: "#", label: "Production Crew", icon: Users },
    ],
  },
  {
    label: "Messages",
    items: [
      {
        to: "/production-v2/messages/clients",
        label: "Clients Messages",
        icon: Mail,
      },
      {
        to: "/production-v2/messages/talents",
        label: "Talents Messages",
        icon: UserRound,
      },
      {
        to: "/production-v2/messages/crew",
        label: "Crew Messages",
        icon: HardHat,
      },
    ],
  },
  {
    label: "Finance",
    items: [
      { to: "/production-v2/time-log", label: "Time Log", icon: Clock },
      { to: "#", label: "Revenue & Expenses", icon: DollarSign },
      { to: "/production-v2/invoices", label: "Invoices", icon: ReceiptText },
    ],
  },
];

function NavItem({ to, label, icon: Icon, end }) {
  const isStub = to === "#";
  const base =
    "flex items-center gap-2.5 rounded-md px-3 font-medium transition-colors";
  if (isStub) {
    return (
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        style={sbNavItemStyle}
        className={`${base} text-neutral-600 hover:bg-neutral-100`}
      >
        <Icon style={sbIconStyle} className="shrink-0" />
        <span className="min-w-0 flex-1 truncate whitespace-nowrap">{label}</span>
      </a>
    );
  }
  return (
    <NavLink
      to={to}
      end={end}
      style={sbNavItemStyle}
      className={({ isActive }) =>
        `${base} ${
          isActive
            ? "bg-[#eaffae] text-neutral-900"
            : "text-neutral-600 hover:bg-neutral-100"
        }`
      }
    >
      <Icon style={sbIconStyle} className="shrink-0" />
      <span className="min-w-0 flex-1 truncate whitespace-nowrap">{label}</span>
    </NavLink>
  );
}

export default function V2Layout({ children }) {
  const location = useLocation();
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
          <div className="text-xs text-neutral-500 mt-1">Production Portal</div>
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
                    <NavItem key={item.label} {...item} />
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
              <AvatarImage src="https://i.pravatar.cc/100?img=68" alt="Shadcn" />
              <AvatarFallback className="rounded-md">SC</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">Shadcn</div>
              <div className="truncate text-xs text-neutral-500">
                m@example.com
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

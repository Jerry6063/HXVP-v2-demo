import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTalentProfiles, useProjects, useCrewProfiles, useBookings, useContracts, useInvoices, useProjectRequests } from '../api/hooks';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  FolderIcon,
  ChevronDownIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
  ArrowRightStartOnRectangleIcon,
  PlusCircleIcon,
  ClockIcon,
  PhotoIcon,
  ChatBubbleLeftIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  CalendarDaysIcon,
  FilmIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  DocumentDuplicateIcon,
  CameraIcon,
  ChartBarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

/**
 * PortalLayout v2.1 — 对齐导演认可的 demo
 *
 *  - 全黑底
 *  - 侧栏分组:OVERVIEW / PRODUCTION / PORTALS / FINANCE
 *  - 每项可显示数字徽章
 *  - 顶部 + New Project 快速操作 (production portal)
 *  - Portals 段落显示其他 portal 的入口
 *  - 底部头像 + 角色 + Sign Out
 */

/* ────────────────────────────────────────────────────────────────────────────
   Portal 配置 —— 用 sections 数组替代之前的 flat nav。
   每个 section 有 title + items 数组。
   item 可有 `badgeKey` 指明从哪个 hook 拉数字徽章。
   ──────────────────────────────────────────────────────────────────────────── */

const portalConfigs = {
  production: {
    title: 'Production',
    subtitle: 'Production Portal',
    number: '01',
    sections: [
      {
        title: 'Overview',
        items: [
          { name: 'Dashboard', to: '/production/dashboard', icon: HomeIcon },
          { name: 'New Project', to: '/production/projects?new=1', icon: PlusCircleIcon, accent: true },
        ],
      },
      {
        title: 'Production',
        items: [
          { name: 'Active Projects', to: '/production/projects', icon: FolderIcon, badgeKey: 'activeProjects', dropdown: true },
          { name: 'Models & Talent', to: '/production/talent', icon: UsersIcon, badgeKey: 'talentCount' },
          { name: 'Shoot Day Tracker', to: '/production/calendar', icon: CameraIcon },
          { name: 'Production Crew', to: '/production/crew', icon: WrenchScrewdriverIcon, badgeKey: 'crewCount' },
          { name: 'Calendar', to: '/production/calendar', icon: CalendarDaysIcon },
          { name: 'Documents', to: '/production/documents', icon: DocumentDuplicateIcon },
          { name: 'Messages', to: '/production/messages', icon: ChatBubbleLeftRightIcon },
        ],
      },
      {
        title: 'Portals',
        items: [
          { name: 'Client Portal', to: '/client/login', icon: UserIcon, external: true },
          { name: 'Model Portal', to: '/talent/login', icon: UserCircleIcon, external: true },
        ],
      },
      {
        title: 'Finance',
        items: [
          { name: 'Revenue & Expenses', to: '/production/revenue', icon: ChartBarIcon },
          { name: 'Client Payments', to: '/production/invoices', icon: CreditCardIcon, badgeKey: 'overdueInvoices' },
          { name: 'Payroll', to: '/production/talent-payments', icon: BanknotesIcon },
        ],
      },
    ],
  },
  client: {
    title: 'Client',
    subtitle: 'Client Portal',
    number: '02',
    sections: [
      {
        title: 'Overview',
        items: [
          { name: 'Dashboard', to: '/client/dashboard', icon: HomeIcon },
          { name: 'New Request', to: '/client/request', icon: PlusCircleIcon, accent: true },
        ],
      },
      {
        title: 'Production',
        items: [
          { name: 'Production', to: '/client/production', icon: FilmIcon },
          { name: 'Deliverables', to: '/client/deliverables', icon: PhotoIcon },
          { name: 'Talent Roster', to: '/client/talent', icon: UsersIcon },
          { name: 'Messages', to: '/client/messages', icon: ChatBubbleLeftIcon },
        ],
      },
      {
        title: 'Finance',
        items: [
          { name: 'Invoices & Payments', to: '/client/payments', icon: CreditCardIcon },
        ],
      },
    ],
  },
  talent: {
    title: 'Model',
    subtitle: 'Model Portal',
    number: '03',
    sections: [
      {
        title: 'Overview',
        items: [
          { name: 'Dashboard', to: '/talent/dashboard', icon: HomeIcon },
          { name: 'My Profile', to: '/talent/profile', icon: UserCircleIcon },
        ],
      },
      {
        title: 'Work',
        items: [
          { name: 'Bookings', to: '/talent/bookings', icon: CalendarDaysIcon },
          { name: 'Calendar', to: '/talent/calendar', icon: CalendarIcon },
          { name: 'Records', to: '/talent/records', icon: FilmIcon },
        ],
      },
      {
        title: 'Finance',
        items: [
          { name: 'Payments', to: '/talent/payments', icon: BanknotesIcon },
        ],
      },
    ],
  },
  crew: {
    title: 'Crew',
    subtitle: 'Crew Portal',
    number: '04',
    sections: [
      {
        title: 'Overview',
        items: [
          { name: 'Dashboard', to: '/crew/dashboard', icon: HomeIcon },
          { name: 'My Profile', to: '/crew/profile', icon: UserCircleIcon },
        ],
      },
      {
        title: 'Work',
        items: [
          { name: 'Assignments', to: '/crew/assignments', icon: ClipboardDocumentListIcon },
          { name: 'Calendar', to: '/crew/calendar', icon: CalendarIcon },
          { name: 'Records', to: '/crew/records', icon: ClockIcon },
        ],
      },
      {
        title: 'Finance',
        items: [
          { name: 'Payments', to: '/crew/payments', icon: BanknotesIcon },
          { name: 'Reimbursements', to: '/crew/reimbursements', icon: CreditCardIcon },
        ],
      },
    ],
  },
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  Hook: counts for sidebar badges                                           */
/* ────────────────────────────────────────────────────────────────────────── */

function useSidebarBadges(portal) {
  const { mockMode } = useAuth();

  const isProd = portal === 'production';
  const { data: projData } = useProjects(isProd ? { status: 'active' } : null);
  const { data: talentData } = useTalentProfiles(isProd ? null : null);
  const { data: crewData } = useCrewProfiles(isProd ? null : null);
  const { data: invoicesData } = useInvoices(isProd ? null : null);

  if (!isProd) return {};

  const projects = projData?.results || projData || [];
  const talent = talentData?.results || talentData || [];
  const crew = crewData?.results || crewData || [];
  const invoices = invoicesData?.results || invoicesData || [];

  const today = new Date().toISOString().slice(0, 10);
  const overdueInvoices = invoices.filter((i) => i.status !== 'paid' && i.due_date && i.due_date < today);

  // Demo mode 时给数字,接真数据时显示真实
  const demoMode = mockMode && projects.length === 0;

  return {
    activeProjects: demoMode ? 4 : projects.length || null,
    talentCount: demoMode ? 12 : talent.length || null,
    crewCount: demoMode ? 14 : crew.length || null,
    overdueInvoices: demoMode ? 2 : overdueInvoices.length || null,
  };
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Main Layout                                                               */
/* ────────────────────────────────────────────────────────────────────────── */

export default function PortalLayout({ portal }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const config = portalConfigs[portal];
  const badges = useSidebarBadges(portal);

  const handleLogout = () => {
    logout();
    navigate(`/${portal}/login`);
  };

  return (
    <div className="min-h-screen bg-[var(--color-paper-dark)] text-[var(--color-paper)]">
      {/* ── Mobile sidebar overlay ─────────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/80" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-[var(--color-paper-dark)] text-[var(--color-paper)] border-r border-white/10 flex flex-col">
            <SidebarHeader config={config} onClose={() => setSidebarOpen(false)} mobile />
            <SidebarNav config={config} badges={badges} portal={portal} />
            <SidebarFooter user={user} portal={portal} onLogout={handleLogout} />
          </div>
        </div>
      )}

      {/* ── Desktop sidebar ────────────────────────────────────────── */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col bg-[var(--color-paper-dark)] text-[var(--color-paper)] border-r border-white/10 z-30">
        <SidebarHeader config={config} />
        <div className="flex-1 overflow-y-auto">
          <SidebarNav config={config} badges={badges} portal={portal} />
        </div>
        <SidebarFooter user={user} portal={portal} onLogout={handleLogout} />
      </aside>

      {/* ── Main content ───────────────────────────────────────────── */}
      <div className="lg:pl-64">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-20 flex items-center gap-4 bg-[var(--color-paper-dark)] text-[var(--color-paper)] px-4 py-3 lg:hidden border-b border-white/10">
          <button onClick={() => setSidebarOpen(true)} className="hover:text-[var(--color-brand)] transition-colors">
            <Bars3Icon className="h-6 w-6" />
          </button>
          <span className="font-display text-xl leading-none">
            HXVP <span className="text-[var(--color-brand)]">/</span> {config.title.toUpperCase()}
          </span>
        </div>

        <main className="p-6 md:p-8 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Sidebar Header                                                            */
/* ────────────────────────────────────────────────────────────────────────── */

function SidebarHeader({ config, onClose, mobile }) {
  return (
    <div className="px-5 pt-6 pb-4 border-b border-white/10">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex flex-col gap-0.5 hover:opacity-80 transition-opacity">
          <span className="font-display text-2xl tracking-wide leading-none">HXVP</span>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[var(--color-paper)]/40">
            {config.subtitle}
          </span>
        </Link>
        {mobile && (
          <button onClick={onClose} className="hover:text-[var(--color-brand)] transition-colors">
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Sidebar Nav (grouped sections)                                            */
/* ────────────────────────────────────────────────────────────────────────── */

function SidebarNav({ config, badges, portal }) {
  return (
    <nav className="py-4 px-2 space-y-6">
      {config.sections.map((section) => (
        <div key={section.title}>
          <p className="px-3 mb-1.5 text-[9px] uppercase tracking-[0.3em] text-[var(--color-paper)]/30 font-medium">
            {section.title}
          </p>
          <div className="space-y-px">
            {section.items.map((item) =>
              item.dropdown && portal === 'production' ? (
                <ProductionsNavItem
                  key={item.to}
                  item={item}
                  badge={badges?.[item.badgeKey]}
                />
              ) : (
                <NavItem
                  key={item.to}
                  item={item}
                  badge={badges?.[item.badgeKey]}
                />
              ),
            )}
          </div>
        </div>
      ))}
    </nav>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Nav items                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

function navItemClasses(isActive, accent) {
  if (accent) {
    return 'relative flex items-center gap-3 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-[var(--color-paper)]/70 hover:text-[var(--color-brand)] transition-colors';
  }
  return `relative flex items-center gap-3 px-3 py-2 text-[11px] uppercase tracking-[0.18em] transition-colors ${
    isActive
      ? 'text-[var(--color-brand)] bg-[var(--color-brand)]/[0.08]'
      : 'text-[var(--color-paper)]/70 hover:text-[var(--color-paper)] hover:bg-white/[0.03]'
  }`;
}

function ActiveBar({ active }) {
  return (
    <span
      className={`absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--color-brand)] transition-opacity ${
        active ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );
}

function Badge({ value }) {
  if (value == null || value === 0) return null;
  return (
    <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-[18px] px-1.5 bg-[var(--color-brand)] text-[var(--color-ink)] text-[10px] font-bold leading-none">
      {value}
    </span>
  );
}

function NavItem({ item, badge }) {
  if (item.external) {
    // Cross-portal links: 视觉一致但不算 active
    return (
      <Link to={item.to} className={navItemClasses(false, false)}>
        <item.icon className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1 truncate">{item.name}</span>
        <span className="text-[var(--color-paper)]/30 text-xs">↗</span>
      </Link>
    );
  }
  return (
    <NavLink to={item.to} className={({ isActive }) => navItemClasses(isActive, item.accent)}>
      {({ isActive }) => (
        <>
          {!item.accent && <ActiveBar active={isActive} />}
          <item.icon className={`h-4 w-4 flex-shrink-0 ${item.accent ? 'text-[var(--color-brand)]' : ''}`} />
          <span className="flex-1 truncate">{item.name}</span>
          <Badge value={badge} />
        </>
      )}
    </NavLink>
  );
}

function matchesNavTarget(location, targetTo) {
  const target = new URL(targetTo, 'http://localhost');
  if (target.search) {
    return location.pathname === target.pathname && location.search === target.search;
  }
  return location.pathname === target.pathname || location.pathname.startsWith(`${target.pathname}/`);
}

function ProductionsNavItem({ item, badge }) {
  const location = useLocation();
  const { data } = useProjects({ status: 'active' });
  const projects = data?.results || data || [];
  const isActive = matchesNavTarget(location, item.to);
  const [open, setOpen] = useState(isActive);

  return (
    <div>
      <div className="flex items-stretch">
        <Link to={item.to} className={`flex-1 ${navItemClasses(isActive)}`}>
          <ActiveBar active={isActive} />
          <item.icon className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1 truncate">{item.name}</span>
          <Badge value={badge} />
        </Link>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setOpen((v) => !v);
          }}
          className="px-2 text-[var(--color-paper)]/40 hover:text-[var(--color-brand)] transition-colors"
          aria-label={`Toggle ${item.name} menu`}
        >
          <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {open && projects.length > 0 && (
        <div className="ml-7 mt-0.5 space-y-px py-1 border-l border-white/10 pl-3">
          {projects.slice(0, 5).map((project) => (
            <NavLink
              key={project.id}
              to={`/production/projects/${project.id}`}
              className={({ isActive: a }) =>
                `block px-2 py-1 text-[10px] uppercase tracking-[0.15em] truncate transition-colors ${
                  a ? 'text-[var(--color-brand)]' : 'text-[var(--color-paper)]/60 hover:text-[var(--color-paper)]'
                }`
              }
            >
              {project.name}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Sidebar Footer (user + sign out)                                          */
/* ────────────────────────────────────────────────────────────────────────── */

function SidebarFooter({ user, portal, onLogout }) {
  return (
    <div className="px-3 py-3 border-t border-white/10">
      {portal === 'talent' ? (
        <TalentUserCard user={user} />
      ) : (
        <div className="flex items-center gap-2.5 px-2 py-1.5 mb-2">
          <div className="w-9 h-9 bg-[var(--color-brand)] text-[var(--color-ink)] flex items-center justify-center text-xs font-bold tracking-wider flex-shrink-0">
            {user?.first_name?.[0]?.toUpperCase() || '?'}
            {user?.last_name?.[0]?.toUpperCase() || ''}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-[var(--color-paper)] truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-paper)]/40 truncate">
              {portalConfigs[portal]?.subtitle || 'User'}
            </p>
          </div>
        </div>
      )}
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-2 px-3 py-2 text-[10px] uppercase tracking-[0.25em] text-[var(--color-paper)]/50 hover:text-[var(--color-brand)] hover:bg-white/[0.03] transition-colors"
      >
        <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
        Sign Out
      </button>
    </div>
  );
}

function TalentUserCard({ user }) {
  const { data: profilesData } = useTalentProfiles();
  const profiles = profilesData?.results || profilesData || [];
  const profile = profiles.find((p) => p.user?.id === user?.id);
  const photo = profile?.primary_photo;

  return (
    <div className="flex items-center gap-2.5 px-2 py-1.5 mb-2">
      {photo ? (
        <img
          src={photo}
          alt="headshot"
          className="w-9 h-9 object-cover border border-[var(--color-brand)]/50 flex-shrink-0"
        />
      ) : (
        <div className="w-9 h-9 bg-[var(--color-brand)] text-[var(--color-ink)] flex items-center justify-center text-xs font-bold flex-shrink-0">
          {user?.first_name?.[0]?.toUpperCase() || '?'}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-[var(--color-paper)] truncate">
          {user?.first_name} {user?.last_name}
        </p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-paper)]/40 truncate">
          Model
        </p>
      </div>
    </div>
  );
}

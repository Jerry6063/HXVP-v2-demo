import { Fragment, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMyTalentProfile, useProjects } from '../api/hooks';
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
  InboxIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  CalendarDaysIcon,
  FilmIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CreditCardIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';

const portalConfigs = {
  production: {
    title: 'Production Portal',
    color: 'indigo',
    nav: [
      { name: 'Dashboard', to: '/production/dashboard', icon: HomeIcon },
      { name: 'Productions', to: '/production/projects', icon: FolderIcon, dropdown: true },
      { name: 'Calendar', to: '/production/calendar', icon: CalendarDaysIcon },
      { name: 'Talents', to: '/production/talent', icon: UsersIcon },
      { name: 'Talent Payments', to: '/production/talent-payments', icon: CurrencyDollarIcon },
      { name: 'Production Crew', to: '/production/crew', icon: WrenchScrewdriverIcon },
      { name: 'Documents', to: '/production/documents', icon: DocumentDuplicateIcon },
      { name: 'Client Payments', to: '/production/invoices', icon: CreditCardIcon },
      { name: 'Messages', to: '/production/messages', icon: ChatBubbleLeftRightIcon },
    ],
  },
  client: {
    title: 'Client Portal',
    color: 'emerald',
    nav: [
      { name: 'Dashboard', to: '/client/dashboard', icon: HomeIcon },
      { name: 'Production Request', to: '/client/request', icon: PlusCircleIcon },
      { name: 'Timeline', to: '/client/timeline', icon: ClockIcon },
      { name: 'Deliverables', to: '/client/deliverables', icon: PhotoIcon },
      { name: 'Invoices & Payments', to: '/client/payments', icon: CreditCardIcon },
      { name: 'Talent Roster', to: '/client/talent', icon: UsersIcon },
      { name: 'Messages', to: '/client/messages', icon: ChatBubbleLeftIcon },
    ],
  },
  talent: {
    title: 'Talent Portal',
    color: 'amber',
    nav: [
      { name: 'Dashboard', to: '/talent/dashboard', icon: HomeIcon },
      { name: 'My Profile', to: '/talent/profile', icon: UserCircleIcon },
      { name: 'Bookings', to: '/talent/bookings', icon: CalendarDaysIcon },
      { name: 'Calendar', to: '/talent/calendar', icon: CalendarIcon },
      { name: 'Records', to: '/talent/records', icon: FilmIcon },
      { name: 'Payments', to: '/talent/payments', icon: BanknotesIcon },
      { name: 'Documents', to: '/talent/documents', icon: DocumentTextIcon },
    ],
  },
  crew: {
    title: 'Crew Portal',
    color: 'sky',
    nav: [
      { name: 'Dashboard', to: '/crew/dashboard', icon: HomeIcon },
      { name: 'My Profile', to: '/crew/profile', icon: UserCircleIcon },
      { name: 'Calendar', to: '/crew/calendar', icon: CalendarIcon },
      { name: 'Assignments', to: '/crew/assignments', icon: ClipboardDocumentListIcon },
      { name: 'Payments', to: '/crew/payments', icon: BanknotesIcon },
      { name: 'Reimbursements', to: '/crew/reimbursements', icon: CreditCardIcon },
      { name: 'Documents', to: '/crew/documents', icon: DocumentTextIcon },
    ],
  },
};

export default function PortalLayout({ portal }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const config = portalConfigs[portal];

  const handleLogout = () => {
    logout();
    navigate(`/${portal}/login`);
  };

  const colorMap = {
    indigo: 'bg-indigo-700',
    emerald: 'bg-emerald-700',
    amber: 'bg-amber-700',
    sky: 'bg-sky-700',
  };

  const activeColorMap = {
    indigo: 'bg-indigo-800 text-white',
    emerald: 'bg-emerald-800 text-white',
    amber: 'bg-amber-800 text-white',
    sky: 'bg-sky-800 text-white',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600/75" onClick={() => setSidebarOpen(false)} />
          <div className={`fixed inset-y-0 left-0 z-50 w-64 ${colorMap[config.color]} text-white`}>
            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-lg font-bold">{config.title}</span>
              <button onClick={() => setSidebarOpen(false)}>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <SidebarNav config={config} activeColor={activeColorMap[config.color]} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col ${colorMap[config.color]}`}>
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex items-center px-6 py-5">
            <span className="text-xl font-bold text-white">{config.title}</span>
          </div>
          <SidebarNav config={config} activeColor={activeColorMap[config.color]} />
          <div className="mt-auto px-4 py-4 border-t border-white/20">
            {portal === 'talent' ? (
              <TalentUserInfo user={user} />
            ) : (
              <div className="text-sm text-white/80 mb-2">
                {user?.first_name} {user?.last_name}
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-10 flex items-center gap-4 bg-white shadow px-4 py-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Bars3Icon className="h-6 w-6 text-gray-700" />
          </button>
          <span className="font-semibold text-gray-800">{config.title}</span>
        </div>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function ProductionsNavItem({ item, activeColor }) {
  const [open, setOpen] = useState(false);
  const { data } = useProjects({ status: 'active' });
  const projects = data?.results || data || [];

  return (
    <div>
      {/* Row: NavLink (left) + chevron toggle (right) */}
      <div className="flex items-center rounded-lg overflow-hidden">
        <NavLink
          to={item.to}
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors flex-1 ${
              isActive ? activeColor : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`
          }
        >
          <item.icon className="h-5 w-5 flex-shrink-0" />
          {item.name}
        </NavLink>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="px-2 py-2.5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Show active productions"
        >
          <ChevronDownIcon
            className={`h-4 w-4 transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* Dropdown list */}
      {open && (
        <div className="ml-8 mt-0.5 space-y-0.5">
          {projects.length === 0 ? (
            <p className="px-3 py-1.5 text-xs text-white/40 italic">No active productions</p>
          ) : (
            projects.map((p) => (
              <NavLink
                key={p.id}
                to={`/production/projects/${p.id}`}
                className={({ isActive }) =>
                  `block px-3 py-1.5 rounded-lg text-xs font-medium truncate transition-colors ${
                    isActive ? activeColor : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {p.name}
              </NavLink>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function SidebarNav({ config, activeColor }) {
  return (
    <nav className="flex-1 px-3 space-y-1">
      {config.nav.map((item) =>
        item.dropdown ? (
          <ProductionsNavItem key={item.to} item={item} activeColor={activeColor} />
        ) : (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? activeColor : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {item.name}
          </NavLink>
        )
      )}
    </nav>
  );
}
function TalentUserInfo({ user }) {
  const { data: profile } = useMyTalentProfile();
  const photo = profile?.primary_photo;

  return (
    <div className="flex items-center gap-2 mb-2">
      {photo ? (
        <img
          src={photo}
          alt="headshot"
          className="w-8 h-8 rounded-full object-cover ring-2 ring-white/30 flex-shrink-0"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ring-2 ring-white/30">
          {user?.first_name?.[0]?.toUpperCase() || '?'}
        </div>
      )}
      <span className="text-sm text-white/80 truncate">{user?.first_name} {user?.last_name}</span>
    </div>
  );
}
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  useProductionStats,
  useProjects,
  useInvoices,
  useShoots,
  useShoot,
} from '../../api/hooks';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  FolderIcon,
  CurrencyDollarIcon,
  CameraIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  ClockIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline';

// ─── Upcoming Shoots Panel ────────────────────────────────────────────────────

function DetailField({ label, value, span }) {
  return (
    <div className={span ? 'sm:col-span-2' : ''}>
      <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wide mb-0.5">{label}</p>
      <p className="text-gray-700 text-sm">{value}</p>
    </div>
  );
}

function PersonChip({ name, sub, status, color, href }) {
  const bg = color === 'indigo' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700';
  const inner = (
    <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1 border border-gray-200 text-xs hover:border-indigo-300 hover:shadow-sm transition-all">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${bg}`}>
        {name[0]}
      </div>
      <span className="font-medium text-gray-800">{name}</span>
      {sub && <span className="text-gray-400 capitalize">{sub?.replace(/_/g, ' ')}</span>}
      <StatusBadge status={status} />
    </div>
  );
  if (href) return <Link to={href}>{inner}</Link>;
  return inner;
}

function ShootRow({ shoot }) {
  const [expanded, setExpanded] = useState(false);
  const { data: detail, isLoading } = useShoot(expanded ? shoot.id : null);
  const dateObj = new Date(shoot.shoot_date + 'T00:00:00');

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <div className="text-center min-w-[44px]">
            <p className="text-[10px] text-gray-400 uppercase font-semibold leading-none">
              {dateObj.toLocaleDateString('en-US', { month: 'short' })}
            </p>
            <p className="text-2xl font-bold text-gray-900 leading-tight">
              {dateObj.getDate()}
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{shoot.location}</p>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <ClockIcon className="h-3 w-3 flex-shrink-0" />
              {shoot.call_time}
              {shoot.est_wrap_time ? ` – ${shoot.est_wrap_time}` : ''}
              {shoot.project_name && (
                <span className="ml-1 text-indigo-500 font-medium">· {shoot.project_name}</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={shoot.status} />
          {expanded ? (
            <ChevronUpIcon className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 space-y-4">
          {isLoading ? (
            <div className="py-4 flex justify-center"><LoadingSpinner /></div>
          ) : !detail ? null : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {detail.address && <DetailField label="Address" value={detail.address} />}
                {detail.description && <DetailField label="Description" value={detail.description} span />}
                {detail.wardrobe_instructions && <DetailField label="Wardrobe" value={detail.wardrobe_instructions} />}
                {detail.hair_makeup_notes && <DetailField label="Hair & Makeup" value={detail.hair_makeup_notes} />}
                {detail.comments && <DetailField label="Comments" value={detail.comments} span />}
              </div>

              {detail.bookings?.length > 0 && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide mb-2">
                    Talent &middot; {detail.bookings.length}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {detail.bookings.map((b) => (
                      <PersonChip key={b.id} name={b.talent_name} sub={b.talent_type} status={b.status} color="indigo" href={b.talent_id ? `/production/talent/${b.talent_id}` : undefined} />
                    ))}
                  </div>
                </div>
              )}

              {detail.crew_assignments?.length > 0 && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide mb-2">
                    Crew &middot; {detail.crew_assignments.length}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {detail.crew_assignments.map((a) => (
                      <PersonChip key={a.id} name={a.crew_name} sub={a.role_display} status={a.status} color="amber" href={a.crew_id ? `/production/crew/${a.crew_id}` : undefined} />
                    ))}
                  </div>
                </div>
              )}

              <Link
                to={`/production/projects/${detail.project}`}
                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Open Project →
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function UpcomingShootsPanel({ onClose }) {
  const { data: shootsData, isLoading } = useShoots({ upcoming: true });
  const shoots = (shootsData?.results || shootsData || []).slice().sort((a, b) => {
    const dA = `${a.shoot_date}T${a.call_time}`;
    const dB = `${b.shoot_date}T${b.call_time}`;
    return dA < dB ? -1 : dA > dB ? 1 : 0;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CameraIcon className="h-5 w-5 text-amber-500" />
          <h2 className="font-semibold text-gray-900">Upcoming Shoots</h2>
          {!isLoading && (
            <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
              {shoots.length}
            </span>
          )}
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
          <XMarkIcon className="h-5 w-5 text-gray-400" />
        </button>
      </div>
      <div className="p-4 space-y-2 max-h-[70vh] overflow-y-auto">
        {isLoading ? (
          <div className="py-10 flex justify-center"><LoadingSpinner /></div>
        ) : shoots.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No upcoming shoots scheduled</p>
        ) : (
          shoots.map((s) => <ShootRow key={s.id} shoot={s} />)
        )}
      </div>
    </div>
  );
}

// ─── Notification Center ─────────────────────────────────────────────────────

const EVENT_TYPES = {
  shoot: { label: 'Shoot', color: 'bg-indigo-100 text-indigo-700' },
  deadline: { label: 'Deadline', color: 'bg-rose-100 text-rose-700' },
  invoice: { label: 'Invoice Due', color: 'bg-emerald-100 text-emerald-700' },
};

function NotificationCenter() {
  const { data: shootsData } = useShoots({ upcoming: true });
  const { data: projectsData } = useProjects({ status: 'active' });
  const { data: invoicesData } = useInvoices();

  const notifications = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const list = [];

    // Production Shoots
    const shoots = shootsData?.results || shootsData || [];
    shoots.forEach((s) => {
      if (!s.shoot_date) return;
      list.push({
        id: `shoot-${s.id}`,
        date: s.shoot_date,
        type: 'shoot',
        title: s.project_name || s.location || 'Production Shoot',
        sub: s.location || '',
        href: `/production/projects/${s.project}`,
      });
    });

    // Project Deadlines
    const projects = projectsData?.results || projectsData || [];
    projects.forEach((p) => {
      if (!p.deadline || p.deadline < today) return;
      list.push({
        id: `deadline-${p.id}`,
        date: p.deadline,
        type: 'deadline',
        title: p.name,
        sub: p.client_name || '',
        href: `/production/projects/${p.id}`,
      });
    });

    // Invoice Due Dates
    const invoices = invoicesData?.results || invoicesData || [];
    invoices.forEach((inv) => {
      if (!inv.due_date || inv.status === 'paid' || inv.due_date < today) return;
      list.push({
        id: `invoice-${inv.id}`,
        date: inv.due_date,
        type: 'invoice',
        title: `${inv.reference_number || 'Invoice'} · $${Number(inv.total || 0).toLocaleString()}`,
        sub: inv.client_name || '',
        href: `/production/invoices/${inv.id}`,
      });
    });

    list.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    return list;
  }, [shootsData, projectsData, invoicesData]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BellAlertIcon className="h-5 w-5 text-indigo-500" />
          <h2 className="font-semibold text-gray-900">Notification Center</h2>
          {notifications.length > 0 && (
            <span className="text-xs text-white bg-indigo-500 rounded-full px-2 py-0.5 leading-none">
              {notifications.length}
            </span>
          )}
        </div>
        <Link
          to="/production/calendar"
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Calendar →
        </Link>
      </div>
      <div className="divide-y divide-gray-50 overflow-y-auto max-h-[420px]">
        {notifications.length === 0 ? (
          <p className="px-5 py-8 text-sm text-gray-400 text-center">No upcoming events</p>
        ) : (
          notifications.map((n) => {
            const { label, color } = EVENT_TYPES[n.type];
            const dateObj = new Date(n.date + 'T00:00:00');
            return (
              <Link
                key={n.id}
                to={n.href}
                className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col items-center min-w-[36px] pt-0.5">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold leading-none">
                    {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                  </p>
                  <p className="text-xl font-bold text-gray-900 leading-tight">
                    {dateObj.getDate()}
                  </p>
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${color}`}>
                      {label}
                    </span>
                    <p className="text-sm font-medium text-gray-800 truncate">{n.title}</p>
                  </div>
                  {n.sub && <p className="text-xs text-gray-500 mt-0.5 truncate">{n.sub}</p>}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function ProductionDashboard() {
  const { data: stats, isLoading: statsLoading } = useProductionStats();
  const { data: projects } = useProjects({ status: 'active' });

  const [showShootsPanel, setShowShootsPanel] = useState(false);
  const toggleShoots = () => setShowShootsPanel((v) => !v);

  const projectList = projects?.results || projects || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Production Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/production/projects" className="block">
          <StatCard
            label="Active Productions"
            value={statsLoading ? '—' : stats?.active_projects}
            icon={FolderIcon}
            color="indigo"
          />
        </Link>
        <Link to="/production/revenue" className="block">
          <StatCard
            label="Revenue (MTD)"
            value={statsLoading ? '—' : `$${(stats?.revenue_mtd || 0).toLocaleString()}`}
            icon={CurrencyDollarIcon}
            color="emerald"
          />
        </Link>
        <StatCard
          label="Upcoming Shoots"
          value={statsLoading ? '—' : stats?.upcoming_shoots}
          icon={CameraIcon}
          color="amber"
          onClick={toggleShoots}
          active={showShootsPanel}
        />
      </div>

      {/* Expandable shoots panel */}
      {showShootsPanel && (
        <UpcomingShootsPanel onClose={() => setShowShootsPanel(false)} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Productions List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Active Productions</h2>
            <Link
              to="/production/projects"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {projectList.length === 0 ? (
              <p className="p-5 text-sm text-gray-400">No active productions</p>
            ) : (
              projectList.slice(0, 5).map((p) => (
                <Link
                  key={p.id}
                  to={`/production/projects/${p.id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {p.client_name || 'No client'} &middot; {p.shoot_count || 0} shoots
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {p.deadline ? `Due ${p.deadline}` : ''}
                    </span>
                    <StatusBadge status={p.status} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Notification Center */}
        <NotificationCenter />
      </div>
    </div>
  );
}

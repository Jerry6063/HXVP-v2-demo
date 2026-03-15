import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useProductionStats,
  useProjects,
  useTalentProfiles,
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

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function ProductionDashboard() {
  const { data: stats, isLoading: statsLoading } = useProductionStats();
  const { data: projects } = useProjects({ status: 'active' });
  const { data: talent } = useTalentProfiles();

  const [showShootsPanel, setShowShootsPanel] = useState(false);
  const toggleShoots = () => setShowShootsPanel((v) => !v);

  const projectList = projects?.results || projects || [];
  const talentList = talent?.results || talent || [];

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

        {/* Model Roster */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Model Roster</h2>
            <Link
              to="/production/talent"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View All
            </Link>
          </div>
          <div className="p-4 grid grid-cols-3 gap-3">
            {talentList.slice(0, 6).map((t) => (
              <div key={t.id} className="text-center">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto text-sm font-bold">
                  {t.user?.first_name?.[0]}
                  {t.user?.last_name?.[0]}
                </div>
                <p className="text-xs font-medium text-gray-700 mt-1.5 truncate">
                  {t.full_name}
                </p>
                <StatusBadge status={t.availability} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { useCrewStats, useCrewProfiles, useCrewAssignments } from '../../api/hooks';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import {
  CameraIcon,
  ClockIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

export default function CrewPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useCrewStats();
  const { data: profiles } = useCrewProfiles();
  const { data: assignments } = useCrewAssignments({ upcoming: true });

  const crewList = profiles?.results || profiles || [];
  const upcomingList = assignments?.results || assignments || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Production Crew</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Shoots This Week"
          value={statsLoading ? '—' : stats?.shoots_this_week}
          icon={CameraIcon}
          color="indigo"
        />
        <StatCard
          label="Crew Hours (Month)"
          value={statsLoading ? '—' : stats?.crew_hours_month}
          icon={ClockIcon}
          color="sky"
        />
        <StatCard
          label="Crew Costs (Month)"
          value={statsLoading ? '—' : `$${(stats?.crew_costs_month || 0).toLocaleString()}`}
          icon={CurrencyDollarIcon}
          color="emerald"
        />
        <StatCard
          label="Equipment"
          value={statsLoading ? '—' : stats?.equipment_total}
          sub={statsLoading ? '' : `${stats?.equipment_checked_out} checked out`}
          icon={WrenchScrewdriverIcon}
          color="amber"
        />
        <StatCard
          label="Pending Deliverables"
          value={statsLoading ? '—' : stats?.pending_deliverables}
          icon={DocumentTextIcon}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crew Roster */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Crew Roster & Availability</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Next Shoot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {crewList.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/production/crew/${c.id}`)}
                  className="hover:bg-sky-50 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-xs font-bold">
                        {c.user?.first_name?.[0]}{c.user?.last_name?.[0]}
                      </div>
                      <span className="font-medium text-gray-900">{c.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600 capitalize">
                    {c.crew_role?.replace(/_/g, ' ')}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    ${Number(c.hourly_rate).toFixed(0)}/hr
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={c.availability} />
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {c.next_shoot_date || '—'}
                  </td>
                </tr>
              ))}
              {crewList.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">
                    No crew members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Upcoming Assignments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Upcoming Assignments</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {upcomingList.length === 0 ? (
              <p className="p-5 text-sm text-gray-400">No upcoming assignments</p>
            ) : (
              upcomingList.slice(0, 10).map((a) => (
                <div key={a.id} className="px-5 py-3">
                  <p className="text-sm font-medium text-gray-900">
                    {a.shoot_detail?.location}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {a.shoot_detail?.shoot_date} &middot; {a.shoot_detail?.call_time}
                  </p>
                  <p className="text-xs text-gray-500">
                    {a.crew_name}{' '}
                    <span className="capitalize">
                      ({a.role_on_shoot?.replace(/_/g, ' ')})
                    </span>
                  </p>
                  <StatusBadge status={a.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

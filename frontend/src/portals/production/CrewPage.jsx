import { useNavigate } from 'react-router-dom';
import { useCrewStats, useCrewProfiles, useCrewAssignments, useProjects } from '../../api/hooks';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import {
  CameraIcon,
  ClockIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const CREW_ROLE_LABELS = { director: 'Director', photographer: 'Photographer', dop: 'Director of Photography', videographer: 'Videographer', first_ac: '1st AC', second_ac: '2nd AC', gaffer: 'Gaffer', grip: 'Grip', electric: 'Electric', wardrobe: 'Wardrobe', set_design: 'Set Design', bts: 'Behind-the-Scene', pa: 'Production Assistant', ac: 'Assistant Camera', audio: 'Audio', lighting: 'Lighting', hair_makeup: 'Hair & Makeup', stylist: 'Stylist', crafty: 'Crafty', other: 'Other' };

export default function CrewPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useCrewStats();
  const { data: profiles } = useCrewProfiles();
  const { data: assignments } = useCrewAssignments({ upcoming: true });
  const { data: projectsData } = useProjects({ status: 'active' });

  const crewList = profiles?.results || profiles || [];
  const upcomingList = assignments?.results || assignments || [];
  const activeProjects = (projectsData?.results || projectsData || []).filter(
    (p) => (p.crew_requirements_list || []).length > 0
  );

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

        {/* Upcoming Productions – Crew Needs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Upcoming Productions</h2>
            <p className="text-xs text-gray-400 mt-0.5">Crew staffing needs</p>
          </div>
          <div className="divide-y divide-gray-50">
            {activeProjects.length === 0 ? (
              <p className="p-5 text-sm text-gray-400">No active productions with crew needs</p>
            ) : (
              activeProjects.slice(0, 8).map((proj) => (
                <div key={proj.id} className="px-5 py-3">
                  <p className="text-sm font-medium text-gray-900">{proj.name}</p>
                  {proj.deadline && <p className="text-xs text-gray-400 mt-0.5">Deadline: {proj.deadline}</p>}
                  <div className="mt-1.5 space-y-1">
                    {(proj.crew_requirements_list || []).map((r) => (
                      <div key={r.id} className="flex items-center gap-1.5 text-xs">
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-sky-100 text-sky-600 text-[10px] font-bold">{r.count}</span>
                        <span className="text-gray-700 capitalize">{CREW_ROLE_LABELS[r.crew_role] || r.crew_role?.replace(/_/g, ' ')}</span>
                        {r.notes && <span className="text-gray-400 italic truncate">– {r.notes}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

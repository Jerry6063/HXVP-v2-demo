import { useProjects, useDeliverables, useShoots, useTalentProfiles, useApproveDeliverable } from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';
import StatCard from '../../components/StatCard';
import {
  FolderIcon,
  CalendarIcon,
  DocumentCheckIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export default function ClientDashboard() {
  const { data: projects } = useProjects();
  const { data: deliverables } = useDeliverables();
  const { data: talent } = useTalentProfiles();
  const { data: shoots } = useShoots({ upcoming: true });
  const approveDeliverable = useApproveDeliverable();

  const projectList = projects?.results || projects || [];
  const deliverableList = deliverables?.results || deliverables || [];
  const talentList = talent?.results || talent || [];
  const shootList = shoots?.results || shoots || [];

  const activeProjects = projectList.filter((p) => p.status === 'active');
  const pendingDeliverables = deliverableList.filter(
    (d) => d.status === 'review' || d.status === 'in_progress'
  );
  const nextShoot = shootList[0];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Client Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Active Projects"
          value={activeProjects.length}
          icon={FolderIcon}
          color="emerald"
        />
        <StatCard
          label="Upcoming Shoots"
          value={shootList.length}
          icon={CalendarIcon}
          color="sky"
        />
        <StatCard
          label="Deliverables"
          value={deliverableList.length}
          sub={`${pendingDeliverables.length} pending`}
          icon={DocumentCheckIcon}
          color="amber"
        />
        <StatCard
          label="Next Deadline"
          value={activeProjects[0]?.deadline || '—'}
          icon={ClockIcon}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Your Projects</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {projectList.length === 0 ? (
              <p className="p-5 text-sm text-gray-400">No projects</p>
            ) : (
              projectList.map((p) => (
                <div key={p.id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 text-sm">{p.name}</h3>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                    <div>
                      <span className="block text-gray-400">Start</span>
                      {p.start_date || '—'}
                    </div>
                    <div>
                      <span className="block text-gray-400">Deadline</span>
                      {p.deadline || '—'}
                    </div>
                    <div>
                      <span className="block text-gray-400">Shoots</span>
                      {p.shoot_count || 0}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Shoot Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Shoot Schedule</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {shootList.length === 0 ? (
              <p className="p-5 text-sm text-gray-400">No upcoming shoots</p>
            ) : (
              shootList.map((s) => (
                <div key={s.id} className="px-5 py-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{s.location}</p>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {s.shoot_date} &middot; {s.call_time} – {s.est_wrap_time || 'TBD'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Talent Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Available Talent</h2>
        </div>
        <div className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {talentList
            .filter((t) => t.availability === 'available')
            .map((t) => (
              <div key={t.id} className="text-center group cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-sm font-bold group-hover:ring-2 group-hover:ring-emerald-400 transition-all">
                  {t.user?.first_name?.[0]}{t.user?.last_name?.[0]}
                </div>
                <p className="text-xs font-medium text-gray-700 mt-2 truncate">{t.full_name}</p>
                <p className="text-xs text-gray-400 capitalize">{t.talent_type}</p>
              </div>
            ))}
        </div>
      </div>

      {/* Deliverables Review */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Deliverables</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {deliverableList.length === 0 ? (
            <p className="p-5 text-sm text-gray-400">No deliverables</p>
          ) : (
            deliverableList.map((d) => (
              <div key={d.id} className="px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{d.name}</p>
                    <p className="text-xs text-gray-500">
                      {d.project_name} &middot; Due {d.deadline || '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={d.status} />
                    {d.status === 'review' && (
                      <button
                        onClick={() => approveDeliverable.mutate(d.id)}
                        className="px-3 py-1 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>
                {d.file_url && (
                  <div className="mt-3">
                    {d.deliverable_type === 'photo' ? (
                      <a href={d.file_url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={d.file_url}
                          alt={d.name}
                          className="h-40 w-auto rounded-lg object-cover border border-gray-200 hover:shadow-md transition-shadow"
                        />
                      </a>
                    ) : d.deliverable_type === 'video' ? (
                      <video
                        src={d.file_url}
                        controls
                        className="h-48 w-auto rounded-lg border border-gray-200"
                      />
                    ) : (
                      <a
                        href={d.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
                      >
                        Download file &rarr;
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Project Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Project Timeline</h2>
        </div>
        <div className="p-5">
          {activeProjects.length === 0 ? (
            <p className="text-sm text-gray-400">No active projects</p>
          ) : (
            activeProjects.map((project) => (
              <div key={project.id} className="mb-6 last:mb-0">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">{project.name}</h3>
                <div className="relative pl-6 space-y-4">
                  <div className="absolute left-2 top-1 bottom-1 w-0.5 bg-gray-200" />
                  <TimelineItem
                    date={project.start_date}
                    label="Project Kickoff"
                    active
                  />
                  {shootList
                    .filter((s) => s.project === project.id)
                    .map((s) => (
                      <TimelineItem
                        key={s.id}
                        date={s.shoot_date}
                        label={`Shoot – ${s.location}`}
                      />
                    ))}
                  <TimelineItem
                    date={project.deadline}
                    label="Final Delivery"
                    isEnd
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ date, label, active, isEnd }) {
  return (
    <div className="relative flex items-start gap-3">
      <div
        className={`absolute -left-[17px] top-0.5 w-3 h-3 rounded-full border-2 ${
          active
            ? 'border-emerald-500 bg-emerald-500'
            : isEnd
              ? 'border-red-400 bg-white'
              : 'border-gray-300 bg-white'
        }`}
      />
      <div>
        <p className="text-sm text-gray-700">{label}</p>
        <p className="text-xs text-gray-400">{date || 'TBD'}</p>
      </div>
    </div>
  );
}

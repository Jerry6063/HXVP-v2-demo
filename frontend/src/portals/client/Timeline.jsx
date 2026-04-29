import { useMilestones, useProjects, useTalentRosterShares, useUpdateTalentRosterFavorite } from '../../api/hooks';
import { ArrowDownTrayIcon, CheckCircleIcon, ClockIcon, HeartIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline';

export default function Production() {
  const { data: projectsData, isLoading: loadingProjects } = useProjects();
  const { data: milestonesData, isLoading: loadingMilestones } = useMilestones();

  const projects = projectsData?.results || projectsData || [];
  const milestones = milestonesData?.results || milestonesData || [];
  const visibleProjects = projects.filter((project) => project.status !== 'archived');

  if (loadingProjects || loadingMilestones) {
    return <div className="text-center py-12 text-gray-400">Loading production details…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">Production</p>
          <h1 className="text-3xl font-semibold text-gray-950">Projects, timeline, and shortlist review</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-500">
            Track each production phase and review the talent shortlist your production team has prepared for that project.
          </p>
        </div>
      </div>

      {visibleProjects.length === 0 ? (
        <div className="rounded-3xl border border-gray-100 bg-white p-12 text-center text-sm text-gray-400 shadow-sm">
          No projects are available yet.
        </div>
      ) : (
        <div className="space-y-6">
          {visibleProjects.map((project) => {
            const projectMilestones = milestones
              .filter((milestone) => milestone.project === project.id)
              .sort((left, right) => left.order - right.order);

            return (
              <ProjectProductionCard
                key={project.id}
                project={project}
                milestones={projectMilestones}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProjectProductionCard({ project, milestones }) {
  const { data: sharesData, isLoading: loadingShares } = useTalentRosterShares({ project: project.id });
  const updateFavorite = useUpdateTalentRosterFavorite();

  const shares = sharesData?.results || sharesData || [];
  const latestShare = shares[0] || null;
  const completedCount = milestones.filter((milestone) => milestone.is_completed).length;
  const progressPct = milestones.length
    ? Math.round((completedCount / milestones.length) * 100)
    : 0;

  const handleFavoriteToggle = async (item) => {
    await updateFavorite.mutateAsync({
      id: latestShare.id,
      itemId: item.id,
      clientFavorite: !item.client_favorite,
      clientNote: item.client_note || '',
    });
  };

  return (
    <article className="overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900">{project.name}</h2>
              <ProjectStatusBadge status={project.status} />
            </div>
            <p className="mt-2 text-sm text-gray-500">{project.description || 'Production details will appear here as the project evolves.'}</p>
          </div>

          <div className="min-w-[220px] rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium">Progress</span>
              <span className="text-xs text-emerald-700">{completedCount}/{milestones.length || 0} complete</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-emerald-100">
              <div className="h-2 rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 px-6 py-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Timeline</h3>
            <p className="text-xs text-gray-500">Current production milestones for this project.</p>
          </div>

          {milestones.length === 0 ? (
            <p className="rounded-2xl bg-gray-50 px-4 py-5 text-sm text-gray-400">No milestones are set for this project yet.</p>
          ) : (
            <div className="rounded-3xl border border-gray-100 bg-gray-50/70 p-5">
              {milestones.map((milestone, index) => (
                <MilestoneStep
                  key={milestone.id}
                  milestone={milestone}
                  isLast={index === milestones.length - 1}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Potential talent list</h3>
              <p className="text-xs text-gray-500">The shortlist your production team asked you to review.</p>
            </div>
            {latestShare?.pdf_url && (
              <a
                href={latestShare.pdf_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:border-emerald-200 hover:text-emerald-700"
              >
                <ArrowDownTrayIcon className="h-4 w-4" /> PDF
              </a>
            )}
          </div>

          {loadingShares ? (
            <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-5 text-sm text-gray-400">Loading shortlist…</div>
          ) : !latestShare ? (
            <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-6 text-sm text-gray-400">
              Production has not shared a talent shortlist for this project yet.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 text-sm text-emerald-900">
                <p className="font-medium">Shared {latestShare.shared_at ? new Date(latestShare.shared_at).toLocaleDateString() : 'recently'}</p>
                <p className="mt-1 text-xs text-emerald-700">{latestShare.talent_details?.length || 0} talent profile{latestShare.talent_details?.length === 1 ? '' : 's'} included in this review packet.</p>
              </div>

              {(latestShare.talent_details || []).map((item) => (
                <div key={item.id} className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-4">
                    {item.primary_photo ? (
                      <img src={item.primary_photo} alt={item.full_name} className="h-24 w-20 rounded-2xl object-cover" />
                    ) : (
                      <div className="flex h-24 w-20 items-center justify-center rounded-2xl bg-emerald-100 text-sm font-semibold text-emerald-700">
                        {item.full_name.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-semibold text-gray-900">{item.full_name}</h4>
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600 capitalize">
                          {(item.talent_type || '').replace(/_/g, ' ')}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-gray-500">
                        {[item.age ? `${item.age} years` : null, item.gender ? item.gender.replace(/_/g, ' ') : null, item.hourly_rate ? `$${item.hourly_rate}/hr` : null]
                          .filter(Boolean)
                          .join(' • ')}
                      </p>

                      {item.bio && (
                        <p className="mt-3 line-clamp-3 text-sm text-gray-600">{item.bio}</p>
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleFavoriteToggle(item)}
                          disabled={updateFavorite.isPending}
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition ${item.client_favorite ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                          {item.client_favorite ? <HeartIcon className="h-4 w-4" /> : <HeartOutlineIcon className="h-4 w-4" />}
                          {item.client_favorite ? 'Favorited' : 'Mark as favorite'}
                        </button>
                        {item.notes && (
                          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-700">Production notes included</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </article>
  );
}

function MilestoneStep({ milestone, isLast }) {
  const phaseLabels = {
    preparing: 'Preparing',
    pre_production: 'Pre-Production',
    shooting: 'Shooting',
    post_production: 'Post-Production',
    review: 'Client Review',
    delivered: 'Delivered',
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        {milestone.is_completed ? (
          <CheckCircleIcon className="w-6 h-6 text-emerald-500 flex-shrink-0" />
        ) : (
          <ClockIcon className="w-6 h-6 text-gray-300 flex-shrink-0" />
        )}
        {!isLast && (
          <div
            className={`w-0.5 flex-1 min-h-[2rem] ${
              milestone.is_completed ? 'bg-emerald-300' : 'bg-gray-200'
            }`}
          />
        )}
      </div>
      <div className="pb-6">
        <p
          className={`text-sm font-medium ${
            milestone.is_completed ? 'text-gray-900' : 'text-gray-500'
          }`}
        >
          {milestone.title || phaseLabels[milestone.phase] || milestone.phase}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {milestone.is_completed && milestone.completed_at
            ? `Completed ${new Date(milestone.completed_at).toLocaleDateString()}`
            : phaseLabels[milestone.phase] || milestone.phase}
        </p>
      </div>
    </div>
  );
}

function ProjectStatusBadge({ status }) {
  const className = {
    active: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-sky-100 text-sky-700',
    on_hold: 'bg-amber-100 text-amber-700',
    archived: 'bg-gray-200 text-gray-600',
  }[status] || 'bg-gray-100 text-gray-700';

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${className}`}>
      {String(status || '').replace(/_/g, ' ')}
    </span>
  );
}

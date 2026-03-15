import { useProjects, useMilestones } from '../../api/hooks';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/solid';

export default function Timeline() {
  const { data: projectsData, isLoading: loadingProjects } = useProjects();
  const { data: milestonesData, isLoading: loadingMilestones } = useMilestones();

  const projects = projectsData?.results || projectsData || [];
  const milestones = milestonesData?.results || milestonesData || [];
  const activeProjects = projects.filter((p) => p.status === 'active');

  if (loadingProjects || loadingMilestones) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Project Timeline</h1>

      {activeProjects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-sm text-gray-400">
          No active projects to display.
        </div>
      ) : (
        <div className="space-y-6">
          {activeProjects.map((project) => {
            const projectMilestones = milestones
              .filter((m) => m.project === project.id)
              .sort((a, b) => a.order - b.order);

            const completedCount = projectMilestones.filter((m) => m.is_completed).length;
            const progressPct = projectMilestones.length
              ? Math.round((completedCount / projectMilestones.length) * 100)
              : 0;

            return (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900">{project.name}</h2>
                    <span className="text-xs text-gray-500">
                      {completedCount}/{projectMilestones.length} phases complete
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                <div className="p-6">
                  {projectMilestones.length === 0 ? (
                    <p className="text-sm text-gray-400">
                      No milestones set for this project yet.
                    </p>
                  ) : (
                    <div className="relative">
                      {projectMilestones.map((ms, idx) => {
                        const isLast = idx === projectMilestones.length - 1;
                        return (
                          <MilestoneStep
                            key={ms.id}
                            milestone={ms}
                            isLast={isLast}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
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

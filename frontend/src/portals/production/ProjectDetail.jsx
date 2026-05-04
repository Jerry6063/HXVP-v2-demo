import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { PencilIcon, TrashIcon, PlusIcon, CheckIcon, XMarkIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import ShootSchedule from './ShootSchedule';
import {
  useProject,
  useDeliverables,
  useContracts,
  useExpenses,
  useProjectFinancials,
  useArchiveProject,
  useActivateProject,
  useUpdateProject,
  useBookings,
  useCrewAssignments,
  useUploadDeliverable,
  useCreateDeliverable,
  useMilestones,
  useCreateMilestone,
  useUpdateMilestone,
  useDeleteMilestone,
  useTalentRosterShares,
  useTalentConsiderations,
  useRemoveTalentConsideration,
  useSendTalentAvailabilityInquiry,
  useCrewConsiderations,
  useRemoveCrewConsideration,
  useSendCrewAvailabilityInquiry,
  useTalentProfiles,
  useTalentAvailability,
  useCreateExpense,
  useDeleteExpense,
  useUpdateExpense,
  useBudgetAllocations,
  useUpsertBudgetAllocation,
  useDeliverableReviews,
  useCreateTalentRequirement,
  useCreateCrewRequirement,
  useDeleteTalentRequirement,
  useDeleteCrewRequirement,
} from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';

const tabs = [
  { id: 'workflow', label: 'Workflow' },
  { id: 'assets', label: 'Assets & Deliverables' },
  { id: 'contracts', label: 'Contracts' },
];

const PHASE_MAIN_TITLES = {
  preparing: 'Preparing',
  pre_production: '1 - Pre-production phase',
  shooting: '2 - Production phase',
  post_production: '3 - Post-production',
  review: 'Client Review',
  delivered: 'Delivered',
};

const PHASE_DISPLAY_ORDER = ['preparing', 'pre_production', 'shooting', 'post_production', 'review', 'delivered'];
const PROJECT_SECTION_IDS = new Set(['workflow', 'team-talent', 'assets', 'budget', 'contracts']);

function normalizeMsTitle(value = '') {
  return String(value).trim().toLowerCase();
}

function cleanMilestoneLabel(title = '') {
  return String(title).replace(/^\s*\d+[a-z]\s*-\s*/i, '').trim();
}

function getMainTitleForPhase(phase) {
  return PHASE_MAIN_TITLES[phase] || String(phase || '').replace(/_/g, ' ');
}

function isPhaseMainMilestone(ms) {
  if (!ms) return false;
  return normalizeMsTitle(ms.title) === normalizeMsTitle(getMainTitleForPhase(ms.phase));
}

function getProjectSection(section) {
  return PROJECT_SECTION_IDS.has(section) ? section : 'workflow';
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = getProjectSection(searchParams.get('section'));
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const { data: project, isLoading } = useProject(id);
  const { data: deliverables } = useDeliverables({ project: id });
  const { data: contracts } = useContracts({ project: id });
  const { data: expenses } = useExpenses({ project: id });
  const { data: financials } = useProjectFinancials(id);
  const { data: bookings } = useBookings({ project: id });
  const { data: assignments } = useCrewAssignments({ project: id });
  const archiveProject = useArchiveProject();
  const activateProject = useActivateProject();
  const updateProject = useUpdateProject();
  const uploadDeliverable = useUploadDeliverable();
  const createDeliverable = useCreateDeliverable();
  const { data: milestonesData } = useMilestones({ project: id });
  const createMilestone = useCreateMilestone();
  const updateMilestone = useUpdateMilestone();
  const deleteMilestone = useDeleteMilestone();
  const { data: reviewsData } = useDeliverableReviews({ project: id });

  const deliverablesArr = deliverables?.results || deliverables || [];
  const milestonesArr = (milestonesData?.results || milestonesData || []).sort(
    (a, b) => a.order - b.order
  );
  const contractsArr = contracts?.results || contracts || [];
  const expensesArr = expenses?.results || expenses || [];
  const reviewsArr = reviewsData?.results || reviewsData || [];
  const bookingsArr = bookings?.results || bookings || [];
  const assignmentsArr = assignments?.results || assignments || [];
  const shoots = project?.shoots || [];

  const handleSectionChange = (sectionId) => {
    const nextSection = getProjectSection(sectionId);
    const nextParams = new URLSearchParams(searchParams);

    if (nextSection === 'workflow') {
      nextParams.delete('section');
    } else {
      nextParams.set('section', nextSection);
    }

    setSearchParams(nextParams, { replace: true });
  };

  if (isLoading) return <div className="text-center py-10 text-gray-400">Loading...</div>;
  if (!project) return <div className="text-center py-10 text-gray-400">Project not found</div>;

  return (
    <div className="space-y-6">
      {/* Archive Confirmation Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Archive this project?</h2>
            <p className="text-sm text-gray-500 mb-5">
              <span className="font-medium text-gray-700">{project.name}</span> will be moved to the
              Archived section. You can reactivate it at any time.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowArchiveModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                disabled={archiveProject.isPending}
                onClick={async () => {
                  await archiveProject.mutateAsync(id);
                  setShowArchiveModal(false);
                  navigate('/production/projects');
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60"
              >
                {archiveProject.isPending ? 'Archiving…' : 'Archive'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{project.description}</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={project.status} />
          {project.status === 'active' && (
            <button
              onClick={() => setShowArchiveModal(true)}
              className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Archive
            </button>
          )}
          {project.status === 'archived' && (
            <button
              disabled={activateProject.isPending}
              onClick={async () => {
                await activateProject.mutateAsync(id);
                navigate('/production/projects');
              }}
              className="px-3 py-1 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
            >
              {activateProject.isPending ? 'Activating…' : 'Activate this project'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main content */}
        <div className="lg:col-span-3">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-4">
            <nav className="flex gap-6 -mb-px overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleSectionChange(tab.id)}
                  className={`pb-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    activeSection === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            {activeSection === 'workflow' && (
              <WorkflowTab
                project={project}
                milestones={milestonesArr}
                createMilestone={createMilestone}
                updateMilestone={updateMilestone}
                deleteMilestone={deleteMilestone}
                bookings={bookingsArr}
                assignments={assignmentsArr}
                reviews={reviewsArr}
                shoots={shoots}
                updateProject={updateProject}
              />
            )}
            {activeSection === 'team-talent' && (
              <TeamTalentTab bookings={bookingsArr} assignments={assignmentsArr} projectId={id} project={project} />
            )}
            {activeSection === 'assets' && (
              <AssetsTab
                project={project}
                deliverables={deliverablesArr}
                projectId={id}
                uploadDeliverable={uploadDeliverable}
                createDeliverable={createDeliverable}
                updateProject={updateProject}
              />
            )}
            {activeSection === 'budget' && (
              <BudgetTab expenses={expensesArr} financials={financials} projectId={id} project={project} />
            )}
            {activeSection === 'contracts' && (
              <ContractsTab contracts={contractsArr} />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Talent & Crew */}
          <button
            type="button"
            onClick={() => handleSectionChange('team-talent')}
            className={`w-full text-left bg-white rounded-xl shadow-sm border p-4 transition-colors ${
              activeSection === 'team-talent'
                ? 'border-indigo-300 ring-2 ring-indigo-100'
                : 'border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-sm">Talent & Crew</h3>
              <span className="text-xs font-medium text-indigo-600">Open</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div className="rounded-lg bg-gray-50 p-2.5">
                <p className="text-xs text-gray-500">Assigned Talent</p>
                <p className="text-base font-semibold text-gray-900 mt-0.5">{bookingsArr.length}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-2.5">
                <p className="text-xs text-gray-500">Assigned Crew</p>
                <p className="text-base font-semibold text-gray-900 mt-0.5">{assignmentsArr.length}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {bookingsArr.slice(0, 2).map((b) => (
                <div key={`talent-${b.id}`} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-600 truncate">Talent: {b.talent_name}</span>
                  <StatusBadge status={b.status} />
                </div>
              ))}
              {assignmentsArr.slice(0, 2).map((a) => (
                <div key={`crew-${a.id}`} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-600 truncate">Crew: {a.crew_name}</span>
                  <StatusBadge status={a.status} />
                </div>
              ))}
              {bookingsArr.length === 0 && assignmentsArr.length === 0 && (
                <p className="text-xs text-gray-400">No assigned talent or crew yet</p>
              )}
            </div>
          </button>

          {/* Budget & Expenses */}
          {financials && (
            <button
              type="button"
              onClick={() => handleSectionChange('budget')}
              className={`w-full text-left bg-white rounded-xl shadow-sm border p-4 transition-colors ${
                activeSection === 'budget'
                  ? 'border-indigo-300 ring-2 ring-indigo-100'
                  : 'border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-sm">Budget & Expenses</h3>
                <span className="text-xs font-medium text-indigo-600">Open</span>
              </div>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Budget</dt>
                  <dd className="font-medium text-gray-900">
                    ${financials.budget?.toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Spent</dt>
                  <dd className="font-medium text-red-600">
                    ${financials.total_expenses?.toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2">
                  <dt className="text-gray-500">Remaining</dt>
                  <dd className="font-bold text-gray-900">
                    ${financials.remaining?.toLocaleString()}
                  </dd>
                </div>
              </dl>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function WorkflowTab({ project, milestones, createMilestone, updateMilestone, deleteMilestone, bookings, assignments, reviews, shoots, updateProject }) {
  const [showAddMs, setShowAddMs] = useState(false);
  const [newMs, setNewMs] = useState({ phase: 'preparing', title: '' });
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({ title: '', phase: 'preparing' });
  const [confirmMilestone, setConfirmMilestone] = useState(null);
  const [draggedMilestoneId, setDraggedMilestoneId] = useState(null);
  const [locationInput, setLocationInput] = useState('');

  const confirmedTalent = useMemo(() => (bookings || []).filter(b => b.status === 'accepted'), [bookings]);
  const confirmedCrew = useMemo(() => (assignments || []).filter(a => a.status === 'accepted'), [assignments]);
  const clientReviewCount = useMemo(() => (reviews || []).filter(r => r.action === 'revision_requested' || r.action === 'comment').length, [reviews]);
  const msTypeMatch = (ms, keyword) => normalizeMsTitle(ms.title).includes(keyword);

  const phaseGroups = useMemo(() => {
    const byPhase = new Map();

    milestones.forEach((ms) => {
      const current = byPhase.get(ms.phase) || { phase: ms.phase, parent: null, children: [] };
      if (isPhaseMainMilestone(ms)) {
        current.parent = ms;
      } else {
        current.children.push(ms);
      }
      byPhase.set(ms.phase, current);
    });

    const groups = Array.from(byPhase.values()).map((group) => {
      group.children.sort((a, b) => a.order - b.order);
      return group;
    });

    groups.sort((a, b) => {
      const aOrderAnchor = a.parent?.order ?? a.children?.[0]?.order ?? Number.MAX_SAFE_INTEGER;
      const bOrderAnchor = b.parent?.order ?? b.children?.[0]?.order ?? Number.MAX_SAFE_INTEGER;
      if (aOrderAnchor !== bOrderAnchor) return aOrderAnchor - bOrderAnchor;

      const aPhaseIdx = PHASE_DISPLAY_ORDER.indexOf(a.phase);
      const bPhaseIdx = PHASE_DISPLAY_ORDER.indexOf(b.phase);
      return (aPhaseIdx === -1 ? 999 : aPhaseIdx) - (bPhaseIdx === -1 ? 999 : bPhaseIdx);
    });

    return groups;
  }, [milestones]);

  const getParentForPhase = (phase) => milestones.find((ms) => ms.phase === phase && isPhaseMainMilestone(ms));
  const getChildrenForPhase = (phase, excludedId = null) =>
    milestones.filter((ms) => ms.phase === phase && !isPhaseMainMilestone(ms) && ms.id !== excludedId);

  const handleAddMilestone = async (e) => {
    e.preventDefault();

    const cleanTitle = newMs.title.trim();
    const phase = newMs.phase;
    const mainTitle = getMainTitleForPhase(phase);
    const existingParent = getParentForPhase(phase);
    const isMainTitleInput = normalizeMsTitle(cleanTitle) === normalizeMsTitle(mainTitle);

    if (existingParent && isMainTitleInput) {
      window.alert('This phase already has a main milestone. Add a sub-milestone title instead.');
      return;
    }

    if (!existingParent && !isMainTitleInput) {
      await createMilestone.mutateAsync({
        project: project.id,
        phase,
        title: mainTitle,
        order: milestones.length,
      });
    }

    await createMilestone.mutateAsync({
      project: project.id,
      phase,
      title: cleanTitle || 'New milestone',
      order: milestones.length + (!existingParent && !isMainTitleInput ? 1 : 0),
    });

    setNewMs({ phase: 'preparing', title: '' });
    setShowAddMs(false);
  };

  const handleToggleMilestone = async (ms) => {
    if (normalizeMsTitle(ms.title).includes('location') && !ms.is_completed) {
      setLocationInput(project.location || '');
    }
    setConfirmMilestone(ms);
  };

  const handleConfirmToggleMilestone = async () => {
    if (!confirmMilestone) return;
    if (isPhaseMainMilestone(confirmMilestone)) {
      setConfirmMilestone(null);
      return;
    }

    const nextCompleted = !confirmMilestone.is_completed;

    if (normalizeMsTitle(confirmMilestone.title).includes('location') && nextCompleted && locationInput.trim()) {
      await updateProject.mutateAsync({ id: project.id, location: locationInput.trim() });
    }

    await updateMilestone.mutateAsync({
      id: confirmMilestone.id,
      is_completed: nextCompleted,
    });

    const phaseParent = getParentForPhase(confirmMilestone.phase);
    if (phaseParent) {
      const siblings = getChildrenForPhase(confirmMilestone.phase);
      const allSubCompleted = siblings.every((sibling) =>
        sibling.id === confirmMilestone.id ? nextCompleted : sibling.is_completed
      );

      if (phaseParent.is_completed !== allSubCompleted) {
        await updateMilestone.mutateAsync({
          id: phaseParent.id,
          is_completed: allSubCompleted,
        });
      }
    }

    setConfirmMilestone(null);
  };

  const startEditMilestone = (ms) => {
    setEditingId(ms.id);
    setEditDraft({
      title: cleanMilestoneLabel(ms.title),
      phase: ms.phase,
    });
  };

  const saveEditMilestone = async () => {
    if (!editingId) return;
    await updateMilestone.mutateAsync({
      id: editingId,
      title: editDraft.title,
      phase: editDraft.phase,
    });
    setEditingId(null);
  };

  const cancelEditMilestone = () => {
    setEditingId(null);
  };

  const handleDeleteMilestone = async (id) => {
    const target = milestones.find((ms) => ms.id === id);
    if (!target) return;

    if (isPhaseMainMilestone(target)) {
      const childMilestones = getChildrenForPhase(target.phase);
      const confirmText = childMilestones.length > 0
        ? `Delete this phase and its ${childMilestones.length} sub-milestone(s)?`
        : 'Delete this phase?';
      if (!window.confirm(confirmText)) return;

      for (const child of childMilestones) {
        await deleteMilestone.mutateAsync(child.id);
      }
      await deleteMilestone.mutateAsync(target.id);
      return;
    }

    if (!window.confirm('Delete this milestone?')) return;
    await deleteMilestone.mutateAsync(target.id);
  };

  const handleDropMilestone = async (targetId) => {
    if (!draggedMilestoneId || draggedMilestoneId === targetId) return;

    const ordered = [...milestones].sort((a, b) => a.order - b.order);
    const fromIndex = ordered.findIndex((ms) => ms.id === draggedMilestoneId);
    const toIndex = ordered.findIndex((ms) => ms.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const [moved] = ordered.splice(fromIndex, 1);
    ordered.splice(toIndex, 0, moved);

    await Promise.all(
      ordered.map((ms, index) => {
        if (ms.order === index) return Promise.resolve();
        return updateMilestone.mutateAsync({ id: ms.id, order: index });
      })
    );

    setDraggedMilestoneId(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoItem label="Start Date" value={project.start_date || '—'} />
        <InfoItem label="Deadline" value={project.deadline || '—'} />
        <InfoItem label="Budget" value={`$${Number(project.budget).toLocaleString()}`} />
        <InfoItem label="Status" value={<StatusBadge status={project.status} />} />
      </div>

      {/* Milestones Editor */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-800 text-sm">Project Milestones</h4>
          <button
            onClick={() => setShowAddMs(!showAddMs)}
            className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700"
          >
            + Add Milestone
          </button>
        </div>

        {showAddMs && (
          <form onSubmit={handleAddMilestone} className="flex gap-2 mb-3">
            <select
              value={newMs.phase}
              onChange={(e) => setNewMs({ ...newMs, phase: e.target.value })}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="preparing">Preparing</option>
              <option value="pre_production">Pre-Production</option>
              <option value="shooting">Production</option>
              <option value="post_production">Post-Production</option>
              <option value="review">Client Review</option>
              <option value="delivered">Delivered</option>
            </select>
            <input
              value={newMs.title}
              onChange={(e) => setNewMs({ ...newMs, title: e.target.value })}
              placeholder="Milestone title"
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button
              type="submit"
              disabled={createMilestone.isPending}
              className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              Add
            </button>
          </form>
        )}

        {milestones.length === 0 ? (
          <p className="text-sm text-gray-400">No milestones yet</p>
        ) : (
          <div className="space-y-2">
            {phaseGroups.map((group) => {
              const parent = group.parent || {
                id: `virtual-${group.phase}`,
                phase: group.phase,
                title: getMainTitleForPhase(group.phase),
                is_completed: false,
              };
              const childMilestones = group.children;
              const mainCompleted = childMilestones.length > 0 && childMilestones.every((child) => child.is_completed);

              const renderRow = (item, options = {}) => {
                const isMain = options.isMain || false;
                const isVirtual = options.isVirtual || false;
                const rowIsEditing = editingId === item.id;

                return (
                  <div
                    key={item.id}
                    draggable={!isVirtual}
                    onDragStart={() => !isVirtual && setDraggedMilestoneId(item.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => !isVirtual && handleDropMilestone(item.id)}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${isMain ? 'bg-white border border-gray-200' : 'hover:bg-white'} ${draggedMilestoneId === item.id ? 'opacity-50' : ''}`}
                  >
                    <span className="text-xs text-gray-400 cursor-grab" title="Drag to reorder">::</span>

                    {isMain ? (
                      <span className={`inline-flex h-5 w-5 items-center justify-center text-xs font-bold rounded-full ${mainCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {mainCompleted ? '✓' : '•'}
                      </span>
                    ) : (
                      <input
                        type="checkbox"
                        checked={item.is_completed}
                        onChange={() => handleToggleMilestone(item)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    )}

                    <div className="flex-1">
                      {rowIsEditing ? (
                        <div className="flex flex-col md:flex-row gap-2">
                          <input
                            value={editDraft.title}
                            onChange={(e) => setEditDraft((prev) => ({ ...prev, title: e.target.value }))}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                          <select
                            value={editDraft.phase}
                            onChange={(e) => setEditDraft((prev) => ({ ...prev, phase: e.target.value }))}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          >
                            <option value="preparing">Preparing</option>
                            <option value="pre_production">Pre-Production</option>
                            <option value="shooting">Production</option>
                            <option value="post_production">Post-Production</option>
                            <option value="review">Client Review</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </div>
                      ) : (
                        <>
                          <span className={isMain ? `text-base font-bold ${mainCompleted ? 'text-green-700' : 'text-gray-900'}` : `text-sm ${item.is_completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                            {isMain ? item.title : cleanMilestoneLabel(item.title)}
                          </span>
                          <span className="text-xs text-gray-400 ml-2 capitalize">
                            {item.phase === 'shooting' ? 'production' : item.phase.replace(/_/g, ' ')}
                          </span>

                          {/* Location: show confirmed location */}
                          {!isMain && msTypeMatch(item, 'location') && item.is_completed && project.location && (
                            <div className="mt-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">{project.location}</span>
                            </div>
                          )}

                          {/* Talent: show confirmed talent names */}
                          {!isMain && msTypeMatch(item, 'talent') && confirmedTalent.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {confirmedTalent.map(b => (
                                <Link key={b.id} to={`/production/talent/${b.talent}`} className="inline-flex items-center px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs font-medium hover:bg-amber-100 transition-colors">{b.talent_name}</Link>
                              ))}
                            </div>
                          )}

                          {/* Crew: show confirmed crew names */}
                          {!isMain && msTypeMatch(item, 'crew') && confirmedCrew.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {confirmedCrew.map(a => (
                                <Link key={a.id} to={`/production/crew/${a.crew}`} className="inline-flex items-center px-2 py-0.5 bg-sky-50 text-sky-700 rounded text-xs font-medium hover:bg-sky-100 transition-colors">{a.crew_name}</Link>
                              ))}
                            </div>
                          )}

                          {/* Call Sheet: link to shoot pages */}
                          {!isMain && msTypeMatch(item, 'call sheet') && (shoots || []).length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {(shoots || []).map(s => (
                                <Link key={s.id} to={`/production/projects/${project.id}/shoots/${s.id}`} className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs font-medium hover:bg-emerald-100 transition-colors">{s.location} – {s.shoot_date}</Link>
                              ))}
                            </div>
                          )}

                          {/* Client Review: notification */}
                          {!isMain && item.phase === 'review' && clientReviewCount > 0 && (
                            <div className="mt-1">
                              <Link to="/production/messages" className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs font-medium hover:bg-red-100 transition-colors">
                                {clientReviewCount} client {clientReviewCount === 1 ? 'comment' : 'comments'}
                              </Link>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {!isMain && item.is_completed && item.completed_at && (
                      <span className="text-xs text-green-500">{new Date(item.completed_at).toLocaleDateString()}</span>
                    )}

                    {!isVirtual && (
                      <div className="flex items-center gap-1">
                        {rowIsEditing ? (
                          <>
                            <button
                              onClick={saveEditMilestone}
                              className="p-1 text-green-600 hover:text-green-700"
                              title="Save"
                            >
                              <CheckIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEditMilestone}
                              className="p-1 text-gray-500 hover:text-gray-700"
                              title="Cancel"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditMilestone(item)}
                              className="p-1 text-gray-500 hover:text-indigo-600"
                              title="Edit"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMilestone(item.id)}
                              className="p-1 text-gray-500 hover:text-red-600"
                              title="Delete"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              };

              return (
                <div key={group.phase} className="space-y-1">
                  {renderRow(parent, { isMain: true, isVirtual: !group.parent })}
                  {childMilestones.length > 0 && (
                    <div className="ml-8 space-y-1 border-l border-gray-200 pl-3">
                      {childMilestones.map((sub) => renderRow(sub))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {confirmMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-5">
            <h5 className="text-base font-semibold text-gray-900 mb-2">Confirm milestone update</h5>
            <p className="text-sm text-gray-600">
              {confirmMilestone.is_completed
                ? 'Mark this milestone as not completed?'
                : 'Mark this milestone as completed?'}
            </p>
            <p className="text-sm font-medium text-gray-800 mt-2">{cleanMilestoneLabel(confirmMilestone.title)}</p>
            {normalizeMsTitle(confirmMilestone.title).includes('location') && !confirmMilestone.is_completed && (
              <div className="mt-3">
                <label className="block text-xs text-gray-500 mb-1 font-medium">Confirmed Location</label>
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="Enter the confirmed location…"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setConfirmMilestone(null)}
                className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmToggleMilestone}
                disabled={updateMilestone.isPending}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <ShootSchedule projectId={project.id} />
    </div>
  );
}

const GENDER_OPTIONS = ['male', 'female', 'non_binary', 'other', 'prefer_not_to_say'];
const AVAILABILITY_OPTIONS = ['available', 'booked', 'unavailable'];

function AddTalentModal({ onClose, onAdd, existingTalentIds = new Set() }) {
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [availStatus, setAvailStatus] = useState('');
  const [availDate, setAvailDate] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const availParams = availDate ? { date_from: availDate, date_to: availDate } : {};
  const { data: availData } = useTalentAvailability(availDate ? availParams : { enabled: false });
  const { data: talentProfiles } = useTalentProfiles({ approval_status: 'approved' });

  const unavailableIds = useMemo(() => {
    if (!availDate || !availData) return new Set();
    const entries = availData?.results || availData || [];
    return new Set(
      entries
        .filter((e) => e.status === 'unavailable')
        .map((e) => e.talent)
    );
  }, [availData, availDate]);

  const profilesArr = useMemo(() => talentProfiles?.results || talentProfiles || [], [talentProfiles]);
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return profilesArr.filter((p) => {
      if (existingTalentIds.has(p.id)) return false;
      if (q && !(p.full_name || p.user_full_name || '').toLowerCase().includes(q)) return false;
      if (gender && p.gender !== gender) return false;
      if (availStatus && p.availability !== availStatus) return false;
      if (availDate && unavailableIds.has(p.id)) return false;
      if (maxRate && parseFloat(p.hourly_rate) > parseFloat(maxRate)) return false;
      if (minAge && (p.age == null || p.age < parseInt(minAge))) return false;
      if (maxAge && (p.age == null || p.age > parseInt(maxAge))) return false;
      return true;
    });
  }, [profilesArr, search, gender, availStatus, availDate, unavailableIds, maxRate, minAge, maxAge, existingTalentIds]);

  const handleAdd = async () => {
    if (!selectedId) return;
    setSaving(true);
    try { await onAdd({ id: selectedId, notes }); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Add Talent to Consideration</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <input
            className="col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="">All genders</option>
            {GENDER_OPTIONS.map((g) => (
              <option key={g} value={g}>{g.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <select
            value={availStatus}
            onChange={(e) => setAvailStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="">Any availability</option>
            {AVAILABILITY_OPTIONS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <input
            type="date"
            value={availDate}
            onChange={(e) => setAvailDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            title="Available on this date"
          />
          <input
            type="number"
            min="0"
            placeholder="Max rate ($/hr)"
            value={maxRate}
            onChange={(e) => setMaxRate(e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <input
            type="number"
            min="0"
            placeholder="Min age"
            value={minAge}
            onChange={(e) => setMinAge(e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <input
            type="number"
            min="0"
            placeholder="Max age"
            value={maxAge}
            onChange={(e) => setMaxAge(e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div className="max-h-52 overflow-y-auto divide-y divide-gray-50 border border-gray-100 rounded-lg mb-3">
          {filtered.length === 0 && <p className="text-xs text-gray-400 p-3">No results</p>}
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`w-full text-left px-3 py-2 text-sm flex justify-between items-center transition-colors ${
                selectedId === p.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span className="font-medium">{p.full_name || p.user_full_name}</span>
              <span className="text-xs text-gray-400 flex gap-2">
                <span className="capitalize">{(p.talent_type || '').replace(/_/g, ' ')}</span>
                {p.gender && <span className="capitalize">{p.gender.replace(/_/g, ' ')}</span>}
                {p.age && <span>{p.age}y</span>}
                {p.hourly_rate > 0 && <span>${p.hourly_rate}/hr</span>}
                <span className={`capitalize ${p.availability === 'available' ? 'text-green-500' : p.availability === 'booked' ? 'text-yellow-500' : 'text-red-400'}`}>
                  {p.availability}
                </span>
              </span>
            </button>
          ))}
        </div>

        <textarea
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
          rows={2}
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
          <button
            onClick={handleAdd}
            disabled={!selectedId || saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Adding…' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatInquiryRate(value) {
  if (value == null || value === '') return 'Rate TBD';
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return `$${value}`;
  return `$${numericValue.toFixed(2)}`;
}

function formatInquiryWindow(startDate, endDate) {
  if (!startDate && !endDate) return 'Dates TBD';
  if (startDate && endDate) return `${startDate} to ${endDate}`;
  return startDate || endDate;
}

function AvailabilityInquiryModal({ consideration, project, type, onClose, onSend, isPending }) {
  const [position, setPosition] = useState(
    consideration?.inquiry_position || (type === 'crew' ? consideration?.crew_role : consideration?.talent_type) || ''
  );
  const [payRate, setPayRate] = useState(consideration?.inquiry_pay_rate ?? '');
  const [productionStartDate, setProductionStartDate] = useState(
    consideration?.inquiry_production_start_date || project?.start_date || ''
  );
  const [productionEndDate, setProductionEndDate] = useState(
    consideration?.inquiry_production_end_date || project?.deadline || project?.start_date || ''
  );
  const [error, setError] = useState('');

  const personName = type === 'crew' ? consideration?.crew_name : consideration?.talent_name;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await onSend({
        id: consideration.id,
        position,
        pay_rate: payRate,
        production_start_date: productionStartDate,
        production_end_date: productionEndDate,
      });
      onClose();
    } catch (err) {
      const detail = err.response?.data;
      const fallbackMessage = 'Failed to send the availability inquiry.';
      const firstFieldError = detail && typeof detail === 'object'
        ? Object.values(detail).flat().find(Boolean)
        : null;
      setError(firstFieldError || detail?.detail || fallbackMessage);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">Availability Check</h3>
            <p className="text-sm text-gray-500 mt-1">{personName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <input
              required
              value={position}
              onChange={(event) => setPosition(event.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Role for this project"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pay Rate</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={payRate}
              onChange={(event) => setPayRate(event.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Production Start Date</label>
              <input
                required
                type="date"
                value={productionStartDate}
                onChange={(event) => setProductionStartDate(event.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Production End Date</label>
              <input
                required
                type="date"
                value={productionEndDate}
                onChange={(event) => setProductionEndDate(event.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-600">
            Accepting this inquiry confirms project-level availability only. Actual shoot bookings and assignments are still created separately in Workflow - Shoot Schedule.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {isPending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TeamTalentTab({ bookings, assignments, projectId, project }) {
  const [showAddTalentReq, setShowAddTalentReq] = useState(false);
  const [showAddCrewReq, setShowAddCrewReq] = useState(false);
  const [availabilityModal, setAvailabilityModal] = useState(null);
  const [newTalentReq, setNewTalentReq] = useState({ talent_type: 'model', count: 1, notes: '' });
  const [newCrewReq, setNewCrewReq] = useState({ crew_role: 'photographer', count: 1, notes: '' });
  const navigate = useNavigate();

  const { data: rosterSharesData } = useTalentRosterShares({ project: projectId });
  const { data: talentConsData } = useTalentConsiderations({ project: projectId });
  const { data: crewConsData } = useCrewConsiderations({ project: projectId });
  const removeTalentCon = useRemoveTalentConsideration();
  const sendTalentInquiry = useSendTalentAvailabilityInquiry();
  const removeCrewCon = useRemoveCrewConsideration();
  const sendCrewInquiry = useSendCrewAvailabilityInquiry();

  const createTalentReq = useCreateTalentRequirement();
  const createCrewReq = useCreateCrewRequirement();
  const deleteTalentReq = useDeleteTalentRequirement();
  const deleteCrewReq = useDeleteCrewRequirement();

  const talentCons = talentConsData?.results || talentConsData || [];
  const crewCons = crewConsData?.results || crewConsData || [];
  const rosterShares = rosterSharesData?.results || rosterSharesData || [];
  const latestShare = rosterShares[0] || null;

  const talentRequirements = project?.talent_requirements || [];
  const crewRequirements = project?.crew_requirements_list || [];

  // Compute fulfillment: count accepted bookings per talent_type
  const acceptedBookings = bookings.filter((b) => b.status === 'accepted' || b.status === 'confirmed');
  const acceptedAssignments = assignments.filter((a) => a.status === 'accepted' || a.status === 'confirmed');

  const talentFulfillment = talentRequirements.map((req) => {
    const filled = acceptedBookings.filter((b) => b.talent_type === req.talent_type).length;
    return { ...req, filled };
  });

  const crewFulfillment = crewRequirements.map((req) => {
    const filled = acceptedAssignments.filter((a) => a.role_on_shoot === req.crew_role).length;
    return { ...req, filled };
  });

  const TALENT_TYPE_LABELS = { model: 'Model', actor: 'Actor', voiceover: 'Voiceover', dancer: 'Dancer', livestream: 'Livestream Host', other: 'Other' };
  const CREW_ROLE_LABELS = { director: 'Director', photographer: 'Photographer', dop: 'Director of Photography', videographer: 'Videographer', first_ac: '1st AC', second_ac: '2nd AC', gaffer: 'Gaffer', grip: 'Grip', electric: 'Electric', wardrobe: 'Wardrobe', set_design: 'Set Design', bts: 'Behind-the-Scene', pa: 'Production Assistant', ac: 'Assistant Camera', audio: 'Audio', lighting: 'Lighting', hair_makeup: 'Hair & Makeup', stylist: 'Stylist', crafty: 'Crafty', other: 'Other' };
  const totalTalentNeeded = talentRequirements.reduce((total, req) => total + Number(req.count || 0), 0);
  const totalCrewNeeded = crewRequirements.reduce((total, req) => total + Number(req.count || 0), 0);
  const filledTalentSlots = talentFulfillment.reduce((total, req) => total + Math.min(req.filled, Number(req.count || 0)), 0);
  const filledCrewSlots = crewFulfillment.reduce((total, req) => total + Math.min(req.filled, Number(req.count || 0)), 0);

  const handleAddTalentReq = async () => {
    await createTalentReq.mutateAsync({ project: projectId, ...newTalentReq });
    setNewTalentReq({ talent_type: 'model', count: 1, notes: '' });
    setShowAddTalentReq(false);
  };

  const handleAddCrewReq = async () => {
    await createCrewReq.mutateAsync({ project: projectId, ...newCrewReq });
    setNewCrewReq({ crew_role: 'photographer', count: 1, notes: '' });
    setShowAddCrewReq(false);
  };

  const handleSendInquiry = async (payload) => {
    if (availabilityModal?.type === 'crew') {
      await sendCrewInquiry.mutateAsync(payload);
      return;
    }
    await sendTalentInquiry.mutateAsync(payload);
  };

  const FulfillIcon = ({ filled, needed }) => {
    if (filled >= needed) return <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600 text-xs">✓</span>;
    if (filled > 0) return <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-600 text-xs font-bold">!</span>;
    return <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-400 text-xs">○</span>;
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 shadow-lg">
        <div className="flex flex-col gap-5 border-b border-white/10 px-5 py-5 text-white lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">Staffing Requirements</p>
            <h4 className="mt-2 text-xl font-semibold">Plan the roster before the project gets busy</h4>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Keep the project staffing targets visible here, then use the dedicated talent and crew builders below to fill the remaining gaps.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-100">Talent</p>
              <p className="mt-2 text-2xl font-semibold">{filledTalentSlots}/{totalTalentNeeded || 0}</p>
              <p className="mt-1 text-xs text-slate-300">filled against requested slots</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-100">Crew</p>
              <p className="mt-2 text-2xl font-semibold">{filledCrewSlots}/{totalCrewNeeded || 0}</p>
              <p className="mt-1 text-xs text-slate-300">filled against requested slots</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 text-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-100">Talent Needs</p>
                <p className="mt-1 text-sm text-slate-300">Booked and shortlisted talent should roll up against these targets.</p>
              </div>
              <button onClick={() => setShowAddTalentReq(true)} className="rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-white hover:bg-white/10">+ Add</button>
            </div>
            {talentRequirements.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-dashed border-white/15 px-4 py-5 text-sm text-slate-300">No talent requirements yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {talentFulfillment.map((r) => (
                  <li key={r.id} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/10 px-3 py-3 text-sm">
                    <FulfillIcon filled={r.filled} needed={r.count} />
                    <div>
                      <p className="font-medium text-white">{r.count}× {TALENT_TYPE_LABELS[r.talent_type] || r.talent_type}</p>
                      <p className="text-xs text-slate-300">{r.filled}/{r.count} filled</p>
                    </div>
                    {r.notes && <span className="text-xs text-slate-400 italic">{r.notes}</span>}
                    <button onClick={() => deleteTalentReq.mutate(r.id)} className="ml-auto text-xs text-slate-400 hover:text-red-300">×</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 text-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">Crew Needs</p>
                <p className="mt-1 text-sm text-slate-300">Use the crew builder to source the open roles and check real availability before adding them.</p>
              </div>
              <button onClick={() => setShowAddCrewReq(true)} className="rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-white hover:bg-white/10">+ Add</button>
            </div>
            {crewRequirements.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-dashed border-white/15 px-4 py-5 text-sm text-slate-300">No crew requirements yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {crewFulfillment.map((r) => (
                  <li key={r.id} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/10 px-3 py-3 text-sm">
                    <FulfillIcon filled={r.filled} needed={r.count} />
                    <div>
                      <p className="font-medium text-white">{r.count}× {CREW_ROLE_LABELS[r.crew_role] || r.crew_role?.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-slate-300">{r.filled}/{r.count} filled</p>
                    </div>
                    {r.notes && <span className="text-xs text-slate-400 italic">{r.notes}</span>}
                    <button onClick={() => deleteCrewReq.mutate(r.id)} className="ml-auto text-xs text-slate-400 hover:text-red-300">×</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {(showAddTalentReq || showAddCrewReq) && (
          <div className="space-y-4 border-t border-white/10 bg-white/95 px-5 py-5 text-gray-900">
            {showAddTalentReq && (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 space-y-3">
                <p className="text-xs font-semibold text-indigo-700 uppercase">Add Talent Requirement</p>
                <div className="flex gap-2 items-end">
                  <div>
                    <label className="text-xs text-gray-500">Count</label>
                    <input type="number" min="1" value={newTalentReq.count} onChange={(e) => setNewTalentReq({ ...newTalentReq, count: parseInt(e.target.value) || 1 })} className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Type</label>
                    <select value={newTalentReq.talent_type} onChange={(e) => setNewTalentReq({ ...newTalentReq, talent_type: e.target.value })} className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm">
                      {Object.entries(TALENT_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">Notes</label>
                    <input value={newTalentReq.notes} onChange={(e) => setNewTalentReq({ ...newTalentReq, notes: e.target.value })} placeholder="Optional notes" className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <button onClick={handleAddTalentReq} disabled={createTalentReq.isPending} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-50">Add</button>
                  <button onClick={() => setShowAddTalentReq(false)} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200">Cancel</button>
                </div>
              </div>
            )}

            {showAddCrewReq && (
              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4 space-y-3">
                <p className="text-xs font-semibold text-sky-700 uppercase">Add Crew Requirement</p>
                <div className="flex gap-2 items-end">
                  <div>
                    <label className="text-xs text-gray-500">Count</label>
                    <input type="number" min="1" value={newCrewReq.count} onChange={(e) => setNewCrewReq({ ...newCrewReq, count: parseInt(e.target.value) || 1 })} className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Role</label>
                    <select value={newCrewReq.crew_role} onChange={(e) => setNewCrewReq({ ...newCrewReq, crew_role: e.target.value })} className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm">
                      {Object.entries(CREW_ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">Notes</label>
                    <input value={newCrewReq.notes} onChange={(e) => setNewCrewReq({ ...newCrewReq, notes: e.target.value })} placeholder="Optional notes" className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <button onClick={handleAddCrewReq} disabled={createCrewReq.isPending} className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-medium hover:bg-sky-700 disabled:opacity-50">Add</button>
                  <button onClick={() => setShowAddCrewReq(false)} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Talent Bookings ── */}
      <section className="rounded-[28px] border border-indigo-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">Talent Bookings</p>
            <h4 className="mt-1 text-lg font-semibold text-gray-900">Client-facing talent shortlist and booked roster</h4>
            <p className="mt-1 text-sm text-gray-500">Keep confirmed talent visible here and send the shortlist from the single builder flow below.</p>
          </div>
          <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            {bookings.length} booking{bookings.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className="mt-5">
        {bookings.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-sm text-gray-400">No talent booked to shoots yet.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="px-4 py-3">Talent</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Shoot</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td className="px-4 py-3 text-gray-700">{b.talent_name}</td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{(b.talent_type || '').replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-gray-500">{b.shoot_detail?.location} – {b.shoot_detail?.shoot_date}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>

        {/* Talent Under Consideration */}
        {talentCons.length > 0 && (
          <div className="mt-4 bg-indigo-50 rounded-2xl p-4">
            <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2">Under Consideration</p>
            <ul className="space-y-2">
              {talentCons.map((c) => (
                <li key={c.id} className="flex items-center justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">{c.talent_name}</span>
                      <span className="text-xs text-indigo-500 capitalize">{(c.talent_type || '').replace(/_/g, ' ')}</span>
                      {c.inquiry_status !== 'unsent' && <StatusBadge status={c.inquiry_status} />}
                    </div>
                    {c.notes && <p className="text-xs text-gray-500 mt-0.5">{c.notes}</p>}
                    {c.inquiry_status !== 'unsent' && (
                      <p className="text-xs text-gray-500 mt-1">
                        {c.inquiry_position || 'Position TBD'} • {formatInquiryRate(c.inquiry_pay_rate)} • {formatInquiryWindow(c.inquiry_production_start_date, c.inquiry_production_end_date)}
                      </p>
                    )}
                    {c.inquiry_status === 'accepted' && (
                      <p className="text-xs text-green-700 mt-1">Confirmed for this project. Shoot-level booking still needs to be created separately.</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-3 shrink-0">
                    <button
                      onClick={() => setAvailabilityModal({ type: 'talent', consideration: c })}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700"
                    >
                      {c.inquiry_status === 'unsent' ? 'Availability Check' : 'Resend Inquiry'}
                    </button>
                    <button
                      onClick={() => removeTalentCon.isPending ? null : removeTalentCon.mutate(c.id)}
                      className="text-xs text-gray-400 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-indigo-100/60 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">Client Shortlist</p>
              <h5 className="mt-1 text-sm font-semibold text-gray-900">
                {latestShare ? 'Latest shortlist sent to client' : 'No shortlist sent yet'}
              </h5>
              <p className="mt-1 text-xs text-gray-500">
                Build the shortlist on a full page, confirm the send, and a client-ready PDF is saved on the project automatically.
              </p>
            </div>
            <button
              onClick={() => navigate(`/production/projects/${projectId}/talent-shortlist`)}
              className="inline-flex items-center justify-center rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
            >
              {latestShare ? 'Update shortlist' : 'Create shortlist'}
            </button>
          </div>

          {latestShare && (
            <div className="mt-4 rounded-xl border border-white/80 bg-white/90 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {latestShare.talent_details?.length || 0} talent{latestShare.talent_details?.length === 1 ? '' : 's'} sent
                  </p>
                  <p className="text-xs text-gray-500">
                    {latestShare.shared_at ? new Date(latestShare.shared_at).toLocaleString() : 'Recently sent'}
                  </p>
                </div>
                {latestShare.pdf_url && (
                  <a
                    href={latestShare.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-xl border border-indigo-200 px-3 py-2 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
                  >
                    Open shortlist PDF
                  </a>
                )}
              </div>
              {latestShare.talent_details?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {latestShare.talent_details.slice(0, 6).map((talent) => (
                    <span key={talent.id} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                      {talent.full_name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Crew Assignments ── */}
      <section className="rounded-[28px] border border-sky-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Crew Assignments</p>
            <h4 className="mt-1 text-lg font-semibold text-gray-900">Internal crew sourcing and assignment tracking</h4>
            <p className="mt-1 text-sm text-gray-500">Filter crew on a dedicated page, review availability calendars, and add them to project consideration before assigning shoots.</p>
          </div>
          <button
            onClick={() => navigate(`/production/projects/${projectId}/crew-builder`)}
            className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2 text-xs font-medium text-white hover:bg-sky-700"
          >
            <span>+ Add Crew</span>
          </button>
        </div>

        <div className="mt-5">
        {assignments.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-sm text-gray-400">No crew assigned to shoots yet.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="px-4 py-3">Crew</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Shoot</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {assignments.map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-3 text-gray-700">{a.crew_name}</td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{a.role_on_shoot?.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-gray-500">{a.shoot_detail?.location} – {a.shoot_detail?.shoot_date}</td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>

        {/* Crew Under Consideration */}
        {crewCons.length > 0 && (
          <div className="mt-4 bg-sky-50 rounded-2xl p-4">
            <p className="text-xs font-semibold text-sky-700 uppercase tracking-wide mb-2">Under Consideration</p>
            <ul className="space-y-2">
              {crewCons.map((c) => (
                <li key={c.id} className="flex items-center justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">{c.crew_name}</span>
                      <span className="text-xs text-sky-500 capitalize">{(c.crew_role || '').replace(/_/g, ' ')}</span>
                      {c.inquiry_status !== 'unsent' && <StatusBadge status={c.inquiry_status} />}
                    </div>
                    {c.notes && <p className="text-xs text-gray-500 mt-0.5">{c.notes}</p>}
                    {c.inquiry_status !== 'unsent' && (
                      <p className="text-xs text-gray-500 mt-1">
                        {c.inquiry_position || 'Position TBD'} • {formatInquiryRate(c.inquiry_pay_rate)} • {formatInquiryWindow(c.inquiry_production_start_date, c.inquiry_production_end_date)}
                      </p>
                    )}
                    {c.inquiry_status === 'accepted' && (
                      <p className="text-xs text-green-700 mt-1">Confirmed for this project. Shoot-level assignment still needs to be created separately.</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-3 shrink-0">
                    <button
                      onClick={() => setAvailabilityModal({ type: 'crew', consideration: c })}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-medium hover:bg-sky-700"
                    >
                      {c.inquiry_status === 'unsent' ? 'Availability Check' : 'Resend Inquiry'}
                    </button>
                    <button
                      onClick={() => removeCrewCon.mutate(c.id)}
                      className="text-xs text-gray-400 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
      {availabilityModal && (
        <AvailabilityInquiryModal
          key={`${availabilityModal.type}-${availabilityModal.consideration.id}`}
          consideration={availabilityModal.consideration}
          project={project}
          type={availabilityModal.type}
          onClose={() => setAvailabilityModal(null)}
          onSend={handleSendInquiry}
          isPending={availabilityModal.type === 'crew' ? sendCrewInquiry.isPending : sendTalentInquiry.isPending}
        />
      )}
    </div>
  );
}

function AssetsTab({ project, deliverables, projectId, uploadDeliverable, createDeliverable, updateProject }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newDel, setNewDel] = useState({ name: '', deliverable_type: 'photo', deadline: '' });
  const [newFile, setNewFile] = useState(null);
  const [driveUrl, setDriveUrl] = useState(project.raw_material_url || '');
  const [savingDrive, setSavingDrive] = useState(false);
  const [driveSaved, setDriveSaved] = useState(false);
  const [assetForm, setAssetForm] = useState({
    name: '',
    source_url: '',
    description: '',
    file: null,
  });

  const assets = useMemo(
    () => deliverables.filter((d) => d.deliverable_type === 'other' || d.source_url),
    [deliverables]
  );

  const handleSaveDriveLink = async () => {
    setSavingDrive(true);
    await updateProject.mutateAsync({ id: project.id, raw_material_url: driveUrl });
    setSavingDrive(false);
    setDriveSaved(true);
    setTimeout(() => setDriveSaved(false), 2000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const payload = { ...newDel, project: projectId, status: 'pending' };
    if (newFile) payload.file = newFile;
    await createDeliverable.mutateAsync(payload);
    setShowAdd(false);
    setNewDel({ name: '', deliverable_type: 'photo', deadline: '' });
    setNewFile(null);
  };

  const handleUpload = async (delId, file) => {
    await uploadDeliverable.mutateAsync({ id: delId, file });
  };

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    if (!assetForm.source_url && !assetForm.file) {
      alert('Add either a cloud drive link or a direct upload for this asset.');
      return;
    }
    await createDeliverable.mutateAsync({
      project: projectId,
      name: assetForm.name || 'Project Asset',
      deliverable_type: 'other',
      status: 'in_progress',
      source_url: assetForm.source_url,
      description: assetForm.description,
      file: assetForm.file,
    });
    setAssetForm({ name: '', source_url: '', description: '', file: null });
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
        <h4 className="font-semibold text-gray-800 text-sm">Raw Materials (Google Drive)</h4>
        <div className="flex gap-2">
          <input
            type="url"
            value={driveUrl}
            onChange={(e) => { setDriveUrl(e.target.value); setDriveSaved(false); }}
            placeholder="https://drive.google.com/drive/folders/..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
          <button
            onClick={handleSaveDriveLink}
            disabled={savingDrive}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap"
          >
            {savingDrive ? 'Saving...' : driveSaved ? 'Saved!' : 'Save Link'}
          </button>
        </div>
        {project.raw_material_url && (
          <a
            href={project.raw_material_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
          >
            Open in Google Drive &rarr;
          </a>
        )}
      </div>

      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
        <h4 className="font-semibold text-gray-800 text-sm">Other Assets</h4>
        <form onSubmit={handleCreateAsset} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              placeholder="Asset name"
              value={assetForm.name}
              onChange={(e) => setAssetForm((f) => ({ ...f, name: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <input
              type="url"
              placeholder="Cloud link (Google Drive/Dropbox/etc.)"
              value={assetForm.source_url}
              onChange={(e) => setAssetForm((f) => ({ ...f, source_url: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <textarea
            rows={2}
            placeholder="Notes (optional)"
            value={assetForm.description}
            onChange={(e) => setAssetForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <div>
            <label className="block text-xs text-gray-500 mb-1">Direct upload (optional)</label>
            <input
              type="file"
              onChange={(e) => setAssetForm((f) => ({ ...f, file: e.target.files?.[0] || null }))}
              className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
            />
          </div>
          <button
            type="submit"
            disabled={createDeliverable.isPending}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {createDeliverable.isPending ? 'Adding...' : 'Add Asset'}
          </button>
        </form>

        {assets.length > 0 && (
          <div className="space-y-2 pt-1">
            {assets.map((asset) => (
              <div key={`asset-${asset.id}`} className="p-3 bg-white rounded-lg border border-gray-200 text-sm space-y-1">
                <p className="font-medium text-gray-900">{asset.name}</p>
                {asset.source_url && (
                  <a
                    href={asset.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                  >
                    Open cloud link &rarr;
                  </a>
                )}
                {asset.file_url && (
                  <a
                    href={asset.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 ml-3"
                  >
                    Download uploaded file &rarr;
                  </a>
                )}
                {asset.description && (
                  <p className="text-gray-600">{asset.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-800 text-sm">Deliverables</h4>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700"
        >
          + Add Deliverable
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              required
              placeholder="Deliverable name"
              value={newDel.name}
              onChange={(e) => setNewDel({ ...newDel, name: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <select
              value={newDel.deliverable_type}
              onChange={(e) => setNewDel({ ...newDel, deliverable_type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="photo">Photo</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="document">Document</option>
              <option value="other">Other</option>
            </select>
            <input
              type="date"
              value={newDel.deadline}
              onChange={(e) => setNewDel({ ...newDel, deadline: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Attach file (optional)</label>
            <input
              type="file"
              onChange={(e) => setNewFile(e.target.files[0] || null)}
              className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createDeliverable.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {createDeliverable.isPending ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {deliverables.length === 0 ? (
        <p className="text-sm text-gray-400">No deliverables yet</p>
      ) : (
        <div className="space-y-3">
          {deliverables.map((d) => (
            <div key={d.id} className="p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{d.name}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {d.deliverable_type} &middot; Due {d.deadline || '—'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={d.status} />
                  {!d.file_url && (
                    <>
                      <input
                        type="file"
                        className="hidden"
                        id={`upload-${d.id}`}
                        onChange={(e) => {
                          if (e.target.files[0]) handleUpload(d.id, e.target.files[0]);
                        }}
                      />
                      <label
                        htmlFor={`upload-${d.id}`}
                        className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 cursor-pointer"
                      >
                        Upload File
                      </label>
                    </>
                  )}
                </div>
              </div>

              {/* File preview */}
              {d.file_url && (
                <div className="mt-2">
                  {d.deliverable_type === 'photo' ? (
                    <a href={d.file_url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={d.file_url}
                        alt={d.name}
                        className="h-32 w-auto rounded-lg object-cover border border-gray-200"
                      />
                    </a>
                  ) : d.deliverable_type === 'video' ? (
                    <video
                      src={d.file_url}
                      controls
                      className="h-40 w-auto rounded-lg border border-gray-200"
                    />
                  ) : (
                    <a
                      href={d.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      Download file &rarr;
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const CAT_CONFIG = {
  talent:          { label: 'Talent',          color: 'bg-indigo-400',  text: 'text-indigo-700',  bar: 'bg-indigo-200' },
  crew:            { label: 'Crew',            color: 'bg-violet-400',  text: 'text-violet-700',  bar: 'bg-violet-200' },
  props:           { label: 'Props',           color: 'bg-cyan-400',    text: 'text-cyan-700',    bar: 'bg-cyan-200' },
  equipment:       { label: 'Equipment',       color: 'bg-blue-400',    text: 'text-blue-700',    bar: 'bg-blue-200' },
  equipment_rental:{ label: 'Equipment Rental',color: 'bg-blue-500',    text: 'text-blue-800',    bar: 'bg-blue-200' },
  location:        { label: 'Location',        color: 'bg-amber-400',   text: 'text-amber-700',   bar: 'bg-amber-200' },
  catering:        { label: 'Catering',        color: 'bg-emerald-400', text: 'text-emerald-700', bar: 'bg-emerald-200' },
  travel:          { label: 'Travel',          color: 'bg-orange-400',  text: 'text-orange-700',  bar: 'bg-orange-200' },
  gas:             { label: 'Gas',             color: 'bg-lime-400',    text: 'text-lime-700',    bar: 'bg-lime-200' },
  post_production: { label: 'Post Production', color: 'bg-pink-400',    text: 'text-pink-700',    bar: 'bg-pink-200' },
  miscellaneous:   { label: 'Miscellaneous',   color: 'bg-slate-400',   text: 'text-slate-700',   bar: 'bg-slate-200' },
  other:           { label: 'Other',           color: 'bg-gray-400',    text: 'text-gray-700',    bar: 'bg-gray-200' },
};
const CATEGORIES = Object.keys(CAT_CONFIG);

function AddExpenseModal({ projectId, onClose }) {
  const createExpense = useCreateExpense();
  const [form, setForm] = useState({
    description: '', category: 'talent', amount: '', date: '', receipt: null,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.description || !form.amount || !form.date) return;
    setSaving(true);
    try {
      await createExpense.mutateAsync({ ...form, project: projectId });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Add Expense</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Description *</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="e.g. Studio rental"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Category *</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CAT_CONFIG[c].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Amount ($) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Date *</label>
            <input
              type="date"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Payment Proof (optional)</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              onChange={(e) => setForm((f) => ({ ...f, receipt: e.target.files[0] || null }))}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving || !form.description || !form.amount || !form.date}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Add Expense'}
          </button>
        </div>
      </div>
    </div>
  );
}

function BudgetTab({ expenses, financials, projectId, project }) {
  const { data: rawAllocList = [] } = useBudgetAllocations(projectId);
  const upsertAlloc = useUpsertBudgetAllocation();
  const deleteExpense = useDeleteExpense();
  const updateExpense = useUpdateExpense();
  const updateProject = useUpdateProject();

  const [editBudget, setEditBudget] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState('');
  const [editingCat, setEditingCat] = useState(null);
  const [allocDraft, setAllocDraft] = useState('');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [reimbursedDraft, setReimbursedDraft] = useState(false);
  const [reimbursementProof, setReimbursementProof] = useState(null);

  const allocList = Array.isArray(rawAllocList)
    ? rawAllocList
    : (rawAllocList?.results || []);
  const allocMap = Object.fromEntries(allocList.map((a) => [a.category, a]));
  const spentByCat = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});

  const totalBudget = Number(project?.budget || financials?.budget || 0);
  const totalAllocated = CATEGORIES.reduce((s, c) => s + Number(allocMap[c]?.amount || 0), 0);
  const totalSpent = Number(financials?.total_expenses || 0);
  const remaining = totalBudget - totalSpent;

  // build stacked bar segments
  const barSegments = CATEGORIES
    .filter((c) => Number(allocMap[c]?.amount || 0) > 0)
    .map((c) => ({ cat: c, pct: (Number(allocMap[c].amount) / Math.max(totalBudget, 1)) * 100 }));
  const unallocatedPct = Math.max(0, 100 - barSegments.reduce((s, b) => s + b.pct, 0));

  const saveBudget = async () => {
    await updateProject.mutateAsync({ id: projectId, budget: budgetDraft });
    setEditBudget(false);
  };

  const saveAlloc = async (cat) => {
    const existing = allocMap[cat];
    await upsertAlloc.mutateAsync({
      ...(existing ? { id: existing.id } : {}),
      project: Number(projectId),
      category: cat,
      amount: allocDraft,
    });
    setEditingCat(null);
  };

  const openExpense = (expense) => {
    setSelectedExpense(expense);
    setReimbursedDraft(!!expense.reimbursed);
    setReimbursementProof(null);
  };

  const saveReimbursement = async () => {
    if (!selectedExpense) return;
    try {
      await updateExpense.mutateAsync({
        id: selectedExpense.id,
        reimbursed: reimbursedDraft,
        reimbursement_proof: reimbursementProof,
      });
      setSelectedExpense(null);
    } catch (err) {
      alert(`Failed to update reimbursement: ${err?.response?.data?.detail || err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {showAddExpense && (
        <AddExpenseModal projectId={projectId} onClose={() => setShowAddExpense(false)} />
      )}
      {selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Expense Details</h3>
              <button onClick={() => setSelectedExpense(null)} className="p-1 rounded hover:bg-gray-100">
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500">Description</p>
                <p className="text-gray-800 font-medium">{selectedExpense.description}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Category</p>
                <p className="text-gray-800">{CAT_CONFIG[selectedExpense.category]?.label || selectedExpense.category}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Amount</p>
                <p className="text-gray-900 font-semibold">${Number(selectedExpense.amount).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-gray-700">{selectedExpense.date}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Time</p>
                <p className="text-gray-700">{selectedExpense.created_at ? new Date(selectedExpense.created_at).toLocaleString() : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Submitted By</p>
                <p className="text-gray-700">{selectedExpense.submitted_by_name || 'Production Admin'}</p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 p-3 space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase">Receipt</p>
              {selectedExpense.receipt_url ? (
                <a href={selectedExpense.receipt_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-700 text-sm">
                  View uploaded receipt
                </a>
              ) : (
                <p className="text-sm text-gray-400">No receipt uploaded</p>
              )}
            </div>

            <div className="rounded-lg border border-gray-100 p-3 space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase">Reimbursement</p>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={reimbursedDraft}
                  onChange={(e) => setReimbursedDraft(e.target.checked)}
                />
                Mark as reimbursed
              </label>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Reimbursement Proof (optional)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setReimbursementProof(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500"
                />
              </div>
              {selectedExpense.reimbursement_proof_url && (
                <a
                  href={selectedExpense.reimbursement_proof_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 text-sm"
                >
                  View reimbursement proof
                </a>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setSelectedExpense(null)} className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">Close</button>
              <button
                onClick={saveReimbursement}
                disabled={updateExpense.isPending}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {updateExpense.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-4 gap-3">
        {/* Total Budget — editable */}
        <div className="p-3 bg-gray-50 rounded-xl text-center relative group">
          <p className="text-xs text-gray-500 mb-1">Total Budget</p>
          {editBudget ? (
            <div className="flex items-center justify-center gap-1">
              <span className="text-sm text-gray-500">$</span>
              <input
                autoFocus
                type="number"
                min="0"
                className="w-24 text-center text-lg font-bold border-b-2 border-indigo-400 bg-transparent focus:outline-none"
                value={budgetDraft}
                onChange={(e) => setBudgetDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveBudget(); if (e.key === 'Escape') setEditBudget(false); }}
              />
              <button onClick={saveBudget} className="p-0.5 rounded hover:bg-green-100"><CheckIcon className="w-4 h-4 text-green-600" /></button>
              <button onClick={() => setEditBudget(false)} className="p-0.5 rounded hover:bg-red-100"><XMarkIcon className="w-4 h-4 text-red-400" /></button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1">
              <p className="text-lg font-bold text-gray-900">${totalBudget.toLocaleString()}</p>
              <button onClick={() => { setBudgetDraft(totalBudget); setEditBudget(true); }} className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-gray-200">
                <PencilIcon className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          )}
        </div>
        <div className="p-3 bg-indigo-50 rounded-xl text-center">
          <p className="text-xs text-gray-500 mb-1">Allocated</p>
          <p className="text-lg font-bold text-indigo-700">${totalAllocated.toLocaleString()}</p>
        </div>
        <div className="p-3 bg-red-50 rounded-xl text-center">
          <p className="text-xs text-gray-500 mb-1">Spent</p>
          <p className="text-lg font-bold text-red-600">${totalSpent.toLocaleString()}</p>
        </div>
        <div className={`p-3 rounded-xl text-center ${remaining >= 0 ? 'bg-green-50' : 'bg-rose-50'}`}>
          <p className="text-xs text-gray-500 mb-1">Remaining</p>
          <p className={`text-lg font-bold ${remaining >= 0 ? 'text-green-600' : 'text-rose-600'}`}>
            {remaining < 0 ? '-' : ''}${Math.abs(remaining).toLocaleString()}
          </p>
        </div>
      </div>

      {/* ── Stacked allocation bar ── */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Budget Allocation</p>
        <div className="flex h-5 rounded-full overflow-hidden bg-gray-100">
          {barSegments.map(({ cat, pct }) => (
            <div
              key={cat}
              title={`${CAT_CONFIG[cat].label}: ${pct.toFixed(1)}%`}
              className={`${CAT_CONFIG[cat].color} transition-all`}
              style={{ width: `${pct}%` }}
            />
          ))}
          {unallocatedPct > 0 && (
            <div className="bg-gray-200" style={{ width: `${unallocatedPct}%` }} title="Unallocated" />
          )}
        </div>
        {/* legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {barSegments.map(({ cat, pct }) => (
            <span key={cat} className="flex items-center gap-1 text-xs text-gray-500">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${CAT_CONFIG[cat].color}`} />
              {CAT_CONFIG[cat].label} {pct.toFixed(1)}%
            </span>
          ))}
        </div>
      </div>

      {/* ── Per-category rows ── */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Category Breakdown</p>
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
          {CATEGORIES.map((cat) => {
            const cfg = CAT_CONFIG[cat];
            const allocated = Number(allocMap[cat]?.amount || 0);
            const spent = spentByCat[cat] || 0;
            const spentPct = allocated > 0 ? Math.min(100, (spent / allocated) * 100) : 0;
            const isEditing = editingCat === cat;
            return (
              <div key={cat} className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 group">
                <span className={`w-3 h-3 rounded-full flex-shrink-0 ${cfg.color}`} />
                <span className="w-32 text-sm text-gray-700">{cfg.label}</span>
                {/* Allocated (editable) */}
                <div className="flex items-center gap-1 w-28">
                  {isEditing ? (
                    <>
                      <span className="text-xs text-gray-400">$</span>
                      <input
                        autoFocus
                        type="number"
                        min="0"
                        className="w-20 text-sm border-b border-indigo-400 bg-transparent focus:outline-none"
                        value={allocDraft}
                        onChange={(e) => setAllocDraft(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') saveAlloc(cat); if (e.key === 'Escape') setEditingCat(null); }}
                      />
                      <button onClick={() => saveAlloc(cat)} className="p-0.5 rounded hover:bg-green-100"><CheckIcon className="w-3.5 h-3.5 text-green-600" /></button>
                      <button onClick={() => setEditingCat(null)} className="p-0.5 rounded hover:bg-red-100"><XMarkIcon className="w-3.5 h-3.5 text-red-400" /></button>
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-gray-600">${allocated.toLocaleString()}</span>
                      <button
                        onClick={() => { setAllocDraft(allocated); setEditingCat(cat); }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-gray-200 ml-1"
                      >
                        <PencilIcon className="w-3 h-3 text-gray-400" />
                      </button>
                    </>
                  )}
                </div>
                {/* Spent */}
                <span className={`w-20 text-sm font-medium ${spent > 0 ? cfg.text : 'text-gray-300'}`}>
                  ${spent.toLocaleString()}
                </span>
                {/* Mini progress bar */}
                <div className="flex-1 h-1.5 rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${cfg.color} ${spentPct >= 100 ? 'opacity-100' : 'opacity-70'}`}
                    style={{ width: `${spentPct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs text-gray-400">{spentPct.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Expenses table ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Expenses</p>
          <button
            onClick={() => setShowAddExpense(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            Add Expense
          </button>
        </div>
        {expenses.length === 0 ? (
          <p className="text-sm text-gray-400">No expenses recorded yet.</p>
        ) : (
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2">Category</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                  <th className="px-4 py-2">Reimbursed</th>
                  <th className="px-4 py-2">Proof</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openExpense(e)}>
                    <td className="px-4 py-2.5 text-gray-700">{e.description}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${CAT_CONFIG[e.category]?.text || 'text-gray-600'}`}>
                        <span className={`w-2 h-2 rounded-full ${CAT_CONFIG[e.category]?.color || 'bg-gray-300'}`} />
                        {CAT_CONFIG[e.category]?.label || e.category}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500">{e.date}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-gray-900">${Number(e.amount).toLocaleString()}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={e.reimbursed ? 'paid' : 'pending'} />
                    </td>
                    <td className="px-4 py-2.5">
                      {e.receipt_url ? (
                        <a href={e.receipt_url} target="_blank" rel="noreferrer" className="flex items-center gap-0.5 text-indigo-500 hover:text-indigo-700">
                          <PaperClipIcon className="w-3.5 h-3.5" />
                          <span className="text-xs">View</span>
                        </a>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={(evt) => {
                          evt.stopPropagation();
                          deleteExpense.mutate({ id: e.id, projectId });
                        }}
                        className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ContractsTab({ contracts }) {
  return (
    <div>
      <h4 className="font-semibold text-gray-800 text-sm mb-3">Contracts & Agreements</h4>
      {contracts.length === 0 ? (
        <p className="text-sm text-gray-400">No contracts</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase">
              <th className="pb-2">Title</th>
              <th className="pb-2">Type</th>
              <th className="pb-2">Party</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {contracts.map((c) => (
              <tr key={c.id}>
                <td className="py-2 text-gray-700">{c.title || '—'}</td>
                <td className="py-2 text-gray-500 capitalize">{c.contract_type}</td>
                <td className="py-2 text-gray-500">{c.user_name}</td>
                <td className="py-2"><StatusBadge status={c.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-gray-900">{value}</dd>
    </div>
  );
}

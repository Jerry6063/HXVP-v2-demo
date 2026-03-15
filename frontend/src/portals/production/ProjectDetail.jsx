import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PencilIcon, TrashIcon, PlusIcon, CheckIcon, XMarkIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import ShootSchedule from './ShootSchedule';
import {
  useProject,
  useDeliverables,
  useContracts,
  useExpenses,
  useProjectFinancials,
  useArchiveProject,
  useUpdateProject,
  useBookings,
  useCrewAssignments,
  useUploadDeliverable,
  useCreateDeliverable,
  useMilestones,
  useCreateMilestone,
  useUpdateMilestone,
  useDeleteMilestone,
  useTalentConsiderations,
  useAddTalentConsideration,
  useRemoveTalentConsideration,
  useCrewConsiderations,
  useAddCrewConsideration,
  useRemoveCrewConsideration,
  useTalentProfiles,
  useCrewProfiles,
  useCreateExpense,
  useDeleteExpense,
  useUpdateExpense,
  useBudgetAllocations,
  useUpsertBudgetAllocation,
} from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';

const tabs = [
  'Workflow',
  'Team & Talent',
  'Assets & Deliverables',
  'Budget & Expenses',
  'Contracts',
  'Activity Log',
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

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const { data: project, isLoading } = useProject(id);
  const { data: deliverables } = useDeliverables({ project: id });
  const { data: contracts } = useContracts({ project: id });
  const { data: expenses } = useExpenses({ project: id });
  const { data: financials } = useProjectFinancials(id);
  const { data: bookings } = useBookings({ project: id });
  const { data: assignments } = useCrewAssignments({ project: id });
  const archiveProject = useArchiveProject();
  const updateProject = useUpdateProject();
  const uploadDeliverable = useUploadDeliverable();
  const createDeliverable = useCreateDeliverable();
  const { data: milestonesData } = useMilestones({ project: id });
  const createMilestone = useCreateMilestone();
  const updateMilestone = useUpdateMilestone();
  const deleteMilestone = useDeleteMilestone();

  const deliverablesArr = deliverables?.results || deliverables || [];
  const milestonesArr = (milestonesData?.results || milestonesData || []).sort(
    (a, b) => a.order - b.order
  );
  const contractsArr = contracts?.results || contracts || [];
  const expensesArr = expenses?.results || expenses || [];
  const bookingsArr = bookings?.results || bookings || [];
  const assignmentsArr = assignments?.results || assignments || [];
  const shoots = project?.shoots || [];
  const logs = project?.activity_logs || [];

  if (isLoading) return <div className="text-center py-10 text-gray-400">Loading...</div>;
  if (!project) return <div className="text-center py-10 text-gray-400">Project not found</div>;

  return (
    <div className="space-y-6">
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
              onClick={async () => {
                await archiveProject.mutateAsync(id);
                navigate('/production/projects');
              }}
              className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Archive
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
              {tabs.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className={`pb-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === i
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            {activeTab === 0 && (
              <WorkflowTab
                project={project}
                milestones={milestonesArr}
                createMilestone={createMilestone}
                updateMilestone={updateMilestone}
                deleteMilestone={deleteMilestone}
              />
            )}
            {activeTab === 1 && (
              <TeamTalentTab bookings={bookingsArr} assignments={assignmentsArr} projectId={id} />
            )}
            {activeTab === 2 && (
              <AssetsTab
                project={project}
                deliverables={deliverablesArr}
                projectId={id}
                uploadDeliverable={uploadDeliverable}
                createDeliverable={createDeliverable}
                updateProject={updateProject}
              />
            )}
            {activeTab === 3 && (
              <BudgetTab expenses={expensesArr} financials={financials} projectId={id} project={project} />
            )}
            {activeTab === 4 && (
              <ContractsTab contracts={contractsArr} />
            )}
            {activeTab === 5 && (
              <ActivityTab logs={logs} />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Confirmed Crew */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Confirmed Crew</h3>
            {assignmentsArr.filter((a) => a.status === 'accepted').length === 0 ? (
              <p className="text-xs text-gray-400">No confirmed crew</p>
            ) : (
              <ul className="space-y-2">
                {assignmentsArr
                  .filter((a) => a.status === 'accepted')
                  .map((a) => (
                    <li key={a.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{a.crew_name}</span>
                      <span className="text-xs text-gray-400 capitalize">
                        {a.role_on_shoot?.replace(/_/g, ' ')}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </div>

          {/* Assigned Talent */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 text-sm mb-3">Assigned Talent</h3>
            {bookingsArr.filter((b) => b.status === 'accepted').length === 0 ? (
              <p className="text-xs text-gray-400">No confirmed talent</p>
            ) : (
              <ul className="space-y-2">
                {bookingsArr
                  .filter((b) => b.status === 'accepted')
                  .map((b) => (
                    <li key={b.id} className="text-sm text-gray-700">
                      {b.talent_name}
                    </li>
                  ))}
              </ul>
            )}
          </div>

          {/* Financials */}
          {financials && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Project Financials</h3>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WorkflowTab({ project, milestones, createMilestone, updateMilestone, deleteMilestone }) {
  const [showAddMs, setShowAddMs] = useState(false);
  const [newMs, setNewMs] = useState({ phase: 'preparing', title: '' });
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({ title: '', phase: 'preparing' });
  const [confirmMilestone, setConfirmMilestone] = useState(null);
  const [draggedMilestoneId, setDraggedMilestoneId] = useState(null);

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
    setConfirmMilestone(ms);
  };

  const handleConfirmToggleMilestone = async () => {
    if (!confirmMilestone) return;
    if (isPhaseMainMilestone(confirmMilestone)) {
      setConfirmMilestone(null);
      return;
    }

    const nextCompleted = !confirmMilestone.is_completed;

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

function AddConsiderationModal({ title, onClose, onAdd, profiles, type }) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const profilesArr = profiles?.results || profiles || [];
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return profilesArr.filter((p) => {
      const name = p.full_name || p.user_full_name || '';
      const role = (p.talent_type || p.crew_role || '').toLowerCase();
      return name.toLowerCase().includes(q) || role.includes(q);
    });
  }, [profilesArr, search]);

  const handleAdd = async () => {
    if (!selectedId) return;
    setSaving(true);
    try { await onAdd({ id: selectedId, notes }); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <input
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder={`Search ${type === 'talent' ? 'talent' : 'crew'}…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="max-h-52 overflow-y-auto divide-y divide-gray-50 border border-gray-100 rounded-lg mb-3">
          {filtered.length === 0 && (
            <p className="text-xs text-gray-400 p-3">No results</p>
          )}
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`w-full text-left px-3 py-2 text-sm flex justify-between items-center transition-colors ${
                selectedId === p.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span className="font-medium">{p.full_name || p.user_full_name}</span>
              <span className="text-xs text-gray-400 capitalize">
                {(p.talent_type || p.crew_role || '').replace(/_/g, ' ')}
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

function TeamTalentTab({ bookings, assignments, projectId }) {
  const [showAddTalent, setShowAddTalent] = useState(false);
  const [showAddCrew, setShowAddCrew] = useState(false);

  const { data: talentConsData } = useTalentConsiderations({ project: projectId });
  const { data: crewConsData } = useCrewConsiderations({ project: projectId });
  const addTalentCon = useAddTalentConsideration();
  const removeTalentCon = useRemoveTalentConsideration();
  const addCrewCon = useAddCrewConsideration();
  const removeCrewCon = useRemoveCrewConsideration();
  const { data: talentProfiles } = useTalentProfiles({ approval_status: 'approved' });
  const { data: crewProfilesData } = useCrewProfiles();

  const talentCons = talentConsData?.results || talentConsData || [];
  const crewCons = crewConsData?.results || crewConsData || [];

  const handleAddTalent = async ({ id, notes }) => {
    await addTalentCon.mutateAsync({ project: projectId, talent: id, notes });
    setShowAddTalent(false);
  };

  const handleAddCrew = async ({ id, notes }) => {
    await addCrewCon.mutateAsync({ project: projectId, crew: id, notes });
    setShowAddCrew(false);
  };

  return (
    <div className="space-y-8">
      {/* ── Talent Bookings ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-800 text-sm">Talent Bookings</h4>
          <button
            onClick={() => setShowAddTalent(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700"
          >
            <span>+ Add Talent</span>
          </button>
        </div>
        {bookings.length === 0 ? (
          <p className="text-sm text-gray-400 mb-3">No talent booked to shoots yet</p>
        ) : (
          <table className="w-full text-sm mb-3">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase">
                <th className="pb-2">Talent</th>
                <th className="pb-2">Shoot</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td className="py-2 text-gray-700">{b.talent_name}</td>
                  <td className="py-2 text-gray-500">{b.shoot_detail?.location} – {b.shoot_detail?.shoot_date}</td>
                  <td className="py-2"><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Talent Under Consideration */}
        {talentCons.length > 0 && (
          <div className="bg-indigo-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2">Under Consideration</p>
            <ul className="space-y-2">
              {talentCons.map((c) => (
                <li key={c.id} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-800">{c.talent_name}</span>
                    <span className="ml-2 text-xs text-indigo-500 capitalize">{(c.talent_type || '').replace(/_/g, ' ')}</span>
                    {c.notes && <p className="text-xs text-gray-500 mt-0.5">{c.notes}</p>}
                  </div>
                  <button
                    onClick={() => removeCrewCon.isPending ? null : removeTalentCon.mutate(c.id)}
                    className="text-xs text-gray-400 hover:text-red-500 ml-3 shrink-0"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ── Crew Assignments ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-800 text-sm">Crew Assignments</h4>
          <button
            onClick={() => setShowAddCrew(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-medium hover:bg-sky-700"
          >
            <span>+ Add Crew</span>
          </button>
        </div>
        {assignments.length === 0 ? (
          <p className="text-sm text-gray-400 mb-3">No crew assigned to shoots yet</p>
        ) : (
          <table className="w-full text-sm mb-3">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase">
                <th className="pb-2">Crew</th>
                <th className="pb-2">Role</th>
                <th className="pb-2">Shoot</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {assignments.map((a) => (
                <tr key={a.id}>
                  <td className="py-2 text-gray-700">{a.crew_name}</td>
                  <td className="py-2 text-gray-500 capitalize">{a.role_on_shoot?.replace(/_/g, ' ')}</td>
                  <td className="py-2 text-gray-500">{a.shoot_detail?.location} – {a.shoot_detail?.shoot_date}</td>
                  <td className="py-2"><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Crew Under Consideration */}
        {crewCons.length > 0 && (
          <div className="bg-sky-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-sky-700 uppercase tracking-wide mb-2">Under Consideration</p>
            <ul className="space-y-2">
              {crewCons.map((c) => (
                <li key={c.id} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-800">{c.crew_name}</span>
                    <span className="ml-2 text-xs text-sky-500 capitalize">{(c.crew_role || '').replace(/_/g, ' ')}</span>
                    {c.notes && <p className="text-xs text-gray-500 mt-0.5">{c.notes}</p>}
                  </div>
                  <button
                    onClick={() => removeCrewCon.mutate(c.id)}
                    className="text-xs text-gray-400 hover:text-red-500 ml-3 shrink-0"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {showAddTalent && (
        <AddConsiderationModal
          title="Add Talent to Consideration"
          type="talent"
          profiles={talentProfiles}
          onClose={() => setShowAddTalent(false)}
          onAdd={handleAddTalent}
        />
      )}
      {showAddCrew && (
        <AddConsiderationModal
          title="Add Crew to Consideration"
          type="crew"
          profiles={crewProfilesData}
          onClose={() => setShowAddCrew(false)}
          onAdd={handleAddCrew}
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
  const fileInputRefs = {};

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

  const isMedia = (type) => ['photo', 'video'].includes(type);

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
              accept="image/*,video/*"
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
                        accept="image/*,video/*"
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

function ActivityTab({ logs }) {
  return (
    <div>
      <h4 className="font-semibold text-gray-800 text-sm mb-3">Activity Log</h4>
      {logs.length === 0 ? (
        <p className="text-sm text-gray-400">No activity recorded</p>
      ) : (
        <ul className="space-y-3">
          {logs.map((log) => (
            <li key={log.id} className="flex items-start gap-3">
              <div className="w-2 h-2 bg-indigo-400 rounded-full mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-700">{log.action}</p>
                <p className="text-xs text-gray-400">
                  {log.user?.first_name} {log.user?.last_name} &middot;{' '}
                  {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
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

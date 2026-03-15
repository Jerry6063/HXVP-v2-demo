import { useState } from 'react';
import {
  useEvaluations,
  useCreateEvaluation,
  useUpdateEvaluation,
  useDeleteEvaluation,
  useTalentProfiles,
  useCrewProfiles,
  useProjects,
} from '../../api/hooks';
import LoadingSpinner from '../../components/LoadingSpinner';

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

function StarRating({ value, onChange, readonly = false }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`text-lg transition ${
            star <= value
              ? 'text-yellow-400'
              : 'text-gray-300'
          } ${readonly ? 'cursor-default' : 'hover:text-yellow-400'}`}
        >
          ★
        </button>
      ))}
      {value > 0 && (
        <span className="text-xs text-gray-500 ml-1 self-center">
          {RATING_LABELS[value]}
        </span>
      )}
    </div>
  );
}

export default function Evaluations() {
  const [filterType, setFilterType] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const { data: evalsData, isLoading } = useEvaluations(
    Object.fromEntries(
      Object.entries({
        subject_type: filterType,
        subject_user: filterSubject,
      }).filter(([, v]) => v)
    )
  );
  const { data: talentData } = useTalentProfiles();
  const { data: crewData } = useCrewProfiles();
  const { data: projectsData } = useProjects();
  const createEval = useCreateEvaluation();
  const updateEval = useUpdateEvaluation();
  const deleteEval = useDeleteEvaluation();

  const evaluations = evalsData?.results || evalsData || [];
  const talentProfiles = talentData?.results || talentData || [];
  const crewProfiles = crewData?.results || crewData || [];
  const projects = projectsData?.results || projectsData || [];

  const allSubjects = [
    ...talentProfiles.map((t) => ({
      id: t.user?.id,
      name: t.user?.first_name + ' ' + t.user?.last_name,
      type: 'talent',
      role: t.talent_type,
    })),
    ...crewProfiles.map((c) => ({
      id: c.user?.id,
      name: c.user?.first_name + ' ' + c.user?.last_name,
      type: 'crew',
      role: c.crew_role_display || c.crew_role,
    })),
  ];

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    subject_type: 'talent',
    subject_user: '',
    project: '',
    rating: 3,
    professionalism: 3,
    skill_level: 3,
    reliability: 3,
    comments: '',
  });

  const resetForm = () => {
    setForm({
      subject_type: 'talent',
      subject_user: '',
      project: '',
      rating: 3,
      professionalism: 3,
      skill_level: 3,
      reliability: 3,
      comments: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (ev) => {
    setForm({
      subject_type: ev.subject_type,
      subject_user: String(ev.subject_user),
      project: ev.project ? String(ev.project) : '',
      rating: ev.rating,
      professionalism: ev.professionalism || 3,
      skill_level: ev.skill_level || 3,
      reliability: ev.reliability || 3,
      comments: ev.comments || '',
    });
    setEditingId(ev.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      subject_user: parseInt(form.subject_user),
      project: form.project ? parseInt(form.project) : null,
    };
    if (editingId) {
      await updateEval.mutateAsync({ id: editingId, ...data });
    } else {
      await createEval.mutateAsync(data);
    }
    resetForm();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this evaluation?')) return;
    await deleteEval.mutateAsync(id);
  };

  const filteredSubjects =
    form.subject_type === 'talent'
      ? allSubjects.filter((s) => s.type === 'talent')
      : allSubjects.filter((s) => s.type === 'crew');

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Evaluations</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm"
        >
          {showForm ? 'Cancel' : '+ New Evaluation'}
        </button>
      </div>

      {/* New / Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-5">
          <h2 className="text-lg font-semibold">
            {editingId ? 'Edit Evaluation' : 'Create Evaluation'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                value={form.subject_type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subject_type: e.target.value, subject_user: '' }))
                }
                className="w-full border rounded-lg p-2"
              >
                <option value="talent">Talent / Model</option>
                <option value="crew">Crew</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Person *</label>
              <select
                value={form.subject_user}
                onChange={(e) => setForm((f) => ({ ...f, subject_user: e.target.value }))}
                required
                className="w-full border rounded-lg p-2"
              >
                <option value="">Select...</option>
                {filteredSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                value={form.project}
                onChange={(e) => setForm((f) => ({ ...f, project: e.target.value }))}
                className="w-full border rounded-lg p-2"
              >
                <option value="">None / General</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Overall Rating *</label>
              <StarRating value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Professionalism</label>
              <StarRating
                value={form.professionalism}
                onChange={(v) => setForm((f) => ({ ...f, professionalism: v }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
              <StarRating
                value={form.skill_level}
                onChange={(v) => setForm((f) => ({ ...f, skill_level: v }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reliability</label>
              <StarRating
                value={form.reliability}
                onChange={(v) => setForm((f) => ({ ...f, reliability: v }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
            <textarea
              value={form.comments}
              onChange={(e) => setForm((f) => ({ ...f, comments: e.target.value }))}
              rows={3}
              className="w-full border rounded-lg p-2 text-sm"
              placeholder="Detailed evaluation notes..."
            />
          </div>

          <button
            type="submit"
            disabled={createEval.isPending || updateEval.isPending}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm"
          >
            {editingId ? 'Update' : 'Save'} Evaluation
          </button>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm"
        >
          <option value="">All Types</option>
          <option value="talent">Talent</option>
          <option value="crew">Crew</option>
        </select>
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm"
        >
          <option value="">All People</option>
          {allSubjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.type})
            </option>
          ))}
        </select>
      </div>

      {/* Evaluation Cards */}
      {evaluations.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
          No evaluations yet. Click "+ New Evaluation" to create one.
        </div>
      ) : (
        <div className="space-y-4">
          {evaluations.map((ev) => (
            <div key={ev.id} className="bg-white rounded-xl shadow p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{ev.subject_name}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        ev.subject_type === 'talent'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-sky-100 text-sky-700'
                      }`}
                    >
                      {ev.subject_type}
                    </span>
                  </div>
                  {ev.project_name && (
                    <p className="text-sm text-gray-500 mt-0.5">
                      Project: {ev.project_name}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(ev)}
                    className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(ev.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                <div>
                  <p className="text-xs text-gray-400">Overall</p>
                  <StarRating value={ev.rating} readonly />
                </div>
                {ev.professionalism && (
                  <div>
                    <p className="text-xs text-gray-400">Professionalism</p>
                    <StarRating value={ev.professionalism} readonly />
                  </div>
                )}
                {ev.skill_level && (
                  <div>
                    <p className="text-xs text-gray-400">Skill Level</p>
                    <StarRating value={ev.skill_level} readonly />
                  </div>
                )}
                {ev.reliability && (
                  <div>
                    <p className="text-xs text-gray-400">Reliability</p>
                    <StarRating value={ev.reliability} readonly />
                  </div>
                )}
              </div>

              {ev.comments && (
                <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {ev.comments}
                </p>
              )}

              <p className="mt-2 text-xs text-gray-400">
                By {ev.evaluator_name || 'Admin'} · {new Date(ev.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

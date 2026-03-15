import { useState } from 'react';
import {
  useEvaluations,
  useCreateEvaluation,
  useDeleteEvaluation,
} from '../api/hooks';
import { PlusIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

const CATEGORIES = [
  { key: 'professionalism', label: 'Professionalism' },
  { key: 'skill_level', label: 'Skill Level' },
  { key: 'reliability', label: 'Reliability' },
];

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

function Stars({ value, onChange, readonly = false }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (value || 0);
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star === value ? 0 : star)}
            className={`w-5 h-5 transition-colors ${readonly ? 'cursor-default' : 'hover:scale-110'}`}
          >
            {filled
              ? <StarSolid className="w-5 h-5 text-amber-400" />
              : <StarIcon className="w-5 h-5 text-gray-300" />
            }
          </button>
        );
      })}
      {value > 0 && (
        <span className="text-xs text-gray-400 ml-1">{RATING_LABELS[value]}</span>
      )}
    </div>
  );
}

const EMPTY_FORM = {
  rating: 0,
  professionalism: 0,
  skill_level: 0,
  reliability: 0,
  comments: '',
};

/**
 * EvaluationPanel — embed in talent or crew detail pages.
 * @param {'talent'|'crew'} subjectType
 * @param {number} subjectUserId  — the User pk (not the profile pk)
 * @param {string} [accentColor]  — tailwind text/border color prefix, e.g. 'indigo'
 */
export default function EvaluationPanel({ subjectType, subjectUserId, accentColor = 'indigo' }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState(null);

  const { data: evalsData, isLoading } = useEvaluations(
    subjectUserId ? { subject_type: subjectType, subject_user: subjectUserId } : null
  );
  const createEval = useCreateEvaluation();
  const deleteEval = useDeleteEvaluation();

  const evals = evalsData?.results || evalsData || [];

  const ring = accentColor === 'sky'
    ? 'focus:ring-sky-400'
    : accentColor === 'emerald'
    ? 'focus:ring-emerald-400'
    : 'focus:ring-indigo-400';

  const btnBg = accentColor === 'sky'
    ? 'bg-sky-600 hover:bg-sky-700'
    : accentColor === 'emerald'
    ? 'bg-emerald-600 hover:bg-emerald-700'
    : 'bg-indigo-600 hover:bg-indigo-700';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rating) return;
    await createEval.mutateAsync({
      subject_type: subjectType,
      subject_user: subjectUserId,
      rating: form.rating,
      professionalism: form.professionalism || null,
      skill_level: form.skill_level || null,
      reliability: form.reliability || null,
      comments: form.comments,
    });
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    await deleteEval.mutateAsync(id);
    setDeleteId(null);
  };

  const avgRating = evals.length
    ? (evals.reduce((s, e) => s + e.rating, 0) / evals.length).toFixed(1)
    : null;

  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Internal Evaluations</h2>
          {avgRating && (
            <p className="text-xs text-gray-400 mt-0.5">
              Avg overall: <span className="font-semibold text-amber-500">{avgRating}/5</span>
              {' '}across {evals.length} evaluation{evals.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className={`flex items-center gap-1.5 text-sm text-white px-3 py-1.5 rounded-lg ${btnBg} transition-colors`}
        >
          <PlusIcon className="w-4 h-4" />
          Add Evaluation
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="border border-gray-200 rounded-xl p-4 space-y-4 bg-gray-50"
        >
          <p className="text-sm font-medium text-gray-700">New Evaluation</p>

          {/* Overall (required) */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Overall Rating <span className="text-red-400">*</span>
            </label>
            <Stars value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
            {!form.rating && (
              <p className="text-[10px] text-red-400 mt-0.5">Required</p>
            )}
          </div>

          {/* Category ratings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CATEGORIES.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                <Stars
                  value={form[key]}
                  onChange={(v) => setForm((f) => ({ ...f, [key]: v }))}
                />
              </div>
            ))}
          </div>

          {/* Comments */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Observations &amp; Notes
            </label>
            <textarea
              value={form.comments}
              onChange={(e) => setForm((f) => ({ ...f, comments: e.target.value }))}
              rows={3}
              placeholder="Performance notes, conduct on set, areas for improvement…"
              className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 ${ring} outline-none resize-none bg-white`}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={createEval.isPending || !form.rating}
              className={`text-sm text-white px-4 py-2 rounded-lg ${btnBg} disabled:opacity-50 transition-colors`}
            >
              {createEval.isPending ? 'Saving…' : 'Save Evaluation'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {isLoading ? (
        <p className="text-sm text-gray-400 text-center py-4">Loading…</p>
      ) : evals.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          No evaluations yet. Add the first one above.
        </p>
      ) : (
        <div className="space-y-3">
          {evals.map((ev) => (
            <div key={ev.id} className="border border-gray-100 rounded-xl p-4 space-y-2.5">
              {/* Top row */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <Stars value={ev.rating} readonly />
                  <p className="text-[10px] text-gray-400">
                    {ev.evaluator_name && `By ${ev.evaluator_name} · `}
                    {new Date(ev.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                    {ev.project_name && ` · ${ev.project_name}`}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(ev.id)}
                  disabled={deleteId === ev.id}
                  className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5"
                  title="Delete evaluation"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Category ratings */}
              {(ev.professionalism || ev.skill_level || ev.reliability) && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map(({ key, label }) =>
                    ev[key] ? (
                      <div key={key}>
                        <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
                        <Stars value={ev[key]} readonly />
                      </div>
                    ) : null
                  )}
                </div>
              )}

              {/* Comments */}
              {ev.comments && (
                <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-2">
                  {ev.comments}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

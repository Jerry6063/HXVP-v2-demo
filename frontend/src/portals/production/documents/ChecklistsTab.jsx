import { useState } from 'react';
import {
  useChecklists,
  useChecklist,
  useCreateChecklist,
  useDeleteChecklist,
  useAddChecklistItem,
  useToggleChecklistItem,
  useRemoveChecklistItem,
} from '../../../api/hooks';
import LoadingSpinner from '../../../components/LoadingSpinner';

const CATEGORIES = [
  { value: 'pre_production', label: 'Pre-Production' },
  { value: 'production', label: 'Production Day' },
  { value: 'post_production', label: 'Post-Production' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'general', label: 'General' },
];

function ChecklistDetail({ id, onBack }) {
  const { data: cl, isLoading } = useChecklist(id);
  const addItem = useAddChecklistItem();
  const toggleItem = useToggleChecklistItem();
  const removeItem = useRemoveChecklistItem();
  const [newItemText, setNewItemText] = useState('');

  if (isLoading) return <LoadingSpinner />;
  if (!cl) return null;

  const items = cl.items || [];
  const completed = items.filter((i) => i.is_completed).length;
  const progress = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    await addItem.mutateAsync({ checklistId: id, text: newItemText.trim() });
    setNewItemText('');
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-indigo-600 hover:text-indigo-800 text-sm">
        ← Back to list
      </button>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{cl.title}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-medium capitalize">
                {cl.category?.replace(/_/g, ' ')}
              </span>
              <span className="text-sm text-gray-500">
                {completed}/{items.length} completed
              </span>
            </div>
          </div>
        </div>

        {cl.description && (
          <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">{cl.description}</p>
        )}

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Items */}
        <div className="space-y-1">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                item.is_completed ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <button
                onClick={() => toggleItem.mutate({ checklistId: id, itemId: item.id })}
                className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition ${
                  item.is_completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-indigo-400'
                }`}
              >
                {item.is_completed && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span
                className={`flex-1 text-sm ${
                  item.is_completed ? 'line-through text-gray-400' : 'text-gray-700'
                }`}
              >
                {item.text}
              </span>
              {item.is_completed && item.completed_by_name && (
                <span className="text-xs text-gray-400">
                  by {item.completed_by_name}
                </span>
              )}
              <button
                onClick={() => removeItem.mutate({ checklistId: id, itemId: item.id })}
                className="text-red-400 hover:text-red-600 text-xs flex-shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Add Item */}
        <form onSubmit={handleAddItem} className="flex gap-2 mt-4">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Add new item..."
            className="flex-1 border rounded-lg p-2.5 text-sm"
          />
          <button
            type="submit"
            disabled={addItem.isPending || !newItemText.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ChecklistsTab({ projectId }) {
  const { data: clData, isLoading } = useChecklists({ project: projectId });
  const createCL = useCreateChecklist();
  const deleteCL = useDeleteChecklist();

  const [viewing, setViewing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: 'general',
    description: '',
  });

  const checklists = clData?.results || clData || [];

  const handleCreate = async (e) => {
    e.preventDefault();
    const created = await createCL.mutateAsync({ ...form, project: projectId });
    setShowForm(false);
    setForm({ title: '', category: 'general', description: '' });
    setViewing(created.id);
  };

  if (viewing) {
    return <ChecklistDetail id={viewing} onBack={() => setViewing(null)} />;
  }

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Checklists</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : '+ New Checklist'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow p-6 space-y-4">
          <h3 className="font-semibold">Create Checklist</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                className="w-full border rounded-lg p-2 text-sm"
                placeholder="e.g. Pre-shoot Equipment Check"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full border rounded-lg p-2 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={createCL.isPending}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            Create
          </button>
        </form>
      )}

      {checklists.length === 0 && !showForm ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
          No checklists yet for this project.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {checklists.map((cl) => {
            const progress =
              cl.item_count > 0
                ? Math.round((cl.completed_count / cl.item_count) * 100)
                : 0;
            return (
              <div
                key={cl.id}
                className="bg-white rounded-xl shadow p-5 hover:shadow-md transition cursor-pointer"
                onClick={() => setViewing(cl.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{cl.title}</h3>
                    <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full capitalize">
                      {cl.category?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Delete this checklist?')) deleteCL.mutate(cl.id);
                    }}
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    Delete
                  </button>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>
                      {cl.completed_count}/{cl.item_count} items
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        progress === 100 ? 'bg-green-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

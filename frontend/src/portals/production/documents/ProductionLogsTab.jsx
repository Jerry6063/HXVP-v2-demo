import { useState } from 'react';
import {
  useProductionLogs,
  useCreateProductionLog,
  useUpdateProductionLog,
  useDeleteProductionLog,
} from '../../../api/hooks';
import LoadingSpinner from '../../../components/LoadingSpinner';

const LOG_TYPES = [
  { value: 'note', label: 'Note', color: 'bg-gray-100 text-gray-700', icon: '📝' },
  { value: 'issue', label: 'Issue', color: 'bg-red-100 text-red-700', icon: '⚠️' },
  { value: 'decision', label: 'Decision', color: 'bg-blue-100 text-blue-700', icon: '🔵' },
  { value: 'change', label: 'Change Order', color: 'bg-orange-100 text-orange-700', icon: '🔄' },
  { value: 'milestone', label: 'Milestone', color: 'bg-green-100 text-green-700', icon: '🎯' },
];

export default function ProductionLogsTab({ projectId, shoots }) {
  const [typeFilter, setTypeFilter] = useState('');
  const { data: logsData, isLoading } = useProductionLogs(
    Object.fromEntries(
      Object.entries({ project: projectId, log_type: typeFilter }).filter(([, v]) => v)
    )
  );
  const createLog = useCreateProductionLog();
  const updateLog = useUpdateProductionLog();
  const deleteLog = useDeleteProductionLog();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    log_type: 'note',
    title: '',
    content: '',
    shoot: '',
  });

  const logs = logsData?.results || logsData || [];

  const resetForm = () => {
    setForm({ log_type: 'note', title: '', content: '', shoot: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (log) => {
    setForm({
      log_type: log.log_type,
      title: log.title,
      content: log.content,
      shoot: log.shoot ? String(log.shoot) : '',
    });
    setEditingId(log.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      project: projectId,
      shoot: form.shoot || null,
    };
    if (editingId) {
      await updateLog.mutateAsync({ id: editingId, ...data });
    } else {
      await createLog.mutateAsync(data);
    }
    resetForm();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this log entry?')) return;
    await deleteLog.mutateAsync(id);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Production Logs</h2>
        <button
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : '+ New Log Entry'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
          <h3 className="font-semibold">{editingId ? 'Edit' : 'New'} Log Entry</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                value={form.log_type}
                onChange={(e) => setForm((f) => ({ ...f, log_type: e.target.value }))}
                className="w-full border rounded-lg p-2 text-sm"
              >
                {LOG_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.icon} {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                className="w-full border rounded-lg p-2 text-sm"
                placeholder="Brief summary..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              required
              rows={4}
              className="w-full border rounded-lg p-2 text-sm"
              placeholder="Detailed log entry..."
            />
          </div>
          {shoots.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Related Shoot (optional)
              </label>
              <select
                value={form.shoot}
                onChange={(e) => setForm((f) => ({ ...f, shoot: e.target.value }))}
                className="w-full max-w-md border rounded-lg p-2 text-sm"
              >
                <option value="">None</option>
                {shoots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.shoot_date} – {s.location}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            type="submit"
            disabled={createLog.isPending || updateLog.isPending}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {editingId ? 'Update' : 'Create'} Entry
          </button>
        </form>
      )}

      {/* Type Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTypeFilter('')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition ${
            !typeFilter ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {LOG_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setTypeFilter(t.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              typeFilter === t.value
                ? 'bg-indigo-600 text-white'
                : `${t.color} hover:opacity-80`
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {logs.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
          No log entries yet for this project.
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
          <div className="space-y-4">
            {logs.map((log) => {
              const typeInfo = LOG_TYPES.find((t) => t.value === log.log_type) || LOG_TYPES[0];
              return (
                <div key={log.id} className="relative pl-14">
                  <div
                    className={`absolute left-4 top-4 w-5 h-5 rounded-full flex items-center justify-center text-xs z-10 ${typeInfo.color}`}
                  >
                    {typeInfo.icon}
                  </div>
                  <div className="bg-white rounded-xl shadow p-5 hover:shadow-md transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{log.title}</h3>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeInfo.color}`}
                          >
                            {typeInfo.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(log.logged_at).toLocaleString()} · by {log.author_name}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(log)}
                          className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{log.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

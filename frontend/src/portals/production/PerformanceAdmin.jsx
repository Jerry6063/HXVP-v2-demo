import { useState } from 'react';
import {
  usePerformanceRecords,
  useCreatePerformanceRecord,
  useTalentProfiles,
  useProjects,
} from '../../api/hooks';

const typeLabels = {
  acting: 'Acting Performance',
  livestream: 'Livestream Campaign',
  commercial: 'Commercial',
  print: 'Print Campaign',
  other: 'Other',
};

export default function PerformanceAdmin() {
  const { data: recordsData, isLoading } = usePerformanceRecords();
  const { data: profilesData } = useTalentProfiles();
  const { data: projectsData } = useProjects();
  const createRecord = useCreatePerformanceRecord();

  const records = recordsData?.results || recordsData || [];
  const profiles = profilesData?.results || profilesData || [];
  const projects = projectsData?.results || projectsData || [];

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    talent: '',
    project: '',
    record_type: 'acting',
    title: '',
    description: '',
    client_name: '',
    date: new Date().toISOString().split('T')[0],
    duration_hours: '',
    notes: '',
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    createRecord.mutate(
      {
        talent: parseInt(form.talent, 10),
        project: form.project ? parseInt(form.project, 10) : null,
        record_type: form.record_type,
        title: form.title,
        description: form.description,
        client_name: form.client_name,
        date: form.date,
        duration_hours: parseFloat(form.duration_hours) || 0,
        notes: form.notes,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setForm({
            talent: '', project: '', record_type: 'acting', title: '',
            description: '', client_name: '',
            date: new Date().toISOString().split('T')[0],
            duration_hours: '', notes: '',
          });
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Performance & Campaign Records</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Add Record
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Talent</label>
              <select value={form.talent} onChange={set('talent')} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="">Select talent...</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Type</label>
              <select value={form.record_type} onChange={set('record_type')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                {Object.entries(typeLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Project (optional)</label>
              <select value={form.project} onChange={set('project')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="">None</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Title</label>
              <input type="text" value={form.title} onChange={set('title')} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Client Name</label>
              <input type="text" value={form.client_name} onChange={set('client_name')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date</label>
              <input type="date" value={form.date} onChange={set('date')} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Duration (hours)</label>
              <input type="number" step="0.25" value={form.duration_hours} onChange={set('duration_hours')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={createRecord.isPending} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              {createRecord.isPending ? 'Saving...' : 'Add Record'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">No records yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase bg-gray-50">
                <th className="px-5 py-3">Talent</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-3 font-medium text-gray-900">{r.talent_name}</td>
                  <td className="px-5 py-3 text-gray-500">{typeLabels[r.record_type] || r.record_type}</td>
                  <td className="px-5 py-3 text-gray-700">{r.title}</td>
                  <td className="px-5 py-3 text-gray-500">{r.client_name || '—'}</td>
                  <td className="px-5 py-3 text-gray-500">{r.date}</td>
                  <td className="px-5 py-3 text-gray-500">{r.duration_hours}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

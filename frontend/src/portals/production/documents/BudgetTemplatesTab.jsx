import { useState } from 'react';
import {
  useContracts,
  useCreateContract,
  useSendContract,
  useDeleteContract,
  useProjects,
  useUsers,
  useProjectFinancials,
} from '../../../api/hooks';
import LoadingSpinner from '../../../components/LoadingSpinner';
import StatusBadge from '../../../components/StatusBadge';
import {
  PaperAirplaneIcon,
  TrashIcon,
  DocumentArrowUpIcon,
  PlusIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/24/outline';

// Pre-built budget template text generators
const TEMPLATES = [
  {
    id: 'standard',
    label: 'Standard Production Budget',
    description: 'Full breakdown: pre-prod, shoot, post, talent, crew, equipment.',
    generate: (project, financials) => {
      const budget = Number(project?.budget || 0).toLocaleString();
      const expenses = financials?.total_expenses ? Number(financials.total_expenses).toLocaleString() : '—';
      return `PRODUCTION BUDGET SUMMARY
Project: ${project?.name || '—'}
Client: ${project?.client_name || '—'}
Total Budget: $${budget}
Total Expenses to Date: $${expenses}

BUDGET CATEGORIES
──────────────────────────────
Pre-Production:    $
Talent Fees:       $
Crew Fees:         $
Equipment Rental:  $
Location:          $
Catering:          $
Props:             $
Post-Production:   $
Contingency (10%): $
──────────────────────────────
TOTAL:             $${budget}

Notes:
`;
    },
  },
  {
    id: 'minimal',
    label: 'Minimal Budget Overview',
    description: 'Single-page overview for client approval.',
    generate: (project) => {
      const budget = Number(project?.budget || 0).toLocaleString();
      return `BUDGET OVERVIEW
Project: ${project?.name || '—'}
Approved Budget: $${budget}

Line Items
- Production Crew:  $
- Talent:           $
- Equipment:        $
- Location:         $
- Post-Production:  $
- Miscellaneous:    $
───────────────────
Total:              $${budget}
`;
    },
  },
];

export default function BudgetTemplatesTab() {
  const { data: contractsData, isLoading } = useContracts({ contract_type: 'budget_template' });
  const { data: projectsData } = useProjects();
  const { data: usersData } = useUsers({ role: 'client' });
  const createContract = useCreateContract();
  const sendContract = useSendContract();
  const deleteContract = useDeleteContract();

  const contracts = contractsData?.results || contractsData || [];
  const projects = projectsData?.results || projectsData || [];
  const clients = usersData?.results || usersData || [];

  const [showForm, setShowForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('standard');
  const [form, setForm] = useState({ project: '', user: '', title: '', notes: '', file: null });
  const [previewText, setPreviewText] = useState('');
  const [sendingId, setSendingId] = useState(null);
  const [sendSuccess, setSendSuccess] = useState(null);
  const [error, setError] = useState('');

  const { data: financials } = useProjectFinancials(form.project || null);
  const selectedProject = projects.find((p) => String(p.id) === form.project);

  const handleProjectChange = (projectId) => {
    setForm((f) => ({ ...f, project: projectId }));
    const proj = projects.find((p) => String(p.id) === projectId);
    if (proj) {
      const tmpl = TEMPLATES.find((t) => t.id === selectedTemplate);
      if (tmpl) setPreviewText(tmpl.generate(proj, financials));
    }
  };

  const handleTemplateChange = (tId) => {
    setSelectedTemplate(tId);
    const tmpl = TEMPLATES.find((t) => t.id === tId);
    if (tmpl && selectedProject) setPreviewText(tmpl.generate(selectedProject, financials));
  };

  const resetForm = () => {
    setForm({ project: '', user: '', title: '', notes: '', file: null });
    setPreviewText('');
    setShowForm(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.project || !form.user) {
      setError('Please select a production and client.');
      return;
    }
    try {
      await createContract.mutateAsync({
        project: form.project,
        user: form.user,
        contract_type: 'budget_template',
        title: form.title || `Budget Template – ${selectedProject?.name || ''}`,
        notes: previewText || form.notes,
        ...(form.file ? { file: form.file } : {}),
      });
      resetForm();
    } catch {
      setError('Failed to create budget template. Please try again.');
    }
  };

  const handleSend = async (id) => {
    setSendingId(id);
    try {
      await sendContract.mutateAsync(id);
      setSendSuccess(id);
    } finally {
      setSendingId(null);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Budget Templates</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Generate pre-filled budget documents for clients. Send via portal & email.
          </p>
        </div>
        <button
          onClick={() => setShowForm((p) => !p)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          <PlusIcon className="w-4 h-4" />
          New Budget Template
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow border-t-4 border-emerald-500 p-6 space-y-5">
          <h3 className="font-semibold text-gray-800">New Budget Template</h3>

          {/* Template picker */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Pre-built Template</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTemplateChange(t.id)}
                  className={`text-left p-4 border-2 rounded-xl transition ${
                    selectedTemplate === t.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <DocumentChartBarIcon className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium text-sm text-gray-900">{t.label}</span>
                  </div>
                  <p className="text-xs text-gray-500">{t.description}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Production *</label>
                <select
                  value={form.project}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm"
                  required
                >
                  <option value="">Select production…</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Client *</label>
                <select
                  value={form.user}
                  onChange={(e) => setForm({ ...form, user: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm"
                  required
                >
                  <option value="">Select client…</option>
                  {clients.map((u) => (
                    <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Document Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={`Budget Template – ${selectedProject?.name || 'Production Name'}`}
                className="w-full border rounded-lg p-2.5 text-sm"
              />
            </div>

            {previewText && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Generated Preview (editable)</label>
                <textarea
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  rows={12}
                  className="w-full border rounded-lg p-3 text-xs font-mono resize-y bg-gray-50"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                <DocumentArrowUpIcon className="w-4 h-4 inline mr-1" />
                Or Upload a Budget File (PDF / XLS)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                onChange={(e) => setForm({ ...form, file: e.target.files[0] || null })}
                className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-emerald-50 file:text-emerald-600 hover:file:bg-emerald-100"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createContract.isPending}
                className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                {createContract.isPending ? 'Creating…' : 'Create Budget Template'}
              </button>
              <button type="button" onClick={resetForm} className="px-5 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {contracts.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-10 text-center text-gray-400">
          <DocumentChartBarIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No budget templates yet. Create one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map((c) => {
            const isSent = c.status === 'sent' || c.status === 'signed';
            return (
              <div key={c.id} className="bg-white rounded-xl shadow border-l-4 border-emerald-500 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-gray-900">{c.title || `Budget Template #${c.id}`}</span>
                      <StatusBadge status={c.status} />
                      {sendSuccess === c.id && <span className="text-xs text-green-600 font-medium">✓ Sent</span>}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                      <span>Project: <strong className="text-gray-700">{c.project_name}</strong></span>
                      <span>Client: <strong className="text-gray-700">{c.user_name}</strong></span>
                      <span>Created: <strong className="text-gray-700">{new Date(c.created_at).toLocaleDateString()}</strong></span>
                    </div>
                    {c.notes && !c.file_abs_url && (
                      <pre className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-2 overflow-auto max-h-32 font-mono whitespace-pre-wrap">{c.notes}</pre>
                    )}
                    {c.file_abs_url && (
                      <a href={c.file_abs_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700">
                        <DocumentArrowUpIcon className="w-3.5 h-3.5" />View File
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!isSent && (
                      <button
                        onClick={() => handleSend(c.id)}
                        disabled={sendingId === c.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
                      >
                        <PaperAirplaneIcon className="w-3.5 h-3.5" />
                        {sendingId === c.id ? 'Sending…' : 'Send to Client'}
                      </button>
                    )}
                    {isSent && <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-lg">✓ Delivered</span>}
                    <button onClick={() => deleteContract.mutate(c.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded transition">
                      <TrashIcon className="w-4 h-4" />
                    </button>
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

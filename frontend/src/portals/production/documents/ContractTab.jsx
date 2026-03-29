import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  useContracts,
  useCreateContract,
  useUpdateContract,
  useDeleteContract,
  useSendContract,
  useProjects,
  useUsers,
} from '../../../api/hooks';
import LoadingSpinner from '../../../components/LoadingSpinner';
import StatusBadge from '../../../components/StatusBadge';
import {
  PaperAirplaneIcon,
  TrashIcon,
  DocumentArrowUpIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

/**
 * Generic reusable tab for Talent Agreements and Crew Contracts.
 *
 * Props:
 *   contractType  – backend value e.g. 'talent', 'crew'
 *   recipientRole – 'talent' | 'crew'
 *   recipientLabel – display label e.g. 'Talent Member', 'Crew Member'
 *   typeLabel     – display name of doc type e.g. 'Talent Agreement'
 *   color         – Tailwind border-t color class e.g. 'border-indigo-500'
 */
export default function ContractTab({ contractType, recipientRole, recipientLabel, typeLabel, color = 'border-indigo-500' }) {
  const { data: contractsData, isLoading } = useContracts({ contract_type: contractType });
  const { data: projectsData } = useProjects();
  const { data: usersData } = useUsers({ role: recipientRole });

  const createContract = useCreateContract();
  const updateContract = useUpdateContract();
  const deleteContract = useDeleteContract();
  const sendContract = useSendContract();

  const contracts = contractsData?.results || contractsData || [];
  const projects = projectsData?.results || projectsData || [];
  const users = usersData?.results || usersData || [];

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ project: '', user: '', title: '', notes: '', file: null });
  const [fileInput, setFileInput] = useState(null);
  const [sendingId, setSendingId] = useState(null);
  const [sendSuccess, setSendSuccess] = useState(null);
  const [error, setError] = useState('');

  const resetForm = () => {
    setForm({ project: '', user: '', title: '', notes: '', file: null });
    setFileInput(null);
    setShowForm(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.project || !form.user) {
      setError('Please select a project and recipient.');
      return;
    }
    try {
      await createContract.mutateAsync({
        project: form.project,
        user: form.user,
        contract_type: contractType,
        title: form.title,
        notes: form.notes,
        ...(form.file ? { file: form.file } : {}),
      });
      resetForm();
    } catch {
      setError('Failed to create document. Please try again.');
    }
  };

  const handleSend = async (id) => {
    setSendingId(id);
    setSendSuccess(null);
    try {
      const result = await sendContract.mutateAsync(id);
      setSendSuccess(id);
      if (result.email_sent === false) {
        toast.warning('Document status updated, but email delivery failed.');
      } else {
        toast.success(`${typeLabel} sent successfully.`);
      }
    } catch {
      toast.error(`Failed to send ${typeLabel.toLowerCase()}.`);
    } finally {
      setSendingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    await deleteContract.mutateAsync(id);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{typeLabel}</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Create and send {typeLabel.toLowerCase()}s to {recipientLabel.toLowerCase()}s via portal and email.
          </p>
        </div>
        <button
          onClick={() => setShowForm((p) => !p)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          <PlusIcon className="w-4 h-4" />
          New {typeLabel}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className={`bg-white rounded-xl shadow border-t-4 ${color} p-6`}>
          <h3 className="font-semibold text-gray-800 mb-4">New {typeLabel}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Production *</label>
                <select
                  value={form.project}
                  onChange={(e) => setForm({ ...form, project: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm"
                  required
                >
                  <option value="">Select production…</option>
                  {projects.filter((p) => p.status !== 'archived').map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{recipientLabel} *</label>
                <select
                  value={form.user}
                  onChange={(e) => setForm({ ...form, user: e.target.value })}
                  className="w-full border rounded-lg p-2.5 text-sm"
                  required
                >
                  <option value="">Select {recipientLabel.toLowerCase()}…</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.first_name} {u.last_name}
                    </option>
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
                placeholder={`${typeLabel} – Production Name`}
                className="w-full border rounded-lg p-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Notes / Instructions</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="w-full border rounded-lg p-2.5 text-sm resize-none"
                placeholder="Optional notes for the recipient…"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                <DocumentArrowUpIcon className="w-4 h-4 inline mr-1" />
                Attach File (PDF / DOC)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const f = e.target.files[0] || null;
                  setForm({ ...form, file: f });
                  setFileInput(f?.name || null);
                }}
                className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
              />
              {fileInput && <p className="text-xs text-gray-400 mt-1">Selected: {fileInput}</p>}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createContract.isPending}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {createContract.isPending ? 'Creating…' : 'Create Document'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contracts list */}
      {contracts.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-10 text-center text-gray-400">
          <DocumentArrowUpIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No {typeLabel.toLowerCase()}s yet. Create one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map((c) => (
            <ContractRow
              key={c.id}
              contract={c}
              typeLabel={typeLabel}
              color={color}
              sendingId={sendingId}
              sendSuccess={sendSuccess}
              onSend={handleSend}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ContractRow({ contract: c, typeLabel, color, sendingId, sendSuccess, onSend, onDelete }) {
  const isSent = c.status === 'sent' || c.status === 'signed';
  const justSent = sendSuccess === c.id;

  return (
    <div className={`bg-white rounded-xl shadow border-l-4 ${color} p-5`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900 text-sm">
              {c.title || typeLabel} #{c.id}
            </span>
            <StatusBadge status={c.status} />
            {justSent && (
              <span className="text-xs text-green-600 font-medium">✓ Sent just now</span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
            <span>Project: <strong className="text-gray-700">{c.project_name}</strong></span>
            <span>To: <strong className="text-gray-700">{c.user_name}</strong></span>
            {c.sent_at && (
              <span>Sent: <strong className="text-gray-700">{new Date(c.sent_at).toLocaleDateString()}</strong></span>
            )}
            <span>Created: <strong className="text-gray-700">{new Date(c.created_at).toLocaleDateString()}</strong></span>
          </div>
          {c.notes && (
            <p className="mt-2 text-xs text-gray-500 bg-gray-50 rounded p-2">{c.notes}</p>
          )}
          {c.file_abs_url && (
            <a
              href={c.file_abs_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
            >
              <DocumentArrowUpIcon className="w-3.5 h-3.5" />
              View File
            </a>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isSent && (
            <button
              onClick={() => onSend(c.id)}
              disabled={sendingId === c.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
              title="Send to recipient via portal & email"
            >
              <PaperAirplaneIcon className="w-3.5 h-3.5" />
              {sendingId === c.id ? 'Sending…' : 'Send'}
            </button>
          )}
          {isSent && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-lg">
              <PaperAirplaneIcon className="w-3.5 h-3.5" />
              Delivered
            </span>
          )}
          <button
            onClick={() => onDelete(c.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 rounded transition"
            title="Delete"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

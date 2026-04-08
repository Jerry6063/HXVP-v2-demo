import { useState } from 'react';
import { toast } from 'react-toastify';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import {
  useContracts, useCreateContract, useUpdateContract, useDeleteContract,
  useSendContract, useProjects, useUsers,
} from '../../../api/hooks';
import LoadingSpinner from '../../../components/LoadingSpinner';
import StatusBadge from '../../../components/StatusBadge';
import {
  PaperAirplaneIcon, TrashIcon, DocumentArrowUpIcon, PlusIcon,
  ArrowLeftIcon, PencilSquareIcon, CloudArrowUpIcon, ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

const DEAL_MEMO_HTML = `
<h1>HXVP MARKETING GROUP</h1>
<h2>Master Crew Deal Memo</h2>
<p>This Master Crew Deal Memo outlines the general working terms and expectations between the Crew Member and HXVP Marketing Group (&ldquo;Company&rdquo;).</p>
<p>This document serves as a standing agreement for future productions. Individual projects will be confirmed through call sheets, booking confirmations, or written production notices specifying role, production details, and agreed compensation.</p>
<h2>1. Onboarding Process</h2>
<p>Before working on a production with the Company, crew members will:</p>
<ul>
  <li>Sign this Master Crew Deal Memo</li>
  <li>Provide a completed W-9</li>
  <li>Provide payment information</li>
  <li>Confirm understanding of production policies</li>
</ul>
<h2>2. Production Workflow</h2>
<p>Each production will be confirmed through a call sheet, booking confirmation, or production notice including:</p>
<ul>
  <li>Project title</li><li>Production date</li><li>Location</li><li>Call time</li>
  <li>Role / responsibilities</li><li>Confirmed rate for the project</li>
</ul>
<p>Once the crew member confirms availability, the call sheet becomes the deal memo for that production.</p>
<h2>3. Rate Structure</h2>
<p>Typical day rate ranges:</p>
<ul>
  <li>Director of Photography: $600 &ndash; $1,200</li>
  <li>Camera Operator: $450 &ndash; $800</li>
  <li>Gaffer: $450 &ndash; $800</li>
  <li>Production Sound Mixer: $450 &ndash; $800</li>
  <li>1st Assistant Camera (AC): $350 &ndash; $650</li>
  <li>Assistant Director (AD): $350 &ndash; $650</li>
  <li>Set Designer / Production Design: $350 &ndash; $650</li>
  <li>DIT / Media Manager: $400 &ndash; $800</li>
  <li>Content Creator / Hybrid Shooter: $350 &ndash; $750</li>
  <li>Grip: $300 &ndash; $600</li>
  <li>Production Assistant: $200 &ndash; $350</li>
  <li>Editor / Post Production: $400 &ndash; $900</li>
  <li>Social Media / Live Operator: $300 &ndash; $700</li>
</ul>
<p>Final compensation will be confirmed per project through call sheet or booking confirmation.</p>
<h2>4. Production Scale &amp; Budget</h2>
<p>Projects may include commercial productions, brand campaigns, e-commerce shoots, social media content, live streaming productions, and product demonstrations.</p>
<h2>5. Production Day &amp; Overtime</h2>
<p>Standard production day: up to 12 hours. Meal break approximately every 6 hours when applicable.</p>
<p>Overtime begins after 12 hours and is compensated at 1.5&times; the hourly equivalent of the agreed day rate.</p>
<h2>6. Cancellation Policy</h2>
<ul>
  <li>24&ndash;48 hours before call time: 50% of agreed rate</li>
  <li>Less than 24 hours before call time: 100% of agreed rate</li>
  <li>Pre-approved rentals and expenses may be reimbursed.</li>
</ul>
<h2>7. Payment Terms</h2>
<p>Payment issued within 14 calendar days after production provided: invoice submitted, W-9 on file, required deliverables submitted.</p>
<h2>8. Professional Expectations</h2>
<p>Crew members agree to maintain professionalism, follow safety instructions, and respect clients and fellow crew.</p>
<p>Crew members may not share behind-the-scenes media or confidential project information without approval.</p>
<h2>9. Client Non-Solicitation</h2>
<p>Crew members agree not to solicit or accept direct work from clients introduced through Company productions for 12 months without written consent.</p>
<h2>10. Equipment Responsibility</h2>
<p>Crew members are responsible for their own equipment. Company is not liable for crew gear except in cases of direct company negligence.</p>
<h2>11. Work Product &amp; Ownership</h2>
<p>All materials created during production are considered work-for-hire and property of the Company and its clients.</p>
<h2>12. Independent Contractor Status</h2>
<p>Crew members are engaged as independent contractors and are responsible for their own taxes, insurance, and benefits.</p>
<h2>13. Governing Law</h2>
<p>This agreement is governed by the laws of the State of Texas. Disputes shall be resolved in Dallas County, Texas.</p>
<hr />
<h2>Crew / Talent Information</h2>
<p>Crew Member Name: <mark>______________________________</mark></p>
<p>Role / Department: <mark>______________________________</mark></p>
<p>Phone: <mark>______________________________</mark></p>
<p>Email: <mark>______________________________</mark></p>
<h2>Acknowledgment &amp; Signature</h2>
<p>By signing below, the crew member acknowledges that they have read and agree to
 the terms outlined in this Master Crew Deal Memo.</p>
<p>Crew Member Signature: <mark>______________________________</mark></p>
<p>Date: <mark>______________________________</mark></p>
<p>Company Representative: <mark>______________________________</mark></p>
<p>Date: <mark>______________________________</mark></p>
`;

const MODES = [
  { id: 'editor', label: '✏️ Agreement Editor' },
  { id: 'library', label: '📁 Document Library' },
];

export default function ContractTab({ contractType, recipientRole, recipientLabel, typeLabel, color = 'border-indigo-500' }) {
  const [mode, setMode] = useState('editor');
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{typeLabel}</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Create and send {typeLabel.toLowerCase()}s to {recipientLabel.toLowerCase()}s via portal and email.
        </p>
      </div>
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              mode === m.id ? 'bg-white shadow text-indigo-700' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      {mode === 'editor' && (
        <EditorPane contractType={contractType} recipientRole={recipientRole} recipientLabel={recipientLabel} typeLabel={typeLabel} color={color} />
      )}
      {mode === 'library' && (
        <LibraryPane contractType={contractType} recipientRole={recipientRole} recipientLabel={recipientLabel} typeLabel={typeLabel} color={color} />
      )}
    </div>
  );
}

function EditorPane({ contractType, recipientRole, recipientLabel, typeLabel, color }) {
  const { data: projectsData } = useProjects();
  const { data: usersData } = useUsers({ role: recipientRole });
  const createContract = useCreateContract();
  const projects = projectsData?.results || projectsData || [];
  const users = usersData?.results || usersData || [];
  const [editingContract, setEditingContract] = useState(null);
  const [form, setForm] = useState({ project: '', user: '', title: '' });
  const [step, setStep] = useState('form');
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.project || !form.user) { setError('Please select a production and recipient.'); return; }
    setError('');
    try {
      const contract = await createContract.mutateAsync({
        project: form.project,
        user: form.user,
        contract_type: contractType,
        title: form.title || typeLabel,
        draft_html: DEAL_MEMO_HTML,
      });
      setEditingContract(contract);
      setStep('edit');
    } catch {
      setError('Failed to create document. Please try again.');
    }
  };

  if (step === 'edit' && editingContract) {
    return (
      <AgreementEditor
        contract={editingContract}
        typeLabel={typeLabel}
        color={color}
        onClose={() => { setStep('form'); setEditingContract(null); }}
      />
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow border-t-4 ${color} p-6 max-w-2xl`}>
      <h3 className="font-semibold text-gray-800 mb-1">New {typeLabel} from Template</h3>
      <p className="text-xs text-gray-400 mb-5">The deal memo template will be pre-loaded. Customize it before sending.</p>
      <form onSubmit={handleCreate} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Production *</label>
            <select value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm" required>
              <option value="">Select production…</option>
              {projects.filter((p) => p.status !== 'archived').map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{recipientLabel} *</label>
            <select value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm" required>
              <option value="">Select {recipientLabel.toLowerCase()}…</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Document Title</label>
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={`${typeLabel} – Production Name`} className="w-full border rounded-lg p-2.5 text-sm" />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={createContract.isPending} className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition">
          <PencilSquareIcon className="w-4 h-4" />
          {createContract.isPending ? 'Creating…' : 'Open in Editor'}
        </button>
      </form>
    </div>
  );
}

function AgreementEditor({ contract, typeLabel, color, onClose }) {
  const updateContract = useUpdateContract();
  const sendContract = useSendContract();
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Highlight, Underline, TextStyle],
    content: contract.draft_html || DEAL_MEMO_HTML,
  });

  const handleSave = async () => {
    if (!editor) return;
    setSaving(true);
    try {
      await updateContract.mutateAsync({ id: contract.id, draft_html: editor.getHTML() });
      toast.success('Draft saved.');
    } catch { toast.error('Save failed.'); }
    finally { setSaving(false); }
  };

  const handleSend = async () => {
    if (!editor) return;
    setSending(true);
    try {
      await updateContract.mutateAsync({ id: contract.id, draft_html: editor.getHTML() });
      const result = await sendContract.mutateAsync(contract.id);
      if (result.email_sent === false) {
        toast.warning('Sent, but email delivery failed.');
      } else {
        toast.success(`${typeLabel} sent successfully.`);
      }
      onClose();
    } catch { toast.error('Send failed.'); }
    finally { setSending(false); }
  };

  const handleDownload = () => {
    if (!editor) return;
    const html = editor.getHTML();
    const blob = new Blob(
      [`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${typeLabel}</title></head><body>${html}</body></html>`],
      { type: 'text/html' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${typeLabel.replace(/\s+/g, '-')}.html`; a.click();
    URL.revokeObjectURL(url);
  };

  const fmtBtns = editor ? [
    { label: 'B', cmd: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), title: 'Bold' },
    { label: 'I', cmd: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), title: 'Italic' },
    { label: 'U', cmd: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive('underline'), title: 'Underline' },
    { label: 'H', cmd: () => editor.chain().focus().toggleHighlight().run(), active: editor.isActive('highlight'), title: 'Highlight' },
  ] : [];

  const blockBtns = editor ? [
    { label: 'H1', cmd: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }) },
    { label: 'H2', cmd: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
    { label: '• List', cmd: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
  ] : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={onClose} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeftIcon className="w-4 h-4" /> Back
        </button>
        <span className="text-gray-300">|</span>
        <span className="text-sm font-medium text-gray-700">{contract.title || typeLabel} #{contract.id}</span>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={handleDownload} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50">
            <ArrowDownTrayIcon className="w-3.5 h-3.5" /> Download
          </button>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-indigo-300 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-50 disabled:opacity-50">
            <CloudArrowUpIcon className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save Draft'}
          </button>
          <button onClick={handleSend} disabled={sending} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-50">
            <PaperAirplaneIcon className="w-3.5 h-3.5" /> {sending ? 'Sending…' : 'Send to Recipient'}
          </button>
        </div>
      </div>

      {editor && (
        <div className="flex flex-wrap gap-1 bg-gray-50 border border-gray-200 rounded-lg p-2">
          {fmtBtns.map(({ label, cmd, active, title }) => (
            <button key={label} onClick={cmd} title={title} className={`w-8 h-8 rounded text-sm font-medium transition ${active ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-200 text-gray-600'}`}>{label}</button>
          ))}
          <span className="w-px bg-gray-300 mx-1 self-stretch" />
          {blockBtns.map(({ label, cmd, active }) => (
            <button key={label} onClick={cmd} className={`px-2 h-8 rounded text-xs font-medium transition ${active ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-200 text-gray-600'}`}>{label}</button>
          ))}
        </div>
      )}

      <div className={`bg-white rounded-xl shadow border-t-4 ${color} overflow-hidden`}>
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none p-6 min-h-[600px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror_mark]:bg-yellow-200 [&_.ProseMirror_mark]:px-0.5 [&_.ProseMirror_mark]:rounded"
        />
      </div>
    </div>
  );
}

function LibraryPane({ contractType, recipientRole, recipientLabel, typeLabel, color }) {
  const { data: contractsData, isLoading } = useContracts({ contract_type: contractType });
  const { data: projectsData } = useProjects();
  const { data: usersData } = useUsers({ role: recipientRole });
  const createContract = useCreateContract();
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
    setFileInput(null); setShowForm(false); setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.project || !form.user) { setError('Please select a project and recipient.'); return; }
    try {
      await createContract.mutateAsync({
        project: form.project, user: form.user, contract_type: contractType,
        title: form.title, notes: form.notes, ...(form.file ? { file: form.file } : {}),
      });
      resetForm();
    } catch { setError('Failed to create document. Please try again.'); }
  };

  const handleSend = async (id) => {
    setSendingId(id); setSendSuccess(null);
    try {
      const result = await sendContract.mutateAsync(id);
      setSendSuccess(id);
      if (result.email_sent === false) { toast.warning('Document status updated, but email delivery failed.'); }
      else { toast.success(`${typeLabel} sent successfully.`); }
    } catch { toast.error(`Failed to send ${typeLabel.toLowerCase()}.`); }
    finally { setSendingId(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    await deleteContract.mutateAsync(id);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Upload a pre-signed file or view previously created documents.</p>
        <button onClick={() => setShowForm((p) => !p)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
          <PlusIcon className="w-4 h-4" /> Upload Document
        </button>
      </div>

      {showForm && (
        <div className={`bg-white rounded-xl shadow border-t-4 ${color} p-6`}>
          <h3 className="font-semibold text-gray-800 mb-4">Upload {typeLabel}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Production *</label>
                <select value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm" required>
                  <option value="">Select production…</option>
                  {projects.filter((p) => p.status !== 'archived').map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{recipientLabel} *</label>
                <select value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm" required>
                  <option value="">Select {recipientLabel.toLowerCase()}…</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Document Title</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={`${typeLabel} – Production Name`} className="w-full border rounded-lg p-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Notes / Instructions</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full border rounded-lg p-2.5 text-sm resize-none" placeholder="Optional notes for the recipient…" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                <DocumentArrowUpIcon className="w-4 h-4 inline mr-1" /> Attach File (PDF / DOC)
              </label>
              <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => { const f = e.target.files[0] || null; setForm({ ...form, file: f }); setFileInput(f?.name || null); }} className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100" />
              {fileInput && <p className="text-xs text-gray-400 mt-1">Selected: {fileInput}</p>}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={createContract.isPending} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition">
                {createContract.isPending ? 'Creating…' : 'Create Document'}
              </button>
              <button type="button" onClick={resetForm} className="px-5 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {contracts.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-10 text-center text-gray-400">
          <DocumentArrowUpIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No {typeLabel.toLowerCase()}s yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map((c) => (
            <ContractRow key={c.id} contract={c} typeLabel={typeLabel} color={color} sendingId={sendingId} sendSuccess={sendSuccess} onSend={handleSend} onDelete={handleDelete} />
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
            <span className="font-medium text-gray-900 text-sm">{c.title || typeLabel} #{c.id}</span>
            <StatusBadge status={c.status} />
            {justSent && <span className="text-xs text-green-600 font-medium">✓ Sent just now</span>}
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
            <span>Project: <strong className="text-gray-700">{c.project_name}</strong></span>
            <span>To: <strong className="text-gray-700">{c.user_name}</strong></span>
            {c.sent_at && <span>Sent: <strong className="text-gray-700">{new Date(c.sent_at).toLocaleDateString()}</strong></span>}
            <span>Created: <strong className="text-gray-700">{new Date(c.created_at).toLocaleDateString()}</strong></span>
          </div>
          {c.notes && <p className="mt-2 text-xs text-gray-500 bg-gray-50 rounded p-2">{c.notes}</p>}
          {c.file_abs_url && (
            <a href={c.file_abs_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700">
              <DocumentArrowUpIcon className="w-3.5 h-3.5" /> View File
            </a>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!isSent && (
            <button onClick={() => onSend(c.id)} disabled={sendingId === c.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 transition">
              <PaperAirplaneIcon className="w-3.5 h-3.5" />
              {sendingId === c.id ? 'Sending…' : 'Send'}
            </button>
          )}
          {isSent && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-lg">
              <PaperAirplaneIcon className="w-3.5 h-3.5" /> Delivered
            </span>
          )}
          <button onClick={() => onDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded transition" title="Delete">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

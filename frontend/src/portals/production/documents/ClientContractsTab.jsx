import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import {
  useContracts,
  useCreateContract,
  useUpdateContract,
  useSendContract,
  useDeleteContract,
  useUsers,
  useProjects,
} from '../../../api/hooks';
import LoadingSpinner from '../../../components/LoadingSpinner';
import StatusBadge from '../../../components/StatusBadge';
import {
  PaperAirplaneIcon,
  TrashIcon,
  DocumentArrowUpIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  PencilSquareIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

const CONTRACT_TEMPLATE_URL = '/contract-template-2026.docx';

function buildHighlightedFragment(doc, value) {
  const pattern = /(\[[^\]\n]{2,80}\]|_{3,}|\.{5,})/g;
  pattern.lastIndex = 0;
  if (!pattern.test(value)) return null;

  const fragment = doc.createDocumentFragment();
  let cursor = 0;
  let match;
  pattern.lastIndex = 0;

  while ((match = pattern.exec(value)) !== null) {
    if (match.index > cursor) {
      fragment.appendChild(doc.createTextNode(value.slice(cursor, match.index)));
    }

    const mark = doc.createElement('mark');
    mark.setAttribute('data-color', '#fef08a');
    mark.textContent = match[0];
    fragment.appendChild(mark);

    cursor = match.index + match[0].length;
  }

  if (cursor < value.length) {
    fragment.appendChild(doc.createTextNode(value.slice(cursor)));
  }

  return fragment;
}

/** Fetch DOCX template and return HTML plus placeholder-detection metadata. */
async function loadTemplateAsHtml() {
  const response = await fetch(CONTRACT_TEMPLATE_URL);
  if (!response.ok) throw new Error('Template not found');
  const arrayBuffer = await response.arrayBuffer();
  const mammothModule = await import('mammoth');
  const mammoth = mammothModule.default || mammothModule;
  const result = await mammoth.convertToHtml({ arrayBuffer });

  const parser = new DOMParser();
  const doc = parser.parseFromString(result.value, 'text/html');
  let detectedCount = 0;

  // Preserve any pre-existing yellow highlights from DOCX styles.
  doc.querySelectorAll('span').forEach((span) => {
    const style = span.getAttribute('style') || '';
    if (/background-color\s*:\s*(yellow|#[fF]{2}[fF]{2}00)/i.test(style)) {
      const mark = doc.createElement('mark');
      mark.setAttribute('data-color', '#fef08a');
      while (span.firstChild) mark.appendChild(span.firstChild);
      span.replaceWith(mark);
      detectedCount += 1;
    }
  });

  // If template has no style highlights, infer placeholders from tokens like ____ or [Client Name].
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let current = walker.nextNode();
  while (current) {
    textNodes.push(current);
    current = walker.nextNode();
  }

  textNodes.forEach((node) => {
    if (!node.nodeValue?.trim()) return;
    const parentTag = node.parentElement?.tagName;
    if (parentTag === 'MARK') return;

    const fragment = buildHighlightedFragment(doc, node.nodeValue);
    if (!fragment) return;

    detectedCount += (node.nodeValue.match(/(\[[^\]\n]{2,80}\]|_{3,}|\.{5,})/g) || []).length;
    node.replaceWith(fragment);
  });

  return {
    html: doc.body.innerHTML || '<p>Template loaded — start editing.</p>',
    detectedCount,
  };
}

const MODES = [
  { id: 'editor', label: '✏️ Contract Editor' },
  { id: 'library', label: '📁 Document Library' },
];

export default function ClientContractsTab() {
  const [mode, setMode] = useState('editor');

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Client Contracts</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Create, edit, and send contracts to clients.
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

      {mode === 'editor' && <ContractEditorPane />}
      {mode === 'library' && <DocumentLibraryPane />}
    </div>
  );
}

// ── Contract Editor Pane ─────────────────────────────────────────────────────
function ContractEditorPane() {
  const { data: usersData } = useUsers({ role: 'client' });
  const { data: allContractsData } = useContracts({ contract_type: 'client' });
  const createContract = useCreateContract();

  const [activeContract, setActiveContract] = useState(null);
  const [form, setForm] = useState({ user: '', title: '' });
  const [formError, setFormError] = useState('');
  const [opening, setOpening] = useState(false);

  const clients = usersData?.results || usersData || [];
  const draftContracts = (allContractsData?.results || allContractsData || []).filter(
    (c) => c.status === 'draft'
  );

  const handleOpen = async (e) => {
    e.preventDefault();
    if (!form.user) {
      setFormError('Please select a client.');
      return;
    }
    setOpening(true);
    setFormError('');
    try {
      const created = await createContract.mutateAsync({
        user: form.user,
        contract_type: 'client',
        title: form.title || 'Client Contract',
        draft_html: '',
      });
      setActiveContract(created);
    } catch {
      setFormError('Failed to create contract. Please try again.');
    } finally {
      setOpening(false);
    }
  };

  if (activeContract) {
    return <ContractEditor contract={activeContract} onClose={() => setActiveContract(null)} />;
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl shadow border-t-4 border-indigo-500 p-6">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-9 h-9 flex-shrink-0 rounded-lg bg-indigo-50 flex items-center justify-center">
            <PencilSquareIcon className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">New Contract from Template</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Opens the 2026 studio contract template in the editor. Placeholder-like fields
              (for example <span className="font-mono">____</span> or <span className="font-mono">[Client Name]</span>)
              are highlighted automatically when detected.
            </p>
          </div>
        </div>

        <form onSubmit={handleOpen} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <label className="block text-xs font-medium text-gray-500 mb-1">Contract Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Client Agreement – Spring Shoot 2026"
              className="w-full border rounded-lg p-2.5 text-sm"
            />
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <button
            type="submit"
            disabled={opening}
            className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            <PencilSquareIcon className="w-4 h-4" />
            {opening ? 'Opening…' : 'Open Editor'}
          </button>
        </form>
      </div>

      {draftContracts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Continue Editing</h3>
          <div className="space-y-2">
            {draftContracts.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveContract(c)}
                className="bg-white rounded-xl shadow p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition"
              >
                <div>
                  <p className="font-medium text-sm text-gray-900">{c.title || 'Untitled Contract'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{getContractSubtitle(c)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={c.status} />
                  <PencilSquareIcon className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── TipTap In-browser Contract Editor ───────────────────────────────────────
function ContractEditor({ contract, onClose }) {
  const updateContract = useUpdateContract();
  const sendContract = useSendContract();

  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved
  const [lastSaved, setLastSaved] = useState(null);
  const [sendStatus, setSendStatus] = useState('idle'); // idle | sending | sent | error
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templateFieldsDetected, setTemplateFieldsDetected] = useState(null);
  const initializedRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: true }),
      Underline,
      TextStyle,
    ],
    content: '',
    editorProps: {
      attributes: { class: 'contract-editor-body' },
    },
  });

  // Load content once (saved draft or fresh template)
  useEffect(() => {
    if (!editor || initializedRef.current) return;
    initializedRef.current = true;
    const init = async () => {
      if (contract.draft_html) {
        editor.commands.setContent(contract.draft_html, false);
        setTemplateFieldsDetected(/<mark\b/i.test(contract.draft_html));
      } else {
        setTemplateLoading(true);
        try {
          const { html, detectedCount } = await loadTemplateAsHtml();
          editor.commands.setContent(html, false);
          setTemplateFieldsDetected(detectedCount > 0);
        } catch {
          editor.commands.setContent(
            '<p>The template could not be loaded. Start typing your contract here.</p>',
            false
          );
          setTemplateFieldsDetected(false);
        } finally {
          setTemplateLoading(false);
        }
      }
    };
    init();
  }, [editor, contract.draft_html]);

  // Stable save via ref – prevents stale closure inside setInterval
  const doSaveRef = useRef(null);
  const doSave = useCallback(async () => {
    if (!editor) return;
    setSaveStatus('saving');
    try {
      await updateContract.mutateAsync({ id: contract.id, draft_html: editor.getHTML() });
      setLastSaved(new Date());
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('idle');
    }
  }, [editor, contract.id, updateContract]);
  doSaveRef.current = doSave;

  // Auto-save every 60 seconds
  useEffect(() => {
    const id = setInterval(() => doSaveRef.current?.(), 60_000);
    return () => clearInterval(id);
  }, []);

  const handleDownload = () => {
    if (!editor) return;
    const title = contract.title || 'Client Contract';
    const fullDoc = [
      '<!DOCTYPE html>',
      '<html>',
      '<head>',
      '  <meta charset="UTF-8">',
      `  <title>${title}</title>`,
      '  <style>',
      "    body{font-family:'Times New Roman',Times,serif;max-width:820px;margin:40px auto;padding:0 56px;line-height:1.75;color:#111}",
      '    h1{font-size:1.4em;font-weight:bold;text-align:center;margin:1.2em 0 .6em}',
      '    h2{font-size:1.15em;font-weight:bold;margin:1.2em 0 .4em}',
      '    h3{font-size:1.05em;font-weight:bold;margin:1em 0 .3em}',
      '    p{margin:.45em 0}',
      '    ul,ol{padding-left:1.8em}',
      '    li{margin:.2em 0}',
      '    mark{background-color:#fef08a;padding:1px 3px;border-radius:2px}',
      '    @media print{body{margin:0;padding:24px}}',
      '  </style>',
      '</head>',
      '<body>',
      editor.getHTML(),
      '</body>',
      '</html>',
    ].join('\n');
    const blob = new Blob([fullDoc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9\s_-]/gi, '').trim().replace(/\s+/g, '_') || 'contract'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSendToClient = async () => {
    await doSave();
    setSendStatus('sending');
    try {
      const result = await sendContract.mutateAsync(contract.id);
      setSendStatus('sent');
      if (result.email_sent === false) {
        toast.warning('Contract status updated, but email delivery failed.');
      } else {
        toast.success('Contract sent to client.');
      }
    } catch {
      setSendStatus('error');
      toast.error('Failed to send contract to client.');
    }
  };

  const toolbarBtns = [
    { label: 'B', title: 'Bold', fn: () => editor?.chain().focus().toggleBold().run(), active: () => editor?.isActive('bold') },
    { label: 'I', title: 'Italic', fn: () => editor?.chain().focus().toggleItalic().run(), active: () => editor?.isActive('italic') },
    { label: 'U', title: 'Underline', fn: () => editor?.chain().focus().toggleUnderline().run(), active: () => editor?.isActive('underline') },
    { label: 'S̶', title: 'Strikethrough', fn: () => editor?.chain().focus().toggleStrike().run(), active: () => editor?.isActive('strike') },
  ];

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-md">
      {/* ── Header bar ── */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded hover:bg-gray-100 text-gray-500 transition"
            title="Back to contract list"
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">{contract.title || 'Untitled Contract'}</p>
            <p className="text-xs text-gray-400">{getContractSubtitle(contract)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400 mr-0.5 whitespace-nowrap">
            {saveStatus === 'saving' && '⏳ Saving…'}
            {saveStatus === 'saved' && '✓ Saved'}
            {saveStatus === 'idle' && lastSaved && `Auto-saved ${lastSaved.toLocaleTimeString()}`}
            {saveStatus === 'idle' && !lastSaved && 'Not saved yet'}
          </span>
          <button
            onClick={doSave}
            disabled={saveStatus === 'saving'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg disabled:opacity-50 transition"
          >
            <CloudArrowUpIcon className="w-3.5 h-3.5" />
            Save
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition"
          >
            <ArrowDownTrayIcon className="w-3.5 h-3.5" />
            Download
          </button>
          <button
            onClick={handleSendToClient}
            disabled={sendStatus === 'sending' || sendStatus === 'sent'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition disabled:opacity-50 ${
              sendStatus === 'sent'
                ? 'bg-green-100 text-green-700'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <PaperAirplaneIcon className="w-3.5 h-3.5" />
            {sendStatus === 'sending' ? 'Sending…' : sendStatus === 'sent' ? '✓ Sent to Client' : 'Send to Client'}
          </button>
        </div>
      </div>

      {/* ── Formatting toolbar ── */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-1.5 flex items-center gap-1 flex-wrap">
        {toolbarBtns.map(({ label, title, fn, active }) => (
          <button
            key={label}
            onClick={fn}
            title={title}
            className={`w-7 h-7 rounded text-xs font-semibold transition ${
              active?.() ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
        <span className="w-px h-5 bg-gray-300 mx-1" />
        {[1, 2, 3].map((level) => (
          <button
            key={level}
            onClick={() => editor?.chain().focus().toggleHeading({ level }).run()}
            title={`Heading ${level}`}
            className={`px-2 h-7 rounded text-xs font-semibold transition ${
              editor?.isActive('heading', { level })
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            H{level}
          </button>
        ))}
        <span className="w-px h-5 bg-gray-300 mx-1" />
        <button
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          title="Bullet list"
          className={`px-2 h-7 rounded text-xs transition ${
            editor?.isActive('bulletList') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          • List
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          title="Numbered list"
          className={`px-2 h-7 rounded text-xs transition ${
            editor?.isActive('orderedList') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          1. List
        </button>
        <span className="w-px h-5 bg-gray-300 mx-1" />
        <button onClick={() => editor?.chain().focus().undo().run()} title="Undo" className="px-2 h-7 rounded text-xs text-gray-600 hover:bg-gray-200 transition">↩ Undo</button>
        <button onClick={() => editor?.chain().focus().redo().run()} title="Redo" className="px-2 h-7 rounded text-xs text-gray-600 hover:bg-gray-200 transition">Redo ↪</button>
      </div>

      {/* ── Template guidance strip ── */}
      <div className="border-b border-amber-100 bg-amber-50 px-4 py-2 flex items-center gap-2">
        <span className="inline-block w-4 h-4 flex-shrink-0 rounded border border-amber-300" style={{ backgroundColor: '#fef08a' }} />
        <p className="text-xs text-amber-700">
          {templateFieldsDetected
            ? (
              <>
                <strong>Highlighted placeholders</strong> were detected from the template. Fill these fields before sending.
              </>
            )
            : (
              <>
                <strong>No placeholder highlights detected.</strong> Use this checklist before sending: client name, project details, dates, payment terms, and signatures.
              </>
            )}
        </p>
      </div>

      {/* ── Editor body ── */}
      <div className="bg-white">
        {templateLoading ? (
          <div className="flex flex-col items-center justify-center h-[500px] gap-3">
            <LoadingSpinner />
            <p className="text-sm text-gray-400">Loading 2026 contract template…</p>
          </div>
        ) : (
          <>
            <style>{`
              .contract-editor-body {
                font-family: "Times New Roman", Times, serif;
                font-size: 14px;
                line-height: 1.8;
                color: #111;
                min-height: 560px;
                padding: 52px 80px;
                outline: none;
              }
              @media (max-width: 768px) {
                .contract-editor-body { padding: 28px 20px; }
              }
              .contract-editor-body:focus { outline: none; }
              .contract-editor-body h1 { font-size: 1.4em; font-weight: bold; text-align: center; margin: 1.2em 0 0.5em; }
              .contract-editor-body h2 { font-size: 1.15em; font-weight: bold; margin: 1.2em 0 0.4em; }
              .contract-editor-body h3 { font-size: 1.05em; font-weight: bold; margin: 1em 0 0.3em; }
              .contract-editor-body p { margin: 0.45em 0; }
              .contract-editor-body ul, .contract-editor-body ol { padding-left: 1.8em; }
              .contract-editor-body li { margin: 0.2em 0; }
              .contract-editor-body mark { background-color: #fef08a !important; padding: 1px 3px; border-radius: 2px; }
              .contract-editor-body strong { font-weight: bold; }
              .contract-editor-body em { font-style: italic; }
              .contract-editor-body u { text-decoration: underline; }
              .contract-editor-body s { text-decoration: line-through; }
            `}</style>
            <EditorContent editor={editor} />
          </>
        )}
      </div>

      {sendStatus === 'error' && (
        <div className="bg-red-50 border-t border-red-100 px-4 py-2 text-sm text-red-600">
          Failed to send to client. Please try again.
        </div>
      )}
    </div>
  );
}

/* ── Document Library (all client agreements) ──────────────────────────────── */
function DocumentLibraryPane() {
  const { data: contractsData, isLoading } = useContracts({ contract_type: 'client' });
  const { data: projectsData } = useProjects();
  const { data: usersData } = useUsers({ role: 'client' });
  const createContract = useCreateContract();
  const sendContract = useSendContract();
  const deleteContract = useDeleteContract();

  const contracts = contractsData?.results || contractsData || [];
  const projects = projectsData?.results || projectsData || [];
  const clients = usersData?.results || usersData || [];

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

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    await deleteContract.mutateAsync(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.project || !form.user) {
      setError('Please select a project and client.');
      return;
    }
    try {
      await createContract.mutateAsync({
        project: form.project,
        user: form.user,
        contract_type: 'client',
        title: form.title,
        notes: form.notes,
        ...(form.file ? { file: form.file } : {}),
      });
      resetForm();
    } catch {
      setError('Failed to create agreement. Please try again.');
    }
  };

  const handleSend = async (id) => {
    setSendingId(id);
    try {
      const result = await sendContract.mutateAsync(id);
      setSendSuccess(id);
      if (result.email_sent === false) {
        toast.warning('Document status updated, but email delivery failed.');
      } else {
        toast.success('Agreement sent to client.');
      }
    } catch {
      toast.error('Failed to send agreement.');
    } finally {
      setSendingId(null);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Upload a signed agreement or view previously created documents.</p>
        <button
          onClick={() => setShowForm((p) => !p)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          <PlusIcon className="w-4 h-4" />
          Upload Client Agreement
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow border-t-4 border-indigo-500 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">New Client Agreement</h3>
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
                placeholder="Client Agreement – Production Name"
                className="w-full border rounded-lg p-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="w-full border rounded-lg p-2.5 text-sm resize-none"
                placeholder="Optional notes for the client…"
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
                onChange={(e) => { const f = e.target.files[0] || null; setForm({ ...form, file: f }); setFileInput(f?.name || null); }}
                className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
              />
              {fileInput && <p className="text-xs text-gray-400 mt-1">Selected: {fileInput}</p>}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={createContract.isPending} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition">
                {createContract.isPending ? 'Creating…' : 'Create Agreement'}
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
          <DocumentArrowUpIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No client agreements yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map((c) => (
            <ClientContractRow
              key={c.id}
              contract={c}
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

function ClientContractRow({ contract: c, sendingId, sendSuccess, onSend, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const isSent = c.status === 'sent' || c.status === 'signed';
  return (
    <div className="bg-white rounded-xl shadow border-l-4 border-indigo-500">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm text-gray-900">{c.title || `Client Agreement #${c.id}`}</span>
              <StatusBadge status={c.status} />
              {sendSuccess === c.id && <span className="text-xs text-green-600 font-medium">✓ Sent just now</span>}
            </div>
            <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
              <span>Production: <strong className="text-gray-700">{c.project_name || 'Pre-production'}</strong></span>
              <span>Client: <strong className="text-gray-700">{c.user_name}</strong></span>
              {c.sent_at && <span>Sent: <strong className="text-gray-700">{new Date(c.sent_at).toLocaleDateString()}</strong></span>}
              <span>Created: <strong className="text-gray-700">{new Date(c.created_at).toLocaleDateString()}</strong></span>
            </div>
            {c.file_abs_url && (
              <a href={c.file_abs_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700">
                <DocumentArrowUpIcon className="w-3.5 h-3.5" /> View File
              </a>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {c.draft_html && (
              <button
                onClick={() => setExpanded((p) => !p)}
                className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 transition"
              >
                {expanded ? 'Hide' : 'View Document'}
              </button>
            )}
            {!isSent && (
              <button
                onClick={() => onSend(c.id)}
                disabled={sendingId === c.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                <PaperAirplaneIcon className="w-3.5 h-3.5" />
                {sendingId === c.id ? 'Sending…' : 'Send'}
              </button>
            )}
            {isSent && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-lg">
                <PaperAirplaneIcon className="w-3.5 h-3.5" /> Delivered
              </span>
            )}
            <button onClick={() => onDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded transition">
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      {expanded && c.draft_html && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4">
          <div
            className="prose prose-sm max-w-none [&_mark]:bg-yellow-200 [&_mark]:px-0.5 [&_mark]:rounded"
            dangerouslySetInnerHTML={{ __html: c.draft_html }}
          />
        </div>
      )}
    </div>
  );
}

function getContractSubtitle(contract) {
  const projectLabel = contract.project_name || 'Pre-production';
  return `${projectLabel} · ${contract.user_name}`;
}

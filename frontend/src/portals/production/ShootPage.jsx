import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  useShoot,
  useDeleteShoot,
  useProject,
  useCallSheets,
  useCallSheet,
  useCreateCallSheet,
  useDeleteCallSheet,
  useAddCallSheetEntry,
  useRemoveCallSheetEntry,
  useGenerateCallSheetFromShoot,
  useSendCallSheet,
} from '../../api/hooks';
import { ArrangeShootModal } from './ShootSchedule';
import StatusBadge from '../../components/StatusBadge';
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  PlusIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

// ── Helpers ──

function formatDisplayDate(dateStr) {
  if (!dateStr) return '–';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(t) {
  if (!t) return '–';
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${m} ${ampm}`;
}

function PersonAvatar({ name, photoUrl, size = 'md' }) {
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm' };
  const cls = sizes[size] || sizes.md;
  if (photoUrl) {
    return <img src={photoUrl} alt={name} className={`${cls} rounded-full object-cover flex-shrink-0`} />;
  }
  return (
    <div className={`${cls} rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-700 font-bold`}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  );
}

// ── Send Call Sheet Modal ──

function SendCallSheetModal({ callSheetId, talent, crew, onClose }) {
  const sendMutation = useSendCallSheet();
  const [selectedTalent, setSelectedTalent] = useState([]);
  const [selectedCrew, setSelectedCrew] = useState([]);
  const [sent, setSent] = useState(false);

  const toggleAll = (list, setter, current) => {
    if (current.length === list.length) {
      setter([]);
    } else {
      setter(list.map((p) => p.talent_id || p.crew_id));
    }
  };

  const handleSend = async () => {
    await sendMutation.mutateAsync({
      id: callSheetId,
      talent_profile_ids: selectedTalent,
      crew_profile_ids: selectedCrew,
    });
    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Send Call Sheet</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="h-5 w-5" /></button>
        </div>

        {sent ? (
          <div className="text-center py-8">
            <p className="text-green-600 font-semibold mb-1">Sent!</p>
            <p className="text-sm text-gray-500">{sendMutation.data?.sent || 0} email(s) delivered.</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">Done</button>
          </div>
        ) : (
          <>
            {talent.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Talent</p>
                  <button type="button" onClick={() => toggleAll(talent, setSelectedTalent, selectedTalent)} className="text-xs text-indigo-600 hover:underline">
                    {selectedTalent.length === talent.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="space-y-1">
                  {talent.map((b) => (
                    <label key={b.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTalent.includes(b.talent_id)}
                        onChange={() =>
                          setSelectedTalent((prev) =>
                            prev.includes(b.talent_id) ? prev.filter((x) => x !== b.talent_id) : [...prev, b.talent_id]
                          )
                        }
                        className="rounded text-indigo-600"
                      />
                      <PersonAvatar name={b.talent_name} photoUrl={b.photo_url} size="xs" />
                      <span className="text-sm text-gray-800">{b.talent_name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {crew.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-sky-700 uppercase tracking-wide">Crew</p>
                  <button type="button" onClick={() => toggleAll(crew, setSelectedCrew, selectedCrew)} className="text-xs text-indigo-600 hover:underline">
                    {selectedCrew.length === crew.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="space-y-1">
                  {crew.map((a) => (
                    <label key={a.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCrew.includes(a.crew_id)}
                        onChange={() =>
                          setSelectedCrew((prev) =>
                            prev.includes(a.crew_id) ? prev.filter((x) => x !== a.crew_id) : [...prev, a.crew_id]
                          )
                        }
                        className="rounded text-indigo-600"
                      />
                      <PersonAvatar name={a.crew_name} photoUrl={a.photo_url} size="xs" />
                      <span className="text-sm text-gray-800">{a.crew_name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {talent.length === 0 && crew.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No talent or crew assigned to this shoot.</p>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200">Cancel</button>
              <button
                onClick={handleSend}
                disabled={sendMutation.isPending || (selectedTalent.length === 0 && selectedCrew.length === 0)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
                {sendMutation.isPending ? 'Sending…' : 'Send'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Call Sheet Card ──

function CallSheetCard({ cs, shootData, talent, crew }) {
  const [expanded, setExpanded] = useState(false);
  const { data: detail } = useCallSheet(expanded ? cs.id : null);
  const deleteMutation = useDeleteCallSheet();
  const addEntry = useAddCallSheetEntry();
  const removeEntry = useRemoveCallSheetEntry();
  const autoPopulate = useGenerateCallSheetFromShoot();
  const [sendingId, setSendingId] = useState(null);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [entryForm, setEntryForm] = useState({ person_type: 'talent', name: '', role: '', call_time: '', notes: '' });

  const entries = detail?.entries || [];
  const talentEntries = entries.filter((e) => e.person_type === 'talent');
  const crewEntries = entries.filter((e) => e.person_type === 'crew');

  const handleDeleteCallSheet = async () => {
    if (!window.confirm('Delete this call sheet?')) return;
    await deleteMutation.mutateAsync(cs.id);
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!entryForm.name) return;
    await addEntry.mutateAsync({ callSheetId: cs.id, ...entryForm });
    setEntryForm({ person_type: 'talent', name: '', role: '', call_time: '', notes: '' });
    setShowAddEntry(false);
  };

  const handleAutoPopulate = async () => {
    await autoPopulate.mutateAsync(cs.id);
  };

  return (
    <div className="border border-gray-200 rounded-xl bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors rounded-xl"
      >
        <div>
          <p className="text-sm font-semibold text-gray-900">{cs.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {cs.shoot_date} · {cs.entry_count || 0} entries
          </p>
        </div>
        <div className="flex items-center gap-2">
          {expanded ? <ChevronUpIcon className="h-4 w-4 text-gray-400" /> : <ChevronDownIcon className="h-4 w-4 text-gray-400" />}
        </div>
      </button>

      {expanded && detail && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-4">
          {/* Call sheet info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div><span className="text-gray-400 block">Call Time</span><span className="font-medium text-gray-700">{formatTime(detail.call_time)}</span></div>
            <div><span className="text-gray-400 block">Wrap Time</span><span className="font-medium text-gray-700">{formatTime(detail.est_wrap_time)}</span></div>
            <div><span className="text-gray-400 block">Location</span><span className="font-medium text-gray-700">{detail.location}</span></div>
            {detail.address && <div><span className="text-gray-400 block">Address</span><span className="font-medium text-gray-700">{detail.address}</span></div>}
          </div>

          {(detail.parking_info || detail.weather_notes || detail.emergency_contact) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {detail.parking_info && <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-400 block mb-0.5">Parking</span>{detail.parking_info}</div>}
              {detail.weather_notes && <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-400 block mb-0.5">Weather</span>{detail.weather_notes}</div>}
              {detail.emergency_contact && <div className="bg-gray-50 rounded-lg p-2"><span className="text-gray-400 block mb-0.5">Emergency</span>{detail.emergency_contact}</div>}
            </div>
          )}

          {(detail.wardrobe_instructions || detail.hair_makeup_notes || detail.production_notes) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {detail.wardrobe_instructions && <div className="bg-amber-50 text-amber-800 rounded-lg p-2"><span className="font-semibold block mb-0.5">Wardrobe</span>{detail.wardrobe_instructions}</div>}
              {detail.hair_makeup_notes && <div className="bg-pink-50 text-pink-800 rounded-lg p-2"><span className="font-semibold block mb-0.5">Hair & Makeup</span>{detail.hair_makeup_notes}</div>}
              {detail.production_notes && <div className="bg-blue-50 text-blue-800 rounded-lg p-2"><span className="font-semibold block mb-0.5">Production Notes</span>{detail.production_notes}</div>}
            </div>
          )}

          {/* Talent entries */}
          {talentEntries.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1.5">Talent</p>
              <div className="space-y-1">
                {talentEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between bg-amber-50/50 rounded-lg px-3 py-2 text-xs">
                    <div>
                      <span className="font-medium text-gray-800">{entry.name}</span>
                      <span className="text-gray-400 ml-2">{entry.role}</span>
                      {entry.call_time && <span className="text-gray-400 ml-2">Call: {formatTime(entry.call_time)}</span>}
                      {entry.notes && <span className="text-gray-400 ml-2">· {entry.notes}</span>}
                    </div>
                    <button onClick={() => removeEntry.mutateAsync({ callSheetId: cs.id, entryId: entry.id })} className="text-red-400 hover:text-red-600">
                      <XMarkIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Crew entries */}
          {crewEntries.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-sky-700 uppercase tracking-wide mb-1.5">Crew</p>
              <div className="space-y-1">
                {crewEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between bg-sky-50/50 rounded-lg px-3 py-2 text-xs">
                    <div>
                      <span className="font-medium text-gray-800">{entry.name}</span>
                      <span className="text-gray-400 ml-2">{entry.role}</span>
                      {entry.call_time && <span className="text-gray-400 ml-2">Call: {formatTime(entry.call_time)}</span>}
                      {entry.notes && <span className="text-gray-400 ml-2">· {entry.notes}</span>}
                    </div>
                    <button onClick={() => removeEntry.mutateAsync({ callSheetId: cs.id, entryId: entry.id })} className="text-red-400 hover:text-red-600">
                      <XMarkIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {talentEntries.length === 0 && crewEntries.length === 0 && (
            <p className="text-xs text-gray-400 italic text-center py-2">No entries yet — add manually or auto-populate from the shoot roster.</p>
          )}

          {/* Add entry form */}
          {showAddEntry && (
            <form onSubmit={handleAddEntry} className="flex flex-wrap items-end gap-2 bg-gray-50 rounded-lg p-3">
              <div>
                <label className="text-xs text-gray-500 block mb-0.5">Type</label>
                <select value={entryForm.person_type} onChange={(e) => setEntryForm((f) => ({ ...f, person_type: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="talent">Talent</option>
                  <option value="crew">Crew</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-0.5">Name *</label>
                <input type="text" required value={entryForm.name} onChange={(e) => setEntryForm((f) => ({ ...f, name: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none w-36" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-0.5">Role</label>
                <input type="text" value={entryForm.role} onChange={(e) => setEntryForm((f) => ({ ...f, role: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none w-28" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-0.5">Call Time</label>
                <input type="time" value={entryForm.call_time} onChange={(e) => setEntryForm((f) => ({ ...f, call_time: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-0.5">Notes</label>
                <input type="text" value={entryForm.notes} onChange={(e) => setEntryForm((f) => ({ ...f, notes: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none w-32" />
              </div>
              <button type="submit" disabled={addEntry.isPending} className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 disabled:opacity-50">Add</button>
              <button type="button" onClick={() => setShowAddEntry(false)} className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300">Cancel</button>
            </form>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            {!showAddEntry && (
              <button onClick={() => setShowAddEntry(true)} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200">
                <PlusIcon className="h-3.5 w-3.5" /> Add Entry
              </button>
            )}
            <button onClick={handleAutoPopulate} disabled={autoPopulate.isPending} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs rounded-lg hover:bg-indigo-100 disabled:opacity-50">
              <SparklesIcon className="h-3.5 w-3.5" /> {autoPopulate.isPending ? 'Populating…' : 'Auto-populate from Shoot'}
            </button>
            <button onClick={() => setSendingId(cs.id)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs rounded-lg hover:bg-emerald-100">
              <PaperAirplaneIcon className="h-3.5 w-3.5" /> Send
            </button>
            <button onClick={handleDeleteCallSheet} disabled={deleteMutation.isPending} className="flex items-center gap-1 px-3 py-1.5 text-red-600 text-xs hover:bg-red-50 rounded-lg disabled:opacity-50">
              <TrashIcon className="h-3.5 w-3.5" /> Delete
            </button>
          </div>

          {sendingId === cs.id && (
            <SendCallSheetModal callSheetId={cs.id} talent={talent} crew={crew} onClose={() => setSendingId(null)} />
          )}
        </div>
      )}
    </div>
  );
}

// ── Create Call Sheet Form ──

function CreateCallSheetForm({ shootData, projectId, onClose }) {
  const createMutation = useCreateCallSheet();
  const autoPopulate = useGenerateCallSheetFromShoot();
  const [form, setForm] = useState({
    title: `Call Sheet – ${shootData.shoot_date || ''}`,
    shoot_date: shootData.shoot_date || '',
    call_time: shootData.call_time || '',
    est_wrap_time: shootData.est_wrap_time || '',
    location: shootData.location || '',
    address: shootData.address || '',
    parking_info: '',
    weather_notes: '',
    emergency_contact: '',
    production_notes: '',
    wardrobe_instructions: '',
    hair_makeup_notes: '',
  });
  const [autoPopulateOnCreate, setAutoPopulateOnCreate] = useState(true);
  const [error, setError] = useState('');

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) { setError('Title is required.'); return; }
    setError('');
    try {
      const cs = await createMutation.mutateAsync({
        ...form,
        project: projectId,
        shoot: shootData.id,
        est_wrap_time: form.est_wrap_time || null,
      });
      if (autoPopulateOnCreate) {
        try { await autoPopulate.mutateAsync(cs.id); } catch (_) { /* non-critical */ }
      }
      onClose();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to create call sheet.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-indigo-200 rounded-xl bg-indigo-50/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-gray-900">New Call Sheet</h4>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="h-4 w-4" /></button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="text-xs text-gray-500 block mb-0.5">Title *</label>
          <input type="text" required value={form.title} onChange={setField('title')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-0.5">Shoot Date</label>
          <input type="date" value={form.shoot_date} onChange={setField('shoot_date')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500 block mb-0.5">Call Time</label>
            <input type="time" value={form.call_time} onChange={setField('call_time')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-0.5">Wrap Time</label>
            <input type="time" value={form.est_wrap_time} onChange={setField('est_wrap_time')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-0.5">Location</label>
          <input type="text" value={form.location} onChange={setField('location')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-0.5">Address</label>
          <input type="text" value={form.address} onChange={setField('address')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-0.5">Parking Info</label>
          <input type="text" value={form.parking_info} onChange={setField('parking_info')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-0.5">Weather Notes</label>
          <input type="text" value={form.weather_notes} onChange={setField('weather_notes')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-0.5">Emergency Contact</label>
          <input type="text" value={form.emergency_contact} onChange={setField('emergency_contact')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-0.5">Production Notes</label>
          <input type="text" value={form.production_notes} onChange={setField('production_notes')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-0.5">Wardrobe Instructions</label>
          <textarea value={form.wardrobe_instructions} onChange={setField('wardrobe_instructions')} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-0.5">Hair & Makeup Notes</label>
          <textarea value={form.hair_makeup_notes} onChange={setField('hair_makeup_notes')} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
        <input type="checkbox" checked={autoPopulateOnCreate} onChange={(e) => setAutoPopulateOnCreate(e.target.checked)} className="rounded text-indigo-600" />
        Auto-populate entries from shoot roster
      </label>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          {createMutation.isPending ? 'Creating…' : 'Create Call Sheet'}
        </button>
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200">Cancel</button>
      </div>
    </form>
  );
}

// ── Main ShootPage ──

export default function ShootPage() {
  const { id: projectId, shootId } = useParams();
  const navigate = useNavigate();
  const { data: shoot, isLoading: shootLoading } = useShoot(shootId);
  const { data: project } = useProject(projectId);
  const deleteShoot = useDeleteShoot();
  const { data: callSheetsData } = useCallSheets({ shoot: shootId });

  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateCS, setShowCreateCS] = useState(false);

  const callSheets = useMemo(() => callSheetsData?.results || callSheetsData || [], [callSheetsData]);
  const talent = shoot?.bookings || [];
  const crew = shoot?.crew_assignments || [];

  const handleDeleteShoot = async () => {
    if (!window.confirm('Delete this shoot? This cannot be undone.')) return;
    await deleteShoot.mutateAsync(shootId);
    navigate(`/production/projects/${projectId}`);
  };

  if (shootLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">Loading shoot…</div>
    );
  }

  if (!shoot) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <p className="text-lg font-semibold mb-2">Shoot not found</p>
        <Link to={`/production/projects/${projectId}`} className="text-indigo-600 hover:underline text-sm">Back to project</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          to={`/production/projects/${projectId}`}
          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mb-3"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to {project?.name || 'Project'}
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{shoot.location}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{formatDisplayDate(shoot.shoot_date)}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={shoot.status} />
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100"
            >
              <PencilSquareIcon className="h-3.5 w-3.5" /> Edit Shoot
            </button>
            <button
              onClick={handleDeleteShoot}
              disabled={deleteShoot.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 disabled:opacity-50"
            >
              <TrashIcon className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* Shoot Info Panel */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              <CalendarDaysIcon className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Date</span>
            </div>
            <div className="text-sm font-semibold text-gray-800">{formatDisplayDate(shoot.shoot_date)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              <ClockIcon className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Call Time</span>
            </div>
            <div className="text-sm font-semibold text-gray-800">{formatTime(shoot.call_time)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              <ClockIcon className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Est. Wrap</span>
            </div>
            <div className="text-sm font-semibold text-gray-800">{formatTime(shoot.est_wrap_time)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              <MapPinIcon className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Status</span>
            </div>
            <div className="text-sm font-semibold text-gray-800"><StatusBadge status={shoot.status} /></div>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-0.5 font-medium uppercase tracking-wide">Location</p>
          <p className="text-sm text-gray-800 font-semibold">{shoot.location}</p>
          {shoot.address && <p className="text-sm text-gray-500 mt-0.5">{shoot.address}</p>}
        </div>

        {shoot.description && (
          <div>
            <p className="text-xs text-gray-500 mb-0.5 font-medium uppercase tracking-wide">Description</p>
            <p className="text-sm text-gray-700 leading-relaxed">{shoot.description}</p>
          </div>
        )}

        {(shoot.wardrobe_instructions || shoot.hair_makeup_notes || shoot.comments) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {shoot.wardrobe_instructions && (
              <div className="bg-amber-50 text-amber-800 p-3 rounded-lg">
                <p className="text-xs font-semibold uppercase tracking-wide mb-1 opacity-70">Wardrobe</p>
                <p className="text-xs leading-relaxed">{shoot.wardrobe_instructions}</p>
              </div>
            )}
            {shoot.hair_makeup_notes && (
              <div className="bg-pink-50 text-pink-800 p-3 rounded-lg">
                <p className="text-xs font-semibold uppercase tracking-wide mb-1 opacity-70">Hair & Makeup</p>
                <p className="text-xs leading-relaxed">{shoot.hair_makeup_notes}</p>
              </div>
            )}
            {shoot.comments && (
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg">
                <p className="text-xs font-semibold uppercase tracking-wide mb-1 opacity-70">Notes</p>
                <p className="text-xs leading-relaxed">{shoot.comments}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Roster */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-gray-800 text-sm">Roster</h3>

        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Talent ({talent.length})</p>
          {talent.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No talent assigned</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {talent.map((b) => (
                <Link
                  key={b.id}
                  to={`/production/talent/${b.talent_id}`}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs hover:ring-2 hover:ring-indigo-300 transition-all"
                >
                  <PersonAvatar name={b.talent_name} photoUrl={b.photo_url} size="xs" />
                  <span className="font-medium text-gray-800">{b.talent_name}</span>
                  <span className="text-gray-400 capitalize">{b.talent_type?.replace(/_/g, ' ')}</span>
                  <StatusBadge status={b.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Crew ({crew.length})</p>
          {crew.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No crew assigned</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {crew.map((a) => (
                <Link
                  key={a.id}
                  to={`/production/crew/${a.crew_id}`}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs hover:ring-2 hover:ring-indigo-300 transition-all"
                >
                  <PersonAvatar name={a.crew_name} photoUrl={a.photo_url} size="xs" />
                  <span className="font-medium text-gray-800">{a.crew_name}</span>
                  <span className="text-gray-400 capitalize">{(a.role_display || a.role)?.replace(/_/g, ' ')}</span>
                  <StatusBadge status={a.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Call Sheets */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-sm">Call Sheets for this Shoot</h3>
          {!showCreateCS && (
            <button
              onClick={() => setShowCreateCS(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700"
            >
              <PlusIcon className="h-3.5 w-3.5" /> New Call Sheet
            </button>
          )}
        </div>

        {showCreateCS && (
          <CreateCallSheetForm shootData={shoot} projectId={projectId} onClose={() => setShowCreateCS(false)} />
        )}

        {callSheets.length === 0 && !showCreateCS ? (
          <div className="flex flex-col items-center py-8 text-center">
            <UserCircleIcon className="h-10 w-10 text-gray-200 mb-2" />
            <p className="text-sm text-gray-400">No call sheets created yet</p>
            <p className="text-xs text-gray-300 mt-0.5">Create one to start organizing your shoot day</p>
          </div>
        ) : (
          <div className="space-y-3">
            {callSheets.map((cs) => (
              <CallSheetCard key={cs.id} cs={cs} shootData={shoot} talent={talent} crew={crew} />
            ))}
          </div>
        )}
      </div>

      {/* Edit Shoot Modal */}
      {showEditModal && (
        <ArrangeShootModal
          projectId={projectId}
          shootToEdit={shoot}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}

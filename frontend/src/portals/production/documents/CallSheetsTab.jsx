import { useState } from 'react';
import {
  useCallSheets,
  useCallSheet,
  useCreateCallSheet,
  useDeleteCallSheet,
  useAddCallSheetEntry,
  useRemoveCallSheetEntry,
  useGenerateCallSheetFromShoot,
} from '../../../api/hooks';
import LoadingSpinner from '../../../components/LoadingSpinner';

function CallSheetDetail({ id, onBack }) {
  const { data: cs, isLoading } = useCallSheet(id);
  const addEntry = useAddCallSheetEntry();
  const removeEntry = useRemoveCallSheetEntry();
  const generateFromShoot = useGenerateCallSheetFromShoot();

  const [entryForm, setEntryForm] = useState({
    person_type: 'crew',
    name: '',
    role: '',
    call_time: '',
    notes: '',
  });

  if (isLoading) return <LoadingSpinner />;
  if (!cs) return null;

  const entries = cs.entries || [];
  const talentEntries = entries.filter((e) => e.person_type === 'talent');
  const crewEntries = entries.filter((e) => e.person_type === 'crew');

  const handleAddEntry = async (e) => {
    e.preventDefault();
    await addEntry.mutateAsync({
      callSheetId: id,
      ...entryForm,
      call_time: entryForm.call_time || null,
    });
    setEntryForm({ person_type: 'crew', name: '', role: '', call_time: '', notes: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-indigo-600 hover:text-indigo-800 text-sm">
          ← Back to list
        </button>
        {cs.shoot && (
          <button
            onClick={() => generateFromShoot.mutate(id)}
            disabled={generateFromShoot.isPending}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50"
          >
            {generateFromShoot.isPending ? 'Generating...' : 'Auto-populate from Shoot'}
          </button>
        )}
      </div>

      {/* Call Sheet Header */}
      <div className="bg-white rounded-xl shadow p-6 border-t-4 border-indigo-600">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{cs.title}</h2>
          <p className="text-gray-500 text-sm mt-1">
            {cs.project_name} · Created by {cs.creator_name}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 rounded-lg p-4">
          <div>
            <p className="text-xs text-gray-400 uppercase">Date</p>
            <p className="font-semibold">{cs.shoot_date}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase">Call Time</p>
            <p className="font-semibold">{cs.call_time}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase">Est. Wrap</p>
            <p className="font-semibold">{cs.est_wrap_time || 'TBD'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase">Location</p>
            <p className="font-semibold">{cs.location}</p>
          </div>
        </div>

        {cs.address && (
          <div className="mt-3 text-sm">
            <span className="text-gray-400">Address: </span>
            <span className="text-gray-700">{cs.address}</span>
          </div>
        )}
        {cs.parking_info && (
          <div className="mt-1 text-sm">
            <span className="text-gray-400">Parking: </span>
            <span className="text-gray-700">{cs.parking_info}</span>
          </div>
        )}
        {cs.weather_notes && (
          <div className="mt-1 text-sm">
            <span className="text-gray-400">Weather: </span>
            <span className="text-gray-700">{cs.weather_notes}</span>
          </div>
        )}
        {cs.emergency_contact && (
          <div className="mt-1 text-sm">
            <span className="text-gray-400">Emergency Contact: </span>
            <span className="text-gray-700">{cs.emergency_contact}</span>
          </div>
        )}

        {(cs.wardrobe_instructions || cs.hair_makeup_notes || cs.production_notes) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {cs.wardrobe_instructions && (
              <div className="bg-amber-50 p-3 rounded-lg text-sm">
                <p className="font-medium text-amber-800 text-xs uppercase mb-1">Wardrobe</p>
                <p className="text-amber-900">{cs.wardrobe_instructions}</p>
              </div>
            )}
            {cs.hair_makeup_notes && (
              <div className="bg-pink-50 p-3 rounded-lg text-sm">
                <p className="font-medium text-pink-800 text-xs uppercase mb-1">Hair & Makeup</p>
                <p className="text-pink-900">{cs.hair_makeup_notes}</p>
              </div>
            )}
            {cs.production_notes && (
              <div className="bg-blue-50 p-3 rounded-lg text-sm">
                <p className="font-medium text-blue-800 text-xs uppercase mb-1">Production Notes</p>
                <p className="text-blue-900">{cs.production_notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Talent Roster */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Talent</h3>
          {talentEntries.length === 0 ? (
            <p className="text-sm text-gray-400">No talent entries yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-gray-400">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Role</th>
                  <th className="pb-2">Call Time</th>
                  <th className="pb-2">Notes</th>
                  <th className="pb-2 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {talentEntries.map((e) => (
                  <tr key={e.id}>
                    <td className="py-2 font-medium">{e.name}</td>
                    <td className="py-2">{e.role}</td>
                    <td className="py-2">{e.call_time || '—'}</td>
                    <td className="py-2 text-gray-500">{e.notes || '—'}</td>
                    <td className="py-2">
                      <button
                        onClick={() => removeEntry.mutate({ callSheetId: id, entryId: e.id })}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Crew Roster */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Crew</h3>
          {crewEntries.length === 0 ? (
            <p className="text-sm text-gray-400">No crew entries yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-gray-400">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Role</th>
                  <th className="pb-2">Call Time</th>
                  <th className="pb-2">Notes</th>
                  <th className="pb-2 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {crewEntries.map((e) => (
                  <tr key={e.id}>
                    <td className="py-2 font-medium">{e.name}</td>
                    <td className="py-2">{e.role}</td>
                    <td className="py-2">{e.call_time || '—'}</td>
                    <td className="py-2 text-gray-500">{e.notes || '—'}</td>
                    <td className="py-2">
                      <button
                        onClick={() => removeEntry.mutate({ callSheetId: id, entryId: e.id })}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add Entry Form */}
        <form onSubmit={handleAddEntry} className="mt-6 border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Add Person</h4>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="w-28">
              <label className="block text-xs text-gray-500 mb-1">Type</label>
              <select
                value={entryForm.person_type}
                onChange={(e) => setEntryForm((f) => ({ ...f, person_type: e.target.value }))}
                className="w-full border rounded-lg p-2 text-sm"
              >
                <option value="talent">Talent</option>
                <option value="crew">Crew</option>
              </select>
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs text-gray-500 mb-1">Name *</label>
              <input
                type="text"
                value={entryForm.name}
                onChange={(e) => setEntryForm((f) => ({ ...f, name: e.target.value }))}
                required
                className="w-full border rounded-lg p-2 text-sm"
              />
            </div>
            <div className="w-36">
              <label className="block text-xs text-gray-500 mb-1">Role *</label>
              <input
                type="text"
                value={entryForm.role}
                onChange={(e) => setEntryForm((f) => ({ ...f, role: e.target.value }))}
                required
                className="w-full border rounded-lg p-2 text-sm"
              />
            </div>
            <div className="w-28">
              <label className="block text-xs text-gray-500 mb-1">Call Time</label>
              <input
                type="time"
                value={entryForm.call_time}
                onChange={(e) => setEntryForm((f) => ({ ...f, call_time: e.target.value }))}
                className="w-full border rounded-lg p-2 text-sm"
              />
            </div>
            <div className="flex-1 min-w-[100px]">
              <label className="block text-xs text-gray-500 mb-1">Notes</label>
              <input
                type="text"
                value={entryForm.notes}
                onChange={(e) => setEntryForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full border rounded-lg p-2 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={addEntry.isPending}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CallSheetsTab({ projectId, shoots }) {
  const { data: csData, isLoading } = useCallSheets({ project: projectId });
  const createCS = useCreateCallSheet();
  const deleteCS = useDeleteCallSheet();

  const [viewing, setViewing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    shoot: '',
    shoot_date: '',
    call_time: '',
    est_wrap_time: '',
    location: '',
    address: '',
    parking_info: '',
    weather_notes: '',
    wardrobe_instructions: '',
    hair_makeup_notes: '',
    production_notes: '',
    emergency_contact: '',
  });

  const callSheets = csData?.results || csData || [];

  const handleShootSelect = (e) => {
    const shootId = e.target.value;
    const shoot = shoots.find((s) => String(s.id) === shootId);
    if (shoot) {
      setForm((f) => ({
        ...f,
        shoot: shootId,
        shoot_date: shoot.shoot_date,
        call_time: shoot.call_time,
        est_wrap_time: shoot.est_wrap_time || '',
        location: shoot.location,
        address: shoot.address || '',
        wardrobe_instructions: shoot.wardrobe_instructions || '',
        hair_makeup_notes: shoot.hair_makeup_notes || '',
        title: f.title || `Call Sheet – ${shoot.location} – ${shoot.shoot_date}`,
      }));
    } else {
      setForm((f) => ({ ...f, shoot: '' }));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      project: projectId,
      shoot: form.shoot || null,
      est_wrap_time: form.est_wrap_time || null,
    };
    const created = await createCS.mutateAsync(data);
    setShowForm(false);
    setForm({
      title: '', shoot: '', shoot_date: '', call_time: '', est_wrap_time: '',
      location: '', address: '', parking_info: '', weather_notes: '',
      wardrobe_instructions: '', hair_makeup_notes: '', production_notes: '',
      emergency_contact: '',
    });
    setViewing(created.id);
  };

  if (viewing) {
    return <CallSheetDetail id={viewing} onBack={() => setViewing(null)} />;
  }

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Call Sheets</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : '+ New Call Sheet'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow p-6 space-y-4">
          <h3 className="font-semibold">Create Call Sheet</h3>

          {shoots.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pre-fill from Shoot (optional)
              </label>
              <select
                value={form.shoot}
                onChange={handleShootSelect}
                className="w-full border rounded-lg p-2 text-sm"
              >
                <option value="">Manual entry...</option>
                {shoots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.shoot_date} – {s.location} ({s.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                className="w-full border rounded-lg p-2 text-sm"
                placeholder="e.g. Day 1 – Studio Shoot"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shoot Date *</label>
              <input
                type="date"
                value={form.shoot_date}
                onChange={(e) => setForm((f) => ({ ...f, shoot_date: e.target.value }))}
                required
                className="w-full border rounded-lg p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                required
                className="w-full border rounded-lg p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Call Time *</label>
              <input
                type="time"
                value={form.call_time}
                onChange={(e) => setForm((f) => ({ ...f, call_time: e.target.value }))}
                required
                className="w-full border rounded-lg p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Est. Wrap Time</label>
              <input
                type="time"
                value={form.est_wrap_time}
                onChange={(e) => setForm((f) => ({ ...f, est_wrap_time: e.target.value }))}
                className="w-full border rounded-lg p-2 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className="w-full border rounded-lg p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parking Info</label>
              <input
                type="text"
                value={form.parking_info}
                onChange={(e) => setForm((f) => ({ ...f, parking_info: e.target.value }))}
                className="w-full border rounded-lg p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weather Notes</label>
              <input
                type="text"
                value={form.weather_notes}
                onChange={(e) => setForm((f) => ({ ...f, weather_notes: e.target.value }))}
                className="w-full border rounded-lg p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
              <input
                type="text"
                value={form.emergency_contact}
                onChange={(e) => setForm((f) => ({ ...f, emergency_contact: e.target.value }))}
                className="w-full border rounded-lg p-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wardrobe</label>
              <textarea
                value={form.wardrobe_instructions}
                onChange={(e) => setForm((f) => ({ ...f, wardrobe_instructions: e.target.value }))}
                rows={2}
                className="w-full border rounded-lg p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hair & Makeup</label>
              <textarea
                value={form.hair_makeup_notes}
                onChange={(e) => setForm((f) => ({ ...f, hair_makeup_notes: e.target.value }))}
                rows={2}
                className="w-full border rounded-lg p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Production Notes</label>
              <textarea
                value={form.production_notes}
                onChange={(e) => setForm((f) => ({ ...f, production_notes: e.target.value }))}
                rows={2}
                className="w-full border rounded-lg p-2 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={createCS.isPending}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {createCS.isPending ? 'Creating...' : 'Create Call Sheet'}
          </button>
        </form>
      )}

      {/* List */}
      {callSheets.length === 0 && !showForm ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
          No call sheets yet for this project.
        </div>
      ) : (
        <div className="space-y-3">
          {callSheets.map((cs) => (
            <div
              key={cs.id}
              className="bg-white rounded-xl shadow p-4 flex items-center justify-between hover:shadow-md transition cursor-pointer"
              onClick={() => setViewing(cs.id)}
            >
              <div>
                <h3 className="font-semibold text-gray-900">{cs.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {cs.shoot_date} · {cs.location} · {cs.entry_count} people
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">
                  by {cs.creator_name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Delete this call sheet?')) deleteCS.mutate(cs.id);
                  }}
                  className="text-red-400 hover:text-red-600 text-xs"
                >
                  Delete
                </button>
                <span className="text-indigo-600 text-sm font-medium">View →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

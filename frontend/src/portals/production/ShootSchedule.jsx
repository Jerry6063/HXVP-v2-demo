import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  useShoots,
  useShoot,
  useCreateShoot,
  useUpdateShoot,
  useDeleteShoot,
  useShootAvailability,
  useTalentProfiles,
  useCrewProfiles,
  useCreateBooking,
  useDeleteBooking,
  useCreateCrewAssignment,
  useDeleteCrewAssignment,
} from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';
import {
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  PlusIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

// ── Helpers ────────────────────────────────────────────────────────────────────

function isoWeekStart(dateStr) {
  const d = dateStr ? new Date(dateStr + 'T00:00:00') : new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().slice(0, 10);
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function formatShortDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

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

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const AVAIL_STYLE = {
  available: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer',
  booked: 'bg-red-100 text-red-500 cursor-default',
  unavailable: 'bg-gray-100 text-gray-400 cursor-default',
};

const AVAIL_LABEL = { available: 'Free', booked: 'Booked', unavailable: 'N/A' };

const CREW_ROLES = [
  { value: 'director', label: 'Director' },
  { value: 'photographer', label: 'Photographer' },
  { value: 'videographer', label: 'Videographer' },
  { value: 'lighting', label: 'Lighting' },
  { value: 'audio', label: 'Audio' },
  { value: 'makeup_artist', label: 'Makeup Artist' },
  { value: 'wardrobe_stylist', label: 'Wardrobe Stylist' },
  { value: 'art_director', label: 'Art Director' },
  { value: 'producer', label: 'Producer' },
  { value: 'assistant', label: 'Assistant' },
  { value: 'editor', label: 'Editor' },
  { value: 'other', label: 'Other' },
];

// ── Shoot Card (list item) ─────────────────────────────────────────────────────

function ShootCard({ shoot, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-3.5 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-sm transition-all text-left group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex-shrink-0 w-10 h-10 bg-indigo-50 rounded-lg flex flex-col items-center justify-center">
          <span className="text-xs font-bold text-indigo-700 leading-none">
            {new Date(shoot.shoot_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
          </span>
          <span className="text-base font-extrabold text-indigo-800 leading-none">
            {new Date(shoot.shoot_date + 'T00:00:00').getDate()}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{shoot.location}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {formatTime(shoot.call_time)}
            {shoot.est_wrap_time && ` – ${formatTime(shoot.est_wrap_time)}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <StatusBadge status={shoot.status} />
        <ChevronRightIcon className="h-4 w-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />
      </div>
    </button>
  );
}

// ── Shoot Detail Modal ─────────────────────────────────────────────────────────

function ShootDetailModal({ shootId, onClose, onEdit }) {
  const { data: shoot, isLoading } = useShoot(shootId);
  const deleteShoot = useDeleteShoot();
  const deleteAssignment = useDeleteCrewAssignment();
  const deleteBooking = useDeleteBooking();

  const handleDelete = async () => {
    if (!window.confirm('Delete this shoot? This cannot be undone.')) return;
    await deleteShoot.mutateAsync(shootId);
    onClose();
  };

  if (isLoading) {
    return (
      <ModalOverlay onClose={onClose}>
        <div className="flex items-center justify-center h-48 text-gray-400">Loading…</div>
      </ModalOverlay>
    );
  }

  if (!shoot) return null;

  const talent = shoot.bookings || [];
  const crew = shoot.crew_assignments || [];

  return (
    <ModalOverlay onClose={onClose} wide>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-900">Shoot Details</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100"
          >
            <PencilSquareIcon className="h-3.5 w-3.5" /> Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteShoot.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 disabled:opacity-50"
          >
            <TrashIcon className="h-3.5 w-3.5" /> Delete
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-1">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Key info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <InfoBlock icon={<CalendarDaysIcon className="h-4 w-4" />} label="Date" value={formatDisplayDate(shoot.shoot_date)} />
        <InfoBlock icon={<ClockIcon className="h-4 w-4" />} label="Call Time" value={formatTime(shoot.call_time)} />
        <InfoBlock icon={<ClockIcon className="h-4 w-4" />} label="Est. Wrap" value={formatTime(shoot.est_wrap_time)} />
        <InfoBlock icon={<MapPinIcon className="h-4 w-4" />} label="Status" value={<StatusBadge status={shoot.status} />} />
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-0.5 font-medium uppercase tracking-wide">Location</p>
        <p className="text-sm text-gray-800 font-semibold">{shoot.location}</p>
        {shoot.address && <p className="text-sm text-gray-500 mt-0.5">{shoot.address}</p>}
      </div>

      {shoot.description && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-0.5 font-medium uppercase tracking-wide">Description</p>
          <p className="text-sm text-gray-700 leading-relaxed">{shoot.description}</p>
        </div>
      )}

      {(shoot.wardrobe_instructions || shoot.hair_makeup_notes || shoot.comments) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {shoot.wardrobe_instructions && (
            <NoteBlock color="amber" label="Wardrobe" text={shoot.wardrobe_instructions} />
          )}
          {shoot.hair_makeup_notes && (
            <NoteBlock color="pink" label="Hair & Makeup" text={shoot.hair_makeup_notes} />
          )}
          {shoot.comments && (
            <NoteBlock color="blue" label="Notes" text={shoot.comments} />
          )}
        </div>
      )}

      {/* Talent Roster */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
          Talent ({talent.length})
        </p>
        {talent.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No talent assigned</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {talent.map((b) => (
              <PersonChip
                key={b.id}
                name={b.talent_name}
                role={b.talent_type}
                photoUrl={b.photo_url}
                status={b.status}
                href={b.talent_id ? `/production/talent/${b.talent_id}` : undefined}
                onRemove={async () => {
                  await deleteBooking.mutateAsync(b.id);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Crew Roster */}
      <div>
        <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
          Crew ({crew.length})
        </p>
        {crew.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No crew assigned</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {crew.map((a) => (
              <PersonChip
                key={a.id}
                name={a.crew_name}
                role={a.role_display || a.role}
                photoUrl={a.photo_url}
                status={a.status}
                href={a.crew_id ? `/production/crew/${a.crew_id}` : undefined}
                onRemove={async () => {
                  await deleteAssignment.mutateAsync(a.id);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </ModalOverlay>
  );
}

// ── Arrange Shoot Modal ────────────────────────────────────────────────────────

function ArrangeShootModal({ projectId, shootToEdit, onClose }) {
  const createShoot = useCreateShoot();
  const updateShoot = useUpdateShoot();
  const createBooking = useCreateBooking();
  const createAssignment = useCreateCrewAssignment();

  const [activeTab, setActiveTab] = useState(0); // 0 = Shoot Details, 1 = Find a Time

  const emptyForm = {
    shoot_date: '',
    call_time: '09:00',
    est_wrap_time: '17:00',
    location: '',
    address: '',
    description: '',
    wardrobe_instructions: '',
    hair_makeup_notes: '',
    comments: '',
    status: 'scheduled',
  };

  const [form, setForm] = useState(
    shootToEdit
      ? {
          shoot_date: shootToEdit.shoot_date || '',
          call_time: shootToEdit.call_time || '',
          est_wrap_time: shootToEdit.est_wrap_time || '',
          location: shootToEdit.location || '',
          address: shootToEdit.address || '',
          description: shootToEdit.description || '',
          wardrobe_instructions: shootToEdit.wardrobe_instructions || '',
          hair_makeup_notes: shootToEdit.hair_makeup_notes || '',
          comments: shootToEdit.comments || '',
          status: shootToEdit.status || 'scheduled',
        }
      : emptyForm
  );

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // People selected for the shoot
  const [selectedTalent, setSelectedTalent] = useState([]); // [{id, name, role, photo_url}]
  const [selectedCrew, setSelectedCrew] = useState([]);     // [{id, name, role, photo_url, role_on_shoot}]

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.shoot_date || !form.location) {
      setSaveError('Date and location are required.');
      return;
    }
    if (form.call_time && form.est_wrap_time && form.est_wrap_time <= form.call_time) {
      setSaveError('Wrap time must be later than call time.');
      return;
    }
    setSaveError('');
    setIsSaving(true);
    try {
      let shoot;
      const payload = {
        ...form,
        project: projectId,
        est_wrap_time: form.est_wrap_time || null,
      };
      if (shootToEdit) {
        shoot = await updateShoot.mutateAsync({ id: shootToEdit.id, ...payload });
      } else {
        shoot = await createShoot.mutateAsync(payload);
        // Create bookings for selected talent
        for (const t of selectedTalent) {
          try {
            await createBooking.mutateAsync({ talent: t.id, shoot: shoot.id, notes: '' });
          } catch (_) {/* ignore duplicate */}
        }
        // Create assignments for selected crew
        for (const c of selectedCrew) {
          try {
            await createAssignment.mutateAsync({
              crew: c.id,
              shoot: shoot.id,
              role_on_shoot: c.role_on_shoot || c.crewRole || 'other',
            });
          } catch (_) {/* ignore duplicate */}
        }
      }
      onClose();
    } catch (err) {
      setSaveError(err?.response?.data?.detail || 'Failed to save shoot.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose} wide>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">
          {shootToEdit ? 'Edit Shoot' : 'Arrange a Shoot'}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200 mb-5">
        {['Shoot Details', 'Find a Time'].map((t, i) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === i
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave}>
        {activeTab === 0 && (
          <ShootDetailsTab form={form} setField={setField} setForm={setForm} selectedTalent={selectedTalent} selectedCrew={selectedCrew} />
        )}
        {activeTab === 1 && (
          <FindATimeTab
            form={form}
            setForm={setForm}
            setActiveTab={setActiveTab}
            selectedTalent={selectedTalent}
            setSelectedTalent={setSelectedTalent}
            selectedCrew={selectedCrew}
            setSelectedCrew={setSelectedCrew}
          />
        )}

        {activeTab === 0 && (
          <div className="mt-5 flex items-center gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving…' : shootToEdit ? 'Update Shoot' : 'Create Shoot'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
            {saveError && <p className="text-sm text-red-600 ml-2">{saveError}</p>}
          </div>
        )}
      </form>
    </ModalOverlay>
  );
}

// ── Tab 1: Shoot Details Form ──────────────────────────────────────────────────

function ShootDetailsTab({ form, setField, setForm, selectedTalent, selectedCrew }) {
  return (
    <div className="space-y-4">
      {/* Date / Times */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1 font-medium">Shoot Date *</label>
          <input
            type="date"
            value={form.shoot_date}
            onChange={setField('shoot_date')}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1 font-medium">Call Time</label>
          <input
            type="time"
            value={form.call_time}
            onChange={setField('call_time')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1 font-medium">Est. Wrap Time</label>
          <input
            type="time"
            value={form.est_wrap_time}
            onChange={setField('est_wrap_time')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1 font-medium">Location / Venue *</label>
          <input
            type="text"
            value={form.location}
            onChange={setField('location')}
            required
            placeholder="e.g. Studio A, Central Park"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1 font-medium">Full Address</label>
          <input
            type="text"
            value={form.address}
            onChange={setField('address')}
            placeholder="123 Main St, New York, NY"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      {/* Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1 font-medium">Status</label>
          <select
            value={form.status}
            onChange={setField('status')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs text-gray-500 mb-1 font-medium">Description / Shot Brief</label>
        <textarea
          value={form.description}
          onChange={setField('description')}
          rows={2}
          placeholder="What will be shot? Key scenes, mood, references…"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
        />
      </div>

      {/* Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1 font-medium">Wardrobe Instructions</label>
          <textarea
            value={form.wardrobe_instructions}
            onChange={setField('wardrobe_instructions')}
            rows={2}
            placeholder="Dress code, outfit colours, accessories…"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1 font-medium">Hair & Makeup Notes</label>
          <textarea
            value={form.hair_makeup_notes}
            onChange={setField('hair_makeup_notes')}
            rows={2}
            placeholder="Look references, preferred styles…"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1 font-medium">Additional Comments</label>
        <textarea
          value={form.comments}
          onChange={setField('comments')}
          rows={2}
          placeholder="Anything else the team should know…"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
        />
      </div>

      {/* Selected people summary */}
      {(selectedTalent.length > 0 || selectedCrew.length > 0) && (
        <div className="pt-1 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2 font-medium">People selected for this shoot</p>
          <div className="flex flex-wrap gap-2">
            {selectedTalent.map((p) => (
              <span key={`t-${p.id}`} className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-medium">
                {p.name} <span className="text-amber-500 capitalize">· {p.role}</span>
              </span>
            ))}
            {selectedCrew.map((p) => (
              <span key={`c-${p.id}`} className="inline-flex items-center gap-1 px-2 py-1 bg-sky-50 text-sky-800 rounded-full text-xs font-medium">
                {p.name} <span className="text-sky-500 capitalize">· {(p.role_on_shoot || p.crewRole || 'crew').replace(/_/g, ' ')}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab 2: Find a Time ─────────────────────────────────────────────────────────

function FindATimeTab({ form, setForm, setActiveTab, selectedTalent, setSelectedTalent, selectedCrew, setSelectedCrew }) {
  const { data: talentData } = useTalentProfiles();
  const { data: crewData } = useCrewProfiles();
  const [search, setSearch] = useState('');
  const [weekStart, setWeekStart] = useState(
    isoWeekStart(form.shoot_date || new Date().toISOString().slice(0, 10))
  );

  const allTalent = useMemo(() => {
    const list = talentData?.results || talentData || [];
    return list.filter((p) => p.approval_status === 'approved' || true);
  }, [talentData]);

  const allCrew = useMemo(() => crewData?.results || crewData || [], [crewData]);

  // 14-day range starting from weekStart
  const dateRange = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 14; i++) {
      dates.push(addDays(weekStart, i));
    }
    return dates;
  }, [weekStart]);

  // Availability query
  const talentIds = selectedTalent.map((t) => t.id).join(',');
  const crewIds = selectedCrew.map((c) => c.id).join(',');
  const hasPeople = selectedTalent.length > 0 || selectedCrew.length > 0;

  const { data: availData, isLoading: availLoading } = useShootAvailability(
    hasPeople
      ? {
          start_date: dateRange[0],
          end_date: dateRange[dateRange.length - 1],
          talent_ids: talentIds || undefined,
          crew_ids: crewIds || undefined,
        }
      : null
  );

  const people = availData?.people || [];

  // Filter search across talent and crew
  const filterStr = search.toLowerCase();
  const filteredTalent = allTalent.filter(
    (p) =>
      `${p.user?.first_name} ${p.user?.last_name}`.toLowerCase().includes(filterStr) ||
      (p.talent_type || '').toLowerCase().includes(filterStr)
  );
  const filteredCrew = allCrew.filter(
    (p) =>
      `${p.user?.first_name} ${p.user?.last_name}`.toLowerCase().includes(filterStr) ||
      (p.crew_role || '').toLowerCase().includes(filterStr)
  );

  const isTalentSelected = (id) => selectedTalent.some((t) => t.id === id);
  const isCrewSelected = (id) => selectedCrew.some((c) => c.id === id);

  const toggleTalent = (p) => {
    const name = `${p.user?.first_name} ${p.user?.last_name}`.trim();
    setSelectedTalent((prev) =>
      isTalentSelected(p.id)
        ? prev.filter((t) => t.id !== p.id)
        : [
            ...prev,
            {
              id: p.id,
              name,
              role: p.talent_type,
              photo_url: p.primary_photo,
            },
          ]
    );
  };

  const toggleCrew = (p, roleOnShoot) => {
    const name = `${p.user?.first_name} ${p.user?.last_name}`.trim();
    setSelectedCrew((prev) =>
      isCrewSelected(p.id)
        ? prev.filter((c) => c.id !== p.id)
        : [
            ...prev,
            {
              id: p.id,
              name,
              crewRole: p.crew_role,
              role_on_shoot: roleOnShoot || p.crew_role,
              photo_url: p.profile_photo_url || null,
            },
          ]
    );
  };

  const handleSlotClick = (dateStr, period) => {
    // Pre-fill the date and suggest a call time based on period
    const suggestedTime = period === 'am' ? '09:00' : '13:00';
    setForm((f) => ({
      ...f,
      shoot_date: dateStr,
      call_time: f.call_time || suggestedTime,
    }));
    setActiveTab(0);
  };

  // Column score: how many people are free for a given half-day
  const colScore = (dateStr, period) => {
    if (people.length === 0) return null;
    return people.filter((p) => p.days?.[dateStr]?.[period] === 'available').length;
  };

  return (
    <div className="flex gap-4" style={{ minHeight: 400 }}>
      {/* Left: People Selector */}
      <div className="w-64 flex-shrink-0 border-r border-gray-100 pr-4 overflow-y-auto" style={{ maxHeight: 500 }}>
        <div className="relative mb-3 sticky top-0 bg-white pb-1">
          <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search talent or crew…"
            className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-400 outline-none"
          />
        </div>

        {filteredTalent.length > 0 && (
          <>
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1.5">Talent</p>
            <div className="space-y-1 mb-3">
              {filteredTalent.map((p) => {
                const name = `${p.user?.first_name} ${p.user?.last_name}`.trim();
                const selected = isTalentSelected(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleTalent(p)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                      selected ? 'bg-amber-50 ring-1 ring-amber-300' : 'hover:bg-gray-50'
                    }`}
                  >
                    <PersonAvatar name={name} photoUrl={p.primary_photo} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{name}</p>
                      <p className="text-xs text-gray-400 capitalize truncate">{p.talent_type?.replace(/_/g, ' ')}</p>
                    </div>
                    {selected && <CheckIcon className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {filteredCrew.length > 0 && (
          <>
            <p className="text-xs font-semibold text-sky-700 uppercase tracking-wide mb-1.5">Crew</p>
            <div className="space-y-1">
              {filteredCrew.map((p) => {
                const name = `${p.user?.first_name} ${p.user?.last_name}`.trim();
                const selected = isCrewSelected(p.id);
                return (
                  <CrewSelectRow
                    key={p.id}
                    person={p}
                    name={name}
                    selected={selected}
                    onToggle={(role) => toggleCrew(p, role)}
                    currentRole={selectedCrew.find((c) => c.id === p.id)?.role_on_shoot}
                  />
                );
              })}
            </div>
          </>
        )}

        {filteredTalent.length === 0 && filteredCrew.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-6">No results</p>
        )}
      </div>

      {/* Right: Availability Grid */}
      <div className="flex-1 overflow-x-auto">
        {/* Week navigation */}
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => setWeekStart((w) => addDays(w, -14))}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeftIcon className="h-4 w-4" /> Prev
          </button>
          <span className="text-xs font-semibold text-gray-600">
            {formatShortDate(dateRange[0])} – {formatShortDate(dateRange[13])}
          </span>
          <button
            type="button"
            onClick={() => setWeekStart((w) => addDays(w, 14))}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Next <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>

        {!hasPeople ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <CalendarDaysIcon className="h-10 w-10 text-gray-200 mb-2" />
            <p className="text-sm text-gray-400">Select talent or crew on the left</p>
            <p className="text-xs text-gray-300 mt-1">Their availability will appear here</p>
          </div>
        ) : availLoading ? (
          <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Loading availability…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border-separate" style={{ borderSpacing: '1px' }}>
              <thead>
                {/* Row 1: grouped date headers */}
                <tr>
                  <th className="w-36 text-left pb-1 text-gray-500 font-medium pr-2" rowSpan={2}>Person</th>
                  {dateRange.map((d) => {
                    const isSelected = form.shoot_date === d;
                    const dayOfWeek = new Date(d + 'T00:00:00').getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    return (
                      <th
                        key={d}
                        colSpan={2}
                        className={`text-center font-semibold pb-0.5 border-b border-gray-200 text-[10px] ${
                          isSelected ? 'text-indigo-700 bg-indigo-50' : isWeekend ? 'text-gray-400 bg-gray-50/60' : 'text-gray-600'
                        }`}
                      >
                        <div>{new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        <div className={isSelected ? 'font-bold' : ''}>
                          {new Date(d + 'T00:00:00').getDate()}
                        </div>
                      </th>
                    );
                  })}
                </tr>
                {/* Row 2: AM / PM sub-headers with availability bars */}
                <tr>
                  {dateRange.map((d) =>
                    ['am', 'pm'].map((period) => {
                      const score = colScore(d, period);
                      const isSelected = form.shoot_date === d;
                      return (
                        <th
                          key={`${d}-${period}`}
                          className={`text-center text-[9px] font-bold pb-1 uppercase min-w-[28px] tracking-wide ${
                            isSelected ? 'bg-indigo-50' : ''
                          } ${period === 'am' ? 'text-sky-500' : 'text-orange-400'}`}
                        >
                          {period.toUpperCase()}
                          {score !== null && people.length > 0 && (
                            <div
                              className={`mx-auto mt-0.5 w-4 h-1 rounded-full ${
                                score === people.length
                                  ? 'bg-emerald-400'
                                  : score === 0
                                  ? 'bg-red-300'
                                  : 'bg-amber-300'
                              }`}
                            />
                          )}
                        </th>
                      );
                    })
                  )}
                </tr>
              </thead>
              <tbody>
                {people.map((person) => (
                  <tr key={`${person.type}-${person.id}`}>
                    <td className="pr-2 py-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <PersonAvatar name={person.name} photoUrl={person.photo_url} size="xs" />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-700 truncate">{person.name}</p>
                          <p className="text-gray-400 capitalize truncate">{person.role?.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                    </td>
                    {dateRange.map((d) =>
                      ['am', 'pm'].map((period) => {
                        const status = person.days?.[d]?.[period] || 'available';
                        const canClick = status === 'available';
                        const isHighlighted =
                          form.shoot_date === d &&
                          ((!form.call_time) ||
                            (period === 'am' && form.call_time < '12:00') ||
                            (period === 'pm' && form.call_time >= '12:00'));
                        return (
                          <td key={`${d}-${period}`} className="text-center py-0.5 px-0">
                            <button
                              type="button"
                              disabled={!canClick}
                              title={
                                canClick
                                  ? `${d} ${period.toUpperCase()} – click to select`
                                  : `${person.name}: ${status}`
                              }
                              onClick={canClick ? () => handleSlotClick(d, period) : undefined}
                              className={`inline-flex items-center justify-center w-7 h-6 rounded text-[10px] font-medium transition-all ${
                                AVAIL_STYLE[status] || AVAIL_STYLE.available
                              } ${isHighlighted ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}`}
                            >
                              {status === 'available' ? '✓' : status === 'booked' ? '✗' : '–'}
                            </button>
                          </td>
                        );
                      })
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Legend */}
        {hasPeople && !availLoading && (
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-200" /> ✓ Available – click AM or PM to select</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-100 border border-red-200" /> ✗ Already booked</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200" /> – Unavailable</span>
            <span className="text-gray-400">· Colored bar = team availability (green=all free · amber=partial · red=none)</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Crew Select Row (with role picker) ────────────────────────────────────────

function CrewSelectRow({ person, name, selected, onToggle, currentRole }) {
  const [role, setRole] = useState(currentRole || person.crew_role || 'other');
  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${selected ? 'bg-sky-50 ring-1 ring-sky-300' : 'hover:bg-gray-50'}`}>
      <button
        type="button"
        onClick={() => onToggle(role)}
        className="flex items-center gap-2 flex-1 min-w-0 text-left"
      >
        <PersonAvatar name={name} photoUrl={person.profile_photo_url} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-800 truncate">{name}</p>
          <p className="text-xs text-gray-400 capitalize truncate">{person.crew_role?.replace(/_/g, ' ')}</p>
        </div>
        {selected && <CheckIcon className="h-3.5 w-3.5 text-sky-600 flex-shrink-0" />}
      </button>
      {selected && (
        <select
          value={role}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            setRole(e.target.value);
            // Update the selected crew entry's role
            onToggle(e.target.value); // remove then re-add with new role
            setTimeout(() => onToggle(e.target.value), 0);
          }}
          className="text-xs border border-sky-200 rounded px-1 py-0.5 bg-white focus:outline-none max-w-[90px]"
        >
          {CREW_ROLES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      )}
    </div>
  );
}

// ── Shared Small Components ────────────────────────────────────────────────────

function ModalOverlay({ children, onClose, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4 pb-4 bg-gray-900/50 backdrop-blur-sm">
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full overflow-y-auto max-h-[90vh] ${
          wide ? 'max-w-4xl' : 'max-w-lg'
        }`}
      >
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
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

function PersonChip({ name, role, photoUrl, status, onRemove, href }) {
  const inner = (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs">
      <PersonAvatar name={name} photoUrl={photoUrl} size="xs" />
      <div>
        <span className="font-medium text-gray-800">{name}</span>
        <span className="text-gray-400 ml-1 capitalize">{role?.replace(/_/g, ' ')}</span>
      </div>
      <StatusBadge status={status} />
      {onRemove && (
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }} className="ml-1 text-red-400 hover:text-red-600">
          <XMarkIcon className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
  if (href) {
    return (
      <Link to={href} className="hover:ring-2 hover:ring-indigo-300 rounded-lg transition-all">
        {inner}
      </Link>
    );
  }
  return inner;
}

function InfoBlock({ icon, label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center gap-1.5 text-gray-400 mb-1">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-sm font-semibold text-gray-800">{value}</div>
    </div>
  );
}

function NoteBlock({ color, label, text }) {
  const colors = {
    amber: 'bg-amber-50 text-amber-800',
    pink: 'bg-pink-50 text-pink-800',
    blue: 'bg-blue-50 text-blue-800',
  };
  return (
    <div className={`p-3 rounded-lg ${colors[color]}`}>
      <p className={`text-xs font-semibold uppercase tracking-wide mb-1 opacity-70`}>{label}</p>
      <p className="text-xs leading-relaxed">{text}</p>
    </div>
  );
}

// ── Main exported component ────────────────────────────────────────────────────

export default function ShootSchedule({ projectId }) {
  const { data: shootsData, isLoading } = useShoots({ project: projectId });
  const [showArrange, setShowArrange] = useState(false);
  const [viewingShootId, setViewingShootId] = useState(null);
  const [editingShoot, setEditingShoot] = useState(null);

  const shoots = useMemo(() => shootsData?.results || shootsData || [], [shootsData]);

  const handleEdit = (shoot) => {
    setViewingShootId(null);
    setEditingShoot(shoot);
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-800 text-sm">Shoot Schedule</h4>
          <button
            onClick={() => setShowArrange(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700"
          >
            <PlusIcon className="h-3.5 w-3.5" /> Arrange Shoot
          </button>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : shoots.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <CalendarDaysIcon className="h-10 w-10 text-gray-200 mb-2" />
            <p className="text-sm text-gray-400">No shoots scheduled yet</p>
            <p className="text-xs text-gray-300 mt-0.5">Click "Arrange Shoot" to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {shoots.map((s) => (
              <ShootCard key={s.id} shoot={s} onClick={() => setViewingShootId(s.id)} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {(showArrange || editingShoot) && (
        <ArrangeShootModal
          projectId={projectId}
          shootToEdit={editingShoot}
          onClose={() => {
            setShowArrange(false);
            setEditingShoot(null);
          }}
        />
      )}

      {viewingShootId && !editingShoot && (
        <ShootDetailModal
          shootId={viewingShootId}
          onClose={() => setViewingShootId(null)}
          onEdit={() => {
            // Fetch the basic shoot from list to pre-fill edit form
            const shoot = shoots.find((s) => s.id === viewingShootId);
            if (shoot) handleEdit(shoot);
          }}
        />
      )}
    </>
  );
}

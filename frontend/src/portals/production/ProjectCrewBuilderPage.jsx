import { useDeferredValue, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

import {
  useAddCrewConsideration,
  useCrewAssignments,
  useCrewAvailability,
  useCrewConsiderations,
  useCrewProfiles,
  useProject,
} from '../../api/hooks';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';

const CREW_ROLE_OPTIONS = [
  { value: '', label: 'All roles' },
  { value: 'director', label: 'Director' },
  { value: 'photographer', label: 'Photographer' },
  { value: 'dop', label: 'Director of Photography' },
  { value: 'videographer', label: 'Videographer' },
  { value: 'first_ac', label: '1st AC' },
  { value: 'second_ac', label: '2nd AC' },
  { value: 'gaffer', label: 'Gaffer' },
  { value: 'grip', label: 'Grip' },
  { value: 'electric', label: 'Electric' },
  { value: 'wardrobe', label: 'Wardrobe' },
  { value: 'set_design', label: 'Set Design' },
  { value: 'bts', label: 'Behind-the-Scene' },
  { value: 'pa', label: 'Production Assistant' },
  { value: 'ac', label: 'Assistant Camera' },
  { value: 'audio', label: 'Audio' },
  { value: 'lighting', label: 'Lighting' },
  { value: 'hair_makeup', label: 'Hair & Makeup' },
  { value: 'stylist', label: 'Stylist' },
  { value: 'crafty', label: 'Crafty' },
  { value: 'other', label: 'Other' },
];

const AVAILABILITY_OPTIONS = [
  { value: '', label: 'Any availability' },
  { value: 'available', label: 'Available' },
  { value: 'booked', label: 'Booked' },
  { value: 'unavailable', label: 'Unavailable' },
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function getCrewInitials(crew) {
  const firstName = crew?.user?.first_name || '';
  const lastName = crew?.user?.last_name || '';
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.trim();
  return initials || crew?.full_name?.slice(0, 2)?.toUpperCase() || 'CR';
}

function getCrewRoleLabel(crew) {
  return crew.crew_role_display || String(crew.crew_role || '').replace(/_/g, ' ');
}

export default function ProjectCrewBuilderPage() {
  const { id } = useParams();
  const today = new Date();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [availability, setAvailability] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [minExperience, setMinExperience] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sharedNotes, setSharedNotes] = useState('');
  const [calendarCrew, setCalendarCrew] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const deferredSearch = useDeferredValue(search);

  const { data: project, isLoading: loadingProject } = useProject(id);
  const { data: crewProfilesData, isLoading: loadingProfiles } = useCrewProfiles();
  const { data: assignmentsData } = useCrewAssignments({ project: id });
  const { data: crewConsData } = useCrewConsiderations({ project: id });
  const addCrewConsideration = useAddCrewConsideration();

  const assignments = assignmentsData?.results || assignmentsData || [];
  const crewConsiderations = crewConsData?.results || crewConsData || [];
  const crewProfiles = crewProfilesData?.results || crewProfilesData || [];

  const excludedCrewIds = useMemo(
    () => new Set([
      ...assignments.map((assignment) => assignment.crew),
      ...crewConsiderations.map((consideration) => consideration.crew),
    ]),
    [assignments, crewConsiderations]
  );

  const filteredCrew = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return crewProfiles.filter((crew) => {
      if (excludedCrewIds.has(crew.id)) return false;
      if (query && !(crew.full_name || '').toLowerCase().includes(query)) return false;
      if (role && crew.crew_role !== role) return false;
      if (availability && crew.availability !== availability) return false;
      if (maxRate && Number(crew.day_rate || 0) > Number(maxRate)) return false;
      if (minExperience && Number(crew.years_experience || 0) < Number(minExperience)) return false;
      return true;
    });
  }, [availability, crewProfiles, deferredSearch, excludedCrewIds, maxRate, minExperience, role]);

  const selectedCrew = useMemo(
    () => crewProfiles.filter((crew) => selectedIds.has(crew.id)),
    [crewProfiles, selectedIds]
  );

  const allFilteredSelected = filteredCrew.length > 0 && filteredCrew.every((crew) => selectedIds.has(crew.id));

  const toggleCrew = (crewId) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(crewId)) {
        next.delete(crewId);
      } else {
        next.add(crewId);
      }
      return next;
    });
  };

  const toggleFilteredCrew = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allFilteredSelected) {
        filteredCrew.forEach((crew) => next.delete(crew.id));
      } else {
        filteredCrew.forEach((crew) => next.add(crew.id));
      }
      return next;
    });
  };

  const resetFilters = () => {
    setSearch('');
    setRole('');
    setAvailability('');
    setMaxRate('');
    setMinExperience('');
  };

  const handleBulkAdd = async () => {
    if (selectedIds.size === 0) return;

    setIsSaving(true);
    try {
      for (const crewId of selectedIds) {
        await addCrewConsideration.mutateAsync({
          project: id,
          crew: crewId,
          notes: sharedNotes,
        });
      }
      toast.success(`${selectedIds.size} crew ${selectedIds.size === 1 ? 'member' : 'members'} added to consideration.`);
      setSelectedIds(new Set());
      setSharedNotes('');
    } catch (error) {
      const detail = error.response?.data?.detail;
      const firstFieldError = Object.values(error.response?.data || {}).find((value) => typeof value === 'string');
      toast.error(detail || firstFieldError || 'Unable to add this crew selection right now.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingProject) {
    return <div className="py-16 text-center text-sm text-gray-400">Loading crew builder…</div>;
  }

  if (!project) {
    return <div className="py-16 text-center text-sm text-gray-400">Project not found.</div>;
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link to={`/production/projects/${id}?section=team-talent`} className="inline-flex items-center gap-2 text-sm font-medium text-sky-600 hover:text-sky-700">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Talent & Crew
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold text-gray-950">Crew Assignments Builder</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="mt-2 max-w-3xl text-sm text-gray-500">
            Filter crew internally, review availability calendars, and add the selected people to project consideration. This page does not create client-facing shortlists.
          </p>
        </div>

        <div className="rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-sm text-sky-950 shadow-sm">
          <p className="font-semibold">{project.client_name || project.client_detail?.first_name || 'Client pending'}</p>
          <p className="mt-1 text-xs text-sky-700/80">
            {project.start_date || 'TBD'} {project.deadline ? `to ${project.deadline}` : ''}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <section className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Filters</p>
                <h2 className="mt-1 text-lg font-semibold text-gray-900">Source crew for this production</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button onClick={toggleFilteredCrew} className="rounded-full border border-gray-200 px-3 py-1.5 font-medium text-gray-700 hover:border-sky-200 hover:text-sky-700">
                  {allFilteredSelected ? 'Clear visible' : 'Select visible'}
                </button>
                <button onClick={() => setSelectedIds(new Set())} className="rounded-full border border-gray-200 px-3 py-1.5 font-medium text-gray-700 hover:border-sky-200 hover:text-sky-700">
                  Clear selection
                </button>
                <button onClick={resetFilters} className="rounded-full border border-gray-200 px-3 py-1.5 font-medium text-gray-700 hover:border-sky-200 hover:text-sky-700">
                  Reset filters
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <label className="md:col-span-2 xl:col-span-2">
                <span className="mb-1 block text-xs font-medium text-gray-500">Search</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by crew name"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                />
              </label>

              <FilterSelect label="Role" value={role} onChange={setRole} options={CREW_ROLE_OPTIONS} />
              <FilterSelect label="Availability" value={availability} onChange={setAvailability} options={AVAILABILITY_OPTIONS} />

              <label>
                <span className="mb-1 block text-xs font-medium text-gray-500">Max day rate</span>
                <input
                  type="number"
                  min="0"
                  value={maxRate}
                  onChange={(event) => setMaxRate(event.target.value)}
                  placeholder="650"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                />
              </label>

              <label>
                <span className="mb-1 block text-xs font-medium text-gray-500">Min experience</span>
                <input
                  type="number"
                  min="0"
                  value={minExperience}
                  onChange={(event) => setMinExperience(event.target.value)}
                  placeholder="3"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                />
              </label>
            </div>
          </section>

          <section className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">Filtered crew list</p>
                <p className="text-xs text-gray-500">{filteredCrew.length} crew profile{filteredCrew.length === 1 ? '' : 's'} available after removing already-assigned and already-considered crew.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                <FunnelIcon className="h-4 w-4" />
                {selectedIds.size} selected
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {loadingProfiles ? (
                <div className="px-5 py-14 text-center text-sm text-gray-400"><LoadingSpinner /></div>
              ) : filteredCrew.length === 0 ? (
                <div className="px-5 py-14 text-center text-sm text-gray-400">No crew matches these filters.</div>
              ) : (
                filteredCrew.map((crew) => {
                  const isSelected = selectedIds.has(crew.id);

                  return (
                    <div key={crew.id} className={`grid gap-4 px-5 py-4 md:grid-cols-[auto_minmax(0,1fr)_auto] ${isSelected ? 'bg-sky-50/70' : 'bg-white'}`}>
                      <label className="mt-1 flex items-start">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCrew(crew.id)}
                          className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                        />
                      </label>

                      <div className="flex gap-4">
                        {crew.profile_photo_url ? (
                          <img src={crew.profile_photo_url} alt={crew.full_name} className="h-16 w-16 rounded-2xl object-cover" />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-lg font-semibold text-sky-700">
                            {getCrewInitials(crew)}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900">{crew.full_name}</p>
                            <StatusBadge status={crew.availability} />
                          </div>
                          <p className="mt-1 text-sm text-sky-700">{getCrewRoleLabel(crew)}</p>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                            {Number(crew.day_rate || 0) > 0 && <span>${Number(crew.day_rate).toFixed(0)}/day</span>}
                            {crew.years_experience != null && <span>{crew.years_experience} years experience</span>}
                            {crew.next_shoot_date && <span>Next shoot: {crew.next_shoot_date}</span>}
                          </div>
                          {(crew.skills || crew.equipment_owned) && (
                            <p className="mt-2 line-clamp-2 text-xs text-gray-500">
                              {crew.skills || crew.equipment_owned}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => setCalendarCrew(crew)}
                          className="inline-flex items-center gap-2 rounded-full border border-sky-200 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-50"
                        >
                          <CalendarDaysIcon className="h-4 w-4" />
                          Calendar
                        </button>
                        <Link
                          to={`/production/crew/${crew.id}`}
                          className="text-xs font-medium text-gray-500 hover:text-gray-700"
                        >
                          View profile
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-[28px] border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-sky-100/70 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Selection</p>
            <h2 className="mt-2 text-lg font-semibold text-gray-900">Add crew to this project</h2>
            <p className="mt-1 text-sm text-gray-500">Selected crew will appear in the Crew Assignments consideration list back on the project page.</p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-sky-100">
                <p className="text-xs text-gray-500">Selected</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{selectedIds.size}</p>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-sky-100">
                <p className="text-xs text-gray-500">Already on project</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{excludedCrewIds.size}</p>
              </div>
            </div>

            <label className="mt-4 block">
              <span className="mb-1 block text-xs font-medium text-gray-500">Shared notes</span>
              <textarea
                value={sharedNotes}
                onChange={(event) => setSharedNotes(event.target.value)}
                rows={4}
                placeholder="Optional notes saved on each selected crew consideration"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
              />
            </label>

            <button
              onClick={handleBulkAdd}
              disabled={selectedIds.size === 0 || isSaving}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircleIcon className="h-5 w-5" />
              {isSaving ? 'Adding crew…' : `Add ${selectedIds.size || ''} ${selectedIds.size === 1 ? 'crew member' : 'crew members'}`.trim()}
            </button>
          </section>

          <section className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Selected Crew</p>
            {selectedCrew.length === 0 ? (
              <p className="mt-3 text-sm text-gray-400">Choose one or more crew members from the filtered list.</p>
            ) : (
              <div className="mt-3 space-y-3">
                {selectedCrew.map((crew) => (
                  <div key={crew.id} className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 px-3 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{crew.full_name}</p>
                      <p className="text-xs text-gray-500">{getCrewRoleLabel(crew)}</p>
                    </div>
                    <button onClick={() => toggleCrew(crew.id)} className="text-xs font-medium text-gray-400 hover:text-red-500">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>

      {calendarCrew && (
        <CrewAvailabilityCalendarModal
          crew={calendarCrew}
          onClose={() => setCalendarCrew(null)}
          initialYear={today.getFullYear()}
          initialMonth={today.getMonth()}
        />
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label>
      <span className="mb-1 block text-xs font-medium text-gray-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function CrewAvailabilityCalendarModal({ crew, onClose, initialYear, initialMonth }) {
  const [calendarYear, setCalendarYear] = useState(initialYear);
  const [calendarMonth, setCalendarMonth] = useState(initialMonth);

  const { data: availabilityData, isLoading: loadingAvailability } = useCrewAvailability({
    crew: crew.id,
    month: calendarMonth + 1,
    year: calendarYear,
  });
  const { data: assignmentData } = useCrewAssignments({ crew: crew.id, upcoming: true });

  const availabilityEntries = availabilityData?.results || availabilityData || [];
  const assignments = assignmentData?.results || assignmentData || [];

  const availabilityMap = useMemo(() => {
    const map = {};
    availabilityEntries.forEach((entry) => {
      if (entry.period === 'full') {
        map[`${entry.date}:am`] = entry.status;
        map[`${entry.date}:pm`] = entry.status;
      } else {
        map[`${entry.date}:${entry.period}`] = entry.status;
      }
    });
    return map;
  }, [availabilityEntries]);

  const bookedSlots = useMemo(() => {
    const slots = new Set();
    assignments.forEach((assignment) => {
      if (assignment.status === 'accepted' && assignment.shoot_detail?.shoot_date) {
        slots.add(`${assignment.shoot_detail.shoot_date}:am`);
        slots.add(`${assignment.shoot_detail.shoot_date}:pm`);
      }
    });
    return slots;
  }, [assignments]);

  const changeMonth = (delta) => {
    let nextMonth = calendarMonth + delta;
    let nextYear = calendarYear;

    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    }
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }

    setCalendarMonth(nextMonth);
    setCalendarYear(nextYear);
  };

  const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
  const firstDay = getFirstDayOfMonth(calendarYear, calendarMonth);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="w-full max-w-4xl rounded-[32px] bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Crew Availability</p>
            <h2 className="mt-2 text-xl font-semibold text-gray-900">{crew.full_name}</h2>
            <p className="mt-1 text-sm text-gray-500">{getCrewRoleLabel(crew)}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">{MONTH_NAMES[calendarMonth]} {calendarYear}</p>
                <p className="text-xs text-gray-500">Read-only calendar for internal staffing decisions.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => changeMonth(-1)} className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-sky-200 hover:text-sky-700">Prev</button>
                <button onClick={() => changeMonth(1)} className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-sky-200 hover:text-sky-700">Next</button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              {[
                { label: 'Available', color: 'bg-green-100' },
                { label: 'Unavailable', color: 'bg-red-100' },
                { label: 'Tentative', color: 'bg-yellow-100' },
                { label: 'Booked', color: 'bg-sky-100' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-gray-500">
                  <span className={`h-3 w-3 rounded ${item.color}`} />
                  {item.label}
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-7 gap-2 text-center text-[11px] font-medium text-gray-400">
              {DAY_NAMES.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            {loadingAvailability ? (
              <div className="py-10"><LoadingSpinner /></div>
            ) : (
              <div className="mt-2 grid grid-cols-7 gap-2">
                {Array.from({ length: firstDay }).map((_, index) => <div key={`empty-${index}`} />)}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1;
                  const date = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                  return (
                    <div key={date} className="min-h-[84px] rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
                      <div className="text-xs font-semibold text-gray-500">{day}</div>
                      <div className="mt-2 space-y-1">
                        {['am', 'pm'].map((period) => {
                          const key = `${date}:${period}`;
                          const isBooked = bookedSlots.has(key);
                          const status = availabilityMap[key];

                          let classes = 'bg-gray-100 text-gray-400';
                          let label = period.toUpperCase();

                          if (isBooked) {
                            classes = 'bg-sky-100 text-sky-700';
                            label = `${period.toUpperCase()} Booked`;
                          } else if (status === 'available') {
                            classes = 'bg-green-100 text-green-700';
                          } else if (status === 'unavailable') {
                            classes = 'bg-red-100 text-red-700';
                          } else if (status === 'tentative') {
                            classes = 'bg-yellow-100 text-yellow-700';
                          }

                          return (
                            <div key={key} className={`rounded-lg px-2 py-1 text-[10px] font-medium ${classes}`}>
                              {label}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="space-y-4 rounded-[28px] border border-gray-200 bg-gray-50 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Snapshot</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">{crew.full_name}</p>
              <p className="mt-1 text-sm text-gray-500">{crew.user?.email || 'No email on file'}</p>
            </div>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="rounded-2xl bg-white px-4 py-3">
                <p className="text-xs text-gray-500">General availability</p>
                <p className="mt-1 font-medium text-gray-900">{crew.availability}</p>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3">
                <p className="text-xs text-gray-500">Day rate</p>
                <p className="mt-1 font-medium text-gray-900">${Number(crew.day_rate || 0).toFixed(0)}/day</p>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3">
                <p className="text-xs text-gray-500">Upcoming accepted assignments</p>
                <p className="mt-1 font-medium text-gray-900">{assignments.filter((assignment) => assignment.status === 'accepted').length}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
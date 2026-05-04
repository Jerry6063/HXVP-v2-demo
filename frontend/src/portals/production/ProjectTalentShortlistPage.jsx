import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowDownTrayIcon, ArrowLeftIcon, CheckCircleIcon, FunnelIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

import {
  useProject,
  useTalentProfiles,
  useTalentConsiderations,
  useTalentRosterShares,
  useSendTalentRoster,
} from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';

const TALENT_TYPE_OPTIONS = [
  { value: '', label: 'All talent types' },
  { value: 'model', label: 'Models' },
  { value: 'actor', label: 'Actors' },
  { value: 'voiceover', label: 'Voiceover' },
  { value: 'dancer', label: 'Dancers' },
  { value: 'livestream', label: 'Livestream Hosts' },
  { value: 'other', label: 'Other' },
];

const GENDER_OPTIONS = [
  { value: '', label: 'All genders' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const AVAILABILITY_OPTIONS = [
  { value: '', label: 'Any status' },
  { value: 'available', label: 'Available' },
  { value: 'booked', label: 'Booked' },
  { value: 'unavailable', label: 'Unavailable' },
];

const DEFAULT_PAGE_SIZE = 20;

export default function ProjectTalentShortlistPage() {
  const { id } = useParams();
  const projectId = Number(id);
  const { data: project, isLoading: loadingProject } = useProject(projectId);
  const { data: talentConsData } = useTalentConsiderations({ project: projectId });
  const { data: rosterSharesData } = useTalentRosterShares({ project: projectId });
  const sendRoster = useSendTalentRoster();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [talentType, setTalentType] = useState('');
  const [gender, setGender] = useState('');
  const [availability, setAvailability] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState('');

  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    if (!project) return;
    setDateFrom((current) => current || project.start_date || '');
    setDateTo((current) => current || project.deadline || project.start_date || '');
  }, [project]);

  useEffect(() => {
    setPage(1);
  }, [deferredSearch, talentType, gender, availability, minAge, maxAge, maxRate, dateFrom, dateTo]);

  const talentParams = useMemo(() => ({
    page,
    approved_only: 'true',
    ...(deferredSearch && { search: deferredSearch }),
    ...(talentType && { talent_type: talentType }),
    ...(gender && { gender }),
    ...(availability && { availability }),
    ...(minAge && { min_age: minAge }),
    ...(maxAge && { max_age: maxAge }),
    ...(maxRate && { max_rate: maxRate }),
    ...(dateFrom && { date_from: dateFrom }),
    ...(dateTo && { date_to: dateTo }),
  }), [availability, dateFrom, dateTo, deferredSearch, gender, maxAge, maxRate, minAge, page, talentType]);

  const { data: talentProfilesData, isLoading: loadingProfiles } = useTalentProfiles(talentParams);

  const paginatedProfiles = talentProfilesData?.results ? talentProfilesData : null;
  const talents = paginatedProfiles?.results || talentProfilesData || [];
  const totalCount = paginatedProfiles?.count ?? talents.length;
  const pageSize = paginatedProfiles ? DEFAULT_PAGE_SIZE : talents.length || 1;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const talentCons = talentConsData?.results || talentConsData || [];
  const shortlistShares = rosterSharesData?.results || rosterSharesData || [];
  const latestShare = shortlistShares[0] || null;

  const considerationIds = useMemo(
    () => new Set(talentCons.map((item) => item.talent)),
    [talentCons]
  );

  const allPageSelected = talents.length > 0 && talents.every((talent) => selectedIds.has(talent.id));
  const selectedCount = selectedIds.size;

  const toggleTalent = (talentId) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(talentId)) {
        next.delete(talentId);
      } else {
        next.add(talentId);
      }
      return next;
    });
  };

  const toggleCurrentPage = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allPageSelected) {
        talents.forEach((talent) => next.delete(talent.id));
      } else {
        talents.forEach((talent) => next.add(talent.id));
      }
      return next;
    });
  };

  const resetFilters = () => {
    setSearch('');
    setTalentType('');
    setGender('');
    setAvailability('');
    setMinAge('');
    setMaxAge('');
    setMaxRate('');
    setDateFrom(project?.start_date || '');
    setDateTo(project?.deadline || project?.start_date || '');
  };

  const handleConfirmSend = async () => {
    try {
      const result = await sendRoster.mutateAsync({
        project: projectId,
        talent_ids: [...selectedIds],
        message,
      });
      if (result.email_sent === false) {
        toast.warning('Shortlist saved and PDF generated, but the client email could not be delivered.');
      } else {
        toast.success('Talent shortlist sent. The PDF is now saved on the project.');
      }
      setSelectedIds(new Set());
      setMessage('');
      setShowConfirm(false);
    } catch (error) {
      const detail = error.response?.data?.detail;
      const firstFieldError = Object.values(error.response?.data || {}).find((value) => typeof value === 'string');
      toast.error(detail || firstFieldError || 'Unable to send this shortlist right now.');
    }
  };

  if (loadingProject) {
    return <div className="py-16 text-center text-sm text-gray-400">Loading shortlist workspace…</div>;
  }

  if (!project) {
    return <div className="py-16 text-center text-sm text-gray-400">Project not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link to={`/production/projects/${projectId}?section=team-talent`} className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to project
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold text-gray-950">Talent Shortlist Builder</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="mt-2 max-w-3xl text-sm text-gray-500">
            Filter the roster, select the talents you want the client to review, and confirm the send to generate a PDF with profiles and photos.
          </p>
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 px-4 py-3 text-sm text-indigo-900 shadow-sm">
          <p className="font-semibold">{project.client_name || project.client_detail?.first_name || 'Client pending'}</p>
          <p className="mt-1 text-xs text-indigo-700/80">
            {project.start_date || 'TBD'} {project.deadline ? `to ${project.deadline}` : ''}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <section className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600">Filters</p>
                <h2 className="mt-1 text-lg font-semibold text-gray-900">Shape the client-facing shortlist</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button onClick={toggleCurrentPage} className="rounded-full border border-gray-200 px-3 py-1.5 font-medium text-gray-700 hover:border-indigo-200 hover:text-indigo-700">
                  {allPageSelected ? 'Clear page' : 'Select page'}
                </button>
                <button onClick={() => setSelectedIds(new Set())} className="rounded-full border border-gray-200 px-3 py-1.5 font-medium text-gray-700 hover:border-indigo-200 hover:text-indigo-700">
                  Clear all
                </button>
                <button onClick={resetFilters} className="rounded-full border border-gray-200 px-3 py-1.5 font-medium text-gray-700 hover:border-indigo-200 hover:text-indigo-700">
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
                  placeholder="Search by name or email"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                />
              </label>

              <FilterSelect label="Talent type" value={talentType} onChange={setTalentType} options={TALENT_TYPE_OPTIONS} />
              <FilterSelect label="Gender" value={gender} onChange={setGender} options={GENDER_OPTIONS} />
              <FilterSelect label="General availability" value={availability} onChange={setAvailability} options={AVAILABILITY_OPTIONS} />
              <NumberFilter label="Min age" value={minAge} onChange={setMinAge} placeholder="18" />
              <NumberFilter label="Max age" value={maxAge} onChange={setMaxAge} placeholder="35" />
              <NumberFilter label="Max rate" value={maxRate} onChange={setMaxRate} placeholder="75" prefix="$" />

              <label>
                <span className="mb-1 block text-xs font-medium text-gray-500">Window start</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                />
              </label>

              <label>
                <span className="mb-1 block text-xs font-medium text-gray-500">Window end</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                />
              </label>
            </div>
          </section>

          <section className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">Filtered talent list</p>
                <p className="text-xs text-gray-500">{totalCount} approved talent profile{totalCount === 1 ? '' : 's'} match the current filters.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                <FunnelIcon className="h-4 w-4" />
                {selectedCount} selected
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {loadingProfiles ? (
                <div className="px-5 py-14 text-center text-sm text-gray-400">Loading filtered talent list…</div>
              ) : talents.length === 0 ? (
                <div className="px-5 py-14 text-center text-sm text-gray-400">No approved talent matches these filters.</div>
              ) : (
                talents.map((talent) => {
                  const checked = selectedIds.has(talent.id);
                  const alreadyTracked = considerationIds.has(talent.id);
                  return (
                    <label
                      key={talent.id}
                      className={`grid cursor-pointer gap-4 px-5 py-4 transition md:grid-cols-[auto_72px_minmax(0,1fr)_auto] ${checked ? 'bg-indigo-50/70' : 'hover:bg-gray-50'}`}
                    >
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleTalent(talent.id)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </div>

                      {talent.primary_photo ? (
                        <img src={talent.primary_photo} alt={talent.full_name} className="h-[88px] w-[72px] rounded-2xl object-cover shadow-sm" />
                      ) : (
                        <div className="flex h-[88px] w-[72px] items-center justify-center rounded-2xl bg-indigo-100 text-lg font-semibold text-indigo-600">
                          {(talent.full_name || '?').slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">{talent.full_name}</p>
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600 capitalize">
                            {(talent.talent_type || '').replace(/_/g, ' ')}
                          </span>
                          {alreadyTracked && (
                            <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-medium text-indigo-700">
                              Already under consideration
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-xs text-gray-500">
                          {[talent.age ? `${talent.age} years` : null, talent.gender ? talent.gender.replace(/_/g, ' ') : null, talent.availability ? talent.availability.replace(/_/g, ' ') : null, talent.hourly_rate ? `$${talent.hourly_rate}/hr` : null]
                            .filter(Boolean)
                            .join(' • ')}
                        </p>

                        {talent.bio && (
                          <p className="mt-2 line-clamp-2 text-sm text-gray-600">{talent.bio}</p>
                        )}

                        {talent.specializations && (
                          <p className="mt-2 text-xs text-gray-500">
                            <span className="font-medium text-gray-700">Specializations:</span> {talent.specializations}
                          </p>
                        )}
                      </div>

                      <div className="flex items-start justify-end">
                        {checked ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white">
                            <CheckCircleIcon className="h-4 w-4" /> Selected
                          </span>
                        ) : null}
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:border-indigo-200 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((current) => current + 1)}
                  disabled={!paginatedProfiles?.next}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:border-indigo-200 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-[28px] border border-indigo-100 bg-gradient-to-br from-indigo-600 via-indigo-500 to-sky-500 p-5 text-white shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-100">Selection</p>
                <h2 className="mt-2 text-2xl font-semibold">{selectedCount}</h2>
                <p className="mt-1 text-sm text-indigo-100">talent ready to send to the client</p>
              </div>
              <SparklesIcon className="h-9 w-9 text-indigo-100" />
            </div>

            <button
              onClick={() => setShowConfirm(true)}
              disabled={selectedCount === 0 || sendRoster.isPending || !project.client}
              className="mt-5 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sendRoster.isPending ? 'Sending shortlist…' : 'Confirm and send to client'}
            </button>

            {!project.client && (
              <p className="mt-3 text-xs text-indigo-100">Assign a client to this project before sending a shortlist.</p>
            )}
          </section>

          <section className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">Production context</h3>
            <dl className="mt-4 space-y-3 text-sm text-gray-600">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Client</dt>
                <dd className="mt-1">{project.client_name || project.client_detail?.first_name || 'Unassigned'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Window</dt>
                <dd className="mt-1">{project.start_date || 'TBD'} {project.deadline ? `to ${project.deadline}` : ''}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Tracked talent</dt>
                <dd className="mt-1">{talentCons.length}</dd>
              </div>
            </dl>

            {project.talent_requirements?.length > 0 && (
              <div className="mt-5 rounded-2xl bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Talent requirements</p>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  {project.talent_requirements.map((requirement) => (
                    <li key={requirement.id} className="flex items-start justify-between gap-3">
                      <span className="capitalize">{(requirement.talent_type || '').replace(/_/g, ' ')}</span>
                      <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-gray-500">x{requirement.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Latest client shortlist</h3>
                <p className="mt-1 text-xs text-gray-500">The most recent package saved on this project.</p>
              </div>
              {latestShare?.pdf_url && (
                <a href={latestShare.pdf_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:border-indigo-200 hover:text-indigo-700">
                  <ArrowDownTrayIcon className="h-4 w-4" /> PDF
                </a>
              )}
            </div>

            {!latestShare ? (
              <p className="mt-4 text-sm text-gray-400">Nothing has been sent to the client for this project yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
                  <p className="font-medium text-gray-900">{latestShare.talent_details?.length || 0} talent included</p>
                  <p className="mt-1 text-xs text-gray-500">{latestShare.shared_at ? new Date(latestShare.shared_at).toLocaleString() : 'Recently sent'}</p>
                </div>
                <div className="space-y-2">
                  {(latestShare.talent_details || []).slice(0, 4).map((talent) => (
                    <div key={talent.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 px-3 py-2">
                      {talent.primary_photo ? (
                        <img src={talent.primary_photo} alt={talent.full_name} className="h-10 w-10 rounded-xl object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-xs font-semibold text-indigo-600">
                          {talent.full_name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">{talent.full_name}</p>
                        <p className="text-xs text-gray-500 capitalize">{(talent.talent_type || '').replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </aside>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[28px] bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-gray-900">Send shortlist to client?</h2>
            <p className="mt-2 text-sm text-gray-500">
              This will save a PDF on the project and notify {project.client_name || 'the client'} that the shortlist is ready for review.
            </p>

            <div className="mt-4 rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-900">
              <p className="font-semibold">{selectedCount} selected talent</p>
              <p className="mt-1 text-xs text-indigo-700">Already tracked project candidates will stay in sync, and any new selections will be added to consideration automatically.</p>
            </div>

            <label className="mt-5 block">
              <span className="mb-1 block text-xs font-medium text-gray-500">Message to client</span>
              <textarea
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Optional context for the client about this shortlist..."
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
              />
            </label>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSend}
                disabled={sendRoster.isPending}
                className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sendRoster.isPending ? 'Generating PDF…' : 'Confirm and send'}
              </button>
            </div>
          </div>
        </div>
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
        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
      >
        {options.map((option) => (
          <option key={option.value || option.label} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function NumberFilter({ label, value, onChange, placeholder, prefix }) {
  return (
    <label>
      <span className="mb-1 block text-xs font-medium text-gray-500">{label}</span>
      <div className="relative">
        {prefix ? <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">{prefix}</span> : null}
        <input
          type="number"
          min="0"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-2xl border border-gray-200 py-3 text-sm text-gray-900 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 ${prefix ? 'pl-8 pr-4' : 'px-4'}`}
        />
      </div>
    </label>
  );
}
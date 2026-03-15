import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useTalentProfile,
  useTalentAvailability,
  useApproveTalentProfile,
  useRejectTalentProfile,
  useBookings,
  useProjects,
  useTalentConsiderations,
  useAddTalentConsideration,
  useRemoveTalentConsideration,
} from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';
import PhotoLightbox from '../../components/PhotoLightbox';
import EvaluationPanel from '../../components/EvaluationPanel';
import {
  ArrowLeftIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  GlobeAltIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_NAMES = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const STATUS_COLORS = {
  available: 'bg-green-100 text-green-800',
  unavailable: 'bg-red-100 text-red-800',
  tentative: 'bg-yellow-100 text-yellow-800',
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

export default function TalentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [assignProjectId, setAssignProjectId] = useState('');

  const { data: activeProjects } = useProjects({ status: 'active' });
  const { data: talentConsData } = useTalentConsiderations({ talent: id });
  const addTalentCon = useAddTalentConsideration();
  const removeTalentCon = useRemoveTalentConsideration();

  const activeProjectsArr = activeProjects?.results || activeProjects || [];
  const talentCons = talentConsData?.results || talentConsData || [];

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const { data: profile, isLoading } = useTalentProfile(id);
  const { data: availData } = useTalentAvailability({
    talent: id,
    month: calMonth + 1,
    year: calYear,
  });
  const { data: bookingsData } = useBookings({ talent: id });
  const approveProfile = useApproveTalentProfile();
  const rejectProfile = useRejectTalentProfile();

  const availEntries = availData?.results || availData || [];
  const bookings = bookingsData?.results || bookingsData || [];

  const availMap = useMemo(() => {
    const map = {};
    availEntries.forEach((e) => {
      if (e.period === 'full') {
        map[`${e.date}:am`] = e.status;
        map[`${e.date}:pm`] = e.status;
      } else {
        map[`${e.date}:${e.period}`] = e.status;
      }
    });
    return map;
  }, [availEntries]);

  const bookingSlots = useMemo(() => {
    const set = new Set();
    bookings.forEach((b) => {
      if (b.shoot_detail?.shoot_date && b.status === 'accepted') {
        const d = b.shoot_detail.shoot_date;
        const ct = b.shoot_detail.call_time;
        const wt = b.shoot_detail.est_wrap_time;
        if (!ct || ct < '12:00') {
          set.add(`${d}:am`);
          if (!wt || wt > '12:00') set.add(`${d}:pm`);
        } else {
          set.add(`${d}:pm`);
        }
      }
    });
    return set;
  }, [bookings]);

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const photos = profile?.photos || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Loading…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16 text-gray-400">
        Talent profile not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Back button */}
      <button
        onClick={() => navigate('/production/talent')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Talents
      </button>

      {/* Hero */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-0">
          {/* Primary photo */}
          <div className="sm:w-64 flex-shrink-0">
            {profile.primary_photo ? (
              <img
                src={profile.primary_photo}
                alt={profile.full_name}
                className="w-full h-64 sm:h-full object-cover cursor-pointer"
                onClick={() => setLightboxIndex(0)}
              />
            ) : (
              <div className="w-full h-64 bg-indigo-50 flex items-center justify-center">
                <UserIcon className="w-20 h-20 text-indigo-200" />
              </div>
            )}
          </div>

          {/* Bio hero info */}
          <div className="p-6 flex flex-col justify-center gap-4 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
              <StatusBadge status={profile.approval_status} />
              <StatusBadge status={profile.availability} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InfoPill label="Type" value={profile.talent_type} />
              <InfoPill label="Rate" value={`$${Number(profile.hourly_rate).toFixed(0)}/hr`} />
              {profile.age && <InfoPill label="Age" value={profile.age} />}
              {profile.height && <InfoPill label="Height" value={profile.height} />}
              {profile.skin_tone && <InfoPill label="Skin Tone" value={profile.skin_tone.replace(/_/g, ' ')} />}
              {profile.race_ethnicity && <InfoPill label="Race / Ethnicity" value={profile.race_ethnicity.replace(/_/g, ' ')} />}
              {profile.gender && <InfoPill label="Gender" value={profile.gender.replace(/_/g, ' ')} />}
              {profile.performance_capability && (
                <InfoPill label="Capability" value={profile.performance_capability.replace(/_/g, ' ')} />
              )}
            </div>

            {profile.portfolio_url && (
              <a
                href={profile.portfolio_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline"
              >
                <GlobeAltIcon className="w-4 h-4" />
                Portfolio
              </a>
            )}
            {/* Contact info */}
            <div className="flex flex-wrap gap-4 text-sm">
              {profile.user?.email && (
                <a href={`mailto:${profile.user.email}`} className="flex items-center gap-1.5 text-gray-600 hover:text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
                  {profile.user.email}
                </a>
              )}
              {profile.user?.phone && (
                <a href={`tel:${profile.user.phone}`} className="flex items-center gap-1.5 text-gray-600 hover:text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 6.75Z" /></svg>
                  {profile.user.phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column – pics / bio / specs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo gallery */}
          {photos.length > 1 && (
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-3">Photos</h2>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {photos.map((photo, idx) => (
                  <img
                    key={photo.id}
                    src={photo.image_url || photo.image}
                    alt={photo.caption}
                    className="h-36 w-auto rounded-xl object-cover border border-gray-100 flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setLightboxIndex(idx)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Bio */}
          {(profile.bio || profile.specializations) && (
            <div className="bg-white rounded-2xl shadow p-6 space-y-4">
              {profile.bio && (
                <div>
                  <h2 className="text-base font-semibold text-gray-800 mb-1">Bio</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
                </div>
              )}
              {profile.specializations && (
                <div>
                  <h2 className="text-base font-semibold text-gray-800 mb-1">Specializations</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{profile.specializations}</p>
                </div>
              )}
            </div>
          )}

          {/* Availability calendar (read-only) */}
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <CalendarDaysIcon className="w-5 h-5 text-indigo-500" />
                Availability – {MONTH_NAMES[calMonth]} {calYear}
              </h2>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
                    else setCalMonth(calMonth - 1);
                  }}
                  className="px-2 py-1 text-xs rounded hover:bg-gray-100 text-gray-500"
                >← Prev</button>
                <button
                  onClick={() => {
                    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
                    else setCalMonth(calMonth + 1);
                  }}
                  className="px-2 py-1 text-xs rounded hover:bg-gray-100 text-gray-500"
                >Next →</button>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-xs mb-4">
              {[
                { color: 'bg-green-100', label: 'Available' },
                { color: 'bg-red-100', label: 'Unavailable' },
                { color: 'bg-yellow-100', label: 'Tentative' },
                { color: 'bg-blue-100', label: 'Booked' },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded ${l.color}`} />
                  <span className="text-gray-500">{l.label}</span>
                </div>
              ))}
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAY_NAMES.map((d) => (
                <div key={d} className="text-center text-[10px] font-medium text-gray-400 py-1">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isToday = dateStr === todayStr;

                return (
                  <div
                    key={day}
                    className={`relative rounded-lg border overflow-hidden ${isToday ? 'ring-2 ring-indigo-400 border-indigo-300' : 'border-gray-200'}`}
                    style={{ minHeight: '62px' }}
                  >
                    <div className="absolute top-0.5 left-1.5 z-10">
                      <span className={`text-[10px] font-bold ${isToday ? 'text-indigo-700' : 'text-gray-400'}`}>{day}</span>
                    </div>
                    <div className="flex flex-col h-full pt-4">
                      {['am', 'pm'].map((period) => {
                        const slotKey = `${dateStr}:${period}`;
                        const isBooked = bookingSlots.has(slotKey);
                        const status = availMap[slotKey];
                        let bg = 'bg-gray-50';
                        if (isBooked) bg = 'bg-blue-100';
                        else if (status) bg = STATUS_COLORS[status] || bg;
                        return (
                          <div
                            key={period}
                            className={`flex-1 flex items-center justify-center ${period === 'am' ? 'border-b border-white/40' : ''} ${bg}`}
                          >
                            <span className={`text-[8px] font-semibold uppercase ${period === 'am' ? 'text-sky-600' : 'text-orange-500'}`}>
                              {period}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Internal Evaluations */}
          <EvaluationPanel
            subjectType="talent"
            subjectUserId={profile.user?.id}
            accentColor="indigo"
          />
        </div>

        {/* Right column – admin actions */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow p-5 space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-800">Admin Actions</h2>
              <StatusBadge status={profile.approval_status} />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Notes / feedback (optional)</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                placeholder="Reason for rejection, or any notes…"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none resize-none"
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => approveProfile.mutate({ id: profile.id, admin_notes: adminNotes })}
                disabled={approveProfile.isPending || profile.approval_status === 'approved'}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-40 transition-colors"
              >
                <CheckCircleIcon className="w-4 h-4" />
                {approveProfile.isPending ? 'Approving…' : profile.approval_status === 'approved' ? 'Already Approved' : 'Approve Profile'}
              </button>
              <button
                onClick={() => rejectProfile.mutate({ id: profile.id, admin_notes: adminNotes })}
                disabled={rejectProfile.isPending || profile.approval_status === 'rejected'}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-100 disabled:opacity-40 transition-colors"
              >
                <XCircleIcon className="w-4 h-4" />
                {rejectProfile.isPending ? 'Rejecting…' : 'Reject Profile'}
              </button>
            </div>

            {profile.admin_notes && (
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-400 mb-1">Previous admin notes</p>
                <p className="text-sm text-gray-600">{profile.admin_notes}</p>
              </div>
            )}
          </div>

          {/* Project Assignment */}
          <div className="bg-white rounded-2xl shadow p-5 space-y-3">
            <h2 className="text-base font-semibold text-gray-800">Project Assignment</h2>
            <p className="text-xs text-gray-400">Add this talent as a potential candidate for a production.</p>
            <div className="flex gap-2">
              <select
                value={assignProjectId}
                onChange={(e) => setAssignProjectId(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
              >
                <option value="">Select production…</option>
                {activeProjectsArr.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <button
                disabled={!assignProjectId || addTalentCon.isPending}
                onClick={async () => {
                  await addTalentCon.mutateAsync({ project: parseInt(assignProjectId), talent: profile.id });
                  setAssignProjectId('');
                }}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40"
              >
                {addTalentCon.isPending ? '…' : 'Add'}
              </button>
            </div>
            {talentCons.length > 0 && (
              <ul className="divide-y divide-gray-50 mt-1">
                {talentCons.map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-700">{c.project_name}</span>
                    <button
                      onClick={() => removeTalentCon.mutate(c.id)}
                      className="text-xs text-gray-400 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {talentCons.length === 0 && (
              <p className="text-xs text-gray-400 italic">Not assigned to any production yet.</p>
            )}
          </div>

          {/* Quick stats */}
          <div className="bg-white rounded-2xl shadow p-5">
            <h2 className="text-base font-semibold text-gray-800 mb-3">Quick Stats</h2>
            <div className="space-y-2.5">
              <StatRow label="Photos uploaded" value={photos.length} />
              <StatRow label="Measurements" value={profile.measurements || '—'} />
              <StatRow label="Bookings" value={bookings.length} />
              <StatRow label="Submitted" value={profile.profile_submitted_at
                ? new Date(profile.profile_submitted_at).toLocaleDateString()
                : '—'} />
              <StatRow label="Approved" value={profile.approved_at
                ? new Date(profile.approved_at).toLocaleDateString()
                : '—'} />
            </div>
          </div>

          {/* Past productions */}
          {(() => {
            const today = new Date().toISOString().slice(0, 10);
            const seen = new Set();
            const pastProductions = bookings
              .filter(b => b.status === 'accepted' && b.shoot_detail?.shoot_date && b.shoot_detail.shoot_date < today)
              .sort((a, b) => b.shoot_detail.shoot_date.localeCompare(a.shoot_detail.shoot_date))
              .reduce((acc, b) => {
                const name = b.shoot_detail.project_name || 'Untitled';
                if (!seen.has(name)) {
                  seen.add(name);
                  acc.push({ name, date: b.shoot_detail.shoot_date });
                }
                return acc;
              }, []);
            if (pastProductions.length === 0) return null;
            return (
              <div className="bg-white rounded-2xl shadow p-5">
                <h2 className="text-base font-semibold text-gray-800 mb-3">Past Productions</h2>
                <ul className="space-y-2">
                  {pastProductions.map((p) => (
                    <li key={p.name} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 font-medium truncate mr-2">{p.name}</span>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(p.date).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          src={photos[lightboxIndex]?.image_url || photos[lightboxIndex]?.image}
          alt={photos[lightboxIndex]?.caption || profile.full_name}
          onClose={() => setLightboxIndex(null)}
          onPrev={photos.length > 1 ? () => setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length) : undefined}
          onNext={photos.length > 1 ? () => setLightboxIndex((lightboxIndex + 1) % photos.length) : undefined}
        />
      )}
    </div>
  );
}

function InfoPill({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2">
      <p className="text-[10px] uppercase font-medium text-gray-400 tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-gray-800 capitalize mt-0.5">{value}</p>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-700">{value}</span>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useCrewProfile,
  useCrewAvailability,
  useCrewAssignments,
} from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EvaluationPanel from '../../components/EvaluationPanel';
import {
  ArrowLeftIcon,
  UserIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  PhoneIcon,
  EnvelopeIcon,
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

export default function CrewDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const { data: profile, isLoading } = useCrewProfile(id);
  const { data: availData } = useCrewAvailability({
    crew: id,
    month: calMonth + 1,
    year: calYear,
  });
  const { data: pastData } = useCrewAssignments({ crew: id, past: true });
  const { data: upcomingData } = useCrewAssignments({ crew: id, upcoming: true });

  const availEntries = availData?.results || availData || [];
  const pastAssignments = (pastData?.results || pastData || []).slice(0, 20);
  const upcomingAssignments = (upcomingData?.results || upcomingData || []).slice(0, 10);

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

  // Mark upcoming accepted assignments as booked on calendar
  const bookedSlots = useMemo(() => {
    const set = new Set();
    upcomingAssignments.forEach((a) => {
      if (a.status === 'accepted' && a.shoot_detail?.shoot_date) {
        const d = a.shoot_detail.shoot_date;
        set.add(`${d}:am`);
        set.add(`${d}:pm`);
      }
    });
    return set;
  }, [upcomingAssignments]);

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  if (isLoading) return <div className="flex items-center justify-center h-64"><LoadingSpinner /></div>;
  if (!profile) return <div className="text-center py-16 text-gray-400">Crew profile not found.</div>;

  const roleLabel = profile.crew_role_display || profile.crew_role?.replace(/_/g, ' ');

  return (
    <div className="space-y-6 pb-12">
      {/* Back */}
      <button
        onClick={() => navigate('/production/crew')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Production Crew
      </button>

      {/* Hero */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-0">
          {/* Photo */}
          <div className="sm:w-56 flex-shrink-0 bg-sky-50 flex items-center justify-center">
            {profile.profile_photo_url ? (
              <img
                src={profile.profile_photo_url}
                alt={profile.full_name}
                className="w-full h-56 sm:h-full object-cover"
              />
            ) : (
              <div className="w-full h-56 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 text-4xl font-bold">
                  {profile.user?.first_name?.[0]}{profile.user?.last_name?.[0]}
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-6 flex flex-col justify-center gap-4 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
              <StatusBadge status={profile.availability} />
            </div>

            <p className="text-sky-600 font-semibold capitalize text-sm">{roleLabel}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <InfoPill
                icon={<CurrencyDollarIcon className="w-4 h-4" />}
                label="Hourly Rate"
                value={`$${Number(profile.hourly_rate).toFixed(0)}/hr`}
              />
              <InfoPill
                icon={<CurrencyDollarIcon className="w-4 h-4" />}
                label="Day Rate"
                value={`$${Number(profile.day_rate).toFixed(0)}/day`}
              />
              {profile.years_experience != null && (
                <InfoPill
                  icon={<ClipboardDocumentListIcon className="w-4 h-4" />}
                  label="Experience"
                  value={`${profile.years_experience} yr${profile.years_experience !== 1 ? 's' : ''}`}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio / Skills / Equipment */}
          {(profile.bio || profile.skills || profile.equipment_owned) && (
            <div className="bg-white rounded-2xl shadow p-6 space-y-5">
              {profile.bio && (
                <div>
                  <h2 className="text-base font-semibold text-gray-800 mb-1">Bio</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
                </div>
              )}
              {profile.skills && (
                <div>
                  <h2 className="text-base font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                    <WrenchScrewdriverIcon className="w-4 h-4 text-sky-500" />
                    Skills &amp; Specializations
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{profile.skills}</p>
                </div>
              )}
              {profile.equipment_owned && (
                <div>
                  <h2 className="text-base font-semibold text-gray-800 mb-1">Equipment Owned</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{profile.equipment_owned}</p>
                </div>
              )}
            </div>
          )}

          {/* Availability calendar */}
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <CalendarDaysIcon className="w-5 h-5 text-sky-500" />
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
                    className={`relative rounded-lg border overflow-hidden ${
                      isToday ? 'ring-2 ring-sky-400 border-sky-300' : 'border-gray-200'
                    }`}
                    style={{ minHeight: '62px' }}
                  >
                    <div className="absolute top-0.5 left-1.5 z-10">
                      <span className={`text-[10px] font-bold ${isToday ? 'text-sky-700' : 'text-gray-400'}`}>{day}</span>
                    </div>
                    <div className="flex flex-col h-full pt-4">
                      {['am', 'pm'].map((period) => {
                        const slotKey = `${dateStr}:${period}`;
                        const isBooked = bookedSlots.has(slotKey);
                        const status = availMap[slotKey];
                        let bg = 'bg-gray-50';
                        if (isBooked) bg = 'bg-blue-100';
                        else if (status) bg = STATUS_COLORS[status] || bg;
                        return (
                          <div
                            key={period}
                            className={`flex-1 flex items-center justify-center ${
                              period === 'am' ? 'border-b border-white/40' : ''
                            } ${bg}`}
                          >
                            <span className={`text-[8px] font-semibold uppercase ${
                              period === 'am' ? 'text-sky-600' : 'text-orange-500'
                            }`}>
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

          {/* Past Works / Past Assignments */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ClipboardDocumentListIcon className="w-5 h-5 text-sky-500" />
              Past Works
            </h2>
            {pastAssignments.length === 0 ? (
              <p className="text-sm text-gray-400">No past assignments recorded.</p>
            ) : (
              <div className="space-y-2">
                {pastAssignments.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {a.shoot_detail?.location || 'Shoot'}
                        {a.project_name && (
                          <span className="ml-2 text-xs text-indigo-500 font-normal">· {a.project_name}</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {a.shoot_detail?.shoot_date}
                        {a.shoot_detail?.call_time && ` · ${a.shoot_detail.call_time}`}
                        {a.role_on_shoot && (
                          <span className="ml-1 capitalize">· {a.role_on_shoot.replace(/_/g, ' ')}</span>
                        )}
                      </p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Internal Evaluations */}
          <EvaluationPanel
            subjectType="crew"
            subjectUserId={profile.user?.id}
            accentColor="sky"
          />
        </div>

        {/* Right column – contact + upcoming */}
        <div className="space-y-5">
          {/* Contact info */}
          <div className="bg-white rounded-2xl shadow p-5 space-y-3">
            <h2 className="text-base font-semibold text-gray-800">Contact</h2>
            {profile.user?.email && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <EnvelopeIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <a href={`mailto:${profile.user.email}`} className="hover:text-sky-600 truncate">
                  {profile.user.email}
                </a>
              </div>
            )}
            {profile.user?.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <PhoneIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <a href={`tel:${profile.user.phone}`} className="hover:text-sky-600">
                  {profile.user.phone}
                </a>
              </div>
            )}
            {!profile.user?.email && !profile.user?.phone && (
              <p className="text-xs text-gray-400">No contact info on file.</p>
            )}
          </div>

          {/* Quick stats */}
          <div className="bg-white rounded-2xl shadow p-5">
            <h2 className="text-base font-semibold text-gray-800 mb-3">Quick Stats</h2>
            <div className="space-y-2.5">
              <StatRow label="Role" value={roleLabel} />
              <StatRow
                label="Experience"
                value={profile.years_experience != null ? `${profile.years_experience} yrs` : '—'}
              />
              <StatRow label="Hourly rate" value={`$${Number(profile.hourly_rate).toFixed(0)}/hr`} />
              <StatRow label="Day rate" value={`$${Number(profile.day_rate).toFixed(0)}/day`} />
              <StatRow label="Past shoots" value={pastAssignments.length} />
              <StatRow label="Upcoming shoots" value={upcomingAssignments.length} />
            </div>
          </div>

          {/* Upcoming assignments */}
          {upcomingAssignments.length > 0 && (
            <div className="bg-white rounded-2xl shadow p-5">
              <h2 className="text-base font-semibold text-gray-800 mb-3">Upcoming Shoots</h2>
              <div className="space-y-2.5">
                {upcomingAssignments.map((a) => (
                  <div key={a.id} className="border-l-2 border-sky-300 pl-3">
                    <p className="text-sm font-medium text-gray-900">
                      {a.shoot_detail?.location || 'Shoot'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {a.shoot_detail?.shoot_date}
                      {a.shoot_detail?.call_time && ` · ${a.shoot_detail.call_time}`}
                    </p>
                    {a.project_name && (
                      <p className="text-xs text-indigo-500 mt-0.5">{a.project_name}</p>
                    )}
                    <div className="mt-1">
                      <StatusBadge status={a.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoPill({ icon, label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2 flex items-start gap-2">
      <div className="text-sky-400 mt-0.5 flex-shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] uppercase font-medium text-gray-400 tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-700 capitalize">{value}</span>
    </div>
  );
}

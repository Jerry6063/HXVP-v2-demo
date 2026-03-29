import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  useTalentProfiles,
  useTalentAvailability,
  useBookings,
  useUsers,
  useSendTalentRoster,
  useProjects,
} from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';
import {
  UserIcon,
  CalendarDaysIcon,
  UsersIcon,
  PaperAirplaneIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const TALENT_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'model', label: 'Model' },
  { value: 'actor', label: 'Actor' },
  { value: 'voiceover', label: 'Voiceover' },
  { value: 'dancer', label: 'Dancer' },
  { value: 'other', label: 'Other' },
];

const GENDER_OPTIONS = [
  { value: '', label: 'All Genders' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non_binary', label: 'Non-Binary' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer Not to Say' },
];

const RACE_OPTIONS = [
  { value: '', label: 'All Ethnicities' },
  { value: 'asian', label: 'Asian' },
  { value: 'black_african', label: 'Black / African' },
  { value: 'east_asian', label: 'East Asian' },
  { value: 'hispanic_latino', label: 'Hispanic / Latino' },
  { value: 'middle_eastern', label: 'Middle Eastern' },
  { value: 'mixed', label: 'Mixed / Multiracial' },
  { value: 'native_american', label: 'Native American / Indigenous' },
  { value: 'pacific_islander', label: 'Pacific Islander' },
  { value: 'south_asian', label: 'South Asian' },
  { value: 'southeast_asian', label: 'Southeast Asian' },
  { value: 'white_caucasian', label: 'White / Caucasian' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer Not to Say' },
];

const AGE_RANGES = [
  { value: '', label: 'All Ages' },
  { value: '0-18', label: '0 – 18' },
  { value: '18-25', label: '18 – 25' },
  { value: '25-35', label: '25 – 35' },
  { value: '35-45', label: '35 – 45' },
  { value: '45+', label: '45+' },
];

const HEIGHT_RANGES = [
  { value: '', label: 'All Heights' },
  { value: '-160', label: 'Under 160 cm' },
  { value: '160-165', label: '160 – 165 cm' },
  { value: '165-170', label: '165 – 170 cm' },
  { value: '170-175', label: '170 – 175 cm' },
  { value: '175-180', label: '175 – 180 cm' },
  { value: '180+', label: '180+ cm' },
];

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_NAMES = ['Mo','Tu','We','Th','Fr','Sa','Su'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

const SLOT_COLORS = {
  available: 'bg-green-400',
  unavailable: 'bg-red-400',
  tentative: 'bg-yellow-400',
  booked: 'bg-blue-400',
};

export default function TalentPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('roster');

  const [typeFilter, setTypeFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [raceFilter, setRaceFilter] = useState('');
  const [ageRangeFilter, setAgeRangeFilter] = useState('');
  const [heightRangeFilter, setHeightRangeFilter] = useState('');

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedTalentIds, setSelectedTalentIds] = useState(new Set());
  const [showSendModal, setShowSendModal] = useState(false);

  const params = {};
  if (typeFilter) params.talent_type = typeFilter;

  const { data, isLoading } = useTalentProfiles(params);
  const talentList = data?.results || data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Talents</h1>
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          <TabButton
            active={activeTab === 'roster'}
            icon={<UsersIcon className="w-4 h-4" />}
            label="Roster"
            onClick={() => setActiveTab('roster')}
          />
          <TabButton
            active={activeTab === 'calendar'}
            icon={<CalendarDaysIcon className="w-4 h-4" />}
            label="Availability Calendar"
            onClick={() => setActiveTab('calendar')}
          />
        </div>
      </div>

      {activeTab === 'roster' ? (
        <RosterTab
          talentList={talentList}
          isLoading={isLoading}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          genderFilter={genderFilter}
          setGenderFilter={setGenderFilter}
          raceFilter={raceFilter}
          setRaceFilter={setRaceFilter}
          ageRangeFilter={ageRangeFilter}
          setAgeRangeFilter={setAgeRangeFilter}
          heightRangeFilter={heightRangeFilter}
          setHeightRangeFilter={setHeightRangeFilter}
          onSelectTalent={(id) => navigate(`/production/talent/${id}`)}
        />
      ) : (
        <CalendarTab
          calYear={calYear}
          calMonth={calMonth}
          setCalYear={setCalYear}
          setCalMonth={setCalMonth}
          selectedTalentIds={selectedTalentIds}
          setSelectedTalentIds={setSelectedTalentIds}
          onSendToClient={() => setShowSendModal(true)}
        />
      )}

      {showSendModal && (
        <SendToClientModal
          selectedTalentIds={[...selectedTalentIds]}
          onClose={() => setShowSendModal(false)}
          onSent={() => {
            setShowSendModal(false);
            setSelectedTalentIds(new Set());
          }}
        />
      )}
    </div>
  );
}

/* ─── Roster Tab ─────────────────────────────────────────────────────────── */

/** Parse a height string like "173 cm" or "5'8\"" into centimetres, or null. */
function parseHeightToCm(h) {
  if (!h) return null;
  const cmMatch = h.match(/^(\d+(?:\.\d+)?)\s*cm/i);
  if (cmMatch) return parseFloat(cmMatch[1]);
  const ftMatch = h.match(/^(\d+)'(\d*)/);
  if (ftMatch) {
    const ft = parseInt(ftMatch[1], 10);
    const inches = parseInt(ftMatch[2] || '0', 10);
    return Math.round(ft * 30.48 + inches * 2.54);
  }
  return null;
}

function matchesAgeRange(age, range) {
  if (!range) return true;
  if (!age) return false;
  const a = parseInt(age, 10);
  if (range === '0-18') return a >= 0 && a <= 18;
  if (range === '18-25') return a >= 18 && a <= 25;
  if (range === '25-35') return a >= 25 && a <= 35;
  if (range === '35-45') return a >= 35 && a <= 45;
  if (range === '45+') return a >= 45;
  return true;
}

function matchesHeightRange(height, range) {
  if (!range) return true;
  const cm = parseHeightToCm(height);
  if (cm === null) return false;
  if (range === '-160') return cm < 160;
  if (range === '160-165') return cm >= 160 && cm < 165;
  if (range === '165-170') return cm >= 165 && cm < 170;
  if (range === '170-175') return cm >= 170 && cm < 175;
  if (range === '175-180') return cm >= 175 && cm < 180;
  if (range === '180+') return cm >= 180;
  return true;
}

function applyFilters(list, { genderFilter, raceFilter, ageRangeFilter, heightRangeFilter }) {
  return list.filter((t) => {
    if (genderFilter && t.gender !== genderFilter) return false;
    if (raceFilter && t.race_ethnicity !== raceFilter) return false;
    if (!matchesAgeRange(t.age, ageRangeFilter)) return false;
    if (!matchesHeightRange(t.height, heightRangeFilter)) return false;
    return true;
  });
}

const selectCls = 'px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none';

function TalentCard({ t, onSelectTalent }) {
  return (
    <div
      onClick={() => onSelectTalent(t.id)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all group"
    >
      {t.primary_photo ? (
        <img src={t.primary_photo} alt={t.full_name} className="w-full h-40 object-cover group-hover:scale-[1.02] transition-transform duration-300" />
      ) : (
        <div className="w-full h-40 bg-indigo-50 flex items-center justify-center">
          <UserIcon className="w-14 h-14 text-indigo-200" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="font-semibold text-gray-900 text-sm truncate">{t.full_name}</p>
          <StatusBadge status={t.approval_status} />
        </div>
        <p className="text-xs text-gray-500 capitalize mb-2">{t.talent_type}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">${Number(t.hourly_rate).toFixed(0)}/hr</span>
          <StatusBadge status={t.availability} />
        </div>
        {t.bio && <p className="mt-2 text-xs text-gray-400 line-clamp-2">{t.bio}</p>}
      </div>
    </div>
  );
}

const TALENT_TYPE_LABELS = { model: 'Model', actor: 'Actor', voiceover: 'Voiceover', dancer: 'Dancer', livestream: 'Livestream Host', other: 'Other' };

function RosterTab({
  talentList, isLoading,
  typeFilter, setTypeFilter,
  genderFilter, setGenderFilter,
  raceFilter, setRaceFilter,
  ageRangeFilter, setAgeRangeFilter,
  heightRangeFilter, setHeightRangeFilter,
  onSelectTalent,
}) {
  const [notApprovedOpen, setNotApprovedOpen] = useState(false);
  const { data: projectsData } = useProjects({ status: 'active' });

  const approved = talentList.filter((t) => t.approval_status === 'approved');
  const notApproved = talentList.filter((t) => t.approval_status !== 'approved');

  const filterArgs = { genderFilter, raceFilter, ageRangeFilter, heightRangeFilter };
  const visibleApproved = applyFilters(approved, filterArgs);
  const visibleNotApproved = applyFilters(notApproved, filterArgs);

  const activeProjects = (projectsData?.results || projectsData || []).filter(
    (p) => (p.talent_requirements || []).length > 0
  );

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={selectCls}>
          {TALENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} className={selectCls}>
          {GENDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={raceFilter} onChange={(e) => setRaceFilter(e.target.value)} className={selectCls}>
          {RACE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={ageRangeFilter} onChange={(e) => setAgeRangeFilter(e.target.value)} className={selectCls}>
          {AGE_RANGES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={heightRangeFilter} onChange={(e) => setHeightRangeFilter(e.target.value)} className={selectCls}>
          {HEIGHT_RANGES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main roster area */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="text-center py-10 text-gray-400">Loading…</div>
          ) : (
            <div className="space-y-6">
              {/* ── Approved talent ── */}
              {visibleApproved.length === 0 && visibleNotApproved.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-sm text-gray-400">
                  No talent match the selected filters
                </div>
              ) : visibleApproved.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">
                  No approved talent match the selected filters
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {visibleApproved.map((t) => <TalentCard key={t.id} t={t} onSelectTalent={onSelectTalent} />)}
                </div>
              )}

              {/* ── Not-yet-approved talent ── */}
              {notApproved.length > 0 && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setNotApprovedOpen((o) => !o)}
                    className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-600"
                  >
                    <span>
                      Pending / Draft / Rejected
                      <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-700 text-xs font-semibold">
                        {visibleNotApproved.length}
                      </span>
                    </span>
                    <span className="text-gray-400 text-xs">{notApprovedOpen ? '▲ Hide' : '▼ Show'}</span>
                  </button>
                  {notApprovedOpen && (
                    <div className="p-4 bg-white">
                      {visibleNotApproved.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No talent match the selected filters</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                          {visibleNotApproved.map((t) => <TalentCard key={t.id} t={t} onSelectTalent={onSelectTalent} />)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upcoming Projects sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 sticky top-6">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Upcoming Projects</h2>
              <p className="text-xs text-gray-400 mt-0.5">Talent staffing needs</p>
            </div>
            <div className="divide-y divide-gray-50">
              {activeProjects.length === 0 ? (
                <p className="p-5 text-sm text-gray-400">No active projects with talent needs</p>
              ) : (
                activeProjects.slice(0, 8).map((proj) => (
                  <div key={proj.id} className="px-5 py-3">
                    <p className="text-sm font-medium text-gray-900">{proj.name}</p>
                    {proj.deadline && <p className="text-xs text-gray-400 mt-0.5">Deadline: {proj.deadline}</p>}
                    <div className="mt-1.5 space-y-1">
                      {(proj.talent_requirements || []).map((r) => (
                        <div key={r.id} className="flex items-center gap-1.5 text-xs">
                          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold">{r.count}</span>
                          <span className="text-gray-700 capitalize">{TALENT_TYPE_LABELS[r.talent_type] || r.talent_type}</span>
                          {r.notes && <span className="text-gray-400 italic truncate">– {r.notes}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Calendar Tab ───────────────────────────────────────────────────────── */

function CalendarTab({ calYear, calMonth, setCalYear, setCalMonth, selectedTalentIds, setSelectedTalentIds, onSendToClient }) {
  const [typeFilter, setTypeFilter] = useState('');

  const { data: profilesData, isLoading: loadingTalents } = useTalentProfiles({ approved_only: 'true', ...(typeFilter && { talent_type: typeFilter }) });
  const { data: availData } = useTalentAvailability({ month: calMonth + 1, year: calYear });
  const { data: bookingsData } = useBookings({});

  const talents = profilesData?.results || profilesData || [];
  const availEntries = availData?.results || availData || [];
  const bookings = bookingsData?.results || bookingsData || [];

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1;
    return `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  });

  const availMap = useMemo(() => {
    const map = {};
    availEntries.forEach((e) => {
      if (!map[e.talent]) map[e.talent] = {};
      if (e.period === 'full') {
        map[e.talent][`${e.date}:am`] = e.status;
        map[e.talent][`${e.date}:pm`] = e.status;
      } else {
        map[e.talent][`${e.date}:${e.period}`] = e.status;
      }
    });
    return map;
  }, [availEntries]);

  const bookedMap = useMemo(() => {
    const map = {};
    bookings.forEach((b) => {
      if (b.shoot_detail?.shoot_date && b.status === 'accepted') {
        const talentId = b.talent;
        if (!map[talentId]) map[talentId] = new Set();
        const d = b.shoot_detail.shoot_date;
        const ct = b.shoot_detail.call_time;
        const wt = b.shoot_detail.est_wrap_time;
        if (!ct || ct < '12:00') {
          map[talentId].add(`${d}:am`);
          if (!wt || wt > '12:00') map[talentId].add(`${d}:pm`);
        } else {
          map[talentId].add(`${d}:pm`);
        }
      }
    });
    return map;
  }, [bookings]);

  const toggleTalent = (id) => {
    setSelectedTalentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1.5">
            <button onClick={prevMonth} className="px-2 text-gray-500 hover:text-gray-800 text-sm">←</button>
            <span className="text-sm font-semibold text-gray-700 px-1 min-w-[140px] text-center">{MONTH_NAMES[calMonth]} {calYear}</span>
            <button onClick={nextMonth} className="px-2 text-gray-500 hover:text-gray-800 text-sm">→</button>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {TALENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setSelectedTalentIds(new Set(talents.map((t) => t.id)))} className="text-xs text-indigo-600 hover:underline">Select all</button>
          <span className="text-gray-300">|</span>
          <button onClick={() => setSelectedTalentIds(new Set())} className="text-xs text-gray-400 hover:underline">Clear</button>
          {selectedTalentIds.size > 0 && (
            <button
              onClick={onSendToClient}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              Send {selectedTalentIds.size} to Client
            </button>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {[{ color: 'bg-green-400', label: 'Available' }, { color: 'bg-red-400', label: 'Unavailable' }, { color: 'bg-yellow-400', label: 'Tentative' }, { color: 'bg-blue-400', label: 'Booked' }, { color: 'bg-gray-200', label: 'Unknown' }].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${l.color}`} />
            <span className="text-gray-500">{l.label}</span>
          </div>
        ))}
        <span className="text-gray-400 italic ml-1">Top half = AM · Bottom half = PM</span>
      </div>

      {/* Matrix table */}
      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="border-collapse text-xs" style={{ minWidth: `${180 + daysInMonth * 28}px` }}>
            <thead>
              <tr className="bg-gray-50">
                <th className="sticky left-0 z-10 bg-gray-50 border-b border-r border-gray-200 w-44 min-w-[176px] px-3 py-2 text-left font-medium text-gray-500">
                  Talent
                </th>
                {days.map((dateStr) => {
                  const dayNum = parseInt(dateStr.slice(-2));
                  const dow = new Date(dateStr).getDay();
                  const isWeekend = dow === 0 || dow === 6;
                  return (
                    <th
                      key={dateStr}
                      className={`border-b border-r border-gray-100 text-center font-medium py-1.5 ${isWeekend ? 'bg-gray-100 text-gray-400' : 'text-gray-600'}`}
                      style={{ width: '28px' }}
                    >
                      <div>{dayNum}</div>
                      <div className="text-[8px] text-gray-400">{DAY_NAMES[dow === 0 ? 6 : dow - 1]}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {loadingTalents ? (
                <tr><td colSpan={daysInMonth + 1} className="text-center py-8 text-gray-400">Loading…</td></tr>
              ) : talents.length === 0 ? (
                <tr><td colSpan={daysInMonth + 1} className="text-center py-8 text-gray-400">No talent found</td></tr>
              ) : (
                talents.map((talent) => {
                  const talentAvail = availMap[talent.id] || {};
                  const talentBooked = bookedMap[talent.id] || new Set();
                  const isChecked = selectedTalentIds.has(talent.id);

                  return (
                    <tr key={talent.id} className={`border-b border-gray-100 transition-colors ${isChecked ? 'bg-indigo-50 hover:bg-indigo-100' : 'hover:bg-gray-50'}`}>
                      <td className={`sticky left-0 z-10 border-r border-gray-200 px-3 py-2 ${isChecked ? 'bg-indigo-50' : 'bg-white'}`}>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleTalent(talent.id)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          {talent.primary_photo ? (
                            <img src={talent.primary_photo} alt={talent.full_name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-[9px] font-bold text-indigo-600">{talent.full_name?.slice(0, 2).toUpperCase()}</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 truncate text-xs">{talent.full_name}</p>
                            <p className="text-[9px] text-gray-400 capitalize">{talent.talent_type}</p>
                          </div>
                        </div>
                      </td>
                      {days.map((dateStr) => {
                        const amKey = `${dateStr}:am`;
                        const pmKey = `${dateStr}:pm`;
                        const amStatus = talentBooked.has(amKey) ? 'booked' : talentAvail[amKey];
                        const pmStatus = talentBooked.has(pmKey) ? 'booked' : talentAvail[pmKey];
                        return (
                          <td key={dateStr} className="border-r border-gray-100 p-0" style={{ width: '28px' }}>
                            <div className="flex flex-col">
                              <div className={`h-4 ${SLOT_COLORS[amStatus] || 'bg-gray-100'} border-b border-white/50`} title={`AM: ${amStatus || '—'}`} />
                              <div className={`h-4 ${SLOT_COLORS[pmStatus] || 'bg-gray-100'}`} title={`PM: ${pmStatus || '—'}`} />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Send to Client Modal ───────────────────────────────────────────────── */
function SendToClientModal({ selectedTalentIds, onClose, onSent }) {
  const [clientId, setClientId] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const { data: usersData } = useUsers({ role: 'client' });
  const clients = usersData?.results || usersData || [];
  const sendRoster = useSendTalentRoster();

  const handleSend = async () => {
    if (!clientId) return;
    try {
      const result = await sendRoster.mutateAsync({ client: clientId, talent_ids: selectedTalentIds, message });
      if (result.email_sent === false) {
        toast.warning('Talent roster shared, but email notification failed.');
      } else {
        toast.success('Talent roster sent to client.');
      }
      setSuccess(true);
      setTimeout(onSent, 1500);
    } catch (err) {
      toast.error('Failed to send talent roster: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Send Talent to Client</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {success ? (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckIcon className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-medium text-gray-800">Sent successfully!</p>
              <p className="text-sm text-gray-500">The client has been notified by email.</p>
            </div>
          ) : (
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Talent selected</label>
                <div className="p-2.5 bg-indigo-50 rounded-lg text-xs text-indigo-700 font-medium">
                  {selectedTalentIds.length} talent profile{selectedTalentIds.length !== 1 ? 's' : ''} will be shared
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Select Client <span className="text-red-400">*</span>
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">— Choose a client —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.first_name} {c.last_name} ({c.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Message to client (optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="E.g. Here are our top picks for the upcoming campaign…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={!clientId || sendRoster.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                  {sendRoster.isPending ? 'Sending…' : 'Send & Notify'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function TabButton({ active, icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

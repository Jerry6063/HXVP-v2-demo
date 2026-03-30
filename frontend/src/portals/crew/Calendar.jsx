import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  useCrewAvailability,
  useBulkUpdateCrewAvailability,
  useCrewAssignments,
} from '../../api/hooks';
import LoadingSpinner from '../../components/LoadingSpinner';
import { LockClosedIcon, CheckIcon } from '@heroicons/react/20/solid';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const STATUS_BG = {
  available: 'bg-green-100 border-green-300',
  unavailable: 'bg-red-100 border-red-300',
  tentative: 'bg-yellow-100 border-yellow-300',
};
const STATUS_TEXT = {
  available: 'text-green-700',
  unavailable: 'text-red-700',
  tentative: 'text-yellow-700',
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}
function fmtDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
function dayRange(a, b) {
  const lo = Math.min(a, b), hi = Math.max(a, b);
  return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
}

const TOUCH_HOLD_MS = 200;
const TOUCH_MOVE_THRESHOLD = 10;

export default function CrewCalendar() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDays, setSelectedDays] = useState(new Set());
  const [bulkStatus, setBulkStatus] = useState('available');
  const [bulkPeriod, setBulkPeriod] = useState('full');
  const [bulkNote, setBulkNote] = useState('');

  // Drag state (mouse)
  const isDragging = useRef(false);
  const dragStart = useRef(null);
  const lastAnchor = useRef(null);

  // Touch state
  const touchTimer = useRef(null);
  const touchStart = useRef(null);
  const touchActive = useRef(false);

  const { data: availData, isLoading: loadingAvail } = useCrewAvailability({
    month: viewMonth + 1,
    year: viewYear,
  });
  const { data: assignmentsData } = useCrewAssignments({ upcoming: 'true' });
  const bulkUpdate = useBulkUpdateCrewAvailability();

  const availEntries = availData?.results || availData || [];
  const assignments = assignmentsData?.results || assignmentsData || [];

  // Per-date availability: { dateStr: { am: entry|null, pm: entry|null, full: entry|null } }
  const availMap = useMemo(() => {
    const map = {};
    availEntries.forEach((e) => {
      if (!map[e.date]) map[e.date] = {};
      map[e.date][e.period] = e;
    });
    return map;
  }, [availEntries]);

  // Assigned dates (set of dateStr)
  const assignedDates = useMemo(() => {
    const set = new Set();
    assignments.forEach((a) => {
      if (a.shoot_detail?.shoot_date && a.status === 'accepted') {
        set.add(a.shoot_detail.shoot_date);
      }
    });
    return set;
  }, [assignments]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const changeMonth = (delta) => {
    let m = viewMonth + delta, y = viewYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setViewMonth(m);
    setViewYear(y);
    setSelectedDays(new Set());
  };

  const todayStr = fmtDate(today.getFullYear(), today.getMonth(), today.getDate());

  // --- Selection helpers ---
  const toggleDay = useCallback((day) => {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day); else next.add(day);
      return next;
    });
  }, []);

  const selectRange = useCallback((from, to) => {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      dayRange(from, to).forEach((d) => {
        const dateStr = fmtDate(viewYear, viewMonth, d);
        if (!assignedDates.has(dateStr)) next.add(d);
      });
      return next;
    });
  }, [viewYear, viewMonth, assignedDates]);

  // --- Mouse drag ---
  const handleMouseDown = useCallback((day, e) => {
    e.preventDefault();
    const dateStr = fmtDate(viewYear, viewMonth, day);
    if (assignedDates.has(dateStr)) return;

    if (e.shiftKey && lastAnchor.current != null) {
      selectRange(lastAnchor.current, day);
    } else {
      isDragging.current = true;
      dragStart.current = day;
      toggleDay(day);
    }
    lastAnchor.current = day;
  }, [viewYear, viewMonth, assignedDates, toggleDay, selectRange]);

  const handleMouseEnter = useCallback((day) => {
    if (!isDragging.current || dragStart.current == null) return;
    setSelectedDays(() => {
      const next = new Set();
      dayRange(dragStart.current, day).forEach((d) => {
        const dateStr = fmtDate(viewYear, viewMonth, d);
        if (!assignedDates.has(dateStr)) next.add(d);
      });
      return next;
    });
  }, [viewYear, viewMonth, assignedDates]);

  useEffect(() => {
    const up = () => { isDragging.current = false; };
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, []);

  // --- Touch drag (with hold-to-activate gate) ---
  const getTouchDay = useCallback((touch) => {
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    return el?.closest('[data-day]')?.dataset.day ? Number(el.closest('[data-day]').dataset.day) : null;
  }, []);

  const handleTouchStart = useCallback((day, e) => {
    const dateStr = fmtDate(viewYear, viewMonth, day);
    if (assignedDates.has(dateStr)) return;
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY, day };
    touchActive.current = false;
    touchTimer.current = setTimeout(() => {
      touchActive.current = true;
      toggleDay(day);
      lastAnchor.current = day;
    }, TOUCH_HOLD_MS);
  }, [viewYear, viewMonth, assignedDates, toggleDay]);

  const handleTouchMove = useCallback((e) => {
    if (!touchActive.current && touchStart.current) {
      const t = e.touches[0];
      const dx = t.clientX - touchStart.current.x;
      const dy = t.clientY - touchStart.current.y;
      if (Math.abs(dx) > TOUCH_MOVE_THRESHOLD || Math.abs(dy) > TOUCH_MOVE_THRESHOLD) {
        clearTimeout(touchTimer.current);
        touchStart.current = null;
        return;
      }
    }
    if (!touchActive.current) return;
    e.preventDefault();
    const day = getTouchDay(e.touches[0]);
    if (day != null && touchStart.current) {
      setSelectedDays(() => {
        const next = new Set();
        dayRange(touchStart.current.day, day).forEach((d) => {
          const ds = fmtDate(viewYear, viewMonth, d);
          if (!assignedDates.has(ds)) next.add(d);
        });
        return next;
      });
    }
  }, [viewYear, viewMonth, assignedDates, getTouchDay]);

  const handleTouchEnd = useCallback(() => {
    clearTimeout(touchTimer.current);
    touchActive.current = false;
    touchStart.current = null;
  }, []);

  // --- Quick selects ---
  const selectWeekdays = () => {
    const next = new Set();
    for (let d = 1; d <= daysInMonth; d++) {
      const dow = new Date(viewYear, viewMonth, d).getDay();
      const dateStr = fmtDate(viewYear, viewMonth, d);
      if (dow !== 0 && dow !== 6 && !assignedDates.has(dateStr)) next.add(d);
    }
    setSelectedDays(next);
  };
  const selectAll = () => {
    const next = new Set();
    for (let d = 1; d <= daysInMonth; d++) {
      if (!assignedDates.has(fmtDate(viewYear, viewMonth, d))) next.add(d);
    }
    setSelectedDays(next);
  };
  const selectWeekRow = (startDay) => {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      for (let d = startDay; d < startDay + 7 && d <= daysInMonth; d++) {
        if (!assignedDates.has(fmtDate(viewYear, viewMonth, d))) next.add(d);
      }
      return next;
    });
  };

  // --- Save ---
  const handleBulkSave = async () => {
    if (selectedDays.size === 0) return;
    const entries = [...selectedDays].map((day) => ({
      date: fmtDate(viewYear, viewMonth, day),
      period: bulkPeriod,
      status: bulkStatus,
      note: bulkNote,
    }));
    await bulkUpdate.mutateAsync({ entries });
    setSelectedDays(new Set());
    setBulkNote('');
  };

  // --- Day cell status resolver ---
  const getDayStatus = useCallback((dateStr) => {
    const rec = availMap[dateStr];
    if (!rec) return null;
    if (rec.full) return { status: rec.full.status, mixed: false, note: rec.full.note };
    const am = rec.am, pm = rec.pm;
    if (am && pm) {
      if (am.status === pm.status) return { status: am.status, mixed: false, note: am.note || pm.note };
      return { status: am.status, mixed: true, amStatus: am.status, pmStatus: pm.status, note: am.note || pm.note };
    }
    if (am) return { status: am.status, mixed: true, amStatus: am.status, pmStatus: null, note: am.note };
    if (pm) return { status: pm.status, mixed: true, amStatus: null, pmStatus: pm.status, note: pm.note };
    return null;
  }, [availMap]);

  if (loadingAvail) return <LoadingSpinner />;

  // Build calendar rows for week-row selection
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Availability Calendar</h1>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {[
          { color: 'bg-green-100 border-green-300', label: 'Available' },
          { color: 'bg-red-100 border-red-300', label: 'Unavailable' },
          { color: 'bg-yellow-100 border-yellow-300', label: 'Tentative' },
          { color: 'bg-blue-100 border-blue-300', label: 'Booked' },
          { color: 'bg-sky-200 border-sky-400', label: 'Selected' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-4 h-4 rounded border ${l.color}`} />
            <span className="text-gray-600">{l.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div
          className="lg:col-span-3 bg-white rounded-xl shadow p-6 select-none"
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Month Nav */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => changeMonth(-1)} className="text-gray-500 hover:text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-100">
              ← Prev
            </button>
            <h2 className="text-lg font-semibold">{MONTH_NAMES[viewMonth]} {viewYear}</h2>
            <button onClick={() => changeMonth(1)} className="text-gray-500 hover:text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-100">
              Next →
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-1 mb-1">
            <div />
            {DAY_NAMES.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">{d}</div>
            ))}
          </div>

          {/* Calendar Rows */}
          {weeks.map((week, wi) => {
            const firstDayInWeek = week.find((d) => d != null);
            return (
              <div key={wi} className="grid grid-cols-[auto_repeat(7,1fr)] gap-1 mb-1">
                {/* Week row selector */}
                <button
                  onClick={() => firstDayInWeek && selectWeekRow(firstDayInWeek)}
                  className="w-6 flex items-center justify-center text-gray-300 hover:text-sky-500 hover:bg-sky-50 rounded text-xs transition"
                  title="Select this week"
                >
                  ›
                </button>
                {week.map((day, di) => {
                  if (day == null) return <div key={`e-${di}`} />;
                  const dateStr = fmtDate(viewYear, viewMonth, day);
                  const isToday = dateStr === todayStr;
                  const isAssigned = assignedDates.has(dateStr);
                  const isSelected = selectedDays.has(day);
                  const info = getDayStatus(dateStr);

                  let bg = 'bg-gray-50 border-gray-200';
                  let textColor = 'text-gray-400';
                  if (isAssigned) {
                    bg = 'bg-blue-50 border-blue-200';
                    textColor = 'text-blue-600';
                  } else if (isSelected) {
                    bg = 'bg-sky-100 border-sky-400 ring-2 ring-sky-400';
                    textColor = 'text-sky-800';
                  } else if (info && !info.mixed) {
                    bg = `${STATUS_BG[info.status]} border`;
                    textColor = STATUS_TEXT[info.status];
                  } else if (info?.mixed) {
                    bg = 'border-gray-300 border';
                  }

                  return (
                    <div
                      key={day}
                      data-day={day}
                      onMouseDown={(e) => handleMouseDown(day, e)}
                      onMouseEnter={() => handleMouseEnter(day)}
                      onTouchStart={(e) => handleTouchStart(day, e)}
                      title={info?.note || undefined}
                      className={`relative rounded-lg overflow-hidden cursor-pointer transition-all ${bg} ${
                        isToday ? 'ring-2 ring-indigo-400' : ''
                      } ${isAssigned ? 'cursor-default' : 'hover:brightness-95'}`}
                      style={{ minHeight: '64px' }}
                    >
                      {/* Date number */}
                      <span className={`absolute top-1.5 left-2 text-xs font-bold ${isToday ? 'text-indigo-700' : textColor}`}>
                        {day}
                      </span>

                      {/* Icons / indicators */}
                      {isAssigned && (
                        <LockClosedIcon className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-blue-400" />
                      )}
                      {isSelected && !isAssigned && (
                        <CheckIcon className="absolute top-1.5 right-1.5 w-4 h-4 text-sky-600" />
                      )}

                      {/* Mixed AM/PM indicator */}
                      {info?.mixed && !isSelected && !isAssigned && (
                        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
                          <div className={`w-2 h-2 rounded-full ${info.amStatus ? STATUS_BG[info.amStatus]?.split(' ')[0] || 'bg-gray-300' : 'bg-gray-200'}`}
                            title={info.amStatus ? `AM: ${info.amStatus}` : 'AM: unset'} />
                          <div className={`w-2 h-2 rounded-full ${info.pmStatus ? STATUS_BG[info.pmStatus]?.split(' ')[0] || 'bg-gray-300' : 'bg-gray-200'}`}
                            title={info.pmStatus ? `PM: ${info.pmStatus}` : 'PM: unset'} />
                        </div>
                      )}

                      {/* Uniform status label */}
                      {info && !info.mixed && !isSelected && !isAssigned && (
                        <span className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-medium capitalize ${textColor}`}>
                          {info.status}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          <p className="text-[11px] text-gray-400 mt-3">
            Click a day to select · Drag across days for a range · Shift+click to extend · Use the row arrow to select a week
          </p>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Update Availability</h3>
            <p className="text-xs text-gray-500">
              Select days on the calendar, then set status and period below.
            </p>

            {/* Quick selects */}
            <div className="flex flex-wrap gap-2">
              <button onClick={selectWeekdays} className="text-xs px-2.5 py-1 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition">
                Weekdays
              </button>
              <button onClick={selectAll} className="text-xs px-2.5 py-1 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition">
                Whole Month
              </button>
              <button onClick={() => setSelectedDays(new Set())} className="text-xs px-2.5 py-1 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition">
                Clear
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="w-full border rounded-lg p-2 text-sm">
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
                <option value="tentative">Tentative</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Period</label>
              <select value={bulkPeriod} onChange={(e) => setBulkPeriod(e.target.value)} className="w-full border rounded-lg p-2 text-sm">
                <option value="full">Full Day</option>
                <option value="am">Morning Only (AM)</option>
                <option value="pm">Afternoon Only (PM)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Note (optional)</label>
              <input
                type="text"
                value={bulkNote}
                onChange={(e) => setBulkNote(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm"
                placeholder="e.g. Out of town"
              />
            </div>

            <div className="text-xs text-gray-500">
              {selectedDays.size} day{selectedDays.size !== 1 ? 's' : ''} selected
            </div>

            <button
              onClick={handleBulkSave}
              disabled={selectedDays.size === 0 || bulkUpdate.isPending}
              className="w-full bg-sky-600 text-white py-2 rounded-lg hover:bg-sky-700 disabled:opacity-50 text-sm font-medium"
            >
              {bulkUpdate.isPending ? 'Saving...' : 'Save Availability'}
            </button>
          </div>

          {/* Upcoming Shoots */}
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Upcoming Shoots</h3>
            {assignments.filter((a) => a.status === 'accepted').length === 0 ? (
              <p className="text-xs text-gray-400">No upcoming shoots</p>
            ) : (
              <div className="space-y-2">
                {assignments
                  .filter((a) => a.status === 'accepted')
                  .slice(0, 5)
                  .map((a) => (
                    <div key={a.id} className="p-2 bg-blue-50 rounded-lg text-xs">
                      <p className="font-medium text-blue-900">{a.shoot_detail?.shoot_date}</p>
                      <p className="text-blue-700 mt-0.5">{a.project_name} – {a.shoot_detail?.location}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo } from 'react';
import {
  useTalentAvailability,
  useBulkUpdateTalentAvailability,
  useBookings,
} from '../../api/hooks';
import LoadingSpinner from '../../components/LoadingSpinner';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const STATUS_COLORS = {
  available: 'bg-green-100 text-green-800 border-green-300',
  unavailable: 'bg-red-100 text-red-800 border-red-300',
  tentative: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  booked: 'bg-blue-100 text-blue-800 border-blue-300',
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export default function TalentCalendar() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedSlots, setSelectedSlots] = useState(new Set()); // "date:am" | "date:pm"
  const [bulkStatus, setBulkStatus] = useState('available');
  const [bulkNote, setBulkNote] = useState('');

  const { data: availData, isLoading: loadingAvail } = useTalentAvailability({
    month: viewMonth + 1,
    year: viewYear,
  });
  const { data: bookingsData } = useBookings({ upcoming: 'true' });
  const bulkUpdate = useBulkUpdateTalentAvailability();

  const availEntries = availData?.results || availData || [];
  const bookings = bookingsData?.results || bookingsData || [];

  const availMap = useMemo(() => {
    const map = {};
    availEntries.forEach((e) => {
      if (e.period === 'full') {
        map[`${e.date}:am`] = e;
        map[`${e.date}:pm`] = e;
      } else {
        map[`${e.date}:${e.period}`] = e;
      }
    });
    return map;
  }, [availEntries]);

  const bookingSlots = useMemo(() => {
    const set = new Set();
    bookings.forEach((b) => {
      if (b.shoot_detail?.shoot_date && b.status === 'accepted') {
        const d = b.shoot_detail.shoot_date;
        const callTime = b.shoot_detail.call_time;
        const wrapTime = b.shoot_detail.est_wrap_time;
        if (!callTime || callTime < '12:00') {
          set.add(`${d}:am`);
          if (!wrapTime || wrapTime > '12:00') set.add(`${d}:pm`);
        } else {
          set.add(`${d}:pm`);
        }
      }
    });
    return set;
  }, [bookings]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
    setSelectedSlots(new Set());
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
    setSelectedSlots(new Set());
  };

  const toggleSlot = (slotKey) => {
    setSelectedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(slotKey)) next.delete(slotKey);
      else next.add(slotKey);
      return next;
    });
  };

  const handleBulkSave = async () => {
    if (selectedSlots.size === 0) return;
    const entries = [...selectedSlots].map((key) => {
      const [date, period] = key.split(':');
      return { date, period, status: bulkStatus, note: bulkNote };
    });
    await bulkUpdate.mutateAsync({ entries });
    setSelectedSlots(new Set());
    setBulkNote('');
  };

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  if (loadingAvail) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Availability Calendar</h1>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {[
          { color: 'bg-green-100 border-green-300', label: 'Available' },
          { color: 'bg-red-100 border-red-300', label: 'Unavailable' },
          { color: 'bg-yellow-100 border-yellow-300', label: 'Tentative' },
          { color: 'bg-blue-100 border-blue-300', label: 'Booked (Shoot)' },
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
        <div className="lg:col-span-3 bg-white rounded-xl shadow p-6">
          {/* Month Nav */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="text-gray-500 hover:text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-100"
            >
              ← Prev
            </button>
            <h2 className="text-lg font-semibold">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </h2>
            <button
              onClick={nextMonth}
              className="text-gray-500 hover:text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-100"
            >
              Next →
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_NAMES.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={day}
                  className={`relative rounded-lg border overflow-hidden ${
                    isToday ? 'ring-2 ring-amber-400 border-amber-300' : 'border-gray-200'
                  }`}
                  style={{ minHeight: '70px' }}
                >
                  {/* Date number */}
                  <div className="absolute top-1 left-2 z-10">
                    <span className={`text-[11px] font-bold ${isToday ? 'text-amber-700' : 'text-gray-400'}`}>
                      {day}
                    </span>
                  </div>

                  {/* AM / PM half-cells */}
                  <div className="flex flex-col h-full pt-5">
                    {['am', 'pm'].map((period) => {
                      const slotKey = `${dateStr}:${period}`;
                      const isBooked = bookingSlots.has(slotKey);
                      const entry = availMap[slotKey];
                      const isSelected = selectedSlots.has(slotKey);

                      let cellColor = 'bg-gray-50 text-gray-500';
                      if (isBooked) cellColor = 'bg-blue-100 text-blue-800';
                      else if (entry) cellColor = STATUS_COLORS[entry.status] || cellColor;
                      if (isSelected) cellColor = 'bg-sky-200 text-sky-900 ring-1 ring-sky-400 ring-inset';

                      return (
                        <button
                          key={period}
                          onClick={() => !isBooked && toggleSlot(slotKey)}
                          disabled={isBooked}
                          title={entry?.note || undefined}
                          className={`w-full flex items-center justify-center transition hover:brightness-95 disabled:cursor-default ${
                            period === 'am' ? 'border-b border-white/40' : ''
                          } ${cellColor}`}
                          style={{ height: '28px' }}
                        >
                          <span className={`text-[9px] font-semibold uppercase ${
                            period === 'am' ? 'text-sky-600' : 'text-orange-500'
                          }`}>
                            {period}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bulk Update Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Update Availability</h3>
            <p className="text-xs text-gray-500">
              Click <span className="text-sky-600 font-medium">AM</span> or{' '}
              <span className="text-orange-500 font-medium">PM</span> half-cells on the
              calendar to select them, then set your status below.
            </p>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm"
              >
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
                <option value="tentative">Tentative</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Note (optional)
              </label>
              <input
                type="text"
                value={bulkNote}
                onChange={(e) => setBulkNote(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm"
                placeholder="e.g. Available after 10am"
              />
            </div>
            <div className="text-xs text-gray-500">
              {selectedSlots.size} half-day{selectedSlots.size !== 1 ? 's' : ''} selected
            </div>
            <button
              onClick={handleBulkSave}
              disabled={selectedSlots.size === 0 || bulkUpdate.isPending}
              className="w-full bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 disabled:opacity-50 text-sm font-medium"
            >
              {bulkUpdate.isPending ? 'Saving...' : 'Save Availability'}
            </button>
          </div>

          {/* Upcoming Bookings */}
          <div className="bg-white rounded-xl shadow p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Upcoming Bookings</h3>
            {bookings.filter((b) => b.status === 'accepted').length === 0 ? (
              <p className="text-xs text-gray-400">No upcoming bookings</p>
            ) : (
              <div className="space-y-2">
                {bookings
                  .filter((b) => b.status === 'accepted')
                  .slice(0, 5)
                  .map((b) => (
                    <div key={b.id} className="p-2 bg-blue-50 rounded-lg text-xs">
                      <p className="font-medium text-blue-900">
                        {b.shoot_detail?.shoot_date}
                      </p>
                      <p className="text-blue-700 mt-0.5">
                        {b.shoot_detail?.location || 'Location TBD'}
                      </p>
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

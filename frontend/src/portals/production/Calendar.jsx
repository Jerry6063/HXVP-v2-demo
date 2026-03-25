import { useMemo, useState } from 'react';
import {
  useShoots,
  useProjects,
  useInvoices,
} from '../../api/hooks';

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toDateKey(value) {
  if (!value) return null;
  return String(value).slice(0, 10);
}

function monthRange(baseDate) {
  const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
  return { start, end };
}

export default function ProductionCalendar() {
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date().toISOString()));
  const [visible, setVisible] = useState({
    shoots: true,
    deadlines: true,
    invoices: true,
  });

  const { start, end } = useMemo(() => monthRange(cursor), [cursor]);
  const from = toDateKey(start.toISOString());
  const to = toDateKey(end.toISOString());

  const { data: shootsData } = useShoots();
  const { data: projectsData } = useProjects();
  const { data: invoicesData } = useInvoices();

  const shoots = shootsData?.results || shootsData || [];
  const projects = projectsData?.results || projectsData || [];
  const invoices = invoicesData?.results || invoicesData || [];

  const events = useMemo(() => {
    const list = [];

    if (visible.shoots) {
      shoots.forEach((s) => {
        const dateKey = toDateKey(s.shoot_date);
        if (!dateKey) return;
        list.push({
          date: dateKey,
          type: 'shoot',
          color: 'bg-indigo-100 text-indigo-700',
          title: `Shoot: ${s.project_name || s.location || 'Shoot'}`,
          subtitle: s.location || '',
        });
      });
    }

    if (visible.deadlines) {
      projects.forEach((p) => {
        const dateKey = toDateKey(p.deadline);
        if (!dateKey) return;
        list.push({
          date: dateKey,
          type: 'deadline',
          color: 'bg-rose-100 text-rose-700',
          title: `Deadline: ${p.name}`,
          subtitle: p.status,
        });
      });
    }

    if (visible.invoices) {
      invoices.forEach((inv) => {
        const dateKey = toDateKey(inv.due_date);
        if (!dateKey) return;
        list.push({
          date: dateKey,
          type: 'invoice',
          color: 'bg-emerald-100 text-emerald-700',
          title: `Invoice Due: ${inv.reference_number}`,
          subtitle: `${inv.client_name || 'Client'} · $${Number(inv.total || 0).toLocaleString()}`,
        });
      });
    }

      return list;
    }, [
      visible,
      shoots,
      projects,
      invoices,
    ]);

  const monthDays = useMemo(() => {
    const firstDay = new Date(start);
    const firstWeekday = firstDay.getDay();
    const days = [];

    for (let i = 0; i < firstWeekday; i += 1) {
      days.push(null);
    }

    for (let d = 1; d <= end.getDate(); d += 1) {
      const date = new Date(cursor.getFullYear(), cursor.getMonth(), d);
      days.push(date);
    }

    return days;
  }, [cursor, start, end]);

  const selectedEvents = eventsByDate[selectedDate] || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production Calendar</h1>
          <p className="text-sm text-gray-500">Master calendar for shoots, deadlines, and invoice due dates.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm hover:bg-gray-50"
          >
            Prev
          </button>
          <button
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-medium text-gray-500 uppercase mb-2">Show / Hide</p>
        <div className="flex flex-wrap gap-3 text-sm">
          {[
            ['shoots', 'Production Shoots'],
            ['deadlines', 'Project Deadlines'],
            ['invoices', 'Invoice Due Dates'],
          ].map(([key, label]) => (
            <label key={key} className="inline-flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={visible[key]}
                onChange={(e) => setVisible((v) => ({ ...v, [key]: e.target.checked }))}
              />
              {label}
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">Campaigns support can be added as another toggle/source.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            {cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
          </h2>
          <span className="text-xs text-gray-500">Click a date to inspect events</span>
        </div>

        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
          {WEEKDAY.map((w) => (
            <div key={w} className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">{w}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-[120px]">
          {monthDays.map((dateObj, idx) => {
            if (!dateObj) {
              return <div key={`empty-${idx}`} className="border-r border-b border-gray-100 bg-gray-50/50" />;
            }
            const dateKey = toDateKey(dateObj.toISOString());
            const dayEvents = eventsByDate[dateKey] || [];
            const selected = selectedDate === dateKey;

            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDate(dateKey)}
                className={`text-left border-r border-b border-gray-100 px-2 py-1.5 hover:bg-indigo-50/40 ${selected ? 'bg-indigo-50/50' : 'bg-white'}`}
              >
                <div className="text-xs font-medium text-gray-700 mb-1">{dateObj.getDate()}</div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((e, i) => (
                    <div key={`${dateKey}-${i}`} className={`truncate rounded px-1.5 py-0.5 text-[10px] ${e.color}`}>
                      {e.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-gray-500">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">
            {selectedDate ? `Events on ${selectedDate}` : 'Events'}
          </h3>
        </div>
        {selectedEvents.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-400">No events for this date.</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {selectedEvents.map((e, idx) => (
              <li key={`${selectedDate}-${idx}`} className="px-5 py-3">
                <div className="flex items-start gap-2">
                  <span className={`mt-0.5 inline-block rounded px-2 py-0.5 text-[11px] ${e.color}`}>
                    {e.type.replace(/_/g, ' ')}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{e.title}</p>
                    {e.subtitle ? <p className="text-xs text-gray-500 mt-0.5">{e.subtitle}</p> : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

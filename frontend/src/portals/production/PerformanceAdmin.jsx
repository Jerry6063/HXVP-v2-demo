import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useApproveCrewTimeLog,
  useApproveTimeLog,
  useBookings,
  useCrewAssignments,
  useCrewTimeLogs,
  useTalentTimeLogs,
} from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

function hasShootWrapped(shootDate, wrapTime) {
  if (!shootDate) return false;

  const now = new Date();
  if (wrapTime) {
    return now > new Date(`${shootDate}T${wrapTime}`);
  }

  return shootDate < now.toISOString().split('T')[0];
}

function buildDisplayStatus(entry) {
  if (entry.kind === 'missing-log') return 'awaiting_hours_confirmation';
  if (entry.paymentStatus === 'paid') return 'paid';
  if (entry.logStatus === 'pending') return 'awaiting_admin_approval';
  if (entry.logStatus === 'approved') return 'awaiting_payment';
  return entry.logStatus || 'pending';
}

function sortEntries(left, right) {
  const leftDate = left.date || '';
  const rightDate = right.date || '';
  if (leftDate !== rightDate) return rightDate.localeCompare(leftDate);
  return left.personName.localeCompare(right.personName);
}

export default function PerformanceAdmin() {
  const navigate = useNavigate();
  const { data: bookingsData, isLoading: bookingsLoading } = useBookings();
  const { data: assignmentsData, isLoading: assignmentsLoading } = useCrewAssignments();
  const { data: talentLogsData, isLoading: talentLogsLoading } = useTalentTimeLogs();
  const { data: crewLogsData, isLoading: crewLogsLoading } = useCrewTimeLogs();
  const approveTalentLog = useApproveTimeLog();
  const approveCrewLog = useApproveCrewTimeLog();
  const [expandedId, setExpandedId] = useState(null);

  const bookings = bookingsData?.results || bookingsData || [];
  const assignments = assignmentsData?.results || assignmentsData || [];
  const talentLogs = talentLogsData?.results || talentLogsData || [];
  const crewLogs = crewLogsData?.results || crewLogsData || [];

  const productions = useMemo(() => {
    const talentLogsByBooking = new Map(
      talentLogs.filter((log) => log.booking).map((log) => [log.booking, log])
    );
    const crewLogsByAssignment = new Map(
      crewLogs.filter((log) => log.assignment).map((log) => [log.assignment, log])
    );
    const grouped = new Map();

    const addEntry = (entry) => {
      const key = entry.projectId || `project-${entry.projectName}`;
      const current = grouped.get(key) || {
        key,
        projectId: entry.projectId,
        projectName: entry.projectName || 'Unassigned Production',
        entries: [],
      };
      current.entries.push({ ...entry, displayStatus: buildDisplayStatus(entry) });
      grouped.set(key, current);
    };

    talentLogs.forEach((log) => {
      addEntry({
        id: `talent-log-${log.id}`,
        logId: log.id,
        kind: 'log',
        workerType: 'talent',
        personName: log.talent_name,
        roleLabel: 'Talent',
        projectId: log.project,
        projectName: log.project_name,
        date: log.date,
        shootDate: log.shoot_date,
        location: log.booking_detail?.location || '—',
        hours: log.hours_worked,
        rate: log.rate_applied,
        amount: log.amount,
        notes: log.notes,
        logStatus: log.log_status,
        paymentId: log.payment_id,
        paymentStatus: log.payment_status,
        paymentTab: 'talent-payments',
      });
    });

    crewLogs.forEach((log) => {
      addEntry({
        id: `crew-log-${log.id}`,
        logId: log.id,
        kind: 'log',
        workerType: 'crew',
        personName: log.crew_name,
        roleLabel: log.assignment_detail?.role_on_shoot || 'Crew',
        projectId: log.project,
        projectName: log.project_name,
        date: log.date,
        shootDate: log.shoot_date,
        location: log.assignment_detail?.location || '—',
        hours: log.hours_worked,
        rate: log.rate_applied,
        amount: log.amount,
        notes: log.notes,
        logStatus: log.log_status,
        paymentId: log.payment_id,
        paymentStatus: log.payment_status,
        paymentTab: 'crew-payments',
      });
    });

    bookings
      .filter((booking) => booking.status === 'accepted')
      .filter((booking) => hasShootWrapped(booking.shoot_detail?.shoot_date, booking.shoot_detail?.est_wrap_time))
      .filter((booking) => !talentLogsByBooking.has(booking.id))
      .forEach((booking) => {
        addEntry({
          id: `talent-missing-${booking.id}`,
          kind: 'missing-log',
          workerType: 'talent',
          personName: booking.talent_name,
          roleLabel: 'Talent',
          projectId: booking.shoot_detail?.project,
          projectName: booking.shoot_detail?.project_name,
          date: booking.shoot_detail?.shoot_date,
          shootDate: booking.shoot_detail?.shoot_date,
          location: booking.shoot_detail?.location || '—',
          notes: 'Waiting for submitted hours from the talent portal.',
        });
      });

    assignments
      .filter((assignment) => assignment.status === 'accepted')
      .filter((assignment) => hasShootWrapped(assignment.shoot_detail?.shoot_date, assignment.shoot_detail?.est_wrap_time))
      .filter((assignment) => !crewLogsByAssignment.has(assignment.id))
      .forEach((assignment) => {
        addEntry({
          id: `crew-missing-${assignment.id}`,
          kind: 'missing-log',
          workerType: 'crew',
          personName: assignment.crew_name,
          roleLabel: assignment.role_on_shoot || 'Crew',
          projectId: assignment.shoot_detail?.project,
          projectName: assignment.project_name,
          date: assignment.shoot_detail?.shoot_date,
          shootDate: assignment.shoot_detail?.shoot_date,
          location: assignment.shoot_detail?.location || '—',
          notes: 'Waiting for submitted hours from the crew portal.',
        });
      });

    return Array.from(grouped.values())
      .map((group) => ({
        ...group,
        entries: [...group.entries].sort(sortEntries),
      }))
      .sort((left, right) => left.projectName.localeCompare(right.projectName));
  }, [assignments, bookings, crewLogs, talentLogs]);

  const isLoading = bookingsLoading || assignmentsLoading || talentLogsLoading || crewLogsLoading;

  const openPayment = (entry) => {
    if (!entry.paymentId) return;
    navigate(`/production/talent-payments?tab=${entry.paymentTab}&payment=${entry.paymentId}`);
  };

  const handleApprove = (entry, event) => {
    event.stopPropagation();
    if (entry.workerType === 'talent') {
      approveTalentLog.mutate(entry.logId);
      return;
    }
    approveCrewLog.mutate(entry.logId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production Time Logs</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review submitted hours by production and move approved logs into Team Payments.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
          Loading production time logs...
        </div>
      ) : productions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-sm text-gray-400">
          No production time activity yet.
        </div>
      ) : (
        <div className="space-y-5">
          {productions.map((production) => (
            <section key={production.key} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">{production.projectName}</h2>
                    <p className="text-xs text-gray-500 mt-1">{production.entries.length} time-log item{production.entries.length === 1 ? '' : 's'}</p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {production.entries.map((entry) => {
                  const isExpanded = expandedId === entry.id;
                  return (
                    <div key={entry.id}>
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                        className="w-full px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDownIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          ) : (
                            <ChevronRightIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          )}
                          <div className="min-w-0 flex-1 grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{entry.personName}</p>
                              <p className="text-xs text-gray-500 capitalize">{String(entry.roleLabel).replace(/_/g, ' ')}</p>
                            </div>
                            <div className="text-sm text-gray-600">{entry.date || '—'}</div>
                            <div className="text-sm text-gray-600">{entry.location}</div>
                            <div className="text-sm text-gray-600">
                              {entry.hours ? `${entry.hours}h` : 'Hours not submitted'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {entry.amount ? `$${Number(entry.amount).toLocaleString()}` : '—'}
                            </div>
                            <div className="md:justify-self-end">
                              <StatusBadge status={entry.displayStatus} />
                            </div>
                          </div>
                          {entry.paymentId && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                openPayment(entry);
                              }}
                              className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-600 text-xs font-medium hover:bg-indigo-50"
                            >
                              <LinkIcon className="h-3.5 w-3.5" />
                              Team Payment
                            </button>
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-5">
                          <div className="ml-7 rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                              <DetailItem label="Shoot Date" value={entry.shootDate || '—'} />
                              <DetailItem label="Hours" value={entry.hours ? `${entry.hours}h` : 'Not submitted'} />
                              <DetailItem label="Rate" value={entry.rate ? `$${Number(entry.rate).toLocaleString()}/hr` : '—'} />
                              <DetailItem label="Amount" value={entry.amount ? `$${Number(entry.amount).toLocaleString()}` : '—'} />
                            </div>

                            <div className="text-sm text-gray-600">
                              <span className="font-medium text-gray-700">Notes:</span> {entry.notes || '—'}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {entry.kind === 'log' && entry.logStatus === 'pending' && (
                                <button
                                  type="button"
                                  onClick={(event) => handleApprove(entry, event)}
                                  disabled={approveTalentLog.isPending || approveCrewLog.isPending}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                                >
                                  Confirm Hours
                                </button>
                              )}

                              {entry.paymentId && (
                                <button
                                  type="button"
                                  onClick={() => openPayment(entry)}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                                >
                                  <LinkIcon className="h-4 w-4" />
                                  Open in Team Payments
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-700 mt-1">{value}</p>
    </div>
  );
}
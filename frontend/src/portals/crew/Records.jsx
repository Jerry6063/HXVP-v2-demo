import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  useCreateCrewTimeLog,
  useCrewAssignments,
  useCrewTimeLogs,
  useMyCrewProfile,
} from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  CalendarDaysIcon,
  ClockIcon,
  ClipboardDocumentListIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

export default function CrewRecords() {
  const [searchParams] = useSearchParams();
  const targetAssignmentId = searchParams.get('assignment') || '';
  const [openFormId, setOpenFormId] = useState(null);
  const [drafts, setDrafts] = useState({});
  const { data: assignmentsData, isLoading: assignmentsLoading } = useCrewAssignments();
  const { data: timeLogsData, isLoading: timeLogsLoading } = useCrewTimeLogs();
  const { data: profile } = useMyCrewProfile();
  const createTimeLog = useCreateCrewTimeLog();

  const assignments = assignmentsData?.results || assignmentsData || [];
  const timeLogs = timeLogsData?.results || timeLogsData || [];

  const acceptedAssignments = useMemo(
    () => assignments.filter((assignment) => assignment.status === 'accepted'),
    [assignments]
  );

  const assignmentCards = useMemo(
    () =>
      acceptedAssignments.map((assignment) => ({
        assignment,
        shoot: assignment.shoot_detail,
        hasWrapped: hasShootWrapped(assignment.shoot_detail),
        logs: timeLogs.filter((log) => String(log.assignment) === String(assignment.id)),
      })),
    [acceptedAssignments, timeLogs]
  );

  const eligibleAssignments = assignmentCards.filter((item) => item.hasWrapped);
  const upcomingAssignments = assignmentCards.filter((item) => !item.hasWrapped);

  useEffect(() => {
    if (!targetAssignmentId) {
      return;
    }

    const targetAssignment = eligibleAssignments.find(
      (item) => String(item.assignment.id) === String(targetAssignmentId)
    );

    if (targetAssignment) {
      setOpenFormId(String(targetAssignment.assignment.id));
    }
  }, [eligibleAssignments, targetAssignmentId]);

  const handleDraftChange = (assignmentId, key, value) => {
    setDrafts((current) => ({
      ...current,
      [assignmentId]: {
        ...(current[assignmentId] || { hours: '', notes: '' }),
        [key]: value,
      },
    }));
  };

  const handleSubmit = async (assignmentId) => {
    const draft = drafts[assignmentId] || {};

    await createTimeLog.mutateAsync({
      assignment: assignmentId,
      hours_worked: Number(draft.hours),
      notes: draft.notes || '',
    });

    setDrafts((current) => ({
      ...current,
      [assignmentId]: { hours: '', notes: '' },
    }));
    setOpenFormId(null);
  };

  if (assignmentsLoading || timeLogsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Records</h1>
        <p className="text-sm text-gray-500 max-w-3xl">
          Submit production hours from Records once an assignment wraps. Approved logs will move into Payments after production review.
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Production Time Logs</h2>
            <p className="mt-1 text-sm text-gray-500">
              Use Records as the single submission point for your wrapped assignments and keep the full submission history visible here.
            </p>
          </div>
          <Link
            to="/crew/payments"
            className="inline-flex items-center justify-center rounded-lg border border-sky-200 px-4 py-2 text-sm font-medium text-sky-700 hover:bg-sky-50"
          >
            View Payments
          </Link>
        </div>

        {eligibleAssignments.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
            No wrapped accepted assignments are ready for time log submission yet.
          </div>
        ) : (
          <div className="space-y-4">
            {eligibleAssignments.map(({ assignment, shoot, logs }) => {
              const draft = drafts[assignment.id] || { hours: '', notes: '' };
              const highlight = String(assignment.id) === String(targetAssignmentId);
              const rate = Number(profile?.hourly_rate);
              const hours = Number(draft.hours);
              const estimatedAmount =
                Number.isFinite(rate) && Number.isFinite(hours) && hours > 0
                  ? (rate * hours).toFixed(2)
                  : null;

              return (
                <div
                  key={assignment.id}
                  className={`rounded-xl border bg-white p-5 shadow-sm ${
                    highlight ? 'border-sky-300 ring-2 ring-sky-100' : 'border-gray-100'
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-gray-900">
                          {assignment.project_name || shoot?.location || 'Assignment'}
                        </h3>
                        <StatusBadge status={assignment.status} />
                      </div>
                      <p className="text-sm text-gray-500 capitalize">
                        Role: {assignment.role_on_shoot?.replace(/_/g, ' ') || 'Crew'}
                      </p>
                      <div className="grid gap-2 text-sm text-gray-500 md:grid-cols-3">
                        <RecordMeta icon={CalendarDaysIcon} value={formatDate(shoot?.shoot_date)} />
                        <RecordMeta icon={ClockIcon} value={`Wrap ${shoot?.est_wrap_time || 'TBD'}`} />
                        <RecordMeta icon={MapPinIcon} value={shoot?.location || 'Location TBD'} />
                      </div>
                      <p className="text-xs text-gray-500">
                        {logs.length > 0
                          ? `${logs.length} time log${logs.length > 1 ? 's' : ''} submitted for this assignment.`
                          : 'No time logs submitted for this assignment yet.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to="/crew/assignments"
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                      >
                        View Assignments
                      </Link>
                      {openFormId === String(assignment.id) ? (
                        <button
                          type="button"
                          onClick={() => setOpenFormId(null)}
                          className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
                        >
                          Close Form
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setOpenFormId(String(assignment.id))}
                          className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700"
                        >
                          Log Time
                        </button>
                      )}
                    </div>
                  </div>

                  {openFormId === String(assignment.id) && (
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        handleSubmit(assignment.id);
                      }}
                      className="mt-5 space-y-3 rounded-lg bg-sky-50 p-4"
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs text-gray-500">Hours Worked</label>
                          <input
                            type="number"
                            step="0.25"
                            min="0.25"
                            value={draft.hours}
                            onChange={(event) =>
                              handleDraftChange(assignment.id, 'hours', event.target.value)
                            }
                            required
                            className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                            placeholder="e.g. 10"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-gray-500">Your Rate</label>
                          <div className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm text-gray-600">
                            ${profile?.hourly_rate || '—'}/hr
                            {estimatedAmount ? (
                              <span className="ml-2 text-gray-400">(est. ${estimatedAmount})</span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-500">Notes (optional)</label>
                        <input
                          type="text"
                          value={draft.notes}
                          onChange={(event) =>
                            handleDraftChange(assignment.id, 'notes', event.target.value)
                          }
                          className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                          placeholder="e.g. Overtime, extra setup, gear wrap"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="submit"
                          disabled={createTimeLog.isPending}
                          className="rounded-lg bg-sky-600 px-5 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
                        >
                          {createTimeLog.isPending ? 'Submitting...' : 'Submit Time Log'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setOpenFormId(null)}
                          className="rounded-lg bg-white px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-500">
                        Submitted logs stay here while production reviews them, then approved entries appear in Payments.
                      </p>
                    </form>
                  )}

                  {logs.length > 0 && (
                    <div className="mt-5 overflow-hidden rounded-lg border border-gray-100">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                            <th className="px-4 py-2">Date</th>
                            <th className="px-4 py-2">Hours</th>
                            <th className="px-4 py-2">Rate</th>
                            <th className="px-4 py-2">Amount</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {logs.map((log) => (
                            <tr key={log.id}>
                              <td className="px-4 py-2 text-gray-700">{formatDate(log.date)}</td>
                              <td className="px-4 py-2 text-gray-700">{log.hours_worked}h</td>
                              <td className="px-4 py-2 text-gray-500">
                                ${Number(log.rate_applied).toLocaleString()}/hr
                              </td>
                              <td className="px-4 py-2 font-medium text-gray-900">
                                ${Number(log.amount).toLocaleString()}
                              </td>
                              <td className="px-4 py-2">
                                <StatusBadge status={log.log_status} />
                              </td>
                              <td className="px-4 py-2 text-xs text-gray-400">{log.notes || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {upcomingAssignments.length > 0 && (
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Upcoming or Still Wrapping</h3>
                <p className="mt-1 text-sm text-gray-500">
                  These accepted assignments will unlock for time log submission here after the shoot wraps.
                </p>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                {upcomingAssignments.length} assignment{upcomingAssignments.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {upcomingAssignments.map(({ assignment, shoot }) => (
                <div
                  key={assignment.id}
                  className={`rounded-lg border px-4 py-3 ${
                    String(assignment.id) === String(targetAssignmentId)
                      ? 'border-sky-300 bg-sky-50'
                      : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {assignment.project_name || shoot?.location || 'Assignment'}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                        <span>{formatDate(shoot?.shoot_date)}</span>
                        <span>{shoot?.est_wrap_time ? `Wrap ${shoot.est_wrap_time}` : 'Wrap time TBD'}</span>
                        <span>{shoot?.location || 'Location TBD'}</span>
                      </div>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-500">
                      Open after wrap
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {acceptedAssignments.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center text-sm text-gray-400">
            Once you accept assignments, this Records page will list them here for time-log submission and history.
          </div>
        )}
      </section>
    </div>
  );
}

function RecordMeta({ icon: Icon, value }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-4 w-4 text-gray-400" />
      <span>{value}</span>
    </div>
  );
}

function hasShootWrapped(shoot) {
  if (!shoot?.shoot_date) {
    return false;
  }

  const now = new Date();

  if (shoot.est_wrap_time) {
    const wrapDateTime = new Date(`${shoot.shoot_date}T${shoot.est_wrap_time}`);
    return now > wrapDateTime;
  }

  return shoot.shoot_date < now.toISOString().split('T')[0];
}

function formatDate(value) {
  if (!value) {
    return 'TBD';
  }

  return new Date(value).toLocaleDateString();
}
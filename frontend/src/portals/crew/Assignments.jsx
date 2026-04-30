import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  useCrewAssignments,
  useCrewAvailabilityInquiries,
  useAcceptAssignment,
  useCreateCrewTimeLog,
  useDeclineAssignment,
  useCrewTimeLogs,
  useMyCrewProfile,
  useRespondCrewAvailabilityInquiry,
} from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  CheckIcon,
  XMarkIcon,
  MapPinIcon,
  ClockIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';

export default function CrewAssignments() {
  const [tab, setTab] = useState('pending');
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: allData, isLoading: isAssignmentsLoading } = useCrewAssignments();
  const { data: inquiriesData, isLoading: isInquiriesLoading } = useCrewAvailabilityInquiries();
  const { data: crewTimeLogsData, isLoading: isTimeLogsLoading } = useCrewTimeLogs();
  const { data: profile } = useMyCrewProfile();
  const acceptAssignment = useAcceptAssignment();
  const declineAssignment = useDeclineAssignment();
  const createCrewTimeLog = useCreateCrewTimeLog();
  const acceptInquiry = useRespondCrewAvailabilityInquiry('accept');
  const declineInquiry = useRespondCrewAvailabilityInquiry('decline');
  const [openLogFormId, setOpenLogFormId] = useState(null);
  const [logDrafts, setLogDrafts] = useState({});

  const allAssignments = useMemo(() => allData?.results || allData || [], [allData]);
  const inquiries = useMemo(() => inquiriesData?.results || inquiriesData || [], [inquiriesData]);
  const crewTimeLogs = useMemo(() => crewTimeLogsData?.results || crewTimeLogsData || [], [crewTimeLogsData]);
  const inquiryId = Number(searchParams.get('inquiry')) || null;
  const inquiryToken = searchParams.get('token') || '';
  const inquiryAction = searchParams.get('action') || '';

  const today = new Date().toISOString().split('T')[0];
  const pending = allAssignments.filter((a) => a.status === 'pending');
  const upcoming = allAssignments.filter(
    (a) => a.status === 'accepted' && a.shoot_detail?.shoot_date >= today
  );
  const past = allAssignments.filter(
    (a) => a.status === 'accepted' && a.shoot_detail?.shoot_date < today
  );
  const declined = allAssignments.filter((a) => a.status === 'declined');
  const pendingInquiries = useMemo(
    () => inquiries.filter((inquiry) => inquiry.inquiry_status === 'pending'),
    [inquiries]
  );
  const respondedInquiries = useMemo(
    () => inquiries.filter((inquiry) => inquiry.inquiry_status !== 'pending'),
    [inquiries]
  );

  const tabs = [
    { id: 'pending', label: 'Pending', count: pending.length },
    { id: 'upcoming', label: 'Upcoming', count: upcoming.length },
    { id: 'past', label: 'Past', count: past.length },
    { id: 'declined', label: 'Declined', count: declined.length },
  ];

  const activeList =
    tab === 'pending' ? pending : tab === 'upcoming' ? upcoming : tab === 'past' ? past : declined;

  const isLoading = isAssignmentsLoading || isInquiriesLoading || isTimeLogsLoading;

  const updateLogDraft = (assignmentId, key, value) => {
    setLogDrafts((current) => ({
      ...current,
      [assignmentId]: {
        ...(current[assignmentId] || { hours: '', notes: '' }),
        [key]: value,
      },
    }));
  };

  const handleSubmitTimeLog = async (assignmentId) => {
    const draft = logDrafts[assignmentId] || {};
    await createCrewTimeLog.mutateAsync({
      assignment: assignmentId,
      hours_worked: Number(draft.hours),
      notes: draft.notes || '',
    });
    setLogDrafts((current) => ({
      ...current,
      [assignmentId]: { hours: '', notes: '' },
    }));
    setOpenLogFormId(null);
  };

  const clearInquiryParams = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('inquiry');
    nextParams.delete('token');
    nextParams.delete('action');
    setSearchParams(nextParams, { replace: true });
  };

  const handleInquiryResponse = async (inquiry, action) => {
    try {
      const token = inquiry.id === inquiryId && inquiryAction === action ? inquiryToken : undefined;
      const payload = { id: inquiry.id, token };
      if (action === 'accept') {
        await acceptInquiry.mutateAsync(payload);
      } else {
        await declineInquiry.mutateAsync(payload);
      }
      if (token) clearInquiryParams();
      toast.success(`Availability inquiry ${action === 'accept' ? 'accepted' : 'declined'}.`);
    } catch (err) {
      toast.error(err.response?.data?.detail || `Failed to ${action} inquiry.`);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Project Assignments</h1>

      {(pendingInquiries.length > 0 || respondedInquiries.length > 0) && (
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold text-sky-800 mb-3">
              Availability Inquiries ({pendingInquiries.length + respondedInquiries.length})
            </h2>
            <p className="text-sm text-gray-500 mb-3">
              These confirm project-level availability only. Actual shoot assignments are still scheduled separately.
            </p>
          </div>

          {pendingInquiries.length > 0 && (
            <div className="space-y-3">
              {pendingInquiries.map((inquiry) => {
                const isHighlighted = inquiry.id === inquiryId;
                const isAcceptLink = isHighlighted && inquiryAction === 'accept';
                const isDeclineLink = isHighlighted && inquiryAction === 'decline';

                return (
                  <div
                    key={inquiry.id}
                    className={`rounded-xl border bg-white p-5 ${isHighlighted ? 'border-amber-300 ring-2 ring-amber-100' : 'border-gray-100 shadow-sm'}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{inquiry.project_name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{inquiry.inquiry_position || 'Position TBD'}</p>
                      </div>
                      <StatusBadge status={inquiry.inquiry_status} />
                    </div>

                    {isHighlighted && (
                      <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                        Review this inquiry and confirm your {inquiryAction || 'response'} below.
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-sm">
                      <InquiryField label="Pay Rate" value={formatInquiryRate(inquiry.inquiry_pay_rate)} />
                      <InquiryField label="Production Dates" value={formatInquiryWindow(inquiry.inquiry_production_start_date, inquiry.inquiry_production_end_date)} />
                      <InquiryField label="Sent" value={inquiry.inquiry_sent_at ? inquiry.inquiry_sent_at.split('T')[0] : 'Just now'} />
                    </div>

                    {inquiry.notes && (
                      <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
                        <span className="font-medium">Production Notes:</span> {inquiry.notes}
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleInquiryResponse(inquiry, 'accept')}
                        disabled={acceptInquiry.isPending || declineInquiry.isPending}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        <CheckIcon className="h-3.5 w-3.5" /> {isAcceptLink ? 'Confirm Accept' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleInquiryResponse(inquiry, 'decline')}
                        disabled={acceptInquiry.isPending || declineInquiry.isPending}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 disabled:opacity-50"
                      >
                        <XMarkIcon className="h-3.5 w-3.5" /> {isDeclineLink ? 'Confirm Decline' : 'Decline'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {respondedInquiries.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-600 mb-3">Inquiry History</h3>
              <div className="space-y-3">
                {respondedInquiries.map((inquiry) => (
                  <div key={inquiry.id} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{inquiry.project_name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{inquiry.inquiry_position || 'Position TBD'}</p>
                      </div>
                      <StatusBadge status={inquiry.inquiry_status} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm">
                      <InquiryField label="Pay Rate" value={formatInquiryRate(inquiry.inquiry_pay_rate)} />
                      <InquiryField label="Production Dates" value={formatInquiryWindow(inquiry.inquiry_production_start_date, inquiry.inquiry_production_end_date)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tabs.map((t) => (
          <div
            key={t.id}
            className={`rounded-xl p-4 cursor-pointer transition ${
              tab === t.id ? 'bg-sky-100 ring-2 ring-sky-400' : 'bg-white shadow hover:shadow-md'
            }`}
            onClick={() => setTab(t.id)}
          >
            <p className="text-xs text-gray-500">{t.label}</p>
            <p className="text-2xl font-bold mt-1">{t.count}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              tab === t.id
                ? 'bg-white shadow text-sky-700'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Assignment Cards */}
      {activeList.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
          No {tab} assignments
        </div>
      ) : (
        <div className="space-y-4">
          {activeList.map((a) => {
            const s = a.shoot_detail;
            const logs = crewTimeLogs.filter((log) => String(log.assignment) === String(a.id));
            const draft = logDrafts[a.id] || { hours: '', notes: '' };
            const showTimeLogSection = tab === 'past' && a.status === 'accepted';
            return (
              <div key={a.id} className="bg-white rounded-xl shadow p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {a.project_name || s?.location}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize mt-0.5">
                      Role: {a.role_on_shoot?.replace(/_/g, ' ') || '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={a.status} />
                    {a.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptAssignment.mutate(a.id)}
                          disabled={acceptAssignment.isPending}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                        >
                          <CheckIcon className="h-3.5 w-3.5" /> Accept
                        </button>
                        <button
                          onClick={() => declineAssignment.mutate(a.id)}
                          disabled={declineAssignment.isPending}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 disabled:opacity-50"
                        >
                          <XMarkIcon className="h-3.5 w-3.5" /> Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Call Sheet Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <DetailItem icon={MapPinIcon} label="Location" value={s?.location} />
                  <DetailItem icon={MapPinIcon} label="Address" value={s?.address || '—'} />
                  <DetailItem icon={ClockIcon} label="Date" value={s?.shoot_date} />
                  <DetailItem icon={ClockIcon} label="Call Time" value={s?.call_time} />
                  <DetailItem icon={ClockIcon} label="Est. Wrap" value={s?.est_wrap_time || 'TBD'} />
                  <DetailItem icon={CameraIcon} label="Wardrobe" value={s?.wardrobe_instructions || '—'} />
                  <DetailItem icon={CameraIcon} label="Hair & Makeup" value={s?.hair_makeup_notes || '—'} />
                </div>

                {a.special_instructions && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-lg text-xs text-amber-800">
                    <span className="font-medium">Special Instructions:</span> {a.special_instructions}
                  </div>
                )}

                {s?.comments && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                    <span className="font-medium">Notes:</span> {s.comments}
                  </div>
                )}

                {showTimeLogSection && (
                  <div className="mt-5 border-t border-gray-100 pt-5 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">Time Logs</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Submit your worked hours for this assignment. Production will review them before payment.
                        </p>
                      </div>
                      {openLogFormId !== a.id && (
                        <button
                          onClick={() => setOpenLogFormId(a.id)}
                          className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700"
                        >
                          + Log Time
                        </button>
                      )}
                    </div>

                    {openLogFormId === a.id && (
                      <form
                        onSubmit={(event) => {
                          event.preventDefault();
                          handleSubmitTimeLog(a.id);
                        }}
                        className="p-4 bg-sky-50 rounded-lg space-y-3"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Hours Worked</label>
                            <input
                              type="number"
                              step="0.25"
                              min="0.25"
                              value={draft.hours}
                              onChange={(event) => updateLogDraft(a.id, 'hours', event.target.value)}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                              placeholder="e.g. 10"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Your Rate</label>
                            <div className="px-3 py-2 bg-white border border-sky-100 rounded-lg text-sm text-gray-600">
                              ${profile?.hourly_rate || '—'}/hr
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Notes (optional)</label>
                          <input
                            type="text"
                            value={draft.notes}
                            onChange={(event) => updateLogDraft(a.id, 'notes', event.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                            placeholder="e.g. Overtime, extra setup, gear wrap"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={createCrewTimeLog.isPending}
                            className="px-5 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 disabled:opacity-50"
                          >
                            {createCrewTimeLog.isPending ? 'Submitting...' : 'Submit Time Log'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setOpenLogFormId(null)}
                            className="px-5 py-2 bg-white text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {logs.length === 0 ? (
                      <div className="text-sm text-gray-400">No time logs submitted yet.</div>
                    ) : (
                      <div className="overflow-hidden rounded-lg border border-gray-100">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-xs text-gray-500 uppercase bg-gray-50">
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
                                <td className="px-4 py-2 text-gray-700">{log.date}</td>
                                <td className="px-4 py-2 text-gray-700">{log.hours_worked}h</td>
                                <td className="px-4 py-2 text-gray-500">${Number(log.rate_applied).toLocaleString()}/hr</td>
                                <td className="px-4 py-2 font-medium text-gray-900">${Number(log.amount).toLocaleString()}</td>
                                <td className="px-4 py-2"><StatusBadge status={log.log_status} /></td>
                                <td className="px-4 py-2 text-gray-400 text-xs">{log.notes || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatInquiryRate(value) {
  if (value == null || value === '') return 'Rate TBD';
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return `$${value}`;
  return `$${numericValue.toFixed(2)}`;
}

function formatInquiryWindow(startDate, endDate) {
  if (!startDate && !endDate) return 'Dates TBD';
  if (startDate && endDate) return `${startDate} to ${endDate}`;
  return startDate || endDate;
}

function InquiryField({ label, value }) {
  return (
    <div className="flex items-start gap-2">
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-gray-700">{value}</p>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }) {
  const Icon = icon;
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-gray-700">{value}</p>
      </div>
    </div>
  );
}

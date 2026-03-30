import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useBooking,
  useAcceptBooking,
  useDeclineBooking,
  useTalentTimeLogs,
  useCreateTalentTimeLog,
  useMe,
} from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  ArrowLeftIcon,
  MapPinIcon,
  ClockIcon,
  CameraIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function BookingDetail() {
  const { id } = useParams();
  const { data: booking, isLoading } = useBooking(id);
  const { data: meData } = useMe();
  const { data: logsData, isLoading: logsLoading } = useTalentTimeLogs({ booking: id });
  const createLog = useCreateTalentTimeLog();
  const acceptBooking = useAcceptBooking();
  const declineBooking = useDeclineBooking();

  const [showLogForm, setShowLogForm] = useState(false);
  const [hours, setHours] = useState('');
  const [notes, setNotes] = useState('');

  if (isLoading) return <LoadingSpinner />;
  if (!booking) return <div className="text-center py-12 text-gray-400">Booking not found</div>;

  const s = booking.shoot_detail;
  const logs = logsData?.results || logsData || [];

  // Determine if the shoot has wrapped
  const now = new Date();
  let hasWrapped = false;
  if (s?.shoot_date) {
    if (s.est_wrap_time) {
      const wrapDT = new Date(`${s.shoot_date}T${s.est_wrap_time}`);
      hasWrapped = now > wrapDT;
    } else {
      // No wrap time — consider wrapped if shoot date is in the past
      hasWrapped = s.shoot_date < now.toISOString().split('T')[0];
    }
  }

  const canLogTime = booking.status === 'accepted' && hasWrapped;

  const handleSubmitLog = async (e) => {
    e.preventDefault();
    await createLog.mutateAsync({
      booking: booking.id,
      hours_worked: parseFloat(hours),
      notes,
    });
    setHours('');
    setNotes('');
    setShowLogForm(false);
  };

  const talentRate = meData?.talent_profile?.hourly_rate;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link to="/talent/bookings" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeftIcon className="h-4 w-4" /> Back to Bookings
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{s?.location || 'Shoot'}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {s?.project_name || 'Project'} &middot; {s?.shoot_date}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={booking.status} />
            {booking.status === 'pending' && (
              <>
                <button
                  onClick={() => acceptBooking.mutate(booking.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700"
                >
                  <CheckIcon className="h-3.5 w-3.5" /> Accept
                </button>
                <button
                  onClick={() => declineBooking.mutate(booking.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200"
                >
                  <XMarkIcon className="h-3.5 w-3.5" /> Decline
                </button>
              </>
            )}
          </div>
        </div>

        {/* Shoot details grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <DetailItem icon={MapPinIcon} label="Location" value={s?.location} />
          <DetailItem icon={MapPinIcon} label="Address" value={s?.address || '—'} />
          <DetailItem icon={ClockIcon} label="Call Time" value={s?.call_time} />
          <DetailItem icon={ClockIcon} label="Est. Wrap" value={s?.est_wrap_time || 'TBD'} />
          <DetailItem icon={CameraIcon} label="Hair & Makeup" value={s?.hair_makeup_notes || '—'} />
          <DetailItem icon={CameraIcon} label="Wardrobe" value={s?.wardrobe_instructions || '—'} />
        </div>

        {booking.attire_requirements && (
          <div className="mt-4 p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
            <span className="font-medium">Attire Requirements:</span> {booking.attire_requirements}
          </div>
        )}
        {booking.special_instructions && (
          <div className="mt-2 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            <span className="font-medium">Special Instructions:</span> {booking.special_instructions}
          </div>
        )}
        {s?.comments && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
            <span className="font-medium">Notes:</span> {s.comments}
          </div>
        )}
      </div>

      {/* Time Logging Section */}
      {booking.status === 'accepted' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Time Logs</h2>
            {canLogTime && !showLogForm && (
              <button
                onClick={() => setShowLogForm(true)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
              >
                + Log Time
              </button>
            )}
            {!canLogTime && (
              <span className="text-xs text-gray-400">
                Time logging available after the shoot wraps
              </span>
            )}
          </div>

          {/* Log Time Form */}
          {showLogForm && (
            <form onSubmit={handleSubmitLog} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Hours Worked</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0.25"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="e.g. 8"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Your Rate</label>
                  <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600">
                    ${talentRate || '—'}/hr
                    {talentRate && hours ? (
                      <span className="ml-2 text-gray-400">
                        (est. ${(parseFloat(hours) * parseFloat(talentRate)).toFixed(2)})
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Notes (optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  placeholder="e.g. Extended shoot, overtime"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={createLog.isPending}
                  className="px-5 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50"
                >
                  {createLog.isPending ? 'Submitting...' : 'Submit Time Log'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogForm(false)}
                  className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
              <p className="text-[11px] text-gray-400">
                Your time log will be submitted for admin review before processing.
              </p>
            </form>
          )}

          {/* Existing logs table */}
          {logsLoading ? (
            <div className="text-gray-400 py-4 text-center text-sm">Loading...</div>
          ) : logs.length === 0 ? (
            <div className="text-gray-400 py-6 text-center text-sm">No time logs yet</div>
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
}

function DetailItem({ icon: Icon, label, value }) {
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

import { useParams, Link } from 'react-router-dom';
import {
  useBooking,
  useAcceptBooking,
  useDeclineBooking,
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
  const acceptBooking = useAcceptBooking();
  const declineBooking = useDeclineBooking();

  if (isLoading) return <LoadingSpinner />;
  if (!booking) return <div className="text-center py-12 text-gray-400">Booking not found</div>;

  const s = booking.shoot_detail;

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
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Production Time Logs</h2>
              <p className="mt-1 text-sm text-gray-500">
                Time log submission now lives in Records so your submissions and payment status stay in one place.
              </p>
              <p className="mt-2 text-xs text-gray-400">
                {canLogTime
                  ? 'This booking is ready for time log submission.'
                  : 'Time log submission opens in Records after the shoot wraps.'}
              </p>
            </div>
            <Link
              to={`/talent/records?booking=${booking.id}`}
              className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
            >
              Open Records
            </Link>
          </div>
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

import {
  useBookings,
  useAcceptBooking,
  useDeclineBooking,
} from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';
import {
  CheckIcon,
  XMarkIcon,
  MapPinIcon,
  ClockIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';

export default function TalentBookings() {
  const { data: bookingsData, isLoading } = useBookings();
  const acceptBooking = useAcceptBooking();
  const declineBooking = useDeclineBooking();

  const bookings = bookingsData?.results || bookingsData || [];
  const pending = bookings.filter((b) => b.status === 'pending');
  const accepted = bookings.filter((b) => b.status === 'accepted');
  const past = bookings.filter((b) => b.status === 'declined');

  if (isLoading) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>

      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <h2 className="font-semibold text-amber-800 mb-3">
            Pending ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                onAccept={() => acceptBooking.mutate(b.id)}
                onDecline={() => declineBooking.mutate(b.id)}
                showActions
              />
            ))}
          </div>
        </div>
      )}

      {/* Accepted / Upcoming */}
      <div>
        <h2 className="font-semibold text-gray-800 mb-3">
          Upcoming Bookings ({accepted.length})
        </h2>
        {accepted.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">
            No upcoming bookings
          </div>
        ) : (
          <div className="space-y-3">
            {accepted.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </div>

      {/* Past / Declined */}
      {past.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-500 mb-3">
            Declined ({past.length})
          </h2>
          <div className="space-y-3">
            {past.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking, onAccept, onDecline, showActions }) {
  const s = booking.shoot_detail;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{s?.location}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {s?.project_name || 'Project'} &middot; {s?.shoot_date}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={booking.status} />
          {showActions && (
            <>
              <button
                onClick={onAccept}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700"
              >
                <CheckIcon className="h-3.5 w-3.5" /> Accept
              </button>
              <button
                onClick={onDecline}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200"
              >
                <XMarkIcon className="h-3.5 w-3.5" /> Decline
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <CallSheetItem icon={MapPinIcon} label="Location" value={s?.location} />
        <CallSheetItem icon={MapPinIcon} label="Address" value={s?.address || '—'} />
        <CallSheetItem icon={ClockIcon} label="Call Time" value={s?.call_time} />
        <CallSheetItem icon={ClockIcon} label="Est. Wrap" value={s?.est_wrap_time || 'TBD'} />
        <CallSheetItem icon={CameraIcon} label="Hair & Makeup" value={s?.hair_makeup_notes || '—'} />
        <CallSheetItem icon={CameraIcon} label="Wardrobe" value={s?.wardrobe_instructions || '—'} />
      </div>

      {booking.attire_requirements && (
        <div className="mt-3 p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
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
  );
}

function CallSheetItem({ icon: Icon, label, value }) {
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

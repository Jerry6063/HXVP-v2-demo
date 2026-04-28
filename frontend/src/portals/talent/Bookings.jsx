import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  useBookings,
  useTalentAvailabilityInquiries,
  useAcceptBooking,
  useDeclineBooking,
  useRespondTalentAvailabilityInquiry,
} from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';
import {
  CheckIcon,
  XMarkIcon,
  MapPinIcon,
  ClockIcon,
  CameraIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

export default function TalentBookings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: bookingsData, isLoading: isBookingsLoading } = useBookings();
  const { data: inquiriesData, isLoading: isInquiriesLoading } = useTalentAvailabilityInquiries();
  const acceptBooking = useAcceptBooking();
  const declineBooking = useDeclineBooking();
  const acceptInquiry = useRespondTalentAvailabilityInquiry('accept');
  const declineInquiry = useRespondTalentAvailabilityInquiry('decline');

  const bookings = useMemo(() => bookingsData?.results || bookingsData || [], [bookingsData]);
  const inquiries = useMemo(() => inquiriesData?.results || inquiriesData || [], [inquiriesData]);
  const inquiryId = Number(searchParams.get('inquiry')) || null;
  const inquiryToken = searchParams.get('token') || '';
  const inquiryAction = searchParams.get('action') || '';

  const todayStr = new Date().toISOString().split('T')[0];

  const { pending, upcoming, pastBookings, declined } = useMemo(() => {
    const pending = [];
    const upcoming = [];
    const pastBookings = [];
    const declined = [];
    bookings.forEach((b) => {
      if (b.status === 'pending') {
        pending.push(b);
      } else if (b.status === 'declined') {
        declined.push(b);
      } else if (b.status === 'accepted') {
        const shootDate = b.shoot_detail?.shoot_date;
        if (shootDate && shootDate < todayStr) {
          pastBookings.push(b);
        } else {
          upcoming.push(b);
        }
      }
    });
    return { pending, upcoming, pastBookings, declined };
  }, [bookings, todayStr]);

  const { pendingInquiries, respondedInquiries } = useMemo(() => {
    const pendingInquiries = [];
    const respondedInquiries = [];
    inquiries.forEach((inquiry) => {
      if (inquiry.inquiry_status === 'pending') {
        pendingInquiries.push(inquiry);
      } else {
        respondedInquiries.push(inquiry);
      }
    });
    return { pendingInquiries, respondedInquiries };
  }, [inquiries]);

  const isLoading = isBookingsLoading || isInquiriesLoading;

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

  if (isLoading) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>

      {(pendingInquiries.length > 0 || respondedInquiries.length > 0) && (
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold text-indigo-800 mb-3">
              Availability Inquiries ({pendingInquiries.length + respondedInquiries.length})
            </h2>
            <p className="text-sm text-gray-500 mb-3">
              These confirm project-level availability only. Shoot-level bookings are still scheduled separately.
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

      {/* Upcoming */}
      <div>
        <h2 className="font-semibold text-gray-800 mb-3">
          Upcoming Bookings ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">
            No upcoming bookings
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </div>

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-500 mb-3">
            Past Bookings ({pastBookings.length})
          </h2>
          <div className="space-y-3">
            {pastBookings.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        </div>
      )}

      {/* Declined */}
      {declined.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-400 mb-3">
            Declined ({declined.length})
          </h2>
          <div className="space-y-3">
            {declined.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
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
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm text-gray-700">{value}</p>
    </div>
  );
}

function BookingCard({ booking, onAccept, onDecline, showActions }) {
  const s = booking.shoot_detail;

  const card = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:border-gray-300 transition-colors">
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
                onClick={(e) => { e.preventDefault(); onAccept(); }}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700"
              >
                <CheckIcon className="h-3.5 w-3.5" /> Accept
              </button>
              <button
                onClick={(e) => { e.preventDefault(); onDecline(); }}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200"
              >
                <XMarkIcon className="h-3.5 w-3.5" /> Decline
              </button>
            </>
          )}
          <ChevronRightIcon className="h-4 w-4 text-gray-300" />
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

  return (
    <Link to={`/talent/bookings/${booking.id}`} className="block">
      {card}
    </Link>
  );
}

function CallSheetItem({ icon, label, value }) {
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

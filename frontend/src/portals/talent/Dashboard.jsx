import { useBookings, useAcceptBooking, useDeclineBooking, useContracts, useEarnings, useTalentProfiles } from '../../api/hooks';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import {
  CheckIcon,
  XMarkIcon,
  MapPinIcon,
  ClockIcon,
  CameraIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export default function TalentDashboard() {
  const { user } = useAuth();
  const { data: bookings } = useBookings();
  const { data: contracts } = useContracts();
  const { data: earnings } = useEarnings();
  const { data: profilesData } = useTalentProfiles();
  const acceptBooking = useAcceptBooking();
  const declineBooking = useDeclineBooking();

  const profiles = profilesData?.results || profilesData || [];
  const profile = profiles.find((p) => p.user?.id === user?.id);
  const missingHeadshot = profile && !profile.primary_photo;

  const bookingList = bookings?.results || bookings || [];
  const contractList = contracts?.results || contracts || [];
  const earningList = earnings?.results || earnings || [];

  const pending = bookingList.filter((b) => b.status === 'pending');
  const accepted = bookingList.filter((b) => b.status === 'accepted');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Talent Dashboard</h1>

      {/* Headshot missing banner */}
      {missingHeadshot && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl p-4">
          <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900">Headshot required</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Upload a headshot to complete your profile and submit it for review.
            </p>
          </div>
          <Link
            to="/talent/profile"
            className="flex-shrink-0 px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-700 transition-colors"
          >
            Upload Now
          </Link>
        </div>
      )}

      {/* Pending Bookings */}
      {pending.length > 0 && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
          <h2 className="font-semibold text-amber-900 mb-3">
            Pending Bookings ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-lg border border-amber-100 p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {b.shoot_detail?.location}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {b.shoot_detail?.shoot_date} &middot; {b.shoot_detail?.call_time}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptBooking.mutate(b.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700"
                  >
                    <CheckIcon className="h-3.5 w-3.5" /> Accept
                  </button>
                  <button
                    onClick={() => declineBooking.mutate(b.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200"
                  >
                    <XMarkIcon className="h-3.5 w-3.5" /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Call Sheets */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-semibold text-gray-900">Upcoming Call Sheets</h2>
          {accepted.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-sm text-gray-400">
              No upcoming bookings
            </div>
          ) : (
            accepted.map((b) => {
              const s = b.shoot_detail;
              return (
                <div key={b.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">
                      {s?.location}
                    </h3>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <CallSheetItem icon={MapPinIcon} label="Location" value={s?.location} />
                    <CallSheetItem icon={MapPinIcon} label="Address" value={s?.address || '—'} />
                    <CallSheetItem icon={ClockIcon} label="Call Time" value={s?.call_time} />
                    <CallSheetItem icon={ClockIcon} label="Est. Wrap" value={s?.est_wrap_time || 'TBD'} />
                    <CallSheetItem icon={CameraIcon} label="Hair & Makeup" value={s?.hair_makeup_notes || '—'} />
                    <CallSheetItem icon={CameraIcon} label="Wardrobe" value={s?.wardrobe_instructions || '—'} />
                  </div>
                  {s?.comments && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                      <span className="font-medium">Notes:</span> {s.comments}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Contracts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm">Contracts & Agreements</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {contractList.length === 0 ? (
                <p className="p-4 text-xs text-gray-400">No contracts</p>
              ) : (
                contractList.map((c) => (
                  <Link key={c.id} to="/talent/documents" className="block px-5 py-3 hover:bg-gray-50 transition-colors">
                    <p className="text-sm font-medium text-gray-700">{c.title || c.contract_type}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-400">{c.project_name}</p>
                      <StatusBadge status={c.status} />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Earnings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm">Earnings</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {earningList.length === 0 ? (
                <p className="p-4 text-xs text-gray-400">No earnings recorded</p>
              ) : (
                earningList.map((e) => (
                  <div key={e.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        ${Number(e.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">{e.project_name} &middot; {e.date}</p>
                    </div>
                    <StatusBadge status={e.status} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
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

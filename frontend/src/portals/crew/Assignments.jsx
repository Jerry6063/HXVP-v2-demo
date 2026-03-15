import { useState } from 'react';
import {
  useCrewAssignments,
  useAcceptAssignment,
  useDeclineAssignment,
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
  const { data: allData, isLoading } = useCrewAssignments();
  const acceptAssignment = useAcceptAssignment();
  const declineAssignment = useDeclineAssignment();

  const allAssignments = allData?.results || allData || [];

  const today = new Date().toISOString().split('T')[0];
  const pending = allAssignments.filter((a) => a.status === 'pending');
  const upcoming = allAssignments.filter(
    (a) => a.status === 'accepted' && a.shoot_detail?.shoot_date >= today
  );
  const past = allAssignments.filter(
    (a) => a.status === 'accepted' && a.shoot_detail?.shoot_date < today
  );
  const declined = allAssignments.filter((a) => a.status === 'declined');

  const tabs = [
    { id: 'pending', label: 'Pending', count: pending.length },
    { id: 'upcoming', label: 'Upcoming', count: upcoming.length },
    { id: 'past', label: 'Past', count: past.length },
    { id: 'declined', label: 'Declined', count: declined.length },
  ];

  const activeList =
    tab === 'pending' ? pending : tab === 'upcoming' ? upcoming : tab === 'past' ? past : declined;

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Project Assignments</h1>

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
              </div>
            );
          })}
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

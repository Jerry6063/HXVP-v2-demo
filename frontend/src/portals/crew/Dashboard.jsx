import { useCrewAssignments, useAcceptAssignment, useDeclineAssignment, useContracts, useEarnings } from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';
import {
  CheckIcon,
  XMarkIcon,
  MapPinIcon,
  ClockIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';

export default function CrewDashboard() {
  const { data: assignments } = useCrewAssignments();
  const { data: contracts } = useContracts();
  const { data: earnings } = useEarnings();
  const acceptAssignment = useAcceptAssignment();
  const declineAssignment = useDeclineAssignment();

  const assignmentList = assignments?.results || assignments || [];
  const contractList = contracts?.results || contracts || [];
  const earningList = earnings?.results || earnings || [];

  const pending = assignmentList.filter((a) => a.status === 'pending');
  const accepted = assignmentList.filter((a) => a.status === 'accepted');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Crew Dashboard</h1>

      {/* Pending Assignments */}
      {pending.length > 0 && (
        <div className="bg-sky-50 rounded-xl border border-sky-200 p-5">
          <h2 className="font-semibold text-sky-900 mb-3">
            Pending Assignments ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map((a) => (
              <div
                key={a.id}
                className="bg-white rounded-lg border border-sky-100 p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {a.shoot_detail?.location}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {a.shoot_detail?.shoot_date} &middot; {a.shoot_detail?.call_time}
                    {' '}&middot;{' '}
                    <span className="capitalize">{a.role_on_shoot?.replace(/_/g, ' ')}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptAssignment.mutate(a.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700"
                  >
                    <CheckIcon className="h-3.5 w-3.5" /> Accept
                  </button>
                  <button
                    onClick={() => declineAssignment.mutate(a.id)}
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
              No upcoming assignments
            </div>
          ) : (
            accepted.map((a) => {
              const s = a.shoot_detail;
              return (
                <div key={a.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{s?.location}</h3>
                      <p className="text-xs text-gray-500 capitalize mt-0.5">
                        Role: {a.role_on_shoot?.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <StatusBadge status={a.status} />
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
                  <div key={c.id} className="px-5 py-3">
                    <p className="text-sm font-medium text-gray-700">{c.title || c.contract_type}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-400">{c.project_name}</p>
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
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

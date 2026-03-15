const colorMap = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  archived: 'bg-gray-100 text-gray-600',
  on_hold: 'bg-yellow-100 text-yellow-700',
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
  available: 'bg-green-100 text-green-700',
  booked: 'bg-blue-100 text-blue-700',
  unavailable: 'bg-gray-100 text-gray-500',
  review: 'bg-purple-100 text-purple-700',
  approved: 'bg-green-100 text-green-700',
  delivered: 'bg-indigo-100 text-indigo-700',
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  signed: 'bg-green-100 text-green-700',
  expired: 'bg-red-100 text-red-600',
  paid: 'bg-green-100 text-green-700',
  checked_out: 'bg-orange-100 text-orange-700',
  submitted: 'bg-yellow-100 text-yellow-700',
  under_review: 'bg-amber-100 text-amber-700',
  contract_sent: 'bg-blue-100 text-blue-700',
  contract_signed: 'bg-green-100 text-green-700',
  in_production: 'bg-indigo-100 text-indigo-700',
  rejected: 'bg-red-100 text-red-600',
  client_commented: 'bg-orange-100 text-orange-700',
  revised: 'bg-purple-100 text-purple-700',
  revision_requested: 'bg-orange-100 text-orange-700',
  verified: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  unpaid: 'bg-gray-100 text-gray-500',
};

export default function StatusBadge({ status }) {
  const label = status?.replace(/_/g, ' ');
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
        colorMap[status] || 'bg-gray-100 text-gray-600'
      }`}
    >
      {label}
    </span>
  );
}

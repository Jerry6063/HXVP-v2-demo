import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectRequests } from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';
import { InboxIcon } from '@heroicons/react/24/outline';

export default function Requests() {
  const { data, isLoading } = useProjectRequests();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const requests = data?.results || data || [];
  const filtered =
    filter === 'all' ? requests : requests.filter((r) => r.status === filter);

  const statusCounts = requests.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Production Request</h1>

      <div className="flex gap-2 flex-wrap">
        {[
          'all',
          'submitted',
          'under_review',
          'contract_sent',
          'contract_signed',
          'in_production',
        ].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
              filter === s
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s.replace(/_/g, ' ')}
            {s === 'all'
              ? ` (${requests.length})`
              : statusCounts[s]
                ? ` (${statusCounts[s]})`
                : ''}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <InboxIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No requests found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase bg-gray-50">
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Budget</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((req) => (
                <tr
                  key={req.id}
                  onClick={() => navigate(`/production/requests/${req.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3 font-medium text-gray-900">{req.title}</td>
                  <td className="px-5 py-3 text-gray-600">{req.client_name}</td>
                  <td className="px-5 py-3 text-gray-500 capitalize">{req.project_type}</td>
                  <td className="px-5 py-3 text-gray-700">
                    ${Number(req.budget).toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-5 py-3 text-gray-400">
                    {new Date(req.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

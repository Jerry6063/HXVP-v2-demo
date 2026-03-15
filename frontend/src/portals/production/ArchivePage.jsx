import { Link } from 'react-router-dom';
import { useProjects } from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';

export default function ArchivePage() {
  const { data: archived, isLoading } = useProjects({ status: 'archived' });
  const { data: completed } = useProjects({ status: 'completed' });

  const archivedList = archived?.results || archived || [];
  const completedList = completed?.results || completed || [];
  const allPast = [...archivedList, ...completedList];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Archived Productions</h1>

      {isLoading ? (
        <div className="text-center py-10 text-gray-400">Loading...</div>
      ) : allPast.length === 0 ? (
        <div className="text-center py-10 text-gray-400">No archived productions</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allPast.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3.5">
                    <Link
                      to={`/production/projects/${p.id}`}
                      className="font-medium text-indigo-600 hover:text-indigo-700 text-sm"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{p.client_name || '—'}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">
                    ${Number(p.budget).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{p.deadline || '—'}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={p.status} />
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

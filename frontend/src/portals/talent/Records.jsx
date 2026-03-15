import { usePerformanceRecords } from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';
import {
  FilmIcon,
  VideoCameraIcon,
  MegaphoneIcon,
  PhotoIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const typeIcons = {
  acting: FilmIcon,
  livestream: VideoCameraIcon,
  commercial: MegaphoneIcon,
  print: PhotoIcon,
  other: DocumentTextIcon,
};

const typeLabels = {
  acting: 'Acting Performance',
  livestream: 'Livestream Campaign',
  commercial: 'Commercial',
  print: 'Print Campaign',
  other: 'Other',
};

export default function PerformanceRecords() {
  const { data, isLoading } = usePerformanceRecords();
  const records = data?.results || data || [];

  if (isLoading) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Performance & Campaign Records</h1>

      {records.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-sm text-gray-400">
          No performance records yet.
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((rec) => {
            const Icon = typeIcons[rec.record_type] || DocumentTextIcon;
            return (
              <div
                key={rec.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-amber-50 rounded-lg">
                    <Icon className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                      <span className="text-xs text-gray-400">
                        {new Date(rec.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-amber-600 font-medium mt-0.5">
                      {typeLabels[rec.record_type] || rec.record_type}
                    </p>
                    {rec.client_name && (
                      <p className="text-sm text-gray-600 mt-1">Client: {rec.client_name}</p>
                    )}
                    {rec.project_name && (
                      <p className="text-sm text-gray-500">Project: {rec.project_name}</p>
                    )}
                    {rec.description && (
                      <p className="text-sm text-gray-600 mt-2">{rec.description}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-xs text-gray-400">
                      {rec.duration_hours > 0 && (
                        <span>{rec.duration_hours}h duration</span>
                      )}
                      {rec.notes && <span>{rec.notes}</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

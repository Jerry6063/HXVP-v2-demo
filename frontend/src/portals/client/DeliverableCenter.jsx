import { useState } from 'react';
import {
  useDeliverables,
  useProjects,
  useCreateDeliverableReview,
} from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';
import {
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  ChatBubbleLeftEllipsisIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

export default function DeliverableCenter() {
  const { data: delivData, isLoading } = useDeliverables();
  const { data: projData } = useProjects();

  const deliverables = delivData?.results || delivData || [];
  const projects = projData?.results || projData || [];

  const grouped = projects
    .filter((p) => deliverables.some((d) => d.project === p.id))
    .map((p) => ({
      project: p,
      items: deliverables.filter((d) => d.project === p.id),
    }));

  const ungrouped = deliverables.filter(
    (d) => !projects.some((p) => p.id === d.project)
  );

  if (isLoading) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Deliverable Center</h1>

      {grouped.length === 0 && ungrouped.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-sm text-gray-400">
          No deliverables available yet.
        </div>
      ) : (
        <>
          {grouped.map(({ project, items }) => (
            <ProjectDeliverables
              key={project.id}
              project={project}
              deliverables={items}
            />
          ))}
          {ungrouped.length > 0 && (
            <ProjectDeliverables
              project={{ id: 0, name: 'Other' }}
              deliverables={ungrouped}
            />
          )}
        </>
      )}
    </div>
  );
}

function ProjectDeliverables({ project, deliverables }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">{project.name}</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {deliverables.length} deliverable{deliverables.length !== 1 && 's'}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
        {deliverables.map((d) => (
          <DeliverableCard key={d.id} deliverable={d} />
        ))}
      </div>
    </div>
  );
}

function DeliverableCard({ deliverable }) {
  const [expanded, setExpanded] = useState(false);

  const TypeIcon =
    deliverable.deliverable_type === 'photo'
      ? PhotoIcon
      : deliverable.deliverable_type === 'video'
        ? VideoCameraIcon
        : DocumentIcon;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* Thumbnail / Preview */}
      <div
        className="relative cursor-pointer bg-gray-100 flex items-center justify-center"
        style={{ minHeight: '10rem' }}
        onClick={() => setExpanded(!expanded)}
      >
        {deliverable.file_url ? (
          deliverable.deliverable_type === 'photo' ? (
            <img
              src={deliverable.thumbnail_url || deliverable.file_url}
              alt={deliverable.name}
              className="w-full h-40 object-cover"
            />
          ) : deliverable.deliverable_type === 'video' ? (
            <video
              src={deliverable.file_url}
              className="w-full h-40 object-cover"
            />
          ) : (
            <DocumentIcon className="w-12 h-12 text-gray-300" />
          )
        ) : (
          <TypeIcon className="w-12 h-12 text-gray-300" />
        )}
      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900 truncate">
            {deliverable.name}
          </p>
          <StatusBadge status={deliverable.status} />
        </div>
        <p className="text-xs text-gray-400">
          {deliverable.deliverable_type} &middot; Due{' '}
          {deliverable.deadline || 'TBD'}
        </p>

        {expanded && (
          <ExpandedView deliverable={deliverable} onClose={() => setExpanded(false)} />
        )}
      </div>
    </div>
  );
}

function ExpandedView({ deliverable, onClose }) {
  const createReview = useCreateDeliverableReview();
  const [feedback, setFeedback] = useState('');
  const [action, setAction] = useState(null);

  const handleSubmit = () => {
    if (!action) return;
    createReview.mutate(
      {
        deliverable: deliverable.id,
        feedback,
        action,
      },
      { onSuccess: () => { setFeedback(''); setAction(null); } }
    );
  };

  return (
    <div className="border-t border-gray-200 pt-3 mt-2 space-y-3">
      {/* Full-size preview */}
      {deliverable.file_url && (
        <div>
          {deliverable.deliverable_type === 'photo' ? (
            <a href={deliverable.file_url} target="_blank" rel="noopener noreferrer">
              <img
                src={deliverable.file_url}
                alt={deliverable.name}
                className="w-full rounded-lg border border-gray-200"
              />
            </a>
          ) : deliverable.deliverable_type === 'video' ? (
            <video
              src={deliverable.file_url}
              controls
              className="w-full rounded-lg border border-gray-200"
            />
          ) : (
            <a
              href={deliverable.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
            >
              Download file &rarr;
            </a>
          )}
        </div>
      )}

      {deliverable.description && (
        <p className="text-sm text-gray-600">{deliverable.description}</p>
      )}

      {/* Actions */}
      {deliverable.status !== 'approved' && deliverable.file_url && (
        <div className="space-y-2">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={2}
            placeholder="Leave feedback..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { setAction('approved'); }}
              className={`flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                action === 'approved'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <CheckIcon className="w-3.5 h-3.5" />
              Approve
            </button>
            <button
              onClick={() => { setAction('revision_requested'); }}
              className={`flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                action === 'revision_requested'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              <ChatBubbleLeftEllipsisIcon className="w-3.5 h-3.5" />
              Request Revision
            </button>
          </div>
          {action && (
            <button
              onClick={handleSubmit}
              disabled={createReview.isPending || (!feedback.trim() && action === 'revision_requested')}
              className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {createReview.isPending ? 'Submitting...' : 'Submit Review'}
            </button>
          )}
        </div>
      )}

      {deliverable.status === 'approved' && (
        <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
          <CheckIcon className="w-4 h-4" />
          Approved
        </div>
      )}
    </div>
  );
}

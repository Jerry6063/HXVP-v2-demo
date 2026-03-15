import { useState, useRef, useCallback } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import StatusBadge from '../../components/StatusBadge';
import {
  useProjectRequests,
  useCreateProjectRequest,
  useCommentContract,
  useSignContract,
} from '../../api/hooks';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

export default function ProjectRequest() {
  const { data, isLoading } = useProjectRequests();
  const createRequest = useCreateProjectRequest();
  const [showForm, setShowForm] = useState(false);

  const requests = data?.results || data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Production Request</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          <PlusCircleIcon className="w-4 h-4" />
          New Request
        </button>
      </div>

      {showForm && (
        <RequestForm
          onSubmit={(vals) => {
            createRequest.mutate(vals, { onSuccess: () => setShowForm(false) });
          }}
          loading={createRequest.isPending}
          onCancel={() => setShowForm(false)}
        />
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-sm text-gray-400">
          No production requests yet. Click "New Request" to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <RequestCard key={req.id} request={req} />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestForm({ onSubmit, loading, onCancel }) {
  const [form, setForm] = useState({
    project_type: 'production',
    title: '',
    budget: '',
    model_requests: '',
    description: '',
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, budget: parseFloat(form.budget) || 0 });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4"
    >
      <h2 className="font-semibold text-gray-800">Submit New Production Request</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Project Type</label>
          <select
            value={form.project_type}
            onChange={set('project_type')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
          >
            <option value="production">Production</option>
            <option value="livestream">Livestream</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Budget ($)</label>
          <input
            type="number"
            value={form.budget}
            onChange={set('budget')}
            placeholder="e.g. 5000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Project Title</label>
        <input
          type="text"
          value={form.title}
          onChange={set('title')}
          placeholder="Name your project"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Model / Talent Requests</label>
        <textarea
          value={form.model_requests}
          onChange={set('model_requests')}
          rows={2}
          placeholder="Any talent or model preferences..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Description / Comments</label>
        <textarea
          value={form.description}
          onChange={set('description')}
          rows={3}
          placeholder="Describe the project goals, deliverables, timeline expectations..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function RequestCard({ request }) {
  const [expanded, setExpanded] = useState(false);
  const contract = request.latest_contract;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div
        className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <h3 className="font-medium text-gray-900 text-sm">{request.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {request.project_type === 'production' ? 'Production' : 'Livestream'}{' '}
            &middot; Budget: ${Number(request.budget).toLocaleString()}{' '}
            &middot; {new Date(request.created_at).toLocaleDateString()}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
          {request.description && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-700">{request.description}</p>
            </div>
          )}
          {request.model_requests && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Model Requests</p>
              <p className="text-sm text-gray-700">{request.model_requests}</p>
            </div>
          )}

          {contract && (
            <ContractSection contract={contract} requestId={request.id} />
          )}
        </div>
      )}
    </div>
  );
}

function ContractSection({ contract, requestId }) {
  const commentContract = useCommentContract();
  const signContract = useSignContract();
  const sigRef = useRef(null);
  const [agreed, setAgreed] = useState(false);
  const [comment, setComment] = useState(contract.client_comment || '');
  const [showSign, setShowSign] = useState(false);

  const handleComment = () => {
    commentContract.mutate({
      requestId,
      contractId: contract.id,
      comment,
    });
  };

  const handleSign = useCallback(() => {
    if (!sigRef.current || sigRef.current.isEmpty()) return;
    sigRef.current.getTrimmedCanvas().toBlob((blob) => {
      signContract.mutate({
        requestId,
        contractId: contract.id,
        signatureBlob: blob,
      });
    });
  }, [requestId, contract.id, signContract]);

  const isSigned = contract.status === 'signed';
  const canSign = ['sent', 'revised'].includes(contract.status);

  return (
    <div className="space-y-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-800 text-sm">Contract</h4>
        <StatusBadge status={contract.status} />
      </div>

      {contract.file_url && (
        <a
          href={contract.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          View Contract PDF &rarr;
        </a>
      )}

      {isSigned && contract.signature_url && (
        <div>
          <p className="text-xs text-gray-400 mb-1">Signature</p>
          <img
            src={contract.signature_url}
            alt="Signature"
            className="h-16 border border-gray-200 rounded bg-white p-1"
          />
          <p className="text-xs text-green-600 mt-1">
            Signed on {new Date(contract.agreed_at).toLocaleDateString()}
          </p>
        </div>
      )}

      {!isSigned && (
        <>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Comments / Change Requests
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
              placeholder="Leave a comment if you need changes..."
            />
            <button
              onClick={handleComment}
              disabled={!comment.trim() || commentContract.isPending}
              className="mt-2 px-4 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 disabled:opacity-50 transition-colors"
            >
              {commentContract.isPending ? 'Sending...' : 'Submit Comment'}
            </button>
          </div>

          {canSign && (
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <button
                onClick={() => setShowSign(!showSign)}
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                {showSign ? 'Hide Signing Area' : 'Ready to Sign? Click Here'}
              </button>

              {showSign && (
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    I have read and agree to the terms
                  </label>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Sign Below</p>
                    <div className="border border-gray-300 rounded-lg bg-white">
                      <SignatureCanvas
                        ref={sigRef}
                        penColor="black"
                        canvasProps={{
                          width: 500,
                          height: 150,
                          className: 'rounded-lg',
                        }}
                      />
                    </div>
                    <button
                      onClick={() => sigRef.current?.clear()}
                      className="mt-1 text-xs text-gray-400 hover:text-gray-600"
                    >
                      Clear Signature
                    </button>
                  </div>

                  <button
                    onClick={handleSign}
                    disabled={!agreed || signContract.isPending}
                    className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    {signContract.isPending
                      ? 'Signing...'
                      : 'Confirm & Sign Contract'}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

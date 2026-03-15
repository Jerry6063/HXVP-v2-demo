import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useProjectRequest,
  useUpdateProjectRequest,
  useUploadContract,
  useCreateProjectFromRequest,
} from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';
import { ArrowLeftIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: request, isLoading } = useProjectRequest(id);
  const updateRequest = useUpdateProjectRequest();
  const uploadContract = useUploadContract();
  const createProject = useCreateProjectFromRequest();

  if (isLoading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
  if (!request) return <div className="text-center py-12 text-gray-400">Request not found</div>;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/production/projects?tab=requests')}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Requests
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{request.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            By {request.client_detail?.first_name} {request.client_detail?.last_name}{' '}
            ({request.client_detail?.email}) &middot;{' '}
            {new Date(request.created_at).toLocaleDateString()}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Details */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-gray-800">Request Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Project Type" value={request.project_type} />
              <InfoItem label="Budget" value={`$${Number(request.budget).toLocaleString()}`} />
            </div>
            {request.description && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Description</p>
                <p className="text-sm text-gray-700">{request.description}</p>
              </div>
            )}
            {request.model_requests && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Model / Talent Requests</p>
                <p className="text-sm text-gray-700">{request.model_requests}</p>
              </div>
            )}
          </div>

          {/* Contracts */}
          <ContractsSection
            contracts={request.contracts || []}
            requestId={request.id}
            uploadContract={uploadContract}
          />
        </div>

        {/* Sidebar actions */}
        <div className="space-y-4">
          <StatusActions
            request={request}
            updateRequest={updateRequest}
            createProject={createProject}
          />
        </div>
      </div>
    </div>
  );
}

function StatusActions({ request, updateRequest, createProject }) {
  const navigate = useNavigate();
  const [changingStatus, setChangingStatus] = useState(false);

  const handleStatusChange = async (status) => {
    setChangingStatus(true);
    await updateRequest.mutateAsync({ id: request.id, status });
    setChangingStatus(false);
  };

  const handleCreateProject = async () => {
    await createProject.mutateAsync(request.id);
    navigate('/production/projects');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
      <h3 className="font-semibold text-gray-800 text-sm">Actions</h3>

      {request.status === 'submitted' && (
        <button
          onClick={() => handleStatusChange('under_review')}
          disabled={changingStatus}
          className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-50 transition-colors"
        >
          Start Review
        </button>
      )}

      {request.status === 'rejected' ? null : request.status !== 'in_production' && (
        <button
          onClick={() => handleStatusChange('rejected')}
          disabled={changingStatus}
          className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-50 transition-colors"
        >
          Reject Request
        </button>
      )}

      {(request.status === 'contract_signed') && (
        <button
          onClick={handleCreateProject}
          disabled={createProject.isPending}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {createProject.isPending ? 'Creating...' : 'Create Production'}
        </button>
      )}

      {request.project && (
        <p className="text-xs text-green-600">
          Linked to project #{request.project}
        </p>
      )}
    </div>
  );
}

function ContractsSection({ contracts, requestId, uploadContract }) {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    await uploadContract.mutateAsync({ requestId, file });
    setFile(null);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
      <h2 className="font-semibold text-gray-800">Contracts</h2>

      {/* Link to Documents module */}
      <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 flex items-center justify-between">
        <p className="text-sm text-indigo-700">Use the Documents module to create contracts from templates or upload files.</p>
        <button
          onClick={() => navigate('/production/documents?type=client_contracts')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 whitespace-nowrap ml-4"
        >
          <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
          Open Documents
        </button>
      </div>

      {/* Upload new contract */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
        <p className="text-sm text-gray-600">Or upload a contract PDF directly for this request:</p>
        <div className="flex gap-2 items-center">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files[0] || null)}
            className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
          />
          <button
            onClick={handleUpload}
            disabled={!file || uploadContract.isPending}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap transition-colors"
          >
            {uploadContract.isPending ? 'Uploading...' : 'Send Contract'}
          </button>
        </div>
      </div>

      {/* Existing contracts */}
      {contracts.length === 0 ? (
        <p className="text-sm text-gray-400">No contracts sent yet</p>
      ) : (
        <div className="space-y-3">
          {contracts.map((c) => (
            <div key={c.id} className="p-4 border border-gray-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Contract #{c.id}
                </span>
                <StatusBadge status={c.status} />
              </div>
              {c.file_url && (
                <a
                  href={c.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  View PDF &rarr;
                </a>
              )}
              {c.client_comment && (
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-xs text-amber-600 font-medium mb-1">Client Comment:</p>
                  <p className="text-sm text-gray-700">{c.client_comment}</p>
                </div>
              )}
              {c.signature_url && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Client Signature:</p>
                  <img
                    src={c.signature_url}
                    alt="Signature"
                    className="h-16 border border-gray-200 rounded bg-white p-1"
                  />
                  <p className="text-xs text-green-600 mt-1">
                    Signed on {new Date(c.agreed_at).toLocaleDateString()}
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-400">
                Sent {new Date(c.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-900 capitalize">{value}</p>
    </div>
  );
}

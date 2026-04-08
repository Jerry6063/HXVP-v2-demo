import { useRef, useState, useCallback } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { toast } from 'react-toastify';
import { useContracts, useSignContractDirect } from '../../api/hooks';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { DocumentTextIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

export default function CrewDocuments() {
  const { data: contractsData, isLoading } = useContracts();
  const contracts = contractsData?.results || contractsData || [];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Documents</h1>
        <p className="text-sm text-gray-400 mt-0.5">Review and sign deal memos sent by the production team.</p>
      </div>

      {contracts.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
          <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 opacity-25" />
          <p className="text-sm font-medium">No documents yet.</p>
          <p className="text-xs mt-1">Deal memos sent to you will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((c) => (
            <ContractCard key={c.id} contract={c} accentColor="border-sky-500" signBtnClass="bg-sky-600 hover:bg-sky-700" />
          ))}
        </div>
      )}
    </div>
  );
}

function ContractCard({ contract: c, accentColor, signBtnClass }) {
  const [view, setView] = useState('summary'); // 'summary' | 'document' | 'sign'
  const sigRef = useRef(null);
  const [agreed, setAgreed] = useState(false);
  const signContract = useSignContractDirect();

  const canSign = c.status === 'sent';
  const isSigned = c.status === 'signed';

  const handleSign = useCallback(() => {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      toast.warning('Please draw your signature before submitting.');
      return;
    }
    sigRef.current.getTrimmedCanvas().toBlob(async (blob) => {
      try {
        await signContract.mutateAsync({ id: c.id, signatureFile: blob });
        toast.success('Document signed successfully.');
        setView('summary');
      } catch {
        toast.error('Failed to sign. Please try again.');
      }
    }, 'image/png');
  }, [c.id, signContract]);

  return (
    <div className={`bg-white rounded-xl shadow border-l-4 ${accentColor}`}>
      {/* Header row */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 text-sm">{c.title || 'Document'} #{c.id}</span>
              <StatusBadge status={c.status} />
            </div>
            <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
              <span>Production: <strong className="text-gray-700">{c.project_name}</strong></span>
              {c.sent_at && <span>Sent: <strong className="text-gray-700">{new Date(c.sent_at).toLocaleDateString()}</strong></span>}
              {c.signed_at && <span>Signed: <strong className="text-gray-700">{new Date(c.signed_at).toLocaleDateString()}</strong></span>}
            </div>
            {c.notes && <p className="mt-2 text-xs text-gray-500 bg-gray-50 rounded p-2">{c.notes}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isSigned && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-1 rounded-lg">
                <CheckBadgeIcon className="w-3.5 h-3.5" /> Signed
              </span>
            )}
            {c.draft_html && (
              <button
                onClick={() => setView(view === 'summary' ? 'document' : 'summary')}
                className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50"
              >
                {view === 'summary' ? 'View Document' : 'Hide'}
              </button>
            )}
            {canSign && view !== 'sign' && (
              <button
                onClick={() => setView('sign')}
                className={`px-3 py-1.5 text-white rounded-lg text-xs font-medium ${signBtnClass}`}
              >
                Sign Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inline document viewer */}
      {view === 'document' && c.draft_html && (
        <div className="border-t border-gray-100 px-5 pb-5">
          <div
            className="prose prose-sm max-w-none pt-4 [&_mark]:bg-yellow-200 [&_mark]:px-0.5 [&_mark]:rounded"
            dangerouslySetInnerHTML={{ __html: c.draft_html }}
          />
          {canSign && (
            <button
              onClick={() => setView('sign')}
              className={`mt-4 px-5 py-2 text-white rounded-lg text-sm font-medium ${signBtnClass}`}
            >
              Proceed to Sign
            </button>
          )}
        </div>
      )}

      {/* Signature panel */}
      {view === 'sign' && (
        <div className="border-t border-gray-100 p-5 space-y-4">
          {c.draft_html && (
            <div
              className="prose prose-sm max-w-none max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50 [&_mark]:bg-yellow-200 [&_mark]:px-0.5 [&_mark]:rounded"
              dangerouslySetInnerHTML={{ __html: c.draft_html }}
            />
          )}

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
            />
            I have read and agree to the terms of this agreement.
          </label>

          <div>
            <p className="text-xs text-gray-500 mb-1 font-medium">Draw your signature below</p>
            <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
              <SignatureCanvas
                ref={sigRef}
                penColor="black"
                canvasProps={{ width: 500, height: 150, className: 'w-full' }}
              />
            </div>
            <button onClick={() => sigRef.current?.clear()} className="mt-1 text-xs text-gray-400 hover:text-gray-600">
              Clear
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSign}
              disabled={!agreed || signContract.isPending}
              className={`px-5 py-2 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition ${signBtnClass}`}
            >
              {signContract.isPending ? 'Signing…' : 'Confirm & Sign'}
            </button>
            <button onClick={() => setView('summary')} className="px-5 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Signed confirmation */}
      {isSigned && c.signature_image_url && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-3">
          <p className="text-xs text-gray-400 mb-1">Your signature on file:</p>
          <img src={c.signature_image_url} alt="Signature" className="h-14 border border-gray-200 rounded bg-white p-1" />
        </div>
      )}
    </div>
  );
}

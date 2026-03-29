import { useSearchParams } from 'react-router-dom';
import { useProjects } from '../../api/hooks';

// Document type tabs
import ClientContractsTab from './documents/ClientContractsTab';
import ContractTab from './documents/ContractTab';

import {
  DocumentTextIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const DOC_TYPES = [
  {
    id: 'client_contracts',
    label: 'Client Contracts',
    description: 'Upload or create contracts for production requests. Clients can review and sign.',
    icon: DocumentTextIcon,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    activeBorder: 'border-indigo-600',
    category: 'contracts',
  },
  {
    id: 'talent_agreements',
    label: 'Talent Agreements',
    description: 'Agreements for specific talent members, linked to a production.',
    icon: UserGroupIcon,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    activeBorder: 'border-violet-600',
    category: 'contracts',
  },
  {
    id: 'crew_contracts',
    label: 'Crew Contracts',
    description: 'Contracts for crew members, linked to a production.',
    icon: UserGroupIcon,
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    activeBorder: 'border-sky-600',
    category: 'contracts',
  },
];

export default function DocumentGenerator() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeType = searchParams.get('type') || '';

  const { data: projectsData } = useProjects();
  const projects = projectsData?.results || projectsData || [];

  const activeDocType = DOC_TYPES.find((t) => t.id === activeType);

  const setType = (id) => {
    setSearchParams({ type: id }, { replace: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        {activeType && (
          <button
            onClick={() => setSearchParams({}, { replace: true })}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← All types
          </button>
        )}
      </div>

      {!activeType ? (
        /* ── Type selection grid ── */
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Contracts &amp; Agreements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {DOC_TYPES.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`text-left bg-white rounded-xl shadow border-2 ${t.border} hover:shadow-md transition p-6 group`}
                >
                  <div className={`w-11 h-11 rounded-lg ${t.bg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${t.color}`} />
                  </div>
                  <p className="font-semibold text-sm text-gray-900 group-hover:text-indigo-700 transition">
                    {t.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{t.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── Active document type view ── */
        <div className="space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => setSearchParams({}, { replace: true })} className="text-gray-400 hover:text-gray-600">
              All Types
            </button>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700 font-medium">{activeDocType?.label}</span>
          </div>

          {/* Project selector for project-scoped tabs */}
          {needsProject && (
            <div className="bg-white rounded-xl shadow p-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Production</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full max-w-md border rounded-lg p-2.5 text-sm"
              >
                <option value="">Choose a production…</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.client_name ? `(${p.client_name})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeType === 'client_contracts' && <ClientContractsTab />}

          {activeType === 'talent_agreements' && (
            <ContractTab
              contractType="talent"
              recipientRole="talent"
              recipientLabel="Talent Member"
              typeLabel="Talent Agreement"
              color="border-violet-500"
            />
          )}

          {activeType === 'crew_contracts' && (
            <ContractTab
              contractType="crew"
              recipientRole="crew"
              recipientLabel="Crew Member"
              typeLabel="Crew Contract"
              color="border-sky-500"
            />
          )}
        </div>
      )}
    </div>
  );
}


import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProjects, useShoots } from '../../api/hooks';

// Existing tabs (reused)
import CallSheetsTab from './documents/CallSheetsTab';
import ChecklistsTab from './documents/ChecklistsTab';
import ProductionLogsTab from './documents/ProductionLogsTab';

// New document type tabs
import ClientContractsTab from './documents/ClientContractsTab';
import BudgetTemplatesTab from './documents/BudgetTemplatesTab';
import ContractTab from './documents/ContractTab';

import {
  DocumentTextIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  DocumentChartBarIcon,
  UserGroupIcon,
  CheckCircleIcon,
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
  {
    id: 'budget_templates',
    label: 'Budget Templates',
    description: 'Generate and send budget documents to clients with pre-filled templates.',
    icon: DocumentChartBarIcon,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    activeBorder: 'border-emerald-600',
    category: 'documents',
  },
  {
    id: 'production_schedules',
    label: 'Production Schedules',
    description: 'Internal production logs, notes, decisions, and milestones.',
    icon: CalendarDaysIcon,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    activeBorder: 'border-amber-600',
    category: 'documents',
  },
  {
    id: 'call_sheets',
    label: 'Call Sheets',
    description: 'Daily call sheets for talent and crew, linked to a production shoot.',
    icon: ClipboardDocumentListIcon,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    activeBorder: 'border-blue-600',
    category: 'documents',
  },
  {
    id: 'checklists',
    label: 'Checklists',
    description: 'Shoot or production checklists to track pre/post-production tasks.',
    icon: CheckCircleIcon,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    activeBorder: 'border-teal-600',
    category: 'documents',
  },
];

export default function DocumentGenerator() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeType = searchParams.get('type') || '';

  const [selectedProject, setSelectedProject] = useState('');
  const { data: projectsData } = useProjects();
  const { data: shootsData } = useShoots(selectedProject ? { project: selectedProject } : {});

  const projects = projectsData?.results || projectsData || [];
  const shoots = shootsData?.results || shootsData || [];

  const activeDocType = DOC_TYPES.find((t) => t.id === activeType);
  const needsProject = ['production_schedules', 'call_sheets', 'checklists'].includes(activeType);

  const setType = (id) => {
    setSearchParams({ type: id }, { replace: true });
    setSelectedProject('');
  };

  const contractTypes = DOC_TYPES.filter((t) => t.category === 'contracts');
  const docTypes = DOC_TYPES.filter((t) => t.category === 'documents');

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
        <div className="space-y-6">
          <DocTypeSection title="Contracts & Agreements" types={contractTypes} onSelect={setType} />
          <DocTypeSection title="Production Documents" types={docTypes} onSelect={setType} />
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

          {activeType === 'budget_templates' && <BudgetTemplatesTab />}

          {activeType === 'production_schedules' && (
            selectedProject
              ? <ProductionLogsTab projectId={selectedProject} shoots={shoots} />
              : <EmptyProjectPrompt label="production schedules" />
          )}

          {activeType === 'call_sheets' && (
            selectedProject
              ? <CallSheetsTab projectId={selectedProject} shoots={shoots} />
              : <EmptyProjectPrompt label="call sheets" />
          )}

          {activeType === 'checklists' && (
            selectedProject
              ? <ChecklistsTab projectId={selectedProject} />
              : <EmptyProjectPrompt label="checklists" />
          )}
        </div>
      )}
    </div>
  );
}

function DocTypeSection({ title, types, onSelect }) {
  return (
    <div>
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {types.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={`text-left bg-white rounded-xl shadow border-2 ${t.border} hover:shadow-md transition p-5 group`}
            >
              <div className={`w-10 h-10 rounded-lg ${t.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${t.color}`} />
              </div>
              <p className="font-semibold text-sm text-gray-900 group-hover:text-indigo-700 transition">
                {t.label}
              </p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{t.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EmptyProjectPrompt({ label }) {
  return (
    <div className="bg-white rounded-xl shadow p-12 text-center">
      <div className="text-5xl mb-4">📋</div>
      <h2 className="text-lg font-semibold text-gray-700">Select a production above</h2>
      <p className="text-gray-400 mt-1 text-sm">
        Choose a production to manage {label}.
      </p>
    </div>
  );
}

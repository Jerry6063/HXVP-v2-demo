import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ActiveProjects from './ActiveProjects';
import ProductionRequests from './Requests';
import ArchivePage from './ArchivePage';

const TABS = {
  active: 'active',
  requests: 'requests',
  archived: 'archived',
};

export default function ProductionsModule() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = useMemo(() => {
    const tab = searchParams.get('tab');
    if (tab === TABS.requests) return TABS.requests;
    if (tab === TABS.archived) return TABS.archived;
    return TABS.active;
  }, [searchParams]);

  const switchTab = (tab) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2 inline-flex gap-2">
        <button
          onClick={() => switchTab(TABS.active)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === TABS.active
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Active Productions
        </button>
        <button
          onClick={() => switchTab(TABS.requests)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === TABS.requests
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Production Request
        </button>
        <button
          onClick={() => switchTab(TABS.archived)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === TABS.archived
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Archived
        </button>
      </div>

      {activeTab === TABS.requests && <ProductionRequests />}
      {activeTab === TABS.archived && <ArchivePage />}
      {activeTab === TABS.active && <ActiveProjects />}
    </div>
  );
}

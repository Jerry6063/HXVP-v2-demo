import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import TalentPage from './TalentPage';
import PerformanceAdmin from './PerformanceAdmin';

const TABS = {
  roster: 'roster',
  records: 'records',
};

export default function TalentsModule() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = useMemo(() => {
    const tab = searchParams.get('tab');
    return tab === TABS.records ? TABS.records : TABS.roster;
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
          onClick={() => switchTab(TABS.roster)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === TABS.roster
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Talents
        </button>
        <button
          onClick={() => switchTab(TABS.records)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === TABS.records
              ? 'bg-indigo-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Performance & Campaign Records
        </button>
      </div>

      {activeTab === TABS.records ? <PerformanceAdmin /> : <TalentPage />}
    </div>
  );
}

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TalentPage from './TalentPage';

export default function TalentsModule() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'time-logs' || tab === 'records') {
      navigate('/production/talent-payments?tab=production-time-logs', { replace: true });
    }
  }, [navigate, searchParams]);

  return <TalentPage />;
}

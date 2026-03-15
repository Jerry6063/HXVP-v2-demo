import { useState } from 'react';
import {
  useTalentPaymentSummary,
  useTalentPayments,
  useTalentTimeLogs,
} from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';
import StatCard from '../../components/StatCard';
import {
  BanknotesIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function TalentPayments() {
  const { data: summary, isLoading: loadingSummary } = useTalentPaymentSummary();
  const { data: paymentsData, isLoading: loadingPayments } = useTalentPayments();
  const { data: timeLogsData, isLoading: loadingLogs } = useTalentTimeLogs();
  const [tab, setTab] = useState('summary');

  const payments = paymentsData?.results || paymentsData || [];
  const timeLogs = timeLogsData?.results || timeLogsData || [];

  if (loadingSummary) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Payment Tracking</h1>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            label="Expected This Month"
            value={`$${Number(summary.expected_this_month).toLocaleString()}`}
            icon={CurrencyDollarIcon}
            color="amber"
          />
          <StatCard
            label="Received This Month"
            value={`$${Number(summary.received_this_month).toLocaleString()}`}
            icon={CheckCircleIcon}
            color="green"
          />
          <StatCard
            label="Pending This Month"
            value={`$${Number(summary.pending_this_month).toLocaleString()}`}
            icon={ClockIcon}
            color="orange"
          />
          <StatCard
            label="Total Received (All Time)"
            value={`$${Number(summary.total_received).toLocaleString()}`}
            icon={BanknotesIcon}
            color="indigo"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6 -mb-px">
          {[
            { id: 'summary', label: 'Payment History' },
            { id: 'timelogs', label: 'Time Logs' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-amber-600 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {tab === 'summary' && (
        <PaymentHistory payments={payments} loading={loadingPayments} />
      )}

      {tab === 'timelogs' && (
        <TimeLogHistory timeLogs={timeLogs} loading={loadingLogs} />
      )}
    </div>
  );
}

function PaymentHistory({ payments, loading }) {
  if (loading) return <div className="text-gray-400 py-8 text-center">Loading...</div>;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {payments.length === 0 ? (
        <div className="p-12 text-center text-sm text-gray-400">
          No payment records yet.
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase bg-gray-50">
              <th className="px-5 py-3">Period</th>
              <th className="px-5 py-3">Hours</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Reference</th>
              <th className="px-5 py-3">Paid Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="px-5 py-3 font-medium text-gray-900">
                  {p.period_label}
                </td>
                <td className="px-5 py-3 text-gray-600">{p.total_hours}h</td>
                <td className="px-5 py-3 font-medium text-gray-900">
                  ${Number(p.total_amount).toLocaleString()}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs">
                  {p.payment_reference || '—'}
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">
                  {p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function TimeLogHistory({ timeLogs, loading }) {
  if (loading) return <div className="text-gray-400 py-8 text-center">Loading...</div>;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {timeLogs.length === 0 ? (
        <div className="p-12 text-center text-sm text-gray-400">
          No time logs yet.
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase bg-gray-50">
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Project</th>
              <th className="px-5 py-3">Hours</th>
              <th className="px-5 py-3">Rate</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {timeLogs.map((log) => (
              <tr key={log.id}>
                <td className="px-5 py-3 text-gray-700">
                  {new Date(log.date).toLocaleDateString()}
                </td>
                <td className="px-5 py-3 text-gray-600">{log.project_name}</td>
                <td className="px-5 py-3 text-gray-700">{log.hours_worked}h</td>
                <td className="px-5 py-3 text-gray-500">
                  ${Number(log.rate_applied).toLocaleString()}/hr
                </td>
                <td className="px-5 py-3 font-medium text-gray-900">
                  ${Number(log.amount).toLocaleString()}
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">{log.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

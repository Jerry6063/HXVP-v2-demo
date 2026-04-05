import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  useCrewPayments,
  useCrewProfiles,
  useCreateCrewStripeAccount,
  useCrewStripeAccountStatus,
} from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function CrewPayments() {
  const { user } = useAuth();
  const { data: paymentsData, isLoading: loadingPayments } = useCrewPayments();
  const { data: profilesData } = useCrewProfiles();
  const [tab, setTab] = useState('history');

  const payments = paymentsData?.results || paymentsData || [];
  const profiles = profilesData?.results || profilesData || [];
  const profile = profiles.find((p) => p.user?.id === user?.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Payments</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6 -mb-px">
          {[
            { id: 'history', label: 'Payment History' },
            { id: 'payout', label: 'Payout Setup' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {tab === 'history' && (
        <PaymentHistory payments={payments} loading={loadingPayments} />
      )}

      {tab === 'payout' && (
        <PayoutSetupPanel profile={profile} />
      )}
    </div>
  );
}

function PaymentHistory({ payments, loading }) {
  if (loading) return <div className="text-gray-400 py-8 text-center">Loading…</div>;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {payments.length === 0 ? (
        <div className="p-12 text-center text-sm text-gray-400">No payment records yet.</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase bg-gray-50">
              <th className="px-5 py-3">Period</th>
              <th className="px-5 py-3">Production</th>
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
                <td className="px-5 py-3 font-medium text-gray-900">{p.period_label}</td>
                <td className="px-5 py-3 text-gray-600">{p.project_name || '—'}</td>
                <td className="px-5 py-3 text-gray-600">{p.total_hours}h</td>
                <td className="px-5 py-3 font-medium text-gray-900">
                  ${Number(p.total_amount).toLocaleString()}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs">{p.payment_reference || '—'}</td>
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

function PayoutSetupPanel({ profile }) {
  const createAccount = useCreateCrewStripeAccount();
  const statusQuery = useCrewStripeAccountStatus(profile?.id);

  if (!profile) {
    return <div className="text-gray-400 py-8 text-center text-sm">Loading profile…</div>;
  }

  const onboarded = profile.stripe_onboarding_complete;
  const hasAccount = !!profile.stripe_account_id;

  const handleSetup = () => {
    createAccount.mutate(profile.id, {
      onSuccess: (data) => {
        if (data?.url) window.open(data.url, '_blank');
      },
    });
  };

  return (
    <div className="max-w-xl space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Stripe Payout Account</h2>
        <p className="text-sm text-gray-500">
          To receive ACH payments from HXVP Studio, you need to connect a bank account via Stripe.
          Stripe securely collects your name, address, SSN (last 4 digits), and bank account details —
          nothing is stored on HXVP&apos;s servers.
        </p>

        {onboarded ? (
          <div className="rounded-lg bg-green-50 border border-green-100 p-4 flex items-start gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-green-800">Payout Account Ready</div>
              <div className="text-xs text-green-600 mt-0.5">
                Your bank account is connected and you can receive ACH payments.
              </div>
              {profile.stripe_account_id && (
                <div className="text-xs text-green-500 mt-1 font-mono">
                  Account: ••••{profile.stripe_account_id.slice(-6)}
                </div>
              )}
            </div>
          </div>
        ) : hasAccount ? (
          <div className="space-y-3">
            <div className="rounded-lg bg-yellow-50 border border-yellow-100 p-4 text-sm text-yellow-800">
              <div className="font-medium mb-1">Onboarding Incomplete</div>
              <div className="text-xs text-yellow-700">
                Your Stripe account was created but setup wasn&apos;t finished. Click below to complete it.
              </div>
            </div>
            <button
              onClick={handleSetup}
              disabled={createAccount.isPending}
              className="px-5 py-2.5 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 disabled:opacity-50"
            >
              {createAccount.isPending ? 'Generating link…' : 'Resume Onboarding'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 space-y-1">
              <div className="font-medium text-gray-700 mb-2">Stripe will ask for:</div>
              <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
                <span>✓ Legal name &amp; address</span>
                <span>✓ Date of birth</span>
                <span>✓ SSN last 4 digits</span>
                <span>✓ Bank routing + account #</span>
              </div>
            </div>
            <button
              onClick={handleSetup}
              disabled={createAccount.isPending}
              className="px-5 py-2.5 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 disabled:opacity-50"
            >
              {createAccount.isPending ? 'Setting up…' : 'Set Up Payout Account'}
            </button>
            {createAccount.isError && (
              <p className="text-xs text-red-500">
                {createAccount.error?.response?.data?.detail || 'Setup failed. Please try again.'}
              </p>
            )}
          </div>
        )}

        {statusQuery.isLoading && hasAccount && (
          <div className="text-xs text-gray-400">Refreshing account status…</div>
        )}
      </div>
    </div>
  );
}

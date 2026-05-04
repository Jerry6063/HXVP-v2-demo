import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useCreateCrewPayment,
  useCreateCrewStripeAccount,
  useCreateTalentPayment,
  useCreateTalentStripeAccount,
  useCrewProfiles,
  useCrewPayments,
  useCrewStripeAccountStatus,
  useInitiateCrewPayout,
  useInitiateTalentPayout,
  useMarkCrewPaymentPaid,
  useMarkTalentPaymentPaid,
  useProjects,
  useTalentProfiles,
  useTalentPayments,
  useTalentStripeAccountStatus,
  useVerifyPaymentPassword,
} from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';

const SORT_OPTIONS = [
  { key: 'person', label: 'Person' },
  { key: 'project', label: 'Production' },
  { key: 'date', label: 'Log Date' },
  { key: 'hours', label: 'Hours' },
  { key: 'amount', label: 'Amount' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'status', label: 'Status' },
];

export default function TalentPaymentAdmin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'crew-payments' ? 'crew-payments' : 'talent-payments';
  const selectedPaymentId = Number(searchParams.get('payment')) || null;

  const switchTab = (tab) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    next.delete('payment');
    setSearchParams(next, { replace: true });
  };

  const selectPayment = (paymentId) => {
    const next = new URLSearchParams(searchParams);
    if (paymentId) {
      next.set('payment', String(paymentId));
    } else {
      next.delete('payment');
    }
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Payments</h1>
        <p className="text-sm text-gray-500 mt-1">
          Each payment row maps to a single approved production time log.
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-6 -mb-px">
          {[
            { id: 'talent-payments', label: 'Talent Payments' },
            { id: 'crew-payments', label: 'Crew Payments' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <PaymentsTab
        type={activeTab === 'talent-payments' ? 'talent' : 'crew'}
        selectedPaymentId={selectedPaymentId}
        onSelectPayment={selectPayment}
      />
    </div>
  );
}

function PaymentsTab({ type, selectedPaymentId, onSelectPayment }) {
  const isTalent = type === 'talent';
  const now = new Date();
  const { data: talentPaymentsData, isLoading: talentLoading } = useTalentPayments();
  const { data: crewPaymentsData, isLoading: crewLoading } = useCrewPayments();
  const { data: talentProfilesData } = useTalentProfiles();
  const { data: crewProfilesData } = useCrewProfiles();
  const { data: projectsData } = useProjects();
  const createTalentPayment = useCreateTalentPayment();
  const createCrewPayment = useCreateCrewPayment();
  const paymentsData = isTalent ? talentPaymentsData : crewPaymentsData;
  const isLoading = isTalent ? talentLoading : crewLoading;
  const payments = paymentsData?.results || paymentsData || [];
  const people = isTalent
    ? (talentProfilesData?.results || talentProfilesData || [])
    : (crewProfilesData?.results || crewProfilesData || []);
  const projects = projectsData?.results || projectsData || [];
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);

  useEffect(() => {
    if (!selectedPaymentId) {
      setSelectedPayment(null);
      return;
    }

    const match = payments.find((payment) => payment.id === selectedPaymentId) || null;
    setSelectedPayment(match);
  }, [payments, selectedPaymentId]);

  useEffect(() => {
    if (!selectedPayment) return;
    const fresh = payments.find((payment) => payment.id === selectedPayment.id);
    if (fresh && fresh !== selectedPayment) {
      setSelectedPayment(fresh);
    }
  }, [payments, selectedPayment]);

  const filteredPayments = useMemo(() => {
    const searchValue = query.trim().toLowerCase();
    const next = payments.filter((payment) => {
      if (statusFilter !== 'all' && payment.status !== statusFilter) return false;
      if (!searchValue) return true;

      const haystack = [
        isTalent ? payment.talent_name : payment.crew_name,
        payment.project_name,
        payment.payment_reference,
        payment.period_label,
        payment.source_time_log_date,
        payment.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(searchValue);
    });

    return next.sort((left, right) => comparePayments(left, right, sortKey, sortDirection, isTalent, now));
  }, [isTalent, payments, query, sortDirection, sortKey, statusFilter, now]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDirection(key === 'person' || key === 'project' || key === 'status' ? 'asc' : 'desc');
  };

  const handleRowClick = (payment) => {
    const nextSelection = selectedPayment?.id === payment.id ? null : payment;
    setSelectedPayment(nextSelection);
    onSelectPayment(nextSelection?.id || null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-800">{isTalent ? 'Talent' : 'Crew'} Payment Records</h2>
          <p className="text-sm text-gray-500 mt-1">Sorted and filterable payment rows linked back to approved time logs.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => setShowAddPaymentForm((prev) => !prev)}
            className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            {showAddPaymentForm ? 'Cancel' : 'Add Payment'}
          </button>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter payments"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      {showAddPaymentForm && (
        <AddPaymentForm
          type={type}
          people={people}
          projects={projects}
          createTalentPayment={createTalentPayment}
          createCrewPayment={createCrewPayment}
          onDone={() => setShowAddPaymentForm(false)}
        />
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">No payment records.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase bg-gray-50">
                <SortableHeader label={isTalent ? 'Talent' : 'Crew'} sortKey="person" activeKey={sortKey} direction={sortDirection} onSort={toggleSort} />
                <SortableHeader label="Production" sortKey="project" activeKey={sortKey} direction={sortDirection} onSort={toggleSort} />
                <SortableHeader label="Log Date" sortKey="date" activeKey={sortKey} direction={sortDirection} onSort={toggleSort} />
                <SortableHeader label="Hours" sortKey="hours" activeKey={sortKey} direction={sortDirection} onSort={toggleSort} />
                <SortableHeader label="Amount" sortKey="amount" activeKey={sortKey} direction={sortDirection} onSort={toggleSort} />
                <SortableHeader label="Overdue" sortKey="overdue" activeKey={sortKey} direction={sortDirection} onSort={toggleSort} />
                <SortableHeader label="Status" sortKey="status" activeKey={sortKey} direction={sortDirection} onSort={toggleSort} />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPayments.map((payment) => (
                <tr
                  key={payment.id}
                  onClick={() => handleRowClick(payment)}
                  className={`cursor-pointer transition-colors ${selectedPayment?.id === payment.id ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-5 py-3 font-medium text-gray-900">{isTalent ? payment.talent_name : payment.crew_name}</td>
                  <td className="px-5 py-3 text-gray-600">{payment.project_name || '—'}</td>
                  <td className="px-5 py-3 text-gray-600">{payment.source_time_log_date || '—'}</td>
                  <td className="px-5 py-3 text-gray-500">{payment.total_hours}h</td>
                  <td className="px-5 py-3 font-medium text-gray-900">${Number(payment.total_amount).toLocaleString()}</td>
                  <td className="px-5 py-3"><OverdueBadge payment={payment} now={now} /></td>
                  <td className="px-5 py-3"><StatusBadge status={payment.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedPayment && <PaymentDetailPanel payment={selectedPayment} type={type} onClose={() => handleRowClick(selectedPayment)} />}

      <div className="flex flex-wrap gap-2 text-xs text-gray-400">
        {SORT_OPTIONS.map((option) => (
          <span key={option.key} className={`px-2 py-1 rounded-full ${sortKey === option.key ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
            Sort: {option.label} {sortKey === option.key ? `(${sortDirection})` : ''}
          </span>
        ))}
      </div>
    </div>
  );
}

function AddPaymentForm({ type, people, projects, createTalentPayment, createCrewPayment, onDone }) {
  const isTalent = type === 'talent';
  const current = new Date();
  const [form, setForm] = useState({
    personId: '',
    projectId: '',
    month: String(current.getMonth() + 1),
    year: String(current.getFullYear()),
    hours: '',
    amount: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const createMutation = isTalent ? createTalentPayment : createCrewPayment;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.personId || !form.month || !form.year || !form.hours || !form.amount) {
      setError('Please fill person, month, year, hours, and amount.');
      return;
    }
    setError('');
    const payload = {
      [isTalent ? 'talent' : 'crew']: Number(form.personId),
      project: form.projectId ? Number(form.projectId) : null,
      period_month: Number(form.month),
      period_year: Number(form.year),
      total_hours: Number(form.hours),
      total_amount: Number(form.amount),
      notes: form.notes,
    };
    try {
      await createMutation.mutateAsync(payload);
      setForm({
        personId: '',
        projectId: '',
        month: String(current.getMonth() + 1),
        year: String(current.getFullYear()),
        hours: '',
        amount: '',
        notes: '',
      });
      onDone();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to add payment.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-indigo-100 shadow-sm p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">Add {isTalent ? 'Talent' : 'Crew'} Payment</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">{isTalent ? 'Talent' : 'Crew'} *</label>
          <select
            value={form.personId}
            onChange={(event) => setForm((prev) => ({ ...prev, personId: event.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          >
            <option value="">Select {isTalent ? 'talent' : 'crew'}…</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>{person.full_name || `${person.user?.first_name || ''} ${person.user?.last_name || ''}`.trim()}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Production</label>
          <select
            value={form.projectId}
            onChange={(event) => setForm((prev) => ({ ...prev, projectId: event.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">No production</option>
            {projects.filter((project) => project.status !== 'archived').map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Month *</label>
            <input
              type="number"
              min="1"
              max="12"
              value={form.month}
              onChange={(event) => setForm((prev) => ({ ...prev, month: event.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Year *</label>
            <input
              type="number"
              min="2020"
              max="2100"
              value={form.year}
              onChange={(event) => setForm((prev) => ({ ...prev, year: event.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Hours *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.hours}
            onChange={(event) => setForm((prev) => ({ ...prev, hours: event.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Amount *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.amount}
            onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-xs text-gray-500 mb-1">Notes</label>
          <textarea
            value={form.notes}
            onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            placeholder="Optional manual payment note"
          />
        </div>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {createMutation.isPending ? 'Saving…' : 'Add Payment'}
        </button>
      </div>
    </form>
  );
}

function SortableHeader({ label, sortKey, activeKey, direction, onSort }) {
  const isActive = activeKey === sortKey;

  return (
    <th className="px-5 py-3">
      <button type="button" onClick={() => onSort(sortKey)} className="inline-flex items-center gap-1 hover:text-gray-700">
        <span>{label}</span>
        <span className="text-[10px]">{isActive ? (direction === 'asc' ? '▲' : '▼') : '↕'}</span>
      </button>
    </th>
  );
}

function comparePayments(left, right, sortKey, sortDirection, isTalent, now) {
  const factor = sortDirection === 'asc' ? 1 : -1;
  const leftValue = getSortValue(left, sortKey, isTalent, now);
  const rightValue = getSortValue(right, sortKey, isTalent, now);

  if (leftValue < rightValue) return -1 * factor;
  if (leftValue > rightValue) return 1 * factor;
  return 0;
}

function getSortValue(payment, sortKey, isTalent, now) {
  switch (sortKey) {
    case 'person':
      return (isTalent ? payment.talent_name : payment.crew_name) || '';
    case 'project':
      return payment.project_name || '';
    case 'hours':
      return Number(payment.total_hours) || 0;
    case 'amount':
      return Number(payment.total_amount) || 0;
    case 'overdue':
      return getOverdueSortValue(payment, now);
    case 'status':
      return payment.status || '';
    case 'date':
    default:
      return payment.source_time_log_date || payment.paid_at || '';
  }
}

function getPaymentDueDate(payment) {
  if (payment?.source_time_log_date) {
    const sourceDate = new Date(`${payment.source_time_log_date}T23:59:59`);
    sourceDate.setDate(sourceDate.getDate() + 30);
    return sourceDate;
  }
  if (payment?.created_at) {
    const created = new Date(payment.created_at);
    created.setDate(created.getDate() + 30);
    return created;
  }
  return null;
}

function getOverdueSortValue(payment, now) {
  if (payment.status === 'paid') return -9999;
  const due = getPaymentDueDate(payment);
  if (!due) return -9998;
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((now.getTime() - due.getTime()) / msPerDay);
}

function OverdueBadge({ payment, now }) {
  if (payment.status === 'paid') {
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-700">No</span>;
  }

  const due = getPaymentDueDate(payment);
  if (!due) {
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">Unknown</span>;
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const dayDiff = Math.floor((now.getTime() - due.getTime()) / msPerDay);

  if (dayDiff > 0) {
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-700">Overdue {dayDiff}d</span>;
  }

  return <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700">On time</span>;
}

function PaymentDetailPanel({ payment, type, onClose }) {
  const isTalent = type === 'talent';
  const profileId = isTalent ? payment.talent : payment.crew;
  const dueDate = getPaymentDueDate(payment);
  const dueBasis = payment.source_time_log_date
    ? '30 days after source shoot log date'
    : payment.created_at
      ? '30 days after payment record creation'
      : null;
  const { paymentUnlocked, setPaymentUnlocked } = useAuth();
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [manualRef, setManualRef] = useState('');

  const talentStripeStatus = useTalentStripeAccountStatus(isTalent ? profileId : null);
  const crewStripeStatus = useCrewStripeAccountStatus(!isTalent ? profileId : null);
  const stripeStatusQuery = isTalent ? talentStripeStatus : crewStripeStatus;

  const createTalentStripe = useCreateTalentStripeAccount();
  const createCrewStripe = useCreateCrewStripeAccount();
  const createStripeAccount = isTalent ? createTalentStripe : createCrewStripe;

  const talentPayout = useInitiateTalentPayout();
  const crewPayout = useInitiateCrewPayout();
  const initiatePayout = isTalent ? talentPayout : crewPayout;

  const talentMarkPaid = useMarkTalentPaymentPaid();
  const crewMarkPaid = useMarkCrewPaymentPaid();
  const markPaid = isTalent ? talentMarkPaid : crewMarkPaid;

  const stripeStatus = stripeStatusQuery.data;
  const onboardingComplete = stripeStatus?.onboarding_complete;
  const hasAccount = !!stripeStatus?.stripe_account_id;
  const requiresReconnect = !!stripeStatus?.requires_reconnect;
  const stripeStatusDetail = stripeStatus?.detail;

  const handleSetupStripe = () => {
    createStripeAccount.mutate(profileId, {
      onSuccess: (data) => {
        if (data?.url) window.open(data.url, '_blank');
      },
    });
  };

  const handlePayout = () => {
    initiatePayout.mutate(payment.id);
  };

  return (
    <div className="bg-white rounded-xl border border-indigo-100 shadow-sm p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{isTalent ? payment.talent_name : payment.crew_name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {payment.project_name || 'No production'} · {payment.source_time_log_date || payment.period_label} · {payment.total_hours}h · ${Number(payment.total_amount).toLocaleString()}
          </p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <InfoItem label="Period" value={payment.period_label} />
        <InfoItem label="Source Log Date" value={payment.source_time_log_date || '—'} />
        <InfoItem label="Source Log Status" value={<StatusBadge status={payment.source_time_log_status || 'pending'} />} />
      </div>

      <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 text-xs text-gray-600">
        <span className="font-medium text-gray-700">Due date:</span>{' '}
        {dueDate ? dueDate.toLocaleDateString() : 'Unknown'}
        {dueBasis && <span className="text-gray-500"> ({dueBasis})</span>}
      </div>

      {payment.status === 'paid' && (
        <div className="rounded-lg bg-green-50 border border-green-100 p-4 text-sm text-green-800">
          <div className="font-medium mb-1">Payment Completed</div>
          {payment.paid_at && <div className="text-xs text-green-600">Paid at: {new Date(payment.paid_at).toLocaleString()}</div>}
          {payment.payment_reference && <div className="text-xs text-green-600 mt-0.5">Ref: {payment.payment_reference}</div>}
          {payment.stripe_transfer_id && <div className="text-xs text-green-600 mt-0.5">Stripe Transfer: {payment.stripe_transfer_id}</div>}
        </div>
      )}

      {payment.status === 'pending' && payment.stripe_transfer_id && (
        <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 text-sm text-blue-800">
          <div className="font-medium mb-1">Stripe Transfer Initiated</div>
          <div className="text-xs text-blue-600">Transfer ID: {payment.stripe_transfer_id}</div>
          <div className="text-xs text-blue-600 mt-0.5">Status: {payment.stripe_payout_status}</div>
          <div className="text-xs text-blue-500 mt-1">Waiting for Stripe webhook to confirm payment…</div>
        </div>
      )}

      {payment.status === 'pending' && !payment.stripe_transfer_id && (
        <div className="space-y-4">
          <div className="text-sm font-medium text-gray-700">Pay via Stripe ACH</div>

          {stripeStatusQuery.isLoading ? (
            <div className="text-sm text-gray-400">Checking Stripe account…</div>
          ) : stripeStatusQuery.isError ? (
            <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700">
              {stripeStatusQuery.error?.response?.data?.detail || 'Unable to verify the Stripe payout account right now.'}
            </div>
          ) : !hasAccount ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">{isTalent ? 'This talent has' : 'This crew member has'} no Stripe payout account yet.</p>
              <button
                onClick={handleSetupStripe}
                disabled={createStripeAccount.isPending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {createStripeAccount.isPending ? 'Creating…' : 'Set Up Stripe Payout Account'}
              </button>
            </div>
          ) : requiresReconnect ? (
            <div className="space-y-2">
              <div className="rounded-lg bg-yellow-50 border border-yellow-100 p-3 text-sm text-yellow-800">
                {stripeStatusDetail || 'This payout account was linked to a previous Stripe platform account and must be reconnected.'}
              </div>
              <button
                onClick={handleSetupStripe}
                disabled={createStripeAccount.isPending}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 disabled:opacity-50"
              >
                {createStripeAccount.isPending ? 'Generating…' : 'Reconnect Stripe Payout Account'}
              </button>
            </div>
          ) : !onboardingComplete ? (
            <div className="space-y-2">
              <div className="rounded-lg bg-yellow-50 border border-yellow-100 p-3 text-sm text-yellow-800">
                Stripe onboarding is not complete. Ask the {isTalent ? 'talent' : 'crew member'} to finish setup, or re-send the onboarding link.
              </div>
              <button
                onClick={handleSetupStripe}
                disabled={createStripeAccount.isPending}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 disabled:opacity-50"
              >
                {createStripeAccount.isPending ? 'Generating…' : 'Re-send Onboarding Link'}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="rounded-lg bg-green-50 border border-green-100 p-3 text-sm text-green-700">
                Stripe account ready · ACH payouts enabled
              </div>
              {!paymentUnlocked ? (
                <button
                  onClick={() => setShowUnlockModal(true)}
                  className="px-5 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 flex items-center gap-2"
                >
                  🔒 Unlock Payments for This Session
                </button>
              ) : (
                <button
                  onClick={handlePayout}
                  disabled={initiatePayout.isPending}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {initiatePayout.isPending ? 'Sending…' : `Pay $${Number(payment.total_amount).toLocaleString()} via ACH`}
                </button>
              )}
            </div>
          )}

          {showUnlockModal && (
            <PaymentUnlockModal
              onSuccess={() => {
                setPaymentUnlocked(true);
                setShowUnlockModal(false);
              }}
              onClose={() => setShowUnlockModal(false)}
            />
          )}

          <div className="pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-400 mb-2">Or mark as paid manually (cash / wire / check)</div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Reference #"
                value={manualRef}
                onChange={(event) => setManualRef(event.target.value)}
                className="w-32 px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button
                onClick={() => markPaid.mutate({ id: payment.id, payment_reference: manualRef, projectId: payment.project })}
                disabled={markPaid.isPending}
                className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-xs font-medium hover:bg-gray-700 disabled:opacity-50"
              >
                {markPaid.isPending ? 'Saving…' : 'Mark Paid'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <div className="mt-1 text-sm text-gray-700">{value}</div>
    </div>
  );
}

function PaymentUnlockModal({ onSuccess, onClose }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const verify = useVerifyPaymentPassword();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await verify.mutateAsync({ password });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm space-y-4 p-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Unlock Payments</h3>
          <p className="text-sm text-gray-500 mt-1">
            Re-enter your password to enable Stripe payouts for this session. You will not be prompted again until you log out.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Your password"
            autoComplete="current-password"
            autoFocus
            required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700 px-4 py-2 text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={verify.isPending}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {verify.isPending ? 'Verifying…' : 'Unlock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
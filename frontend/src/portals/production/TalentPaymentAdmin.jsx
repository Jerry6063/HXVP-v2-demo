import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useTalentProfiles,
  useTalentTimeLogs,
  useTalentPayments,
  useCreateTalentTimeLog,
  useCreateTalentPayment,
  useMarkTalentPaymentPaid,
  useApproveTimeLog,
  useRejectTimeLog,
  useUpdateTalentTimeLog,
  useProjects,
  useShoots,
  useCreateTalentStripeAccount,
  useTalentStripeAccountStatus,
  useInitiateTalentPayout,
  useCrewPayments,
  useCreateCrewPayment,
  useMarkCrewPaymentPaid,
  useCrewProfiles,
  useCreateCrewStripeAccount,
  useCrewStripeAccountStatus,
  useInitiateCrewPayout,
  useVerifyPaymentPassword,
} from '../../api/hooks';
import { useAuth } from '../../contexts/AuthContext';
import StatusBadge from '../../components/StatusBadge';

export default function TalentPaymentAdmin() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = useMemo(() => {
    const tab = searchParams.get('tab');

    if (tab === 'talent-payments' || tab === 'crew-payments') {
      return tab;
    }

    return 'timelogs';
  }, [searchParams]);

  const switchTab = (tab) => {
    const next = new URLSearchParams(searchParams);

    if (tab === 'timelogs') {
      next.delete('tab');
    } else {
      next.set('tab', tab);
    }

    setSearchParams(next, { replace: true });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Talent Payments & Time Logs</h1>

      <div className="border-b border-gray-200">
        <nav className="flex gap-6 -mb-px">
          {[
            { id: 'timelogs', label: 'Log Time' },
            { id: 'talent-payments', label: 'Talent Payments' },
            { id: 'crew-payments', label: 'Crew Payments' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === t.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'timelogs' && <TimeLogTab />}
      {activeTab === 'talent-payments' && <PaymentsTab type="talent" />}
      {activeTab === 'crew-payments' && <PaymentsTab type="crew" />}
    </div>
  );
}

function TimeLogTab() {
  const { data: profilesData } = useTalentProfiles();
  const { data: projectsData } = useProjects();
  const { data: shootsData } = useShoots();
  const { data: logsData, isLoading } = useTalentTimeLogs();
  const createLog = useCreateTalentTimeLog();
  const approveLog = useApproveTimeLog();
  const rejectLog = useRejectTimeLog();
  const updateLog = useUpdateTalentTimeLog();

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const profiles = profilesData?.results || profilesData || [];
  const projects = projectsData?.results || projectsData || [];
  const shoots = shootsData?.results || shootsData || [];
  const logs = logsData?.results || logsData || [];

  const [form, setForm] = useState({
    talent: '',
    project: '',
    shoot: '',
    date: new Date().toISOString().split('T')[0],
    hours_worked: '',
    rate_applied: '',
    notes: '',
  });
  const [showForm, setShowForm] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const selectedTalent = profiles.find((p) => String(p.id) === form.talent);
  const autoRate = selectedTalent?.hourly_rate || '';

  const handleSubmit = (e) => {
    e.preventDefault();
    const rate = form.rate_applied || autoRate;
    const hours = parseFloat(form.hours_worked);
    createLog.mutate(
      {
        talent: parseInt(form.talent, 10),
        project: parseInt(form.project, 10),
        shoot: form.shoot ? parseInt(form.shoot, 10) : null,
        date: form.date,
        hours_worked: hours,
        rate_applied: parseFloat(rate),
        amount: hours * parseFloat(rate),
        notes: form.notes,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setForm({
            talent: '', project: '', shoot: '',
            date: new Date().toISOString().split('T')[0],
            hours_worked: '', rate_applied: '', notes: '',
          });
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Time Logs</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Log Time
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Talent</label>
              <select
                value={form.talent}
                onChange={set('talent')}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Select talent...</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Project</label>
              <select
                value={form.project}
                onChange={set('project')}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Select project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Shoot (optional)</label>
              <select
                value={form.shoot}
                onChange={set('shoot')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">None</option>
                {shoots
                  .filter((s) => !form.project || String(s.project) === form.project)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.shoot_date} – {s.location}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={set('date')}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Hours Worked</label>
              <input
                type="number"
                step="0.25"
                value={form.hours_worked}
                onChange={set('hours_worked')}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Rate ($/hr){autoRate ? ` — default: $${autoRate}` : ''}
              </label>
              <input
                type="number"
                step="0.01"
                value={form.rate_applied}
                onChange={set('rate_applied')}
                placeholder={autoRate ? String(autoRate) : ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Notes</label>
            <input
              type="text"
              value={form.notes}
              onChange={set('notes')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createLog.isPending}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {createLog.isPending ? 'Saving...' : 'Log Time'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">No time logs yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase bg-gray-50">
                <th className="px-5 py-3">Talent</th>
                <th className="px-5 py-3">Project</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Hours</th>
                <th className="px-5 py-3">Rate</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-5 py-3 font-medium text-gray-900">{log.talent_name}</td>
                  <td className="px-5 py-3 text-gray-600">{log.project_name}</td>
                  <td className="px-5 py-3 text-gray-500">{log.date}</td>
                  {editingId === log.id ? (
                    <>
                      <td className="px-5 py-3"><input type="number" step="0.25" value={editForm.hours_worked} onChange={(e) => setEditForm(f => ({ ...f, hours_worked: e.target.value }))} className="w-16 px-2 py-1 border border-gray-300 rounded text-xs" /></td>
                      <td className="px-5 py-3"><input type="number" step="0.01" value={editForm.rate_applied} onChange={(e) => setEditForm(f => ({ ...f, rate_applied: e.target.value }))} className="w-20 px-2 py-1 border border-gray-300 rounded text-xs" /></td>
                      <td className="px-5 py-3"><input type="number" step="0.01" value={editForm.amount} onChange={(e) => setEditForm(f => ({ ...f, amount: e.target.value }))} className="w-20 px-2 py-1 border border-gray-300 rounded text-xs" /></td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-3 text-gray-700">{log.hours_worked}h</td>
                      <td className="px-5 py-3 text-gray-500">${Number(log.rate_applied).toLocaleString()}</td>
                      <td className="px-5 py-3 font-medium text-gray-900">${Number(log.amount).toLocaleString()}</td>
                    </>
                  )}
                  <td className="px-5 py-3"><StatusBadge status={log.log_status} /></td>
                  <td className="px-5 py-3">
                    {editingId === log.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => { updateLog.mutate({ id: log.id, hours_worked: parseFloat(editForm.hours_worked), rate_applied: parseFloat(editForm.rate_applied), amount: parseFloat(editForm.amount), notes: editForm.notes }); setEditingId(null); }} className="px-2 py-1 bg-indigo-600 text-white rounded text-xs font-medium hover:bg-indigo-700">Save</button>
                        <button onClick={() => setEditingId(null)} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium hover:bg-gray-200">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        {log.log_status === 'pending' && (
                          <>
                            <button onClick={() => approveLog.mutate(log.id)} disabled={approveLog.isPending} className="px-2 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 disabled:opacity-50">Approve</button>
                            <button onClick={() => rejectLog.mutate(log.id)} disabled={rejectLog.isPending} className="px-2 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 disabled:opacity-50">Reject</button>
                          </>
                        )}
                        <button onClick={() => { setEditingId(log.id); setEditForm({ hours_worked: log.hours_worked, rate_applied: log.rate_applied, amount: log.amount, notes: log.notes || '' }); }} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium hover:bg-gray-200">Edit</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Shared Payments Tab (talent or crew) ─────────────────────────────────────

function PaymentsTab({ type }) {
  const isTalent = type === 'talent';
  const { data: talentProfilesData } = useTalentProfiles();
  const { data: crewProfilesData } = useCrewProfiles();
  const { data: talentPaymentsData, isLoading: talentLoading } = useTalentPayments();
  const { data: crewPaymentsData, isLoading: crewLoading } = useCrewPayments();
  const createTalentPay = useCreateTalentPayment();
  const createCrewPay = useCreateCrewPayment();

  const profilesData = isTalent ? talentProfilesData : crewProfilesData;
  const paymentsData = isTalent ? talentPaymentsData : crewPaymentsData;
  const isLoading = isTalent ? talentLoading : crewLoading;
  const createPayment = isTalent ? createTalentPay : createCrewPay;

  const { data: projectsData } = useProjects();
  const allProjects = projectsData?.results || projectsData || [];
  const profiles = profilesData?.results || profilesData || [];
  const payments = paymentsData?.results || paymentsData || [];

  const [showCreate, setShowCreate] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Keep selectedPayment in sync with fresh list data so the detail panel
  // reflects any server-side changes (e.g. after a payout mutation).
  useEffect(() => {
    if (selectedPayment) {
      const fresh = payments.find((p) => p.id === selectedPayment.id);
      if (fresh && fresh !== selectedPayment) setSelectedPayment(fresh);
    }
  }, [payments]); // eslint-disable-line react-hooks/exhaustive-deps
  const now = new Date();
  const [form, setForm] = useState({
    person: '',
    project: '',
    period_month: now.getMonth() + 1,
    period_year: now.getFullYear(),
    total_hours: '',
    total_amount: '',
    notes: '',
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCreate = (e) => {
    e.preventDefault();
    const personKey = isTalent ? 'talent' : 'crew';
    createPayment.mutate(
      {
        [personKey]: parseInt(form.person, 10),
        project: form.project ? parseInt(form.project, 10) : null,
        period_month: parseInt(form.period_month, 10),
        period_year: parseInt(form.period_year, 10),
        total_hours: parseFloat(form.total_hours) || 0,
        total_amount: parseFloat(form.total_amount) || 0,
        notes: form.notes,
      },
      {
        onSuccess: () => {
          setShowCreate(false);
          setForm({ person: '', project: '', period_month: now.getMonth() + 1, period_year: now.getFullYear(), total_hours: '', total_amount: '', notes: '' });
        },
      }
    );
  };

  const personLabel = isTalent ? 'Talent' : 'Crew Member';
  const nameField = isTalent ? 'full_name' : 'full_name';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">{isTalent ? 'Talent' : 'Crew'} Payment Records</h2>
        <button
          onClick={() => { setShowCreate(!showCreate); setSelectedPayment(null); }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Create Payment
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">{personLabel}</label>
              <select value={form.person} onChange={set('person')} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="">Select {personLabel.toLowerCase()}...</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>{p[nameField]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Month</label>
              <input type="number" min="1" max="12" value={form.period_month} onChange={set('period_month')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Year</label>
              <input type="number" value={form.period_year} onChange={set('period_year')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Production</label>
              <select value={form.project} onChange={set('project')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="">None (no production)</option>
                {allProjects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Total Hours</label>
              <input type="number" step="0.25" value={form.total_hours} onChange={set('total_hours')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Total Amount ($)</label>
              <input type="number" step="0.01" value={form.total_amount} onChange={set('total_amount')} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={createPayment.isPending} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              {createPayment.isPending ? 'Creating...' : 'Create Payment Record'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">No payment records.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase bg-gray-50">
                <th className="px-5 py-3">{personLabel}</th>
                <th className="px-5 py-3">Production</th>
                <th className="px-5 py-3">Period</th>
                <th className="px-5 py-3">Hours</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setSelectedPayment(selectedPayment?.id === p.id ? null : p)}
                  className={`cursor-pointer transition-colors ${selectedPayment?.id === p.id ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {isTalent ? p.talent_name : p.crew_name}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{p.project_name || '—'}</td>
                  <td className="px-5 py-3 text-gray-600">{p.period_label}</td>
                  <td className="px-5 py-3 text-gray-500">{p.total_hours}h</td>
                  <td className="px-5 py-3 font-medium text-gray-900">${Number(p.total_amount).toLocaleString()}</td>
                  <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedPayment && (
        <PaymentDetailPanel
          payment={selectedPayment}
          type={type}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </div>
  );
}

// ── Payment Detail Panel ──────────────────────────────────────────────────────

function PaymentDetailPanel({ payment, type, onClose }) {
  const isTalent = type === 'talent';
  const profileId = isTalent ? payment.talent : payment.crew;

  const { paymentUnlocked, setPaymentUnlocked } = useAuth();
  const [showUnlockModal, setShowUnlockModal] = useState(false);

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
  const [manualRef, setManualRef] = useState('');

  const stripeStatus = stripeStatusQuery.data;
  const onboardingComplete = stripeStatus?.onboarding_complete;
  const hasAccount = !!stripeStatus?.stripe_account_id;

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
          <h3 className="text-base font-semibold text-gray-900">
            {isTalent ? payment.talent_name : payment.crew_name}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {payment.project_name || 'No production'} · {payment.period_label} · {payment.total_hours}h · ${Number(payment.total_amount).toLocaleString()}
          </p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
      </div>

      {/* Paid state */}
      {payment.status === 'paid' && (
        <div className="rounded-lg bg-green-50 border border-green-100 p-4 text-sm text-green-800">
          <div className="font-medium mb-1">Payment Completed</div>
          {payment.paid_at && <div className="text-xs text-green-600">Paid at: {new Date(payment.paid_at).toLocaleString()}</div>}
          {payment.payment_reference && <div className="text-xs text-green-600 mt-0.5">Ref: {payment.payment_reference}</div>}
          {payment.stripe_transfer_id && <div className="text-xs text-green-600 mt-0.5">Stripe Transfer: {payment.stripe_transfer_id}</div>}
        </div>
      )}

      {/* Transfer initiated (pending) state */}
      {payment.status === 'pending' && payment.stripe_transfer_id && (
        <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 text-sm text-blue-800">
          <div className="font-medium mb-1">Stripe Transfer Initiated</div>
          <div className="text-xs text-blue-600">Transfer ID: {payment.stripe_transfer_id}</div>
          <div className="text-xs text-blue-600 mt-0.5">Status: {payment.stripe_payout_status}</div>
          <div className="text-xs text-blue-500 mt-1">Waiting for Stripe webhook to confirm payment…</div>
        </div>
      )}

      {/* Pending: no transfer yet — show Stripe payout options */}
      {payment.status === 'pending' && !payment.stripe_transfer_id && (
        <div className="space-y-4">
          <div className="text-sm font-medium text-gray-700">Pay via Stripe ACH</div>

          {stripeStatusQuery.isLoading ? (
            <div className="text-sm text-gray-400">Checking Stripe account…</div>
          ) : !hasAccount ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                {isTalent ? 'This talent has' : 'This crew member has'} no Stripe payout account yet.
              </p>
              <button
                onClick={handleSetupStripe}
                disabled={createStripeAccount.isPending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {createStripeAccount.isPending ? 'Creating…' : 'Set Up Stripe Payout Account'}
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
              {initiatePayout.isError && (
                <div className="text-xs bg-red-50 border border-red-100 rounded-lg p-3 space-y-1">
                  {initiatePayout.error?.response?.data?.stripe_transfer_id ? (
                    <>
                      <p className="font-semibold text-red-700">Transfer sent — portal update failed.</p>
                      <p className="text-red-600">Transfer ID: <span className="font-mono">{initiatePayout.error.response.data.stripe_transfer_id}</span></p>
                      <p className="text-red-500">The payout was sent to Stripe. Please verify in the Stripe dashboard and use "Mark Paid" below to update this record.</p>
                    </>
                  ) : (
                    <p className="text-red-600">{initiatePayout.error?.response?.data?.detail || 'Payout request failed. Please check the Stripe dashboard before retrying.'}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {showUnlockModal && (
            <PaymentUnlockModal
              onSuccess={() => { setPaymentUnlocked(true); setShowUnlockModal(false); }}
              onClose={() => setShowUnlockModal(false)}
            />
          )}

          {/* Manual fallback */}
          <div className="pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-400 mb-2">Or mark as paid manually (cash / wire / check)</div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Reference #"
                value={manualRef}
                onChange={(e) => setManualRef(e.target.value)}
                className="w-32 px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button
                onClick={() => markPaid.mutate({ id: payment.id, payment_reference: manualRef })}
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

// ── Payment Unlock Modal ──────────────────────────────────────────────────────

function PaymentUnlockModal({ onSuccess, onClose }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const verify = useVerifyPaymentPassword();

  const handleSubmit = async (e) => {
    e.preventDefault();
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
            onChange={(e) => setPassword(e.target.value)}
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


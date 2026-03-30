import { useState } from 'react';
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
} from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';

export default function TalentPaymentAdmin() {
  const [tab, setTab] = useState('timelogs');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Talent Payments & Time Logs</h1>

      <div className="border-b border-gray-200">
        <nav className="flex gap-6 -mb-px">
          {[
            { id: 'timelogs', label: 'Log Time' },
            { id: 'payments', label: 'Manage Payments' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {tab === 'timelogs' && <TimeLogTab />}
      {tab === 'payments' && <PaymentsTab />}
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

function PaymentsTab() {
  const { data: profilesData } = useTalentProfiles();
  const { data: paymentsData, isLoading } = useTalentPayments();
  const createPayment = useCreateTalentPayment();
  const markPaid = useMarkTalentPaymentPaid();

  const profiles = profilesData?.results || profilesData || [];
  const payments = paymentsData?.results || paymentsData || [];

  const [showCreate, setShowCreate] = useState(false);
  const now = new Date();
  const { data: projectsData } = useProjects();
  const allProjects = projectsData?.results || projectsData || [];

  const [form, setForm] = useState({
    talent: '',
    project: '',
    period_month: now.getMonth() + 1,
    period_year: now.getFullYear(),
    total_hours: '',
    total_amount: '',
    notes: '',
  });
  const [payRef, setPayRef] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCreate = (e) => {
    e.preventDefault();
    createPayment.mutate(
      {
        talent: parseInt(form.talent, 10),
        project: form.project ? parseInt(form.project, 10) : null,
        period_month: parseInt(form.period_month, 10),
        period_year: parseInt(form.period_year, 10),
        total_hours: parseFloat(form.total_hours) || 0,
        total_amount: parseFloat(form.total_amount) || 0,
        notes: form.notes,
      },
      { onSuccess: () => setShowCreate(false) }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Payment Records</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Create Payment
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Talent</label>
              <select value={form.talent} onChange={set('talent')} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="">Select talent...</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
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
                <th className="px-5 py-3">Talent</th>
                <th className="px-5 py-3">Production</th>
                <th className="px-5 py-3">Period</th>
                <th className="px-5 py-3">Hours</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-3 font-medium text-gray-900">{p.talent_name}</td>
                  <td className="px-5 py-3 text-gray-600">{p.project_name || '—'}</td>
                  <td className="px-5 py-3 text-gray-600">{p.period_label}</td>
                  <td className="px-5 py-3 text-gray-500">{p.total_hours}h</td>
                  <td className="px-5 py-3 font-medium text-gray-900">${Number(p.total_amount).toLocaleString()}</td>
                  <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-3">
                    {p.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Ref #"
                          value={payRef}
                          onChange={(e) => setPayRef(e.target.value)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                        <button
                          onClick={() => markPaid.mutate({ id: p.id, payment_reference: payRef })}
                          disabled={markPaid.isPending}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                        >
                          Mark Paid
                        </button>
                      </div>
                    )}
                    {p.status === 'paid' && (
                      <span className="text-xs text-green-600">{p.payment_reference}</span>
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

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  useInvoices,
  useCreateInvoice,
  useProjects,
  useProjectPayments,
  useCreateProjectPayment,
  useVerifyPayment,
  useRejectPayment,
} from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function InvoiceManager() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const { data: invoicesData, isLoading } = useInvoices();
  const { data: projectsData } = useProjects({ status: 'active' });
  const createInvoice = useCreateInvoice();
  const createPayment = useCreateProjectPayment();
  const [paymentFilters, setPaymentFilters] = useState({
    status: '',
    client: '',
    date_from: '',
    date_to: '',
  });
  const activePaymentFilters = Object.fromEntries(
    Object.entries(paymentFilters).filter(([, v]) => v)
  );
  const { data: paymentsData } = useProjectPayments(activePaymentFilters);
  const verifyPayment = useVerifyPayment();
  const rejectPayment = useRejectPayment();

  const [notesModal, setNotesModal] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  const DEFAULT_INSTRUCTIONS =
    'Please remit payment via bank wire transfer to:\nBank: [Bank Name]\nAccount Name: HXVP Marketing Group\nAccount Number: [Account Number]\nRouting Number: [Routing Number]\nSWIFT/BIC: [SWIFT Code]\n\nPlease include your invoice reference number in the transfer memo.';

  const [showForm, setShowForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [form, setForm] = useState({
    project: '',
    client: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    tax_rate: '0',
    payment_instructions: DEFAULT_INSTRUCTIONS,
    notes: '',
  });
  const [paymentForm, setPaymentForm] = useState({
    invoice: '',
    amount: '',
    payment_method: 'Bank Transfer',
    payment_date: new Date().toISOString().split('T')[0],
    reference_note: '',
    payment_proof: null,
  });

  const projects = projectsData?.results || projectsData || [];
  const invoices = invoicesData?.results || invoicesData || [];
  const selectableInvoices = invoices.filter((inv) => inv.status !== 'draft');
  const payments = paymentsData?.results || paymentsData || [];
  const filteredInvoices = statusFilter
    ? invoices.filter((i) => i.status === statusFilter)
    : invoices;

  const handleToggleForm = () => {
    if (!showForm) {
      // Prefill payment instructions from the most recently created invoice
      const lastInstructions = invoices[0]?.payment_instructions;
      setForm((f) => ({
        ...f,
        project: '',
        client: '',
        due_date: '',
        notes: '',
        invoice_date: new Date().toISOString().split('T')[0],
        payment_instructions: lastInstructions || DEFAULT_INSTRUCTIONS,
      }));
    }
    setShowForm((s) => !s);
  };

  const handleProjectChange = (e) => {
    const pid = e.target.value;
    const proj = projects.find((p) => String(p.id) === pid);
    setForm((f) => ({
      ...f,
      project: pid,
      client: proj ? String(proj.client) : '',
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const newInvoice = await createInvoice.mutateAsync({
        ...form,
        tax_rate: parseFloat(form.tax_rate) || 0,
      });
      navigate(`/production/invoices/${newInvoice.id}`);
    } catch (err) {
      alert('Error creating invoice: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handlePaymentInvoiceChange = (e) => {
    const invoiceId = e.target.value;
    const selected = invoices.find((inv) => String(inv.id) === invoiceId);
    setPaymentForm((f) => ({
      ...f,
      invoice: invoiceId,
      amount: selected ? String(selected.total || '') : '',
    }));
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    try {
      await createPayment.mutateAsync({
        ...paymentForm,
        amount: parseFloat(paymentForm.amount),
      });
      setShowPaymentForm(false);
      setPaymentForm({
        invoice: '',
        amount: '',
        payment_method: 'Bank Transfer',
        payment_date: new Date().toISOString().split('T')[0],
        reference_note: '',
        payment_proof: null,
      });
    } catch (err) {
      alert('Error uploading payment: ' + (err.response?.data?.detail || err.message));
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const stats = {
    total: filteredInvoices.length,
    draft: filteredInvoices.filter((i) => i.status === 'draft').length,
    pending: filteredInvoices.filter((i) => i.status === 'pending').length,
    paid: filteredInvoices.filter((i) => i.status === 'paid').length,
    totalRevenue: invoices
      .filter((i) => i.status === 'paid')
      .reduce((s, i) => s + parseFloat(i.total || 0), 0),
  };

  const paymentStats = {
    total: payments.length,
    pending: payments.filter((p) => p.status === 'pending').length,
    verified: payments.filter((p) => p.status === 'verified').length,
    rejected: payments.filter((p) => p.status === 'rejected').length,
    totalVerified: payments
      .filter((p) => p.status === 'verified')
      .reduce((s, p) => s + parseFloat(p.amount || 0), 0),
  };

  const handleVerify = async (paymentId) => {
    setNotesModal({ paymentId, action: 'verify' });
    setAdminNotes('');
  };

  const handleReject = async (paymentId) => {
    setNotesModal({ paymentId, action: 'reject' });
    setAdminNotes('');
  };

  const confirmAction = async () => {
    if (!notesModal) return;
    const { paymentId, action } = notesModal;
    if (action === 'verify') {
      await verifyPayment.mutateAsync({ id: paymentId, admin_notes: adminNotes });
    } else {
      await rejectPayment.mutateAsync({ id: paymentId, admin_notes: adminNotes });
    }
    setNotesModal(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Client Payments</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowPaymentForm(false);
              handleToggleForm();
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            {showForm ? 'Cancel Invoice' : '+ New Invoice'}
          </button>
          <button
            onClick={() => {
              setShowForm(false);
              setShowPaymentForm((v) => !v);
            }}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            {showPaymentForm ? 'Cancel Payment' : '+ Add Payment'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Invoices', val: stats.total, color: 'bg-gray-100' },
          { label: 'Draft', val: stats.draft, color: 'bg-yellow-50' },
          { label: 'Payment Pending', val: stats.pending, color: 'bg-blue-50' },
          { label: 'Paid', val: stats.paid, color: 'bg-green-50' },
          {
            label: 'Revenue (Paid)',
            val: `$${stats.totalRevenue.toLocaleString()}`,
            color: 'bg-emerald-50',
          },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-xl p-4`}>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-xl font-bold mt-1">{s.val}</p>
          </div>
        ))}
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="text-lg font-semibold">Create New Invoice</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
              <select
                value={form.project}
                onChange={handleProjectChange}
                required
                className="w-full border rounded-lg p-2"
              >
                <option value="">Select project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.client_name ? `(${p.client_name})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
              <input
                type="number"
                step="0.01"
                value={form.tax_rate}
                onChange={(e) => setForm((f) => ({ ...f, tax_rate: e.target.value }))}
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date *</label>
              <input
                type="date"
                value={form.invoice_date}
                onChange={(e) => setForm((f) => ({ ...f, invoice_date: e.target.value }))}
                required
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                required
                className="w-full border rounded-lg p-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Instructions</label>
            <textarea
              value={form.payment_instructions}
              onChange={(e) => setForm((f) => ({ ...f, payment_instructions: e.target.value }))}
              rows={5}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={createInvoice.isPending}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
          </button>
        </form>
      )}

      {showPaymentForm && (
        <form onSubmit={handleCreatePayment} className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="text-lg font-semibold">Upload Client Payment (Admin)</h2>
          <p className="text-sm text-gray-500">
            Use this when client cannot submit payment from their portal. Payment will be recorded for the selected invoice's client.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice *</label>
              <select
                value={paymentForm.invoice}
                onChange={handlePaymentInvoiceChange}
                required
                className="w-full border rounded-lg p-2"
              >
                <option value="">Select invoice...</option>
                {selectableInvoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.reference_number} — {inv.client_name} — ${parseFloat(inv.total || 0).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm((f) => ({ ...f, amount: e.target.value }))}
                required
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <input
                type="text"
                value={paymentForm.payment_method}
                onChange={(e) => setPaymentForm((f) => ({ ...f, payment_method: e.target.value }))}
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
              <input
                type="date"
                value={paymentForm.payment_date}
                onChange={(e) => setPaymentForm((f) => ({ ...f, payment_date: e.target.value }))}
                required
                className="w-full border rounded-lg p-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference Note</label>
            <input
              type="text"
              value={paymentForm.reference_note}
              onChange={(e) => setPaymentForm((f) => ({ ...f, reference_note: e.target.value }))}
              className="w-full border rounded-lg p-2"
              placeholder="Transfer ID / check number (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Proof (optional)</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setPaymentForm((f) => ({ ...f, payment_proof: e.target.files?.[0] || null }))}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={createPayment.isPending}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {createPayment.isPending ? 'Uploading...' : 'Upload Payment'}
          </button>
        </form>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        {['', 'draft', 'pending', 'paid', 'unpaid', 'overdue'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              statusFilter === s
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Reference', 'Project', 'Client', 'Date', 'Due', 'Total', 'Status', ''].map(
                (h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  No invoices yet
                </td>
              </tr>
            )}
            {filteredInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-sm font-medium">{inv.reference_number}</td>
                <td className="px-4 py-3 text-sm">{inv.project_name}</td>
                <td className="px-4 py-3 text-sm">{inv.client_name}</td>
                <td className="px-4 py-3 text-sm">{inv.invoice_date}</td>
                <td className="px-4 py-3 text-sm">{inv.due_date}</td>
                <td className="px-4 py-3 text-sm font-medium">${parseFloat(inv.total).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={inv.status} />
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/production/invoices/${inv.id}`}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pt-2">
        <h2 className="text-lg font-semibold text-gray-900">Payment Verification</h2>
        <p className="text-sm text-gray-500">Review client payment proofs and verify or reject submissions.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Payments', val: paymentStats.total, color: 'bg-gray-100' },
          { label: 'Pending', val: paymentStats.pending, color: 'bg-yellow-50' },
          { label: 'Verified', val: paymentStats.verified, color: 'bg-green-50' },
          { label: 'Rejected', val: paymentStats.rejected, color: 'bg-red-50' },
          {
            label: 'Total Received',
            val: `$${paymentStats.totalVerified.toLocaleString()}`,
            color: 'bg-emerald-50',
          },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-xl p-4`}>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-xl font-bold mt-1">{s.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              value={paymentFilters.status}
              onChange={(e) => setPaymentFilters((f) => ({ ...f, status: e.target.value }))}
              className="w-full border rounded-lg p-2 text-sm"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Client ID</label>
            <input
              type="text"
              value={paymentFilters.client}
              onChange={(e) => setPaymentFilters((f) => ({ ...f, client: e.target.value }))}
              placeholder="Filter by client ID"
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
            <input
              type="date"
              value={paymentFilters.date_from}
              onChange={(e) => setPaymentFilters((f) => ({ ...f, date_from: e.target.value }))}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
            <input
              type="date"
              value={paymentFilters.date_to}
              onChange={(e) => setPaymentFilters((f) => ({ ...f, date_to: e.target.value }))}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Invoice', 'Project', 'Client', 'Amount', 'Method', 'Date', 'Status', 'Proof', 'Actions'].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payments.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                  No payments found
                </td>
              </tr>
            )}
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-sm">{p.invoice_ref}</td>
                <td className="px-4 py-3 text-sm">{p.project_name}</td>
                <td className="px-4 py-3 text-sm">{p.client_name}</td>
                <td className="px-4 py-3 text-sm font-medium">
                  ${parseFloat(p.amount).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm">{p.payment_method}</td>
                <td className="px-4 py-3 text-sm">{p.payment_date}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-4 py-3">
                  {p.proof_url ? (
                    <a
                      href={p.proof_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 text-sm hover:underline"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-gray-400 text-sm">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {p.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerify(p.id)}
                        className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-medium hover:bg-green-200"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => handleReject(p.id)}
                        className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-medium hover:bg-red-200"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {p.status === 'verified' && (
                    <span className="text-green-600 text-xs">✓ Confirmed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {notesModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold">
              {notesModal.action === 'verify' ? 'Verify Payment' : 'Reject Payment'}
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Notes (optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="w-full border rounded-lg p-2 text-sm"
                placeholder="Add notes about this payment..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setNotesModal(null)}
                className="text-gray-600 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={verifyPayment.isPending || rejectPayment.isPending}
                className={`px-4 py-2 rounded-lg text-sm text-white disabled:opacity-50 ${
                  notesModal.action === 'verify'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {notesModal.action === 'verify' ? 'Confirm Verify' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

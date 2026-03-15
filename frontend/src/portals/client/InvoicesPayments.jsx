import { useState, useRef } from 'react';
import {
  useInvoices,
  useInvoice,
  useProjectPayments,
  useCreateProjectPayment,
} from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

function BankInfo() {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
      <h2 className="text-lg font-bold text-indigo-900 mb-4">
        Bank & Wire Transfer Information
      </h2>
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <span className="text-gray-500">Company:</span>
          <span className="font-medium">HXVP Marketing Group</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <span className="text-gray-500">Bank:</span>
          <span className="font-medium">[Bank Name]</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <span className="text-gray-500">Account Name:</span>
          <span className="font-medium">HXVP Marketing Group</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <span className="text-gray-500">Account Number:</span>
          <span className="font-medium font-mono">[Account Number]</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <span className="text-gray-500">Routing Number:</span>
          <span className="font-medium font-mono">[Routing Number]</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <span className="text-gray-500">SWIFT/BIC:</span>
          <span className="font-medium font-mono">[SWIFT Code]</span>
        </div>
      </div>
      <div className="mt-4 p-3 bg-white/60 rounded-lg text-xs text-gray-600">
        Please include the invoice reference number in the transfer memo/description
        to help us identify your payment quickly.
      </div>
    </div>
  );
}

function InvoiceView({ invoiceId, onClose }) {
  const { data: invoice, isLoading } = useInvoice(invoiceId);

  if (isLoading) return <LoadingSpinner />;
  if (!invoice) return null;

  const items = invoice.items || [];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Invoice</p>
              <h2 className="text-xl font-bold">{invoice.reference_number}</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
              ×
            </button>
          </div>

          {/* Key Dates */}
          <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
            <div>
              <p className="text-xs text-gray-400">Invoice Date</p>
              <p className="font-medium">{invoice.invoice_date}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Due Date</p>
              <p className="font-medium text-red-600">{invoice.due_date}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Balance Due</p>
              <p className="text-xl font-bold text-indigo-700">
                ${parseFloat(invoice.total).toLocaleString()}
              </p>
            </div>
          </div>

          {/* From / To */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase mb-1">From</p>
              <p className="font-semibold">HXVP Marketing Group</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase mb-1">Bill To</p>
              <p className="font-semibold">{invoice.client_name}</p>
              <p className="text-sm text-gray-500">{invoice.client_email}</p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-gray-400">
                <th className="pb-2">Item</th>
                <th className="pb-2 w-20">Qty</th>
                <th className="pb-2 w-24">Rate</th>
                <th className="pb-2 w-24 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2">{item.description}</td>
                  <td className="py-2">{item.quantity}</td>
                  <td className="py-2">${parseFloat(item.rate).toLocaleString()}</td>
                  <td className="py-2 text-right font-medium">
                    ${parseFloat(item.amount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex flex-col items-end space-y-1 border-t pt-3">
            <div className="flex gap-8 text-sm">
              <span className="text-gray-500">Subtotal:</span>
              <span className="w-24 text-right">${parseFloat(invoice.subtotal).toLocaleString()}</span>
            </div>
            <div className="flex gap-8 text-sm">
              <span className="text-gray-500">Tax ({invoice.tax_rate}%):</span>
              <span className="w-24 text-right">${parseFloat(invoice.tax_amount).toLocaleString()}</span>
            </div>
            <div className="flex gap-8 font-bold border-t pt-2">
              <span>Total:</span>
              <span className="w-24 text-right">${parseFloat(invoice.total).toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Instructions */}
          {invoice.payment_instructions && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-400 uppercase mb-2">Payment Instructions</p>
              <pre className="whitespace-pre-wrap text-sm text-gray-700">
                {invoice.payment_instructions}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SubmitPaymentForm({ invoices, onDone }) {
  const createPayment = useCreateProjectPayment();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    invoice: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'Bank Transfer',
    reference_note: '',
  });
  const [proofFile, setProofFile] = useState(null);

  const unpaidInvoices = (invoices || []).filter(
    (i) => i.status === 'sent' || i.status === 'overdue'
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form };
    if (proofFile) data.payment_proof = proofFile;
    try {
      await createPayment.mutateAsync(data);
      setForm({
        invoice: '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'Bank Transfer',
        reference_note: '',
      });
      setProofFile(null);
      if (fileRef.current) fileRef.current.value = '';
      onDone?.();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.detail || err.message));
    }
  };

  const selectedInvoice = unpaidInvoices.find((i) => String(i.id) === form.invoice);

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Submit Payment Proof</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Invoice *</label>
          <select
            value={form.invoice}
            onChange={(e) => {
              const inv = unpaidInvoices.find((i) => String(i.id) === e.target.value);
              setForm((f) => ({
                ...f,
                invoice: e.target.value,
                amount: inv ? inv.total : '',
              }));
            }}
            required
            className="w-full border rounded-lg p-2"
          >
            <option value="">Select invoice...</option>
            {unpaidInvoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.reference_number} – {inv.project_name} (${parseFloat(inv.total).toLocaleString()})
              </option>
            ))}
          </select>
          {selectedInvoice && (
            <p className="text-xs text-gray-500 mt-1">
              Due: {selectedInvoice.due_date} · Total: ${parseFloat(selectedInvoice.total).toLocaleString()}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid *</label>
          <input
            type="number"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            required
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
          <input
            type="date"
            value={form.payment_date}
            onChange={(e) => setForm((f) => ({ ...f, payment_date: e.target.value }))}
            required
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
          <select
            value={form.payment_method}
            onChange={(e) => setForm((f) => ({ ...f, payment_method: e.target.value }))}
            className="w-full border rounded-lg p-2"
          >
            <option>Bank Transfer</option>
            <option>Wire Transfer</option>
            <option>Check</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reference / Memo</label>
          <input
            type="text"
            value={form.reference_note}
            onChange={(e) => setForm((f) => ({ ...f, reference_note: e.target.value }))}
            className="w-full border rounded-lg p-2"
            placeholder="e.g. transfer confirmation number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Proof (screenshot/PDF)
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setProofFile(e.target.files[0] || null)}
            className="w-full border rounded-lg p-2 text-sm"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={createPayment.isPending}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {createPayment.isPending ? 'Submitting...' : 'Submit Payment'}
      </button>
    </form>
  );
}

export default function InvoicesPayments() {
  const { data: invoicesData, isLoading: loadingInv } = useInvoices();
  const { data: paymentsData, isLoading: loadingPay } = useProjectPayments();
  const [tab, setTab] = useState('invoices');
  const [viewInvoice, setViewInvoice] = useState(null);

  const invoices = invoicesData?.results || invoicesData || [];
  const payments = paymentsData?.results || paymentsData || [];

  if (loadingInv || loadingPay) return <LoadingSpinner />;

  const tabs = [
    { id: 'invoices', label: 'My Invoices' },
    { id: 'bank', label: 'Bank & Transfer Info' },
    { id: 'submit', label: 'Submit Payment' },
    { id: 'history', label: 'Payment History' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Invoices & Payments</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              tab === t.id ? 'bg-white shadow text-indigo-700' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Invoices Tab */}
      {tab === 'invoices' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Reference', 'Project', 'Date', 'Due Date', 'Total', 'Status', ''].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No invoices yet
                  </td>
                </tr>
              )}
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm font-medium">
                    {inv.reference_number}
                  </td>
                  <td className="px-4 py-3 text-sm">{inv.project_name}</td>
                  <td className="px-4 py-3 text-sm">{inv.invoice_date}</td>
                  <td className="px-4 py-3 text-sm">{inv.due_date}</td>
                  <td className="px-4 py-3 text-sm font-medium">
                    ${parseFloat(inv.total).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={inv.payment_status || inv.status} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setViewInvoice(inv.id)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bank Info Tab */}
      {tab === 'bank' && <BankInfo />}

      {/* Submit Payment Tab */}
      {tab === 'submit' && <SubmitPaymentForm invoices={invoices} />}

      {/* Payment History Tab */}
      {tab === 'history' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Invoice', 'Project', 'Amount', 'Method', 'Date', 'Reference', 'Status', 'Proof'].map(
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
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    No payment records yet
                  </td>
                </tr>
              )}
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{p.invoice_ref}</td>
                  <td className="px-4 py-3 text-sm">{p.project_name}</td>
                  <td className="px-4 py-3 text-sm font-medium">
                    ${parseFloat(p.amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm">{p.payment_method}</td>
                  <td className="px-4 py-3 text-sm">{p.payment_date}</td>
                  <td className="px-4 py-3 text-sm">{p.reference_note || '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3">
                    {p.proof_url ? (
                      <a
                        href={p.proof_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 text-xs hover:underline"
                      >
                        View
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice View Modal */}
      {viewInvoice && (
        <InvoiceView invoiceId={viewInvoice} onClose={() => setViewInvoice(null)} />
      )}
    </div>
  );
}

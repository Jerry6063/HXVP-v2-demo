import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useInvoice,
  useAddInvoiceItem,
  useRemoveInvoiceItem,
  useSendInvoice,
  useUpdateInvoice,
} from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: invoice, isLoading } = useInvoice(id);
  const addItem = useAddInvoiceItem();
  const removeItem = useRemoveInvoiceItem();
  const sendInvoice = useSendInvoice();
  const updateInvoice = useUpdateInvoice();

  const [itemForm, setItemForm] = useState({
    description: '',
    quantity: '1',
    rate: '',
  });
  const [editingInstructions, setEditingInstructions] = useState(false);
  const [instructions, setInstructions] = useState('');

  if (isLoading) return <LoadingSpinner />;
  if (!invoice) return <p className="text-center py-8 text-gray-400">Invoice not found</p>;

  const items = invoice.items || [];
  const payments = invoice.payments || [];
  const isDraft = invoice.status === 'draft';

  const handleAddItem = async (e) => {
    e.preventDefault();
    await addItem.mutateAsync({
      invoiceId: id,
      description: itemForm.description,
      quantity: parseFloat(itemForm.quantity),
      rate: parseFloat(itemForm.rate),
    });
    setItemForm({ description: '', quantity: '1', rate: '' });
  };

  const handleSend = async () => {
    if (items.length === 0) {
      alert('Add at least one line item before sending.');
      return;
    }
    if (!window.confirm('Send this invoice to the client? They will receive an email notification.'))
      return;
    await sendInvoice.mutateAsync(id);
  };

  const handleSaveInstructions = async () => {
    await updateInvoice.mutateAsync({ id: invoice.id, payment_instructions: instructions });
    setEditingInstructions(false);
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/production/invoices')}
        className="text-indigo-600 hover:text-indigo-800 text-sm"
      >
        ← Back to Invoices
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Invoice {invoice.reference_number}
            </h1>
            <p className="text-gray-500 mt-1">Project: {invoice.project_name}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={invoice.status} />
            {isDraft && (
              <button
                onClick={handleSend}
                disabled={sendInvoice.isPending}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm"
              >
                {sendInvoice.isPending ? 'Sending...' : 'Send to Client'}
              </button>
            )}
          </div>
        </div>

        {/* Invoice Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6">
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">From</p>
            <p className="font-semibold mt-1">HXVP Marketing Group</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">Bill To</p>
            <p className="font-semibold mt-1">{invoice.client_name}</p>
            <p className="text-sm text-gray-500">{invoice.client_email}</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Invoice Date:</span>
              <span className="text-sm font-medium">{invoice.invoice_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Due Date:</span>
              <span className="text-sm font-medium">{invoice.due_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Balance Due:</span>
              <span className="text-lg font-bold text-indigo-700">
                ${parseFloat(invoice.total).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-4">Line Items</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-gray-500">
                <th className="pb-2 pr-4">Item</th>
                <th className="pb-2 pr-4 w-24">Qty</th>
                <th className="pb-2 pr-4 w-28">Rate</th>
                <th className="pb-2 pr-4 w-28">Amount</th>
                {isDraft && <th className="pb-2 w-16"></th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 pr-4">{item.description}</td>
                  <td className="py-3 pr-4">{item.quantity}</td>
                  <td className="py-3 pr-4">${parseFloat(item.rate).toLocaleString()}</td>
                  <td className="py-3 pr-4 font-medium">
                    ${parseFloat(item.amount).toLocaleString()}
                  </td>
                  {isDraft && (
                    <td className="py-3">
                      <button
                        onClick={() => removeItem.mutate({ invoiceId: id, itemId: item.id })}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={isDraft ? 5 : 4} className="py-6 text-center text-gray-400">
                    No items added yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {isDraft && (
            <form onSubmit={handleAddItem} className="flex gap-3 mt-4 items-end">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Description</label>
                <input
                  type="text"
                  value={itemForm.description}
                  onChange={(e) => setItemForm((f) => ({ ...f, description: e.target.value }))}
                  required
                  className="w-full border rounded-lg p-2 text-sm"
                  placeholder="e.g. Photography session – half day"
                />
              </div>
              <div className="w-24">
                <label className="block text-xs text-gray-500 mb-1">Qty</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={itemForm.quantity}
                  onChange={(e) => setItemForm((f) => ({ ...f, quantity: e.target.value }))}
                  required
                  className="w-full border rounded-lg p-2 text-sm"
                />
              </div>
              <div className="w-28">
                <label className="block text-xs text-gray-500 mb-1">Rate ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={itemForm.rate}
                  onChange={(e) => setItemForm((f) => ({ ...f, rate: e.target.value }))}
                  required
                  className="w-full border rounded-lg p-2 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={addItem.isPending}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm"
              >
                Add
              </button>
            </form>
          )}

          {/* Totals */}
          <div className="flex flex-col items-end mt-6 space-y-1 border-t pt-4">
            <div className="flex gap-8">
              <span className="text-sm text-gray-500">Subtotal:</span>
              <span className="text-sm font-medium w-28 text-right">
                ${parseFloat(invoice.subtotal).toLocaleString()}
              </span>
            </div>
            <div className="flex gap-8">
              <span className="text-sm text-gray-500">Tax ({invoice.tax_rate}%):</span>
              <span className="text-sm font-medium w-28 text-right">
                ${parseFloat(invoice.tax_amount).toLocaleString()}
              </span>
            </div>
            <div className="flex gap-8 border-t pt-2 mt-1">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-lg w-28 text-right">
                ${parseFloat(invoice.total).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Payment Instructions</h2>
            {isDraft && !editingInstructions && (
              <button
                onClick={() => {
                  setInstructions(invoice.payment_instructions);
                  setEditingInstructions(true);
                }}
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                Edit
              </button>
            )}
          </div>
          {editingInstructions ? (
            <div className="space-y-2">
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={6}
                className="w-full border rounded-lg p-3 text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveInstructions}
                  className="bg-indigo-600 text-white px-4 py-1 rounded-lg text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingInstructions(false)}
                  className="text-gray-600 px-4 py-1 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
              {invoice.payment_instructions}
            </pre>
          )}
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-2">Notes</h2>
            <p className="text-sm text-gray-600">{invoice.notes}</p>
          </div>
        )}

        {/* Client Payments */}
        {payments.length > 0 && (
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Payment Submissions</h2>
            <div className="space-y-3">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="font-medium">${parseFloat(p.amount).toLocaleString()}</p>
                    <p className="text-sm text-gray-500">
                      {p.payment_method} – {p.payment_date}
                    </p>
                    {p.reference_note && (
                      <p className="text-xs text-gray-400 mt-1">Ref: {p.reference_note}</p>
                    )}
                    {p.proof_url && (
                      <a
                        href={p.proof_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 text-xs hover:underline"
                      >
                        View Proof
                      </a>
                    )}
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

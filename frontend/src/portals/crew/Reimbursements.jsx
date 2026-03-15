import { useState } from 'react';
import { useCrewAssignments, useExpenses, useCreateExpense } from '../../api/hooks';
import StatusBadge from '../../components/StatusBadge';

const CATEGORY_OPTIONS = [
  { value: 'props', label: 'Props' },
  { value: 'equipment_rental', label: 'Equipment Rental' },
  { value: 'travel', label: 'Travel' },
  { value: 'gas', label: 'Gas' },
  { value: 'catering', label: 'Catering' },
  { value: 'miscellaneous', label: 'Miscellaneous' },
];

export default function CrewReimbursements() {
  const { data: assignmentsData } = useCrewAssignments({ status: 'accepted' });
  const { data: expensesData, isLoading } = useExpenses({ mine: 1 });
  const createExpense = useCreateExpense();

  const assignments = assignmentsData?.results || assignmentsData || [];
  const expenses = expensesData?.results || expensesData || [];

  const projectOptions = Array.from(
    new Map(
      assignments
        .filter((a) => a.shoot_detail?.project)
        .map((a) => [a.shoot_detail.project, { id: a.shoot_detail.project, name: a.project_name }])
    ).values()
  );

  const [form, setForm] = useState({
    project: '',
    category: 'props',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    receipt: null,
  });
  const [selectedExpense, setSelectedExpense] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createExpense.mutateAsync({
      ...form,
      amount: parseFloat(form.amount),
    });
    setForm((f) => ({
      ...f,
      amount: '',
      description: '',
      receipt: null,
    }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reimbursements</h1>

      {selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Expense Details</h3>
              <button
                onClick={() => setSelectedExpense(null)}
                className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500">Project</p>
                <p className="text-gray-800 font-medium">{selectedExpense.project_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Category</p>
                <p className="text-gray-700 capitalize">{selectedExpense.category?.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Amount</p>
                <p className="text-gray-900 font-semibold">${Number(selectedExpense.amount).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-gray-700">{selectedExpense.date}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500">Description</p>
                <p className="text-gray-800">{selectedExpense.description}</p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 p-3 space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase">Expense Receipt</p>
              {selectedExpense.receipt_url ? (
                <a href={selectedExpense.receipt_url} target="_blank" rel="noreferrer" className="text-sky-600 hover:text-sky-700 text-sm">
                  View uploaded receipt
                </a>
              ) : (
                <p className="text-sm text-gray-400">No receipt uploaded</p>
              )}
            </div>

            <div className="rounded-lg border border-gray-100 p-3 space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase">Reimbursement</p>
              <StatusBadge status={selectedExpense.reimbursed ? 'paid' : 'pending'} />
              {selectedExpense.reimbursed ? (
                selectedExpense.reimbursement_proof_url ? (
                  <a
                    href={selectedExpense.reimbursement_proof_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-sky-600 hover:text-sky-700 text-sm"
                  >
                    View reimbursement proof
                  </a>
                ) : (
                  <p className="text-sm text-gray-400">Reimbursed, no reimbursement proof uploaded</p>
                )
              ) : (
                <p className="text-sm text-gray-400">Not reimbursed yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">Submit Expense Receipt</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Project *</label>
            <select
              value={form.project}
              onChange={(e) => setForm((f) => ({ ...f, project: e.target.value }))}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Select project...</option>
              {projectOptions.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Amount ($) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Description *</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="What was purchased / paid"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs text-gray-500 mb-1">Receipt (photo or PDF)</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setForm((f) => ({ ...f, receipt: e.target.files?.[0] || null }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={createExpense.isPending}
          className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 disabled:opacity-50"
        >
          {createExpense.isPending ? 'Submitting...' : 'Submit Reimbursement'}
        </button>
      </form>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">My Submitted Expenses</h2>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : expenses.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No reimbursement records yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase bg-gray-50">
                <th className="px-5 py-3">Project</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Reimbursement</th>
                <th className="px-5 py-3">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {expenses.map((e) => (
                <tr key={e.id} onClick={() => setSelectedExpense(e)} className="cursor-pointer hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-700">{e.project_name}</td>
                  <td className="px-5 py-3 text-gray-600 capitalize">{e.category?.replace(/_/g, ' ')}</td>
                  <td className="px-5 py-3 text-gray-900 font-medium">${Number(e.amount).toLocaleString()}</td>
                  <td className="px-5 py-3 text-gray-500">{e.date}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={e.reimbursed ? 'paid' : 'pending'} />
                  </td>
                  <td className="px-5 py-3">
                    {e.receipt_url ? (
                      <a
                        href={e.receipt_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(evt) => evt.stopPropagation()}
                        className="text-sky-600 hover:text-sky-700"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-gray-300">—</span>
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

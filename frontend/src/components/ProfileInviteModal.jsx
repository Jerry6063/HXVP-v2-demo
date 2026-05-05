import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const extractInviteErrorMessage = (error, fallbackMessage) => {
  const data = error?.response?.data || {};
  const detail = data.detail;
  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }

  const firstFieldValue = Object.values(data).find(
    (value) => typeof value === 'string' || (Array.isArray(value) && value.length > 0)
  );

  if (typeof firstFieldValue === 'string' && firstFieldValue.trim()) {
    return firstFieldValue;
  }
  if (Array.isArray(firstFieldValue) && typeof firstFieldValue[0] === 'string') {
    return firstFieldValue[0];
  }

  return fallbackMessage;
};

export default function ProfileInviteModal({
  kindLabel,
  createMutation,
  successMessage,
  onClose,
}) {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '' });
  const [errorMessage, setErrorMessage] = useState('');

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    try {
      const result = await createMutation.mutateAsync({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
      });
      toast.success(result?.detail || successMessage);
      onClose();
    } catch (error) {
      const message = extractInviteErrorMessage(
        error,
        `Unable to create this ${kindLabel.toLowerCase()} profile right now.`
      );
      setErrorMessage(message);
      toast.error(message);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Add {kindLabel}</h2>
              <p className="mt-1 text-sm text-gray-500">
                Create the profile now and send a registration email for the {kindLabel.toLowerCase()} portal.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  First name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={(event) => updateField('first_name', event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Last name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={(event) => updateField('last_name', event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {errorMessage ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating…' : 'Create Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
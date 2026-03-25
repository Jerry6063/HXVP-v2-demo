import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/client';

const portalMeta = {
  client: { title: 'Client Portal', color: 'emerald' },
  talent: { title: 'Talent Portal', color: 'amber' },
  crew: { title: 'Crew Portal', color: 'sky' },
};

const bgMap = {
  emerald: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
  amber: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
  sky: 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-500',
};

export default function ResetPasswordPage({ portal }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const meta = portalMeta[portal];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!token) {
      setError('Invalid or missing reset token. Please request a new link.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/password-reset/confirm/', {
        token,
        new_password: newPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate(`/${portal}/login`), 3000);
    } catch (err) {
      const data = err.response?.data;
      if (data?.detail) {
        setError(data.detail);
      } else if (data && typeof data === 'object') {
        setError(Object.values(data).flat().join(' '));
      } else {
        setError('Reset failed. The link may be expired. Please request a new one.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
            <p className="mt-1 text-sm text-gray-500">{meta.title}</p>
          </div>

          {success ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                Password updated successfully! Redirecting to sign in…
              </div>
              <Link
                to={`/${portal}/login`}
                className="block text-sm text-gray-500 hover:text-gray-700 hover:underline"
              >
                Go to sign in now
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-offset-0 focus:border-transparent focus:outline-none text-sm"
                    placeholder="Min. 8 characters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-offset-0 focus:border-transparent focus:outline-none text-sm"
                    placeholder="Re-enter new password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2.5 px-4 rounded-lg text-white font-medium text-sm focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 ${bgMap[meta.color]}`}
                >
                  {loading ? 'Updating…' : 'Update Password'}
                </button>
              </form>

              <p className="mt-5 text-center text-sm">
                <Link
                  to={`/${portal}/forgot-password`}
                  className="text-gray-500 hover:text-gray-700 hover:underline"
                >
                  ← Request a new link
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
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

export default function ForgotPasswordPage({ portal }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const meta = portalMeta[portal];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/password-reset/', {
        email,
        portal,
      });
    } catch {
      // Silently swallow errors to prevent user enumeration
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
            <p className="mt-1 text-sm text-gray-500">{meta.title}</p>
          </div>

          {submitted ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                If that email address is registered, you'll receive a password reset link shortly.
              </div>
              <Link
                to={`/${portal}/login`}
                className="block text-sm text-gray-500 hover:text-gray-700 hover:underline"
              >
                ← Back to sign in
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-offset-0 focus:border-transparent focus:outline-none text-sm"
                    placeholder="you@example.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2.5 px-4 rounded-lg text-white font-medium text-sm focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 ${bgMap[meta.color]}`}
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>

              <p className="mt-5 text-center text-sm">
                <Link
                  to={`/${portal}/login`}
                  className="text-gray-500 hover:text-gray-700 hover:underline"
                >
                  ← Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

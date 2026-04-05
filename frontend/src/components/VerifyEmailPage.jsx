import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';

const ROLE_PORTAL = {
  client:           '/client/dashboard',
  talent:           '/talent/dashboard',
  crew:             '/crew/dashboard',
  production_admin: '/production/dashboard',
};

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [pageState, setPageState]   = useState('loading'); // loading | invalid | form
  const [userInfo, setUserInfo]     = useState(null);
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [error, setError]           = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) { setPageState('invalid'); return; }
    api.get(`/auth/verify-email/?token=${encodeURIComponent(token)}`)
      .then(({ data }) => { setUserInfo(data); setPageState('form'); })
      .catch(() => setPageState('invalid'));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/verify-email/confirm/', { token, password });
      localStorage.setItem('access_token',  data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);
      await refreshUser();
      navigate(ROLE_PORTAL[data.user.role] || '/');
    } catch (err) {
      const d = err.response?.data;
      setError(d?.detail || d?.password?.[0] || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (pageState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Verifying your link…</p>
        </div>
      </div>
    );
  }

  if (pageState === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Link invalid or expired</h2>
            <p className="text-sm text-gray-500 mb-6">
              This verification link is invalid or has expired (links are valid for 24 hours).
              Please register again to receive a new link.
            </p>
            <Link to="/" className="text-sm font-medium text-indigo-600 hover:underline">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Email verified!</h1>
            {userInfo && (
              <p className="mt-1 text-sm text-gray-500">
                Welcome, {userInfo.first_name}. Set a password to activate your account.
              </p>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password" required minLength={8}
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 focus:border-transparent focus:outline-none text-sm"
                placeholder="Min. 8 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password" required minLength={8}
                value={confirm} onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 focus:border-transparent focus:outline-none text-sm"
                placeholder="Re-enter your password"
              />
            </div>
            <button
              type="submit" disabled={submitting}
              className="w-full py-2.5 px-4 rounded-lg text-white font-medium text-sm bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Activating account…' : 'Set Password & Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

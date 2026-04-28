import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const portalMeta = {
  production: { title: 'Production Portal', color: 'indigo', redirect: '/production/dashboard' },
  client: { title: 'Client Portal', color: 'emerald', redirect: '/client/dashboard' },
  talent: { title: 'Talent Portal', color: 'amber', redirect: '/talent/dashboard' },
  crew: { title: 'Crew Portal', color: 'sky', redirect: '/crew/dashboard' },
};

export default function LoginPage({ portal }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const meta = portalMeta[portal];

  const bgMap = {
    indigo: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
    emerald: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
    amber: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
    sky: 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-500',
  };

  const redirectTo = location.state?.from
    ? `${location.state.from.pathname || ''}${location.state.from.search || ''}${location.state.from.hash || ''}`
    : meta.redirect;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, portal);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Studio Portal</h1>
            <p className="mt-1 text-sm text-gray-500">{meta.title}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-offset-0 focus:border-transparent focus:outline-none text-sm"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 rounded-lg text-white font-medium text-sm focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 ${bgMap[meta.color]}`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {portal !== 'production' && (
            <div className="flex justify-between text-sm pt-4">
              <Link to={`/${portal}/forgot-password`} className="text-gray-500 hover:text-gray-700 hover:underline">
                Forgot password?
              </Link>
              <Link to={`/${portal}/register`} className="font-medium text-gray-700 hover:underline">
                Create account
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

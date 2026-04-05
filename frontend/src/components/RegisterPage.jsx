import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

const PORTAL_ROLE = { client: 'client', talent: 'talent', crew: 'crew' };

const portalMeta = {
  client: { title: 'Client Portal', color: 'emerald', redirect: '/client/dashboard' },
  talent: { title: 'Talent Portal', color: 'amber',   redirect: '/talent/dashboard' },
  crew:   { title: 'Crew Portal',   color: 'sky',     redirect: '/crew/dashboard' },
};

const bgMap = {
  emerald: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
  amber:   'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
  sky:     'bg-sky-600 hover:bg-sky-700 focus:ring-sky-500',
};

export default function RegisterPage({ portal }) {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const meta = portalMeta[portal];
  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register/', {
        first_name: form.first_name,
        last_name:  form.last_name,
        email:      form.email,
        phone:      form.phone || undefined,
        role:       PORTAL_ROLE[portal],
      });
      setSent(true);
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const msgs = Object.values(data).flat().join(' ');
        setError(msgs || 'Registration failed. Please try again.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
            <p className="text-sm text-gray-500 mb-1">We sent a verification link to</p>
            <p className="text-sm font-medium text-gray-800 mb-4">{form.email}</p>
            <p className="text-xs text-gray-400">
              Click the link to set your password and activate your account. The link expires in 24 hours.
            </p>
            <p className="mt-6 text-xs text-gray-400">
              Wrong email?{' '}
              <button onClick={() => setSent(false)} className="font-medium text-gray-600 hover:underline">
                Go back
              </button>
            </p>
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
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="mt-1 text-sm text-gray-500">{meta.title}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text" name="first_name" required
                  value={form.first_name} onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-offset-0 focus:border-transparent focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text" name="last_name" required
                  value={form.last_name} onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-offset-0 focus:border-transparent focus:outline-none text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email" name="email" required
                value={form.email} onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-offset-0 focus:border-transparent focus:outline-none text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="tel" name="phone"
                value={form.phone} onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-offset-0 focus:border-transparent focus:outline-none text-sm"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className={`w-full py-2.5 px-4 rounded-lg text-white font-medium text-sm focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 ${bgMap[meta.color]}`}
            >
              {loading ? 'Sending verification email…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to={`/${portal}/login`} className="font-medium text-gray-700 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


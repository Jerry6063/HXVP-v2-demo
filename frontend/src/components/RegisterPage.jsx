import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';

const PORTAL_ROLE = { client: 'client', talent: 'talent', crew: 'crew' };

const portalMeta = {
  client: { title: 'Client Portal', color: 'emerald', redirect: '/client/dashboard' },
  talent: { title: 'Talent Portal', color: 'amber', redirect: '/talent/dashboard' },
  crew: { title: 'Crew Portal', color: 'sky', redirect: '/crew/dashboard' },
};

const bgMap = {
  emerald: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
  amber: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
  sky: 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-500',
};

const HCAPTCHA_SITE_KEY =
  import.meta.env.VITE_HCAPTCHA_SITE_KEY || '10000000-ffff-ffff-ffff-000000000001';

export default function RegisterPage({ portal }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const captchaRef = useRef(null);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [captchaToken, setCaptchaToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const meta = portalMeta[portal];

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!captchaToken) {
      setError('Please complete the CAPTCHA verification.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register/', {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        role: PORTAL_ROLE[portal],
        captcha_token: captchaToken,
      });
      // Auto-login after registration
      await login(form.email, form.password, portal);
      navigate(meta.redirect);
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const msgs = Object.values(data).flat().join(' ');
        setError(msgs || 'Registration failed. Please try again.');
      } else {
        setError('Registration failed. Please try again.');
      }
      captchaRef.current?.resetCaptcha();
      setCaptchaToken('');
    } finally {
      setLoading(false);
    }
  };

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
                  type="text"
                  name="first_name"
                  required
                  value={form.first_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-offset-0 focus:border-transparent focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  required
                  value={form.last_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-offset-0 focus:border-transparent focus:outline-none text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-offset-0 focus:border-transparent focus:outline-none text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                value={form.password}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-offset-0 focus:border-transparent focus:outline-none text-sm"
                placeholder="Min. 8 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-offset-0 focus:border-transparent focus:outline-none text-sm"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="flex justify-center pt-1">
              <HCaptcha
                ref={captchaRef}
                sitekey={HCAPTCHA_SITE_KEY}
                onVerify={(token) => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken('')}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !captchaToken}
              className={`w-full py-2.5 px-4 rounded-lg text-white font-medium text-sm focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 ${bgMap[meta.color]}`}
            >
              {loading ? 'Creating account…' : 'Create Account'}
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

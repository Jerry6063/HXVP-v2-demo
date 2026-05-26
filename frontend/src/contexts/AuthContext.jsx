import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

/* ────────────────────────────────────────────────────────────────────────────
   MOCK MODE
   ──────────
   v2 当前阶段没有后端。如果 VITE_API_BASE_URL 没设置,自动进入 mock 模式:
   - login() 不打 API,直接接受任意邮箱/密码,造一个角色匹配的假 user
   - useEffect 不调 /auth/me/,从 localStorage 还原假 user
   - 假 token 是普通字符串,后端联通后会被真实 JWT 替换

   要切回真实后端模式:在 frontend/.env.local 里设 VITE_API_BASE_URL=https://...
   ──────────────────────────────────────────────────────────────────────────── */
const MOCK_MODE = !import.meta.env.VITE_API_BASE_URL;

const MOCK_USERS = {
  production: {
    id: 1,
    email: 'admin@studio.com',
    first_name: 'Demo',
    last_name: 'Admin',
    role: 'production_admin',
  },
  client: {
    id: 2,
    email: 'client@brandco.com',
    first_name: 'Demo',
    last_name: 'Client',
    role: 'client',
  },
  talent: {
    id: 3,
    email: 'talent1@studio.com',
    first_name: 'Demo',
    last_name: 'Talent',
    role: 'talent',
  },
  crew: {
    id: 4,
    email: 'crew1@studio.com',
    first_name: 'Demo',
    last_name: 'Crew',
    role: 'crew',
  },
};

const MOCK_TOKEN = 'mock-access-token-v2';
const MOCK_USER_STORAGE_KEY = 'mock_user';

if (MOCK_MODE && typeof console !== 'undefined') {
  // eslint-disable-next-line no-console
  console.info(
    '%c[HXVP v2] Auth running in MOCK mode',
    'background:#d8ff00;color:#000;padding:2px 6px;font-weight:bold',
    '— 任意邮箱/密码都可登录。设 VITE_API_BASE_URL 切回真后端。',
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('access_token'));
  const [paymentUnlocked, setPaymentUnlocked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    if (MOCK_MODE) {
      // Mock: 从 localStorage 还原假 user,无 API 调用
      try {
        const stored = localStorage.getItem(MOCK_USER_STORAGE_KEY);
        if (stored) setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem(MOCK_USER_STORAGE_KEY);
      } finally {
        setLoading(false);
      }
      return;
    }

    // 真实模式
    api.get('/auth/me/')
      .then(({ data }) => setUser(data))
      .catch(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password, portal) => {
    if (MOCK_MODE) {
      // 任意密码通过,根据 portal 选对应角色
      const mockUser = MOCK_USERS[portal];
      if (!mockUser) throw new Error(`Unknown portal: ${portal}`);
      // 假装 200ms 网络延迟,让 loading 状态可见
      await new Promise((r) => setTimeout(r, 250));
      const customUser = { ...mockUser, email: email || mockUser.email };
      localStorage.setItem('access_token', MOCK_TOKEN);
      localStorage.setItem('refresh_token', MOCK_TOKEN);
      localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(customUser));
      setUser(customUser);
      setPaymentUnlocked(false);
      setLoading(false);
      return customUser;
    }

    // 真实模式
    const { data } = await api.post('/auth/login/', { email, password, portal });
    localStorage.setItem('access_token', data.tokens.access);
    localStorage.setItem('refresh_token', data.tokens.refresh);
    setUser(data.user);
    setPaymentUnlocked(false);
    setLoading(false);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem(MOCK_USER_STORAGE_KEY);
    setUser(null);
    setPaymentUnlocked(false);
  }, []);

  const refreshUser = useCallback(() => {
    if (MOCK_MODE) return Promise.resolve(user);
    return api.get('/auth/me/').then(({ data }) => setUser(data));
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        paymentUnlocked,
        setPaymentUnlocked,
        mockMode: MOCK_MODE,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

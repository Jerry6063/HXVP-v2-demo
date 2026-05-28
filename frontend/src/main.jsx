import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App';
import './index.css';

window.addEventListener('error', (e) => {
  document.getElementById('root').innerHTML =
    `<pre style="color:red;padding:2rem;font-family:monospace;">UNCAUGHT ERROR:\n${e.message}\n\n${e.filename}:${e.lineno}</pre>`;
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled rejection:', e.reason);
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

// Vite 通过 BASE_URL 注入 vite.config.js 里的 `base` 值,例如:
//   - dev:    BASE_URL = '/'
//   - build:  BASE_URL = '/HXVP-v2-demo/'
// BrowserRouter 的 basename 不要尾部斜杠.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter basename={basename || undefined}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);

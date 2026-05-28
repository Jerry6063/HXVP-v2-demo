import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Vite config.
 *
 * `base` is conditional:
 *  - dev (`npm run dev`)    → '/'                  (访问 http://localhost:5173/)
 *  - build (`npm run build`)→ '/HXVP-v2-demo/'     (GitHub Pages 路径前缀)
 *
 * 如果以后换部署位置(例如自定义域名),只需调整 build 分支的字符串。
 */
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/HXVP-v2-demo/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
    allowedHosts: [
      '.ngrok-free.dev'      // Allow a domain and all its subdomains
    ]
  },
}))

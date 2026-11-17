import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/family-api': {
        target: 'https://api.babi.prot.kr',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (request) => request.removeHeader('origin'))
        },
        rewrite: (path) => path.replace(/^\/family-api/, ''),
      },
      '/backend': {
        target: 'https://api.babi.prot.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/backend(?=\/|$)/, ''),
        cookieDomainRewrite: '',
        cookiePathRewrite: '/',
        configure: (proxy) => {
          // 브라우저는 같은 출처의 Vite로 요청한다. 로컬 Origin을 upstream으로 넘기지 않는다.
          proxy.on('proxyReq', (request) => request.removeHeader('origin'))
        },
      },
    },
  },
})

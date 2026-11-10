import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
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
    },
  },
  plugins: [react(), tailwindcss()],
})

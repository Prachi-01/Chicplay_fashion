import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',      // Bind to all network interfaces (required for Vite v7 + ngrok)
    port: 5173,           // Fixed port to match ngrok
    strictPort: true,     // Fail if port is already in use
    allowedHosts: 'all',  // Allow ngrok and other tunnel services
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})


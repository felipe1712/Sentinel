import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3100,
    allowedHosts: [
      'uw.sentineliq.com.mx',
      'cdmx.urbanwatch.mx',
      '.sentineliq.com.mx',
      'localhost',
      '127.0.0.1',
    ],
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8100',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 3100,
    allowedHosts: [
      'uw.sentineliq.com.mx',
      'cdmx.urbanwatch.mx',
      '.sentineliq.com.mx',
      'localhost',
      '127.0.0.1',
    ],
  },
});

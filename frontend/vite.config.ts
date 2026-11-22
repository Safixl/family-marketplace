import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiProxy = {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
  },
};

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['.cloudpub.ru', '.ngrok-free.app', '.loca.lt'],
    proxy: apiProxy,
  },
  // `npm run preview` нужен для проверки PWA: здесь работает Service Worker.
  preview: {
    host: true,
    port: 4173,
    allowedHosts: ['.cloudpub.ru', '.ngrok-free.app', '.loca.lt'],
    proxy: apiProxy,
  },
});

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

/**
 * Service Worker включаем в production/preview, чтобы не кэшировать dev-сборку.
 * Для отладки PWA на телефоне через dev-сервер можно задать VITE_ENABLE_SW=1.
 */
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  const enabled = import.meta.env.PROD || import.meta.env.VITE_ENABLE_SW === '1';
  if (!enabled) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      // Офлайн-режим недоступен — приложение продолжает работать онлайн.
    });
  });
}

registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);

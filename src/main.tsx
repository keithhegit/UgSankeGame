import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// 注册Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // 先注销所有已存在的 Service Worker
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        await registration.unregister();
      }

      // 重新注册 Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('ServiceWorker registration successful');

      // 检查更新
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 新的 Service Worker 已安装，可以刷新页面
              if (window.confirm('新版本可用，是否刷新页面？')) {
                window.location.reload();
              }
            }
          });
        }
      });
    } catch (err) {
      console.log('ServiceWorker registration failed: ', err);
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
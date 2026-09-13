import { registerSW } from 'virtual:pwa-register';

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    const updateSW = registerSW({
      onNeedRefresh() {
        console.log('[PWA] New content available, updating service worker...');
        updateSW(true);
      },
      onOfflineReady() {
        console.log('[PWA] App is ready for offline usage.');
      },
      onRegisterError(error: unknown) {
        console.warn('[PWA] Service Worker registration failed:', error);
      }
    });
  }
}

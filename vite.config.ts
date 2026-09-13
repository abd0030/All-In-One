import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'favicon.ico',
        'favicon.png',
        'favicon.svg',
        'logo.png',
        'apple-touch-icon.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'maskable-icon-512x512.png'
      ],
      manifest: {
        name: "All in One - Pakistan's Premium Classifieds Marketplace",
        short_name: 'All in One',
        description: "Pakistan's leading classifieds marketplace to buy and sell cars, property, electronics, services and more.",
        theme_color: '#2563eb',
        background_color: '#0b0f17',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2,ttf}'],
        globIgnores: ['**/node_modules/**/*', '**/*.apk', '**/*.mp4'],
        navigateFallback: '/index.html',
        importScripts: ['/push-notifications-sw.js'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024
      }
    })
  ],
  resolve: {
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
  build: {
    minify: false,
    sourcemap: false,
  },
})


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import viteCompression from 'vite-plugin-compression'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    viteCompression({ algorithm: 'gzip' }),
    viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'router':        ['react-router-dom'],
          'framer-motion': ['framer-motion'],
          'chart':         ['chart.js', 'react-chartjs-2'],
          'leaflet':       ['leaflet'],
        },
      },
    },
  },
})

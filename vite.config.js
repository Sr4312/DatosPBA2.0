import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
  ],
  /* .geojson no es un tipo de asset conocido por Vite: sin esto lo trataría
     como módulo. Declarado acá, sale del build con hash de contenido en el
     nombre, que es lo que habilita cachearlo como inmutable (ver vercel.json). */
  assetsInclude: ['**/*.geojson'],
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
          'chart':         ['chart.js', 'react-chartjs-2'],
          'leaflet':       ['leaflet'],
        },
      },
    },
  },
})

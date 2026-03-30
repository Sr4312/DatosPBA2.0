/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f8f9',
          100: '#dff0f0',
          200: '#b3dddd',
          300: '#7fcfcf',
          400: '#3dbfbf',
          500: '#1ab8b8',
          600: '#13999a',
          700: '#0e7878',
        },
      },
    },
  },
  plugins: [],
}

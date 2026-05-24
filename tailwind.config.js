/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      fontSize: {
        'xs':   ['0.78rem',  { lineHeight: '1.15rem' }],
        'sm':   ['0.925rem', { lineHeight: '1.4rem'  }],
        'base': ['1.05rem',  { lineHeight: '1.65rem' }],
        'lg':   ['1.15rem',  { lineHeight: '1.75rem' }],
        'xl':   ['1.28rem',  { lineHeight: '1.85rem' }],
      },
      colors: {
        brand: {
          50:  '#edf1f8',
          100: '#d0daf0',
          200: '#a1b4e0',
          300: '#6a8bca',
          400: '#3d65b2',
          500: '#1f4795',
          600: '#1a3d7c',
          700: '#152952',
        },
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Archivo', 'sans-serif'],
        display: ['Archivo', 'sans-serif'],
      },
      /* Escala tipográfica del sistema de diseño (nombres semánticos).
         Un solo display por página; toda cifra usa data-xl/data-md. */
      fontSize: {
        'xs':   ['0.78rem',  { lineHeight: '1.15rem' }],
        'sm':   ['0.925rem', { lineHeight: '1.4rem'  }],
        'base': ['1.0625rem', { lineHeight: '1.7rem' }],   // body 17/1.6
        'lg':   ['1.15rem',  { lineHeight: '1.75rem' }],
        'xl':   ['1.28rem',  { lineHeight: '1.85rem' }],
        'display':  ['2.75rem',   { lineHeight: '1.05', fontWeight: '700', letterSpacing: '-0.02em' }], // 44
        'headline': ['1.75rem',   { lineHeight: '1.15', fontWeight: '700' }],                            // 28
        'subhead':  ['1.25rem',   { lineHeight: '1.35', fontWeight: '600' }],                            // 20
        'data-xl':  ['2.5rem',    { lineHeight: '1',    fontWeight: '700' }],                            // 40, tabular
        'data-md':  ['1.5rem',    { lineHeight: '1',    fontWeight: '600' }],                            // 24, tabular
        'caption':  ['0.8125rem', { lineHeight: '1.4' }],                                                // 13
        'label':    ['0.6875rem', { lineHeight: '1',    fontWeight: '600', letterSpacing: '0.06em' }],   // 11, uppercase
      },
      colors: {
        /* El único azul de interfaz es --focus (#2563EB): interacción, no dato.
           La escala brand queda anclada a ese azul para que las clases
           existentes rindan dentro del sistema; los usos no interactivos
           se eliminan en Fase 3. */
        brand: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
      },
      maxWidth: {
        read: '68ch',      // párrafo
        data: '1080px',    // gráficos y tablas
        full: '1280px',    // bloques a sangre
      },
      spacing: {
        dense:  '32px',    // bloques de datos
        normal: '64px',    // entre secciones
        air:    '112px',   // cambios de nivel
      },
    },
    /* Superficie del sistema: radio default 2px (rounded-full queda solo
       para el badge de tema); sin sombras — separación por borde 1px o
       fondo sólido. Remapear acá convierte todas las clases existentes
       sin tocar archivo por archivo. */
    borderRadius: {
      none: '0',
      sm: '2px',
      DEFAULT: '2px',
      md: '2px',
      lg: '2px',
      xl: '2px',
      '2xl': '2px',
      '3xl': '2px',
      full: '9999px',
    },
    boxShadow: {
      none: 'none',
      sm: 'none',
      DEFAULT: 'none',
      md: 'none',
      lg: 'none',
      xl: 'none',
      '2xl': 'none',
      inner: 'none',
    },
  },
  plugins: [],
}

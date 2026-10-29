/** @type {import('tailwindcss').Config} */
// Colori e misure dalle regole di stile esportate da Stitch ("Tactile Botanical").
// Le dimensioni del testo sono in rem, così l'impostazione "dimensione del testo"
// (che cambia la grandezza di base) ingrandisce tutta l'app.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F7F9F4',
        ink: '#1F2937',
        'ink-soft': '#4B5563',
        line: '#E5E7EB',
        'line-strong': '#CBD5E1',
        // Il verde dei pulsanti è un tono più scuro di quello di Stitch,
        // perché il testo bianco sopra superi il contrasto 4.5:1.
        leaf: {
          DEFAULT: '#378500',
          dark: '#2A6900',
          deep: '#1F5100',
          bright: '#58CC02',
          tint: '#E8F8D8',
        },
        sun: {
          DEFAULT: '#FFC800',
          dark: '#D99B00',
          tint: '#FFF6D6',
        },
        sky: {
          DEFAULT: '#2B70C9',
          dark: '#1E5598',
          tint: '#E1F5FE',
        },
        petal: {
          DEFAULT: '#E5484D',
          dark: '#B82329',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans Variable"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        meta: ['1rem', { lineHeight: '1.4' }],
        body: ['1.125rem', { lineHeight: '1.5' }],
        lead: ['1.25rem', { lineHeight: '1.5' }],
        h3: ['1.375rem', { lineHeight: '1.35' }],
        h2: ['1.625rem', { lineHeight: '1.25' }],
        h1: ['1.875rem', { lineHeight: '1.2' }],
        hero: ['2.25rem', { lineHeight: '1.15' }],
      },
      borderRadius: {
        card: '1.5rem',
        btn: '1.125rem',
      },
      minHeight: {
        touch: '3.5rem',
      },
      maxWidth: {
        app: '34rem',
      },
    },
  },
  plugins: [],
};

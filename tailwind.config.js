/** @type {import('tailwindcss').Config} */
// Colori e misure dalle regole di stile esportate da Stitch ("Tactile Botanical").
// Le dimensioni del testo sono in rem, così l'impostazione "dimensione del testo"
// (che cambia la grandezza di base) ingrandisce tutta l'app.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Palette da DESIGN.md di Stitch ("Tactile Botanical").
        canvas: '#F7FAF5',
        ink: '#1F2937',
        'ink-soft': '#4B5563',
        line: '#E5E7EB',
        'line-strong': '#CBD5E1',
        moss: '#DCEBD3', // bordo delle schede
        // Il verde principale di Stitch (#46A302): con testo bianco grande e in grassetto supera il contrasto 3:1.
        leaf: {
          DEFAULT: '#46A302',
          dark: '#357C01',
          deep: '#2A6900',
          bright: '#58CC02',
          tint: '#EEFAE6',
        },
        sun: {
          DEFAULT: '#FFC800',
          dark: '#D99B00',
          tint: '#FFF9ED',
          edge: '#FFDB99',
        },
        orange: {
          DEFAULT: '#FF9600',
          dark: '#CC7800',
          text: '#A35400',
          tint: '#FFF4E0',
        },
        sky: {
          DEFAULT: '#1CB0F6',
          dark: '#1899D6',
          text: '#0369A1',
          tint: '#E0F4FF',
        },
        plum: {
          DEFAULT: '#A855F7',
          text: '#7E22CE',
          tint: '#F3E8FF',
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
        card: '1.75rem',
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

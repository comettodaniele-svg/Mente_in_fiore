import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' fa funzionare la stessa build sia su GitHub Pages (sotto /nome-repo/)
// sia dentro l'app Android (Capacitor).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    target: 'es2020',
  },
});

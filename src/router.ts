import { useSyncExternalStore } from 'react';

// Navigazione con l'hash (#/oggi): funziona su GitHub Pages e nell'app Android,
// e il tasto "indietro" del telefono torna alla schermata precedente.

function current(): string {
  const h = window.location.hash.replace(/^#/, '');
  return h || '/';
}

export function useRoute(): string {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener('hashchange', cb);
      return () => window.removeEventListener('hashchange', cb);
    },
    current,
  );
}

export function navigate(path: string, opts: { replace?: boolean } = {}) {
  if (opts.replace) {
    const url = `${window.location.pathname}${window.location.search}#${path}`;
    window.history.replaceState(null, '', url);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = path;
  }
  window.scrollTo(0, 0);
}

export function back(fallback = '/oggi') {
  if (window.history.length > 1) window.history.back();
  else navigate(fallback, { replace: true });
}

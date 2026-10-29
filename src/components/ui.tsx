import type { ReactNode } from 'react';
import { ArrowLeft, Sun, Sprout, TrendingUp, User, Volume2 } from 'lucide-react';
import { back, navigate, useRoute } from '../router';
import { canSpeak, speak } from '../lib/speech';
import { useApp } from '../store';

export function Screen({ children, nav = false, className = '' }: { children: ReactNode; nav?: boolean; className?: string }) {
  return (
    <div className={`min-h-[100dvh] flex flex-col ${nav ? 'pb-28' : 'pb-8'}`} style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <main className={`w-full max-w-app mx-auto px-5 flex-1 flex flex-col ${className}`}>{children}</main>
      {nav && <BottomNav />}
    </div>
  );
}

export function TopBar({ title, onBack, right }: { title?: string; onBack?: (() => void) | false; right?: ReactNode }) {
  return (
    <header className="flex items-center gap-3 pt-4 pb-3 min-h-[4.5rem]">
      {onBack !== false && (
        <button
          type="button"
          onClick={() => (onBack ? onBack() : back())}
          className="btn-outline !px-0 w-14 shrink-0"
          aria-label="Indietro"
        >
          <ArrowLeft size={26} strokeWidth={2.5} aria-hidden />
        </button>
      )}
      {title && <h1 className="text-h3 font-extrabold flex-1 leading-tight">{title}</h1>}
      {right}
    </header>
  );
}

const NAV = [
  { path: '/oggi', label: 'Oggi', Icon: Sun },
  { path: '/giardino', label: 'Giardino', Icon: Sprout },
  { path: '/progressi', label: 'Progressi', Icon: TrendingUp },
  { path: '/io', label: 'Io', Icon: User },
];

export function BottomNav() {
  const route = useRoute();
  return (
    <nav
      aria-label="Menu principale"
      className="fixed bottom-0 inset-x-0 z-40 bg-white border-t-2 border-line"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)' }}
    >
      <div className="max-w-app mx-auto grid grid-cols-4 gap-1 px-2 pt-2">
        {NAV.map(({ path, label, Icon }) => {
          const active = route.startsWith(path);
          return (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 min-h-[3.75rem] rounded-2xl text-meta ${
                active ? 'bg-leaf-tint text-leaf-dark font-extrabold border-2 border-leaf/40' : 'text-ink-soft font-bold border-2 border-transparent'
              }`}
            >
              <Icon size={26} strokeWidth={active ? 2.6 : 2.2} aria-hidden />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>;
}

/** Pulsante "Ascolta" che legge un testo, mostrato solo se la lettura è attiva e supportata. */
export function Listen({ text }: { text: string }) {
  const s = useApp();
  if (!s.settings.voice || !canSpeak()) return null;
  return (
    <button type="button" className="btn-outline !min-h-[3rem] !px-4 text-meta" onClick={() => speak(text)}>
      <Volume2 size={22} aria-hidden /> Ascolta
    </button>
  );
}

/** Gradini di avanzamento (es. Seme → Fiori). */
export function Steps({ labels, current, done }: { labels: readonly string[]; current: number; done: number }) {
  return (
    <ol className="grid gap-1" style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))` }}>
      {labels.map((l, i) => {
        const isDone = i < done;
        const isCurrent = i === current;
        return (
          <li key={l} className="flex flex-col items-center gap-1.5 text-center">
            <span
              className={`w-11 h-11 rounded-full flex items-center justify-center border-2 ${
                isDone
                  ? 'bg-leaf border-leaf text-white'
                  : isCurrent
                  ? 'bg-sun-tint border-sun-dark'
                  : 'bg-white border-dashed border-line-strong'
              }`}
              aria-hidden
            >
              {isDone ? (
                <svg width="20" height="20" viewBox="0 0 24 24"><polyline points="5 12 10 17 19 7" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              ) : (
                <span className={`w-3.5 h-3.5 rounded-full ${isCurrent ? 'bg-sun-dark' : 'bg-line-strong'}`} />
              )}
            </span>
            <span className={`text-[0.875rem] leading-tight ${isCurrent ? 'font-extrabold text-ink' : 'font-semibold text-ink-soft'}`}>{l}</span>
            <span className="sr-only">{isDone ? 'completato' : isCurrent ? 'in corso' : 'più avanti'}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function Dots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current + 1} aria-label={`Passo ${current + 1} di ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-2.5 flex-1 rounded-full ${i <= current ? 'bg-leaf' : 'bg-line'}`} />
      ))}
    </div>
  );
}

export function Notice({ children, tone = 'leaf' }: { children: ReactNode; tone?: 'leaf' | 'sun' | 'sky' }) {
  const cls = tone === 'leaf' ? 'bg-leaf-tint border-leaf/40' : tone === 'sun' ? 'bg-sun-tint border-sun-dark/40' : 'bg-sky-tint border-sky/30';
  return <div className={`rounded-2xl border-2 px-4 py-3 text-body font-semibold fade-up ${cls}`} role="status">{children}</div>;
}

export function Avatar({ name, me = false, size = 'md' }: { name: string; me?: boolean; size?: 'md' | 'sm' }) {
  const s = size === 'md' ? 'w-12 h-12 text-lead' : 'w-10 h-10 text-body';
  return (
    <span
      className={`${s} shrink-0 rounded-full flex items-center justify-center font-extrabold border-2 ${
        me ? 'bg-leaf text-white border-leaf-dark' : 'bg-leaf-tint text-leaf-deep border-leaf/30'
      }`}
      aria-hidden
    >
      {me ? 'Tu' : name.charAt(0).toUpperCase()}
    </span>
  );
}

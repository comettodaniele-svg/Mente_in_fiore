import type { ReactNode } from 'react';
import { ArrowLeft, Sun, Sprout, TrendingUp, User, Volume2, Check, Flower2 } from 'lucide-react';
import { back, navigate, useRoute } from '../router';
import { canSpeak, speak } from '../lib/speech';
import { useApp } from '../store';
import { hashString } from '../lib/rng';

/** Barra in alto delle schermate principali, come in Stitch: logo, nome dell'app e sezione. */
export function AppBar({ section }: { section: string }) {
  return (
    <header
      className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b-2 border-moss"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="max-w-app mx-auto h-[4.5rem] px-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-2xl bg-leaf-tint border-2 border-leaf/30 flex items-center justify-center" aria-hidden>
            <Sprout size={26} strokeWidth={2.6} className="text-leaf" />
          </span>
          <span className="flex flex-col">
            <span className="text-lead font-extrabold leading-tight tracking-tight">Mente in fiore</span>
            <span className="text-[0.8125rem] font-extrabold text-leaf-deep uppercase tracking-wider leading-none">{section}</span>
          </span>
        </div>
        <button
          type="button"
          aria-label="Il mio profilo"
          onClick={() => navigate('/io')}
          className="w-12 h-12 rounded-2xl bg-[#F0F4F0] border-2 border-moss flex items-center justify-center"
        >
          <span className="w-8 h-8 rounded-full bg-leaf flex items-center justify-center" style={{ boxShadow: '0 2px 0 0 #357C01' }}>
            <User size={20} color="#fff" strokeWidth={2.6} aria-hidden />
          </span>
        </button>
      </div>
    </header>
  );
}

export function Screen({ children, nav = false, bar, className = '' }: { children: ReactNode; nav?: boolean; bar?: string; className?: string }) {
  return (
    <div className={`min-h-[100dvh] flex flex-col ${nav ? 'pb-28' : 'pb-8'}`} style={bar ? undefined : { paddingTop: 'env(safe-area-inset-top)' }}>
      {bar && <AppBar section={bar} />}
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
      className="fixed bottom-0 inset-x-0 z-40 bg-white border-t-2 border-moss"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)', boxShadow: '0 -4px 16px rgba(0,0,0,0.04)' }}
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
                active ? 'bg-leaf-tint text-leaf-deep font-extrabold border-2 border-leaf/40' : 'text-ink-soft font-bold border-2 border-transparent'
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
    <button type="button" className="btn-outline !min-h-[3rem] !px-4 !text-body" onClick={() => speak(text)}>
      <Volume2 size={22} aria-hidden /> Ascolta
    </button>
  );
}

/** Gradini di avanzamento in stile Stitch: barra sopra, cerchio, etichetta. Nessun lucchetto. */
export function Steps({ labels, current, done }: { labels: readonly string[]; current: number; done: number }) {
  return (
    <ol className="grid gap-2" style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))` }}>
      {labels.map((l, i) => {
        const isDone = i < done;
        const isCurrent = i === current;
        return (
          <li key={l} className="flex flex-col items-center gap-1.5 text-center">
            <span
              className={`w-full h-3 rounded-full ${isDone ? 'bg-leaf' : isCurrent ? 'bg-orange' : 'bg-line'}`}
              style={{ boxShadow: isDone ? '0 2px 0 0 #357C01' : isCurrent ? '0 2px 0 0 #CC7800' : undefined }}
              aria-hidden
            />
            <span
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isDone ? 'bg-leaf' : isCurrent ? 'bg-orange ring-4 ring-[#FFE0A3]' : 'bg-slate-100 border-2 border-dashed border-line-strong'
              }`}
              style={{ boxShadow: isDone ? '0 2px 0 0 #357C01' : isCurrent ? '0 2px 0 0 #CC7800' : undefined }}
              aria-hidden
            >
              {isDone ? (
                <Check size={22} strokeWidth={3.4} color="#fff" />
              ) : isCurrent ? (
                <Sprout size={20} strokeWidth={2.6} color="#fff" />
              ) : (
                <Flower2 size={18} className="text-line-strong" />
              )}
            </span>
            <span className={`text-[0.875rem] leading-tight ${isCurrent ? 'font-extrabold text-orange-text' : isDone ? 'font-bold text-ink' : 'font-bold text-ink-soft'}`}>{l}</span>
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
        <span key={i} className={`h-3 flex-1 rounded-full ${i <= current ? 'bg-leaf' : 'bg-line'}`} />
      ))}
    </div>
  );
}

export function Notice({ children, tone = 'leaf' }: { children: ReactNode; tone?: 'leaf' | 'sun' | 'sky' }) {
  const cls = tone === 'leaf' ? 'bg-leaf-tint border-leaf/40' : tone === 'sun' ? 'bg-sun-tint border-sun-edge' : 'bg-sky-tint border-sky/30';
  return <div className={`rounded-2xl border-2 px-4 py-3 text-body font-semibold fade-up ${cls}`} role="status">{children}</div>;
}

// Colori delle persone del gruppo, come gli avatar di Stitch.
export const TONES = [
  { ring: '#58CC02', bg: '#EEFAE6', text: '#2A6900', soft: '#F7FAF5', edge: '#E3F5D5' },
  { ring: '#FF9600', bg: '#FFF4E0', text: '#A35400', soft: '#FFFAF0', edge: '#FDE9C4' },
  { ring: '#1CB0F6', bg: '#E0F4FF', text: '#0369A1', soft: '#F0F9FF', edge: '#CDEBFB' },
  { ring: '#A855F7', bg: '#F3E8FF', text: '#7E22CE', soft: '#FAF5FF', edge: '#EBDDFB' },
  { ring: '#E5484D', bg: '#FFE9EA', text: '#B42328', soft: '#FFF5F5', edge: '#FBD5D7' },
];

export const toneFor = (name: string, index?: number) => TONES[(index ?? hashString(name)) % TONES.length];

export function Avatar({ name, me = false, size = 'md', tone }: { name: string; me?: boolean; size?: 'md' | 'sm'; tone?: number }) {
  const s = size === 'md' ? 'w-12 h-12 text-lead' : 'w-11 h-11 text-body';
  if (me) {
    return (
      <span className={`${s} shrink-0 rounded-full flex items-center justify-center font-extrabold bg-leaf text-white border-[3px] border-white`} style={{ boxShadow: '0 0 0 2px #357C01' }} aria-hidden>
        Tu
      </span>
    );
  }
  const t = toneFor(name, tone);
  return (
    <span
      className={`${s} shrink-0 rounded-full flex items-center justify-center font-extrabold border-[3px] border-white`}
      style={{ background: t.bg, color: t.text, boxShadow: `0 0 0 2px ${t.ring}` }}
      aria-hidden
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

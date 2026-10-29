import { useEffect, useRef, type ReactNode } from 'react';

/** true finché il componente è montato: evita aggiornamenti dopo che si è usciti dall'esercizio. */
export function useAlive() {
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  return alive;
}

export const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function TrialHeader({ label, index, total }: { label?: string; index: number; total: number }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <span className="text-meta font-bold text-ink-soft">{label ?? 'Prova'} {Math.min(index + 1, total)} di {total}</span>
      <div className="flex gap-1 flex-1 max-w-[11rem]" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`h-2 flex-1 rounded-full ${i < index ? 'bg-leaf' : i === index ? 'bg-sun-dark' : 'bg-line'}`} />
        ))}
      </div>
    </div>
  );
}

export function Prompt({ children }: { children: ReactNode }) {
  return <p className="text-lead font-bold text-center mb-4" aria-live="polite">{children}</p>;
}

/** Adattamento standard: sopra la soglia alta si sale, sotto la bassa si scende. */
export function stepLevel(level: number, acc: number, max: number, up = 0.8, down = 0.5) {
  if (acc >= up) return Math.min(max, level + 1);
  if (acc < down) return Math.max(1, level - 1);
  return level;
}

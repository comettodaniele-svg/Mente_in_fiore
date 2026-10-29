// "Il sentiero dei sassi": memoria di lavoro visuo-spaziale (blocchi di Corsi).
// Alcuni sassi si illuminano uno dopo l'altro; si toccano nello stesso ordine.
import { useEffect, useState } from 'react';
import type { ExerciseProps } from './types';
import { TrialHeader, Prompt, useAlive, wait } from './common';
import { freshRng, sample } from '../lib/rng';

const TRIALS = 5;

export const sassiSpan = (level: number) => level + 2;

export default function Sassi({ level, onDone }: ExerciseProps) {
  const alive = useAlive();
  const span = sassiSpan(level);
  const size = span <= 5 ? 3 : 4;
  const cells = size * size;
  const [trial, setTrial] = useState(0);
  const [seq, setSeq] = useState<number[]>(() => sample(freshRng(), [...Array(cells).keys()], span));
  const [lit, setLit] = useState<number | null>(null);
  const [phase, setPhase] = useState<'ready' | 'show' | 'input' | 'fb'>('ready');
  const [taps, setTaps] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [lastOk, setLastOk] = useState(false);

  // Mostra la sequenza all'inizio di ogni prova. Dipende solo da "trial":
  // se dipendesse anche da "phase", il passaggio a 'show' interromperebbe l'animazione.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await wait(800);
      if (cancelled) return;
      setPhase('show');
      for (const c of seq) {
        setLit(c);
        await wait(750);
        if (cancelled) return;
        setLit(null);
        await wait(280);
        if (cancelled) return;
      }
      setPhase('input');
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trial]);

  async function tap(c: number) {
    if (phase !== 'input') return;
    const next = [...taps, c];
    setTaps(next);
    setLit(c);
    setTimeout(() => alive.current && setLit((l) => (l === c ? null : l)), 220);
    const wrong = next.some((x, i) => x !== seq[i]);
    if (!wrong && next.length < seq.length) return;
    const ok = !wrong;
    const ns = score + (ok ? 1 : 0);
    const nb = ok ? Math.max(best, span) : best;
    setScore(ns);
    setBest(nb);
    setLastOk(ok);
    setPhase('fb');
    await wait(1300);
    if (!alive.current) return;
    if (trial + 1 >= TRIALS) {
      onDone({
        correct: ns,
        total: TRIALS,
        metric: nb || Math.max(1, span - 1),
        metricLabel: 'sassi ricordati in fila',
      });
      return;
    }
    setTrial(trial + 1);
    setSeq(sample(freshRng(), [...Array(cells).keys()], span));
    setTaps([]);
    setPhase('ready');
  }

  const msg =
    phase === 'input' ? `Tocca i ${span} sassi nello stesso ordine` :
    phase === 'fb' ? (lastOk ? 'Perfetto!' : 'Non proprio: ecco la prossima.') :
    'Guarda bene i sassi che si illuminano';

  return (
    <div>
      <TrialHeader index={trial} total={TRIALS} />
      <Prompt>{msg}</Prompt>
      <div
        className="grid gap-3 mx-auto w-full max-w-[22rem] p-4 rounded-card bg-[#E9E2D0] border-2 border-[#D4C7A8]"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: cells }, (_, c) => {
          const on = lit === c;
          const tapped = taps.includes(c);
          return (
            <button
              key={c}
              type="button"
              disabled={phase !== 'input'}
              onClick={() => tap(c)}
              aria-label={`Sasso ${c + 1}`}
              className={`aspect-square rounded-[40%] border-[3px] transition-colors duration-100 flex items-center justify-center ${
                on ? 'bg-sun border-sun-dark' : tapped && phase === 'input' ? 'bg-[#D6CDB6] border-[#B5A684]' : 'bg-[#F6F1E4] border-[#C9BB98]'
              } disabled:cursor-default`}
              style={{ boxShadow: on ? '0 0 0 6px rgba(255,200,0,.35)' : '0 4px 0 0 #B5A684' }}
            >
              {on && (
                <svg viewBox="0 0 24 24" width="60%" height="60%" aria-hidden>
                  {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="12" cy="6" rx="3.4" ry="5" fill="#FFFFFF" transform={`rotate(${a} 12 12)`} />)}
                  <circle cx="12" cy="12" r="3.6" fill="#F5B000" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

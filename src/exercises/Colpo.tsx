// "Colpo d'occhio": velocità di elaborazione e attenzione periferica,
// sul modello dell'allenamento "campo visivo utile" dello studio ACTIVE.
// Al centro compare un'immagine e, insieme, un'ape in una di 8 posizioni intorno.
// Il tempo di esposizione si accorcia quando si risponde bene.
import { useEffect, useState } from 'react';
import { Token, type TokenKind } from '../art/Tokens';
import type { ExerciseProps } from './types';
import { TrialHeader, Prompt, useAlive, wait } from './common';
import { freshRng, randInt } from '../lib/rng';

export const COLPO_MS = [600, 460, 350, 270, 210, 165, 130, 100, 80, 60];
const TRIALS = 8;
const CENTER: TokenKind[] = ['girasole', 'foglia'];

type Phase = 'fix' | 'show' | 'mask' | 'q1' | 'q2' | 'fb';

const pos = (i: number) => {
  const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
  return { left: `${50 + Math.cos(a) * 38}%`, top: `${50 + Math.sin(a) * 38}%` };
};

export default function Colpo({ level, onDone }: ExerciseProps) {
  const alive = useAlive();
  const ms = COLPO_MS[Math.min(COLPO_MS.length, level) - 1];
  const distractors = level >= 5;
  const [trial, setTrial] = useState(0);
  const [phase, setPhase] = useState<Phase>('fix');
  const [stim, setStim] = useState(() => newStim());
  const [answer1, setAnswer1] = useState<TokenKind | null>(null);
  const [score, setScore] = useState(0);
  const [lastOk, setLastOk] = useState<boolean | null>(null);

  function newStim() {
    const rng = freshRng();
    const target = randInt(rng, 0, 7);
    const others = [0, 1, 2, 3, 4, 5, 6, 7].filter((i) => i !== target && rng() < 0.6);
    return { center: CENTER[randInt(rng, 0, 1)], target, others };
  }

  useEffect(() => {
    if (phase !== 'fix') return;
    let cancelled = false;
    (async () => {
      await wait(700);
      if (cancelled) return;
      setPhase('show');
      await wait(ms);
      if (cancelled) return;
      setPhase('mask');
      await wait(450);
      if (cancelled) return;
      setPhase('q1');
    })();
    return () => {
      cancelled = true;
    };
  }, [phase, trial, ms, alive]);

  async function chooseLocation(i: number) {
    const ok = answer1 === stim.center && i === stim.target;
    const newScore = score + (ok ? 1 : 0);
    setScore(newScore);
    setLastOk(ok);
    setPhase('fb');
    await wait(1100);
    if (!alive.current) return;
    if (trial + 1 >= TRIALS) {
      onDone({ correct: newScore, total: TRIALS, metric: ms, metricLabel: 'millesimi di secondo', lowerIsBetter: true });
      return;
    }
    setTrial(trial + 1);
    setStim(newStim());
    setAnswer1(null);
    setLastOk(null);
    setPhase('fix');
  }

  return (
    <div>
      <TrialHeader index={trial} total={TRIALS} />
      {phase === 'q1' ? (
        <div className="fade-up">
          <Prompt>Cosa c'era al centro?</Prompt>
          <div className="grid grid-cols-2 gap-3">
            {CENTER.map((c) => (
              <button key={c} type="button" className="choice !flex-col !py-4" onClick={() => { setAnswer1(c); setPhase('q2'); }}>
                <Token kind={c} size={64} />
                <span className="capitalize">{c}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <Prompt>
            {phase === 'q2' ? "Dov'era l'ape? Tocca il cerchio giusto." : phase === 'fb' ? (lastOk ? 'Giusto!' : 'Quasi: andiamo avanti.') : 'Guarda il centro'}
          </Prompt>
          <div className="relative mx-auto aspect-square w-full max-w-[22rem] rounded-card bg-white border-2 border-line" aria-live="polite">
            {phase === 'fix' && <span className="absolute inset-0 flex items-center justify-center text-hero font-extrabold text-ink-soft" aria-hidden>+</span>}
            {phase === 'show' && (
              <>
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"><Token kind={stim.center} size={64} /></span>
                <span className="absolute -translate-x-1/2 -translate-y-1/2" style={pos(stim.target)}><Token kind="ape" size={46} /></span>
                {distractors && stim.others.map((i) => (
                  <span key={i} className="absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-[#B7BDC6]" style={pos(i)} aria-hidden />
                ))}
              </>
            )}
            {phase === 'mask' && (
              <div className="absolute inset-0 rounded-card" style={{ background: 'repeating-linear-gradient(45deg,#D1D5DB 0 6px,#F3F4F6 6px 12px)' }} aria-hidden />
            )}
            {(phase === 'q2' || phase === 'fb') && Array.from({ length: 8 }, (_, i) => (
              <button
                key={i}
                type="button"
                disabled={phase === 'fb'}
                onClick={() => chooseLocation(i)}
                aria-label={`Posizione ${i + 1}`}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-[3px] ${
                  phase === 'fb' && i === stim.target ? 'bg-leaf-tint border-leaf' : 'bg-sky-tint border-sky/50'
                }`}
                style={pos(i)}
              >
                {phase === 'fb' && i === stim.target && <span className="flex items-center justify-center"><Token kind="ape" size={36} /></span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// "La lista della spesa": memoria episodica verbale (riconoscimento dopo una pausa).
import { useEffect, useMemo, useState } from 'react';
import type { ExerciseProps } from './types';
import { Prompt, useAlive, wait } from './common';
import { freshRng, sample, shuffle, randInt } from '../lib/rng';
import { Token } from '../art/Tokens';

const CATS: Record<string, string[]> = {
  frutta: ['mele', 'pere', 'banane', 'arance', 'uva', 'pesche', 'fragole', 'ciliegie', 'kiwi', 'prugne'],
  verdura: ['carote', 'zucchine', 'pomodori', 'patate', 'cipolle', 'insalata', 'peperoni', 'spinaci', 'melanzane', 'finocchi'],
  casa: ['sapone', 'detersivo', 'spugne', 'sale', 'zucchero', 'caffè', 'tè', 'farina', 'olio', 'aceto'],
  frigo: ['latte', 'burro', 'yogurt', 'uova', 'formaggio', 'prosciutto', 'mozzarella', 'panna', 'ricotta', 'salame'],
  dispensa: ['pane', 'grissini', 'biscotti', 'pasta', 'riso', 'crackers', 'marmellata', 'miele', 'tonno', 'fagioli'],
};

export const spesaLen = (level: number) => level + 3;

export default function Spesa({ level, onDone }: ExerciseProps) {
  const alive = useAlive();
  const n = spesaLen(level);
  const { list, options } = useMemo(() => {
    const rng = freshRng();
    const all = Object.values(CATS).flat();
    const chosen = sample(rng, all, n * 2);
    return { list: chosen.slice(0, n), options: shuffle(rng, chosen) };
  }, [n]);
  const studyMs = Math.max(9000, n * 2600);
  const [phase, setPhase] = useState<'study' | 'pause' | 'recall' | 'fb'>('study');
  const [left, setLeft] = useState(studyMs);
  const [count] = useState(() => randInt(freshRng(), 3, 7));
  const [countAnswer, setCountAnswer] = useState<number | null>(null);
  const [marked, setMarked] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (phase !== 'study') return;
    const t0 = Date.now();
    const id = setInterval(() => {
      const l = studyMs - (Date.now() - t0);
      setLeft(l);
      if (l <= 0) {
        clearInterval(id);
        setPhase('pause');
      }
    }, 200);
    return () => clearInterval(id);
  }, [phase, studyMs]);

  async function answerCount(v: number) {
    setCountAnswer(v);
    await wait(900);
    if (alive.current) setPhase('recall');
  }

  function finish() {
    let hits = 0;
    let fa = 0;
    marked.forEach((w) => (list.includes(w) ? hits++ : fa++));
    onDone({ correct: Math.max(0, hits - fa), total: n, metric: hits, metricLabel: `cose ricordate su ${n}`, extra: { errori: fa } });
  }

  if (phase === 'study') {
    return (
      <div className="fade-up">
        <Prompt>Leggi con calma la lista: dopo te la chiederò</Prompt>
        <ol className="card !p-4 grid grid-cols-2 gap-x-4 gap-y-2 list-decimal list-inside text-lead font-bold">
          {list.map((w) => <li key={w} className="capitalize">{w}</li>)}
        </ol>
        <div className="h-3 rounded-full bg-line mt-4 overflow-hidden" aria-hidden>
          <div className="h-full bg-sun-dark" style={{ width: `${Math.max(0, (left / studyMs) * 100)}%` }} />
        </div>
        <button type="button" className="btn-primary w-full mt-4" onClick={() => setPhase('pause')}>Ho memorizzato</button>
      </div>
    );
  }

  if (phase === 'pause') {
    return (
      <div className="fade-up">
        <Prompt>Un attimo di pausa: quante gocce vedi?</Prompt>
        <div className="card flex flex-wrap justify-center gap-3 !py-6">
          {Array.from({ length: count }, (_, i) => <Token key={i} kind="goccia" size={44} />)}
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[count - 1, count, count + 1].map((v) => (
            <button
              key={v}
              type="button"
              className="choice !justify-center text-h3"
              aria-pressed={countAnswer === v}
              onClick={() => answerCount(v)}
              disabled={countAnswer !== null}
            >
              {v}
            </button>
          ))}
        </div>
        {countAnswer !== null && <p className="text-center text-body font-bold mt-3" role="status">{countAnswer === count ? 'Esatto!' : `Erano ${count}.`} Ora torniamo alla lista.</p>}
      </div>
    );
  }

  return (
    <div className="fade-up">
      <Prompt>Tocca le cose che erano nella lista</Prompt>
      <div className="grid grid-cols-2 gap-2.5">
        {options.map((w) => (
          <button
            key={w}
            type="button"
            className="choice !justify-center capitalize !min-h-[3.5rem]"
            aria-pressed={marked.has(w)}
            onClick={() =>
              setMarked((m) => {
                const x = new Set(m);
                if (x.has(w)) x.delete(w);
                else x.add(w);
                return x;
              })
            }
          >
            {w}
          </button>
        ))}
      </div>
      <button type="button" className="btn-primary w-full mt-5" onClick={finish}>Ho finito</button>
    </div>
  );
}

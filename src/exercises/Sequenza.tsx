// "Cosa viene dopo?": ragionamento e funzioni esecutive (completare una serie).
// Serie di immagini che seguono una regola; si sceglie l'elemento che manca.
import { useMemo, useState } from 'react';
import { Token, type TokenKind } from '../art/Tokens';
import type { ExerciseProps } from './types';
import { TrialHeader, Prompt, useAlive, wait } from './common';
import { freshRng, sample, shuffle, randInt, type Rng } from '../lib/rng';

const TRIALS = 6;
const KINDS: TokenKind[] = ['margherita', 'tulipano', 'girasole', 'foglia', 'goccia', 'sole', 'fungo'];

interface Item { kind: TokenKind; size: number }
interface Puzzle { shown: Item[]; answer: Item; options: Item[] }

const key = (i: Item) => `${i.kind}-${i.size}`;

function rule(level: number, rng: Rng): Puzzle {
  // Livelli: 1 alternanza AB; 2 ciclo ABC; 3 ABB; 4 grandezza che cresce; 5 ciclo + grandezza; 6 AABBC…
  const type = Math.min(6, randInt(rng, Math.max(1, level - 1), level));
  const k = sample(rng, KINDS, 3);
  let seq: Item[] = [];
  const S = 1;
  if (type === 1) seq = Array.from({ length: 6 }, (_, i) => ({ kind: k[i % 2], size: S }));
  if (type === 2) seq = Array.from({ length: 7 }, (_, i) => ({ kind: k[i % 3], size: S }));
  if (type === 3) seq = Array.from({ length: 7 }, (_, i) => ({ kind: i % 3 === 0 ? k[0] : k[1], size: S }));
  if (type === 4) seq = Array.from({ length: 5 }, (_, i) => ({ kind: k[0], size: (i % 3) + 1 }));
  if (type === 5) seq = Array.from({ length: 7 }, (_, i) => ({ kind: k[i % 2], size: (i % 3) + 1 }));
  if (type === 6) seq = Array.from({ length: 8 }, (_, i) => ({ kind: k[Math.floor((i % 5) / 2) % 3], size: S }));
  const answer = seq[seq.length - 1];
  const shown = seq.slice(0, -1);
  const pool: Item[] = [];
  KINDS.forEach((kind) => [1, 2, 3].forEach((size) => pool.push({ kind, size })));
  const near = pool.filter(
    (p) => key(p) !== key(answer) && (shown.some((s) => s.kind === p.kind) || p.kind === answer.kind) && (type >= 4 || p.size === S),
  );
  const options = shuffle(rng, [answer, ...sample(rng, near, 3)]);
  return { shown, answer, options };
}

const px = (size: number) => [0, 40, 54, 70][size];

export default function Sequenza({ level, onDone }: ExerciseProps) {
  const alive = useAlive();
  const puzzles = useMemo(() => {
    const rng = freshRng();
    return Array.from({ length: TRIALS }, () => rule(level, rng));
  }, [level]);
  const [trial, setTrial] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const p = puzzles[trial];

  async function choose(o: Item) {
    if (picked) return;
    const ok = key(o) === key(p.answer);
    setPicked(key(o));
    const ns = score + (ok ? 1 : 0);
    setScore(ns);
    await wait(1200);
    if (!alive.current) return;
    if (trial + 1 >= TRIALS) {
      onDone({ correct: ns, total: TRIALS, metric: ns, metricLabel: `serie completate su ${TRIALS}` });
      return;
    }
    setTrial(trial + 1);
    setPicked(null);
  }

  const ok = picked !== null && picked === key(p.answer);
  return (
    <div>
      <TrialHeader label="Serie" index={trial} total={TRIALS} />
      <Prompt>{picked ? (ok ? 'Giusto!' : 'Ecco quello giusto.') : 'Quale viene dopo?'}</Prompt>
      <div className="card !p-3 flex flex-wrap items-end justify-center gap-1.5 min-h-[6rem]">
        {p.shown.map((s, i) => (
          <span key={i} className="flex items-end justify-center" style={{ width: 54, height: 70 }}>
            <Token kind={s.kind} size={px(s.size)} />
          </span>
        ))}
        <span
          className={`flex items-center justify-center rounded-xl border-[3px] border-dashed ${picked ? 'border-leaf bg-leaf-tint' : 'border-sun-dark bg-sun-tint'}`}
          style={{ width: 58, height: 74 }}
        >
          {picked ? <Token kind={p.answer.kind} size={px(p.answer.size)} /> : <span className="text-h2 font-extrabold text-sun-dark" aria-hidden>?</span>}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-5">
        {p.options.map((o) => {
          const isAnswer = key(o) === key(p.answer);
          const state = picked ? (isAnswer ? 'border-leaf bg-leaf-tint' : picked === key(o) ? 'border-sky opacity-70' : 'opacity-50') : '';
          return (
            <button
              key={key(o)}
              type="button"
              onClick={() => choose(o)}
              disabled={!!picked}
              className={`choice !justify-center !min-h-[6rem] ${state}`}
              aria-label={`${o.kind}${o.size > 1 ? (o.size === 2 ? ', medio' : ', grande') : ', piccolo'}`}
            >
              <Token kind={o.kind} size={px(o.size)} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

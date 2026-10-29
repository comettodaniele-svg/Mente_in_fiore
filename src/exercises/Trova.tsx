// "Trova i girasoli": attenzione selettiva (ricerca visiva).
// In più, una prova di memoria prospettica: all'inizio si chiede di toccare
// la farfalla SE compare; comparirà in uno dei quadri.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Token, type TokenKind } from '../art/Tokens';
import type { ExerciseProps } from './types';
import { TrialHeader, Prompt, useAlive, wait } from './common';
import { freshRng, randInt, shuffle, pick } from '../lib/rng';
import { Notice } from '../components/ui';

const ROUNDS = 3;
const GRID: [number, number][] = [[4, 5], [5, 5], [5, 6], [6, 6], [6, 7], [6, 8]];

function makeBoard(level: number, withButterfly: boolean): TokenKind[] {
  const rng = freshRng();
  const [c, r] = GRID[Math.min(GRID.length, level) - 1];
  const total = c * r;
  const nTargets = randInt(rng, 4, Math.min(8, 3 + level));
  const easy: TokenKind[] = ['foglia', 'goccia', 'tulipano', 'fungo'];
  const hard: TokenKind[] = ['margherita', 'sole', 'tulipano', 'foglia'];
  const pool = level >= 3 ? hard : easy;
  const cells: TokenKind[] = [];
  for (let i = 0; i < nTargets; i++) cells.push('girasole');
  while (cells.length < total - (withButterfly ? 1 : 0)) cells.push(pick(rng, pool));
  if (withButterfly) cells.push('farfalla');
  return shuffle(rng, cells);
}

export default function Trova({ level, onDone }: ExerciseProps) {
  const alive = useAlive();
  const butterflyRound = useMemo(() => 1 + Math.floor(Math.random() * 2), []);
  const [round, setRound] = useState(0);
  const [board, setBoard] = useState(() => makeBoard(level, butterflyRound === 0));
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [butterflyHit, setButterflyHit] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const totals = useRef({ hits: 0, fa: 0, targets: 0, ms: 0 });
  const started = useRef(Date.now());
  const cols = GRID[Math.min(GRID.length, level) - 1][0];

  useEffect(() => {
    started.current = Date.now();
  }, [round]);

  function toggle(i: number) {
    if (board[i] === 'farfalla') {
      setButterflyHit(true);
      setBoard((b) => b.map((x, j) => (j === i ? 'foglia' : x)));
      setMsg('Hai ricordato la farfalla: ottima memoria!');
      setTimeout(() => alive.current && setMsg(null), 2200);
      return;
    }
    setMarked((m) => {
      const n = new Set(m);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  }

  async function finish() {
    const targets = board.filter((k) => k === 'girasole').length;
    let hits = 0;
    let fa = 0;
    marked.forEach((i) => (board[i] === 'girasole' ? hits++ : fa++));
    const t = totals.current;
    t.hits += hits;
    t.fa += fa;
    t.targets += targets;
    t.ms += Date.now() - started.current;
    setMsg(hits === targets && fa === 0 ? 'Tutti trovati!' : `Trovati ${hits} su ${targets}.`);
    await wait(1200);
    if (!alive.current) return;
    setMsg(null);
    if (round + 1 >= ROUNDS) {
      const correct = Math.max(0, t.hits - t.fa);
      onDone({
        correct,
        total: t.targets,
        metric: t.hits,
        metricLabel: `girasoli trovati su ${t.targets}`,
        extra: { farfalla: butterflyHit ? 1 : 0, secondi: Math.round(t.ms / 1000 / ROUNDS), errori: t.fa },
      });
      return;
    }
    setRound(round + 1);
    setMarked(new Set());
    setBoard(makeBoard(level, butterflyRound === round + 1));
  }

  return (
    <div>
      <TrialHeader label="Quadro" index={round} total={ROUNDS} />
      <Prompt>Tocca tutti i girasoli</Prompt>
      <div className="grid gap-1.5 mx-auto w-full max-w-[24rem]" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {board.map((k, i) => (
          <button
            key={`${round}-${i}`}
            type="button"
            onClick={() => toggle(i)}
            aria-label={`${k}${marked.has(i) ? ', segnato' : ''}`}
            aria-pressed={marked.has(i)}
            className={`aspect-square rounded-2xl border-[3px] flex items-center justify-center bg-white ${
              marked.has(i) ? 'border-leaf bg-leaf-tint' : 'border-line'
            }`}
          >
            <Token kind={k} size={40} />
          </button>
        ))}
      </div>
      <div className="min-h-[3.5rem] mt-3">{msg && <Notice>{msg}</Notice>}</div>
      <button type="button" className="btn-primary w-full mt-2" onClick={finish}>Ho finito</button>
    </div>
  );
}

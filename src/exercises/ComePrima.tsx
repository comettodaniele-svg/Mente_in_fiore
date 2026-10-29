// "Come prima?": aggiornamento della memoria di lavoro (compito n-back).
// Compaiono immagini una alla volta: si tocca il pulsante quando l'immagine è
// uguale a quella di 1 (o 2, 3) passi prima.
import { useEffect, useRef, useState } from 'react';
import { Token, type TokenKind } from '../art/Tokens';
import type { ExerciseProps } from './types';
import { Prompt, useAlive, wait } from './common';
import { freshRng, pick } from '../lib/rng';

export const NBACK: [number, number][] = [[1, 2700], [1, 2100], [2, 2900], [2, 2300], [3, 3100], [3, 2500]];
const KINDS: TokenKind[] = ['margherita', 'tulipano', 'girasole', 'foglia', 'goccia', 'fungo'];
const LEN = 20;

export const passi = (n: number) => (n === 1 ? '1 passo' : `${n} passi`);

function makeSequence(n: number): TokenKind[] {
  const rng = freshRng();
  const seq: TokenKind[] = [];
  for (let i = 0; i < LEN + n; i++) {
    if (i >= n && rng() < 0.32) seq.push(seq[i - n]);
    else {
      let k = pick(rng, KINDS);
      // evita bersagli non voluti
      while (i >= n && k === seq[i - n]) k = pick(rng, KINDS);
      seq.push(k);
    }
  }
  return seq;
}

export default function ComePrima({ level, onDone }: ExerciseProps) {
  const alive = useAlive();
  const [n, interval] = NBACK[Math.min(NBACK.length, level) - 1];
  const [seq] = useState(() => makeSequence(n));
  const [idx, setIdx] = useState(-1);
  const [visible, setVisible] = useState(false);
  const [flash, setFlash] = useState<'ok' | 'no' | null>(null);
  const pressed = useRef<boolean[]>(Array(seq.length).fill(false));
  const idxRef = useRef(-1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await wait(1200);
      for (let i = 0; i < seq.length; i++) {
        if (cancelled) return;
        idxRef.current = i;
        setIdx(i);
        setFlash(null);
        setVisible(true);
        await wait(interval - 600);
        if (cancelled) return;
        setVisible(false);
        await wait(600);
      }
      if (cancelled) return;
      let correct = 0;
      let total = 0;
      for (let i = n; i < seq.length; i++) {
        const target = seq[i] === seq[i - n];
        if (target === pressed.current[i]) correct++;
        total++;
      }
      const acc = correct / total;
      onDone({ correct, total, metric: Math.round(acc * 100), metricLabel: `% di risposte giuste, ricordando ${passi(n)} indietro`, extra: { n } });
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function press() {
    const i = idxRef.current;
    if (i < n || pressed.current[i]) return;
    pressed.current[i] = true;
    const ok = seq[i] === seq[i - n];
    setFlash(ok ? 'ok' : 'no');
    setTimeout(() => alive.current && setFlash(null), 500);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-meta font-bold text-ink-soft">Immagine {Math.max(0, idx + 1)} di {seq.length}</span>
        <span className="pill bg-sky-tint text-sky-dark">{passi(n)} indietro</span>
      </div>
      <Prompt>
        {idx < n ? `Ricorda le immagini: tra poco confronta con quella di ${passi(n)} prima` : `È uguale a quella di ${passi(n)} prima?`}
      </Prompt>
      <div
        className={`mx-auto w-56 h-56 rounded-card bg-white border-[3px] flex items-center justify-center ${
          flash === 'ok' ? 'border-leaf flash-ok' : flash === 'no' ? 'border-sky' : 'border-line'
        }`}
      >
        {visible && idx >= 0 && <Token kind={seq[idx]} size={150} label />}
      </div>
      <p className="text-center text-meta text-ink-soft mt-2 min-h-[1.5rem]" aria-live="polite">
        {flash === 'ok' ? 'Sì, era uguale!' : flash === 'no' ? 'Questa volta no, era diversa.' : ''}
      </p>
      <button type="button" className="btn-primary w-full mt-4 !min-h-[4.5rem] text-lead" onClick={press} disabled={idx < n}>
        È uguale!
      </button>
      <p className="text-center text-meta text-ink-soft mt-3">Se è diversa, non toccare niente.</p>
    </div>
  );
}

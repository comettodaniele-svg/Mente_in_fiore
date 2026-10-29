// "Solo i fiori": controllo degli impulsi (compito go/no-go).
// Si annaffiano i fiori; le erbacce no.
import { useEffect, useRef, useState } from 'react';
import { Droplets } from 'lucide-react';
import { Token, type TokenKind } from '../art/Tokens';
import type { ExerciseProps } from './types';
import { Prompt, useAlive, wait } from './common';
import { freshRng, pick } from '../lib/rng';

export const GONOGO_MS = [1700, 1500, 1320, 1160, 1020, 900, 800];
const LEN = 30;
const FLOWERS: TokenKind[] = ['tulipano', 'margherita', 'girasole'];

export default function SoloFiori({ level, onDone }: ExerciseProps) {
  const alive = useAlive();
  const ms = GONOGO_MS[Math.min(GONOGO_MS.length, level) - 1];
  const [seq] = useState<TokenKind[]>(() => {
    const rng = freshRng();
    return Array.from({ length: LEN }, (_, i) => (i > 1 && rng() < 0.25 ? 'erbaccia' : pick(rng, FLOWERS)));
  });
  const [idx, setIdx] = useState(-1);
  const [visible, setVisible] = useState(false);
  const [flash, setFlash] = useState<'ok' | 'weed' | null>(null);
  const pressed = useRef<boolean[]>(Array(LEN).fill(false));
  const idxRef = useRef(-1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await wait(1200);
      for (let i = 0; i < LEN; i++) {
        if (cancelled) return;
        idxRef.current = i;
        setIdx(i);
        setFlash(null);
        setVisible(true);
        await wait(ms);
        if (cancelled) return;
        setVisible(false);
        idxRef.current = -1;
        await wait(350);
      }
      if (cancelled) return;
      let correct = 0;
      let weedErrors = 0;
      seq.forEach((k, i) => {
        const go = k !== 'erbaccia';
        if (go === pressed.current[i]) correct++;
        if (!go && pressed.current[i]) weedErrors++;
      });
      onDone({ correct, total: LEN, metric: weedErrors, metricLabel: 'erbacce annaffiate per sbaglio', lowerIsBetter: true });
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function water() {
    const i = idxRef.current;
    if (i < 0 || pressed.current[i]) return;
    pressed.current[i] = true;
    setFlash(seq[i] === 'erbaccia' ? 'weed' : 'ok');
    setTimeout(() => alive.current && setFlash(null), 450);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-meta font-bold text-ink-soft">{Math.max(0, idx + 1)} di {LEN}</span>
      </div>
      <Prompt>Annaffia i fiori, non le erbacce</Prompt>
      <div
        className={`mx-auto w-56 h-56 rounded-card bg-white border-[3px] flex items-center justify-center ${
          flash === 'ok' ? 'border-leaf flash-ok' : flash === 'weed' ? 'border-sky' : 'border-line'
        }`}
      >
        {visible && idx >= 0 && <Token kind={seq[idx]} size={150} label />}
      </div>
      <p className="text-center text-meta text-ink-soft mt-2 min-h-[1.5rem]" aria-live="polite">
        {flash === 'weed' ? 'Era un\'erbaccia: lasciala stare.' : flash === 'ok' ? 'Annaffiato!' : ''}
      </p>
      <button type="button" className="btn-primary w-full mt-4 !min-h-[4.5rem] text-lead" onClick={water}>
        <Droplets size={28} aria-hidden /> Annaffia
      </button>
    </div>
  );
}

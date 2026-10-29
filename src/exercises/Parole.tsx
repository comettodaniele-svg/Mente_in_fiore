// "Parole del giardino": accesso al lessico e categorie.
// Due tipi di prova: l'intruso (quale parola non c'entra) e la parola nascosta
// (completare una parola a partire dalla definizione e dalle prime lettere).
import { useMemo, useState } from 'react';
import type { ExerciseProps } from './types';
import { TrialHeader, Prompt, useAlive, wait } from './common';
import { freshRng, sample, shuffle, pick, type Rng } from '../lib/rng';

const TRIALS = 8;

const GROUPS: Record<string, string[]> = {
  'fiori': ['rosa', 'tulipano', 'margherita', 'viola', 'giglio', 'orchidea', 'garofano', 'girasole'],
  'alberi': ['quercia', 'pino', 'faggio', 'betulla', 'castagno', 'acero', 'abete', 'olmo'],
  'attrezzi da giardino': ['rastrello', 'zappa', 'vanga', 'cesoie', 'annaffiatoio', 'carriola', 'falce', 'pala'],
  'uccelli': ['passero', 'merlo', 'rondine', 'pettirosso', 'gazza', 'colomba', 'cinciallegra', 'gufo'],
  'ortaggi': ['carota', 'zucchina', 'pomodoro', 'patata', 'cipolla', 'lattuga', 'peperone', 'melanzana'],
  'insetti': ['ape', 'farfalla', 'formica', 'coccinella', 'grillo', 'cicala', 'libellula', 'vespa'],
  'erbe aromatiche': ['basilico', 'rosmarino', 'salvia', 'timo', 'origano', 'menta', 'prezzemolo', 'alloro'],
};

const DEFS: { word: string; def: string }[] = [
  { word: 'annaffiatoio', def: 'Si usa per dare acqua alle piante' },
  { word: 'rastrello', def: 'Raccoglie le foglie secche' },
  { word: 'carriola', def: 'Ha una ruota e serve a trasportare la terra' },
  { word: 'semina', def: 'Mettere i semi nella terra' },
  { word: 'potatura', def: 'Tagliare i rami per far crescere meglio la pianta' },
  { word: 'serra', def: 'Una casa di vetro per le piante' },
  { word: 'siepe', def: 'Una fila di cespugli che fa da confine' },
  { word: 'germoglio', def: 'La prima piccola parte verde che spunta' },
  { word: 'radice', def: 'La parte della pianta sotto terra' },
  { word: 'petalo', def: 'Una delle parti colorate del fiore' },
  { word: 'spaventapasseri', def: 'Un pupazzo che tiene lontani gli uccelli' },
  { word: 'vendemmia', def: "La raccolta dell'uva" },
  { word: 'concime', def: 'Si mette nella terra per nutrire le piante' },
  { word: 'ape', def: 'Fa il miele' },
  { word: 'chiocciola', def: 'Va piano e si porta la casa sulle spalle' },
  { word: 'aiuola', def: 'Uno spazio di terra con i fiori' },
];

type Trial =
  | { type: 'intruso'; group: string; options: string[]; answer: string }
  | { type: 'nascosta'; def: string; hint: string; options: string[]; answer: string };

function makeTrial(level: number, rng: Rng, i: number): Trial {
  if (level <= 2 || i % 2 === 0) {
    const names = Object.keys(GROUPS);
    const g = pick(rng, names);
    const other = pick(rng, names.filter((x) => x !== g));
    const nIn = level >= 3 ? 4 : 3;
    const inWords = sample(rng, GROUPS[g], nIn);
    const odd = pick(rng, GROUPS[other]);
    return { type: 'intruso', group: g, options: shuffle(rng, [...inWords, odd]), answer: odd };
  }
  const d = pick(rng, DEFS);
  const shown = level >= 5 ? 1 : 2;
  const hint = d.word.slice(0, shown).toUpperCase() + ' ' + '_ '.repeat(Math.max(0, d.word.length - shown)).trim();
  const distract = sample(rng, DEFS.filter((x) => x.word !== d.word).map((x) => x.word), 3);
  return { type: 'nascosta', def: d.def, hint, options: shuffle(rng, [d.word, ...distract]), answer: d.word };
}

export default function Parole({ level, onDone }: ExerciseProps) {
  const alive = useAlive();
  const trials = useMemo(() => {
    const rng = freshRng();
    return Array.from({ length: TRIALS }, (_, i) => makeTrial(level, rng, i));
  }, [level]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const t = trials[idx];

  async function choose(w: string) {
    if (picked) return;
    setPicked(w);
    const ok = w === t.answer;
    const ns = score + (ok ? 1 : 0);
    setScore(ns);
    await wait(1300);
    if (!alive.current) return;
    if (idx + 1 >= TRIALS) {
      onDone({ correct: ns, total: TRIALS, metric: ns, metricLabel: `parole trovate su ${TRIALS}` });
      return;
    }
    setIdx(idx + 1);
    setPicked(null);
  }

  const ok = picked === t.answer;
  return (
    <div>
      <TrialHeader label="Parola" index={idx} total={TRIALS} />
      {t.type === 'intruso' ? (
        <Prompt>{picked ? (ok ? 'Giusto!' : `Era «${t.answer}».`) : 'Quale parola non c\'entra con le altre?'}</Prompt>
      ) : (
        <div className="card !p-4 mb-4 text-center">
          <p className="text-lead font-bold">{t.def}</p>
          <p className="text-h2 font-extrabold tracking-[0.2em] mt-2 text-leaf-dark" aria-label={`Inizia con ${t.hint.split(' ')[0]}`}>{t.hint}</p>
          {picked && <p className="text-body font-bold mt-2" role="status">{ok ? 'Giusto!' : `Era «${t.answer}».`}</p>}
        </div>
      )}
      <div className="grid gap-3">
        {t.options.map((w) => {
          const state = picked ? (w === t.answer ? '!border-leaf !bg-leaf-tint' : w === picked ? 'opacity-70' : 'opacity-50') : '';
          return (
            <button key={w} type="button" className={`choice !justify-center text-lead capitalize ${state}`} onClick={() => choose(w)} disabled={!!picked}>
              {w}
            </button>
          );
        })}
      </div>
      {t.type === 'intruso' && picked && (
        <p className="text-center text-meta text-ink-soft mt-3">Le altre erano {t.group}.</p>
      )}
    </div>
  );
}

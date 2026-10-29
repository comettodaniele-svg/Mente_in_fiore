// Catalogo degli esercizi: cosa allenano, istruzioni, frase sul risultato e regola di adattamento.
import type { ExerciseDef, ExerciseId, ExerciseOutcome } from './types';
import { stepLevel } from './common';
import Colpo, { COLPO_MS } from './Colpo';
import Sassi, { sassiSpan } from './Sassi';
import ComePrima, { NBACK, passi } from './ComePrima';
import Trova from './Trova';
import Spesa, { spesaLen } from './Spesa';
import SoloFiori, { GONOGO_MS } from './SoloFiori';
import Sequenza from './Sequenza';
import Parole from './Parole';

const acc = (o: ExerciseOutcome) => (o.total ? o.correct / o.total : 0);

export const EXERCISES: ExerciseDef[] = [
  {
    id: 'colpo',
    name: "Colpo d'occhio",
    domains: ['velocita', 'attenzione'],
    trains: 'La prontezza e lo sguardo laterale',
    instructions: () =>
      "Guarda il punto al centro. Per un attimo compariranno un'immagine al centro e un'ape intorno. Poi dimmi cosa c'era al centro e dove si trovava l'ape.",
    maxLevel: COLPO_MS.length,
    phrase: (o) => `Hai riconosciuto le immagini in ${o.metric} millesimi di secondo`,
    adapt: (l, o) => stepLevel(l, acc(o), COLPO_MS.length, 0.75, 0.5),
    component: Colpo,
  },
  {
    id: 'sassi',
    name: 'Il sentiero dei sassi',
    domains: ['lavoro', 'spaziale'],
    trains: 'Ricordare posizioni e percorsi',
    instructions: (l) => `Alcuni sassi si illumineranno uno dopo l'altro. Poi toccali nello stesso ordine. Questa volta sono ${sassiSpan(l)}.`,
    maxLevel: 7,
    phrase: (o) => `Hai ricordato una fila di ${o.metric} sassi`,
    adapt: (l, o) => stepLevel(l, acc(o), 7, 0.6, 0.4),
    component: Sassi,
  },
  {
    id: 'comeprima',
    name: 'Come prima?',
    domains: ['lavoro', 'attenzione'],
    trains: 'Tenere a mente le cose mentre cambiano',
    instructions: (l) => {
      const n = NBACK[Math.min(NBACK.length, l) - 1][0];
      return `Comparirà un'immagine alla volta. Tocca «Uguale!» quando l'immagine è la stessa di ${passi(n)} prima. Altrimenti non fare nulla.`;
    },
    maxLevel: NBACK.length,
    phrase: (o) => {
      const n = o.extra?.n ?? 1;
      return `Hai risposto bene il ${o.metric}% delle volte, ricordando ${passi(n)} indietro`;
    },
    adapt: (l, o) => stepLevel(l, acc(o), NBACK.length, 0.82, 0.6),
    component: ComePrima,
  },
  {
    id: 'trova',
    name: 'Trova i girasoli',
    domains: ['attenzione', 'prospettica'],
    trains: "L'attenzione e ricordarsi di fare una cosa",
    instructions: () =>
      'Tocca tutti i girasoli che vedi, poi premi «Fatto». Un\'ultima cosa da ricordare: se a un certo punto vedi una farfalla, toccala!',
    maxLevel: 6,
    phrase: (o) => {
      const f = o.extra?.farfalla ? ' e ti sei ricordato della farfalla' : '';
      return `Hai trovato ${o.metric} girasoli su ${o.total}${f}`;
    },
    adapt: (l, o) => stepLevel(l, acc(o) - (o.extra?.errori ?? 0) * 0.05, 6, 0.85, 0.6),
    component: Trova,
  },
  {
    id: 'spesa',
    name: 'La lista della spesa',
    domains: ['memoria'],
    trains: 'Ricordare cose dette o lette',
    instructions: (l) => `Leggi una lista di ${spesaLen(l)} cose da comprare. Dopo una breve pausa, ritrovale in mezzo ad altre.`,
    maxLevel: 7,
    phrase: (o) => `Hai ricordato ${o.metric} cose della lista su ${o.total}`,
    adapt: (l, o) => stepLevel(l, acc(o), 7, 0.8, 0.5),
    component: Spesa,
  },
  {
    id: 'solofiori',
    name: 'Solo i fiori',
    domains: ['esecutive', 'attenzione'],
    trains: 'Fermarsi prima di fare in automatico',
    instructions: () =>
      'Comparirà una pianta alla volta. Tocca «Annaffia» per i fiori. Per le erbacce, invece, non fare nulla.',
    maxLevel: GONOGO_MS.length,
    phrase: (o) =>
      o.metric === 0 ? 'Non hai annaffiato nemmeno un\'erbaccia' : `Hai annaffiato per sbaglio ${o.metric} ${o.metric === 1 ? 'erbaccia' : 'erbacce'}`,
    adapt: (l, o) => stepLevel(l, acc(o), GONOGO_MS.length, 0.9, 0.75),
    component: SoloFiori,
  },
  {
    id: 'sequenza',
    name: 'Cosa viene dopo?',
    domains: ['esecutive'],
    trains: 'Ragionare e scoprire le regole',
    instructions: () => 'Guarda la fila di immagini: segue una regola. Scegli quella che viene dopo.',
    maxLevel: 6,
    phrase: (o) => `Hai completato ${o.metric} serie su ${o.total}`,
    adapt: (l, o) => stepLevel(l, acc(o), 6, 0.8, 0.5),
    component: Sequenza,
  },
  {
    id: 'parole',
    name: 'Parole del giardino',
    domains: ['linguaggio'],
    trains: 'Trovare le parole giuste',
    instructions: () => 'Trova la parola che non c\'entra con le altre, oppure la parola che corrisponde alla descrizione.',
    maxLevel: 6,
    phrase: (o) => `Hai trovato ${o.metric} parole su ${o.total}`,
    adapt: (l, o) => stepLevel(l, acc(o), 6, 0.85, 0.5),
    component: Parole,
  },
];

export const exById = (id: ExerciseId): ExerciseDef => EXERCISES.find((e) => e.id === id)!;

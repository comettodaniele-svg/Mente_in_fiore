import type { JSX } from 'react';
import type { Domain } from '../data/domains';

export type ExerciseId =
  | 'colpo'
  | 'sassi'
  | 'comeprima'
  | 'trova'
  | 'spesa'
  | 'solofiori'
  | 'sequenza'
  | 'parole';

export interface ExerciseOutcome {
  correct: number;
  total: number;
  /** Il numero concreto da mostrare alla persona (es. lunghezza della sequenza). */
  metric: number;
  /** Frase che spiega il numero, es. "sassi ricordati in fila". */
  metricLabel: string;
  /** true se un valore più BASSO è migliore (es. millisecondi). */
  lowerIsBetter?: boolean;
  extra?: Record<string, number>;
}

export interface ExerciseProps {
  level: number;
  onDone: (o: ExerciseOutcome) => void;
}

export interface ExerciseDef {
  id: ExerciseId;
  name: string;
  domains: Domain[];
  /** Cosa allena, in parole semplici. */
  trains: string;
  /** Istruzioni brevi, lette anche ad alta voce. */
  instructions: (level: number) => string;
  maxLevel: number;
  /** Frase concreta sul risultato, es. "Hai ricordato 6 sassi in fila". */
  phrase: (o: ExerciseOutcome) => string;
  /** Come cambia il livello in base all'esito. */
  adapt: (level: number, o: ExerciseOutcome) => number;
  component: (p: ExerciseProps) => JSX.Element;
}

import { Eye, Grid3x3, Repeat, Search, ShoppingBasket, Droplets, Shapes, MessageSquareText, type LucideIcon } from 'lucide-react';
import type { ExerciseId } from './types';

/** Icona e colore di ogni esercizio, per i nodi del sentiero nel giardino. */
export const EX_LOOK: Record<ExerciseId, { Icon: LucideIcon; tone: number }> = {
  colpo: { Icon: Eye, tone: 1 },
  sassi: { Icon: Grid3x3, tone: 2 },
  comeprima: { Icon: Repeat, tone: 3 },
  trova: { Icon: Search, tone: 1 },
  spesa: { Icon: ShoppingBasket, tone: 2 },
  solofiori: { Icon: Droplets, tone: 2 },
  sequenza: { Icon: Shapes, tone: 3 },
  parole: { Icon: MessageSquareText, tone: 1 },
};

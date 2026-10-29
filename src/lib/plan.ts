// La sessione del giorno: 3 esercizi scelti in base alle situazioni che la persona vuole migliorare,
// variando ogni giorno. Lo stesso giorno mostra sempre lo stesso piano.
import type { AppState } from '../store';
import type { ExerciseId } from '../exercises/types';
import { EXERCISES } from '../exercises';
import { domainPriority, sessionsOn } from './derive';
import { addDays, dayKey } from './dates';
import { rngFrom } from './rng';

/** Al massimo due sessioni al giorno: poi l'app invita a riposare. */
export const MAX_SESSIONS_PER_DAY = 2;

export function todayPlan(s: AppState, day = dayKey()): ExerciseId[] {
  const prio = domainPriority(s);
  const n = sessionsOn(s, day);
  const rng = rngFrom(`${day}-${n}-${s.name}`);
  const recent = new Set<ExerciseId>();
  // Esercizi fatti ieri e oggi pesano meno, per variare.
  [dayKey(addDays(new Date(), -1)), day].forEach((d) =>
    s.results.filter((r) => r.day === d).forEach((r) => recent.add(r.ex)),
  );

  const scored = EXERCISES.map((e) => {
    const p = e.domains.reduce((a, d) => a + prio[d], 0);
    let score = 2 + p + rng() * 3;
    if (e.id === 'colpo') score += 1.5; // l'allenamento con le prove più solide
    if (recent.has(e.id)) score -= 4;
    return { id: e.id, score, domains: e.domains };
  }).sort((a, b) => b.score - a.score);

  // Scegli 3 esercizi che coprano domini diversi.
  const out: ExerciseId[] = [];
  const used = new Set<string>();
  for (const e of scored) {
    if (out.length === 3) break;
    if (used.has(e.domains[0])) continue;
    out.push(e.id);
    e.domains.forEach((d) => used.add(d));
  }
  for (const e of scored) {
    if (out.length === 3) break;
    if (!out.includes(e.id)) out.push(e.id);
  }
  return out;
}

export const levelOf = (s: AppState, id: ExerciseId) => s.levels[id] ?? 1;

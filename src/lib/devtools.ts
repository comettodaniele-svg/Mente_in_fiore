// Strumenti per la modalità sviluppatore: dati di esempio e scorciatoie.
import { setState } from '../store';
import type { ResultEntry, SessionEntry } from '../store';
import { EXERCISES } from '../exercises';
import { addDays, dayKey } from './dates';
import { freshRng, randInt, sample } from './rng';

/** Aggiunge circa tre settimane di sessioni e risultati verosimili prima di oggi. */
export function seedDemoData(days = 21) {
  const rng = freshRng();
  const sessions: SessionEntry[] = [];
  const results: ResultEntry[] = [];
  const today = new Date();
  for (let i = days; i >= 1; i--) {
    if (rng() < 0.35) continue; // qualche giorno di pausa
    const d = addDays(today, -i);
    d.setHours(10, randInt(rng, 0, 59));
    const day = dayKey(d);
    const exs = sample(rng, EXERCISES, 3);
    sessions.push({ at: d.toISOString(), day, exercises: exs.map((e) => e.id) });
    exs.forEach((e) => {
      const progress = (days - i) / days; // migliora con il tempo
      const total = 8;
      const correct = Math.min(total, Math.round(total * (0.5 + 0.4 * progress) + (rng() - 0.5) * 2));
      results.push({
        ex: e.id, level: 1 + Math.floor(progress * 3), at: d.toISOString(), day,
        correct, total, metric: correct, metricLabel: 'risposte giuste (dati di esempio)',
      });
    });
  }
  setState((s) => ({
    ...s,
    sessions: [...sessions, ...s.sessions].sort((a, b) => a.at.localeCompare(b.at)),
    results: [...results, ...s.results].sort((a, b) => a.at.localeCompare(b.at)),
  }));
}

export function resetLevels() {
  setState((s) => ({ ...s, levels: {} }));
}

/** Cancella sessioni e risultati, tenendo nome, pianta, gruppo e impostazioni. */
export function clearProgress() {
  setState((s) => ({ ...s, sessions: [], results: [], weeks: {}, replies: [], devLog: [] }));
}

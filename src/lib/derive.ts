// Valori calcolati dallo stato: progressi, giardino, gruppo.
import type { AppState, Member } from '../store';
import { memberActiveOn } from '../store';
import { personalStage, DECORATIONS } from '../data/plants';
import { QUESTIONS, type Answer } from '../data/questionnaire';
import type { Domain } from '../data/domains';
import { addDays, dayKey, daysOfWeekSoFar, fromDayKey, weekKey, daysBetween } from './dates';
import type { ExerciseId } from '../exercises/types';

export const today = () => dayKey();

export function sessionsOn(s: AppState, day: string) {
  return s.sessions.filter((x) => x.day === day).length;
}

export function activeDays(s: AppState): Set<string> {
  return new Set(s.sessions.map((x) => x.day));
}

export function activeDaysInMonth(s: AppState, d = new Date()): string[] {
  const prefix = dayKey(d).slice(0, 7);
  return [...activeDays(s)].filter((k) => k.startsWith(prefix)).sort();
}

export function activeDaysThisWeek(s: AppState): number {
  const days = new Set(daysOfWeekSoFar());
  return [...activeDays(s)].filter((k) => days.has(k)).length;
}

export function activeWeeks(s: AppState): number {
  return new Set(s.sessions.map((x) => weekKey(fromDayKey(x.day)))).size;
}

export function myPlant(s: AppState) {
  return personalStage(s.sessions.length);
}

/** Stadio della pianta prima dell'ultima sessione (per l'animazione di crescita). */
export function myPlantBefore(s: AppState) {
  return personalStage(Math.max(0, s.sessions.length - 1));
}

export function unlockedDecorations(s: AppState) {
  const w = activeWeeks(s);
  return DECORATIONS.map((d) => ({ ...d, unlocked: w >= d.weeks, missing: Math.max(0, d.weeks - w) }));
}

// ---------- Gruppo ----------

export function memberSessionsThisWeek(m: Member): number {
  return daysOfWeekSoFar().filter((d) => memberActiveOn(m, d)).length;
}

export function memberTotalSessions(m: Member, sinceDay: string): number {
  // Attività simulata dagli ultimi 40 giorni o dalla creazione del gruppo.
  let n = 0;
  const start = fromDayKey(sinceDay);
  const t = new Date();
  for (let d = addDays(start, -20); d <= t; d = addDays(d, 1)) {
    if (memberActiveOn(m, dayKey(d))) n++;
  }
  return n;
}

export function groupSessionsThisWeek(s: AppState): number {
  const days = new Set(daysOfWeekSoFar());
  const mine = s.sessions.filter((x) => days.has(x.day)).length;
  const others = s.group?.mode === 'gruppo' ? s.group.members.reduce((a, m) => a + memberSessionsThisWeek(m), 0) : 0;
  return mine + others;
}

/** Soglie della settimana per l'albero comune, in base a quante persone ci sono. */
export function groupThresholds(s: AppState): number[] {
  const people = 1 + (s.group?.mode === 'gruppo' ? s.group.members.length : 0);
  const target = people * 3;
  return [0, Math.ceil(target * 0.2), Math.ceil(target * 0.45), Math.ceil(target * 0.7), target];
}

export function treeStage(s: AppState): number {
  const n = groupSessionsThisWeek(s);
  const th = groupThresholds(s);
  let st = 0;
  th.forEach((t, i) => {
    if (n >= t) st = i;
  });
  return st;
}

export interface FeedItem {
  who: string;
  text: string;
  day: string;
}

/** Aggiornamenti del gruppo negli ultimi 3 giorni (simulati per il gruppo di prova). */
export function groupFeed(s: AppState): FeedItem[] {
  if (!s.group || s.group.mode !== 'gruppo') return [];
  const out: FeedItem[] = [];
  const t = new Date();
  const userWasActiveYesterday = activeDays(s).has(dayKey(addDays(t, -1))) || activeDays(s).has(dayKey(t));
  for (let i = 0; i < 3; i++) {
    const d = dayKey(addDays(t, -i));
    s.group.members.forEach((m, idx) => {
      if (!memberActiveOn(m, d)) return;
      const kind = (idx + i) % 3;
      if (kind === 0) out.push({ who: m.name, text: 'ha fatto crescere un fiore', day: d });
      else if (kind === 1 && userWasActiveYesterday) out.push({ who: m.name, text: 'ti ha mandato «Forza!»', day: d });
      else out.push({ who: m.name, text: 'ha annaffiato il melograno', day: d });
    });
  }
  return out.slice(0, 4);
}

// ---------- Questionario e priorità ----------

export function latestAnswers(s: AppState): Record<string, Answer> {
  return s.questionnaire[s.questionnaire.length - 1]?.answers ?? {};
}

export function firstAnswers(s: AppState): Record<string, Answer> {
  return s.questionnaire[0]?.answers ?? {};
}

export function domainPriority(s: AppState): Record<Domain, number> {
  const a = latestAnswers(s);
  const score: Record<Domain, number> = {
    attenzione: 0, velocita: 0, lavoro: 0, memoria: 0, prospettica: 0, esecutive: 0, linguaggio: 0, spaziale: 0,
  };
  QUESTIONS.forEach((q) => {
    const v = a[q.id];
    if (v === null || v === undefined) return;
    q.domains.forEach((d) => (score[d] += v));
  });
  if (s.personalGoal) {
    const q = QUESTIONS.find((x) => x.id === s.personalGoal);
    q?.domains.forEach((d) => (score[d] += 3));
  }
  return score;
}

export function daysSinceQuestionnaire(s: AppState): number | null {
  const last = s.questionnaire[s.questionnaire.length - 1];
  return last ? daysBetween(last.at, dayKey()) : null;
}

// ---------- Risultati ----------

export function resultsOf(s: AppState, ex: ExerciseId) {
  return s.results.filter((r) => r.ex === ex);
}

export function playedThisWeek(s: AppState): Set<ExerciseId> {
  const days = new Set(daysOfWeekSoFar());
  return new Set(s.results.filter((r) => days.has(r.day)).map((r) => r.ex));
}

/** Stato dell'obiettivo settimanale scelto. */
export function weeklyGoalProgress(s: AppState): { done: number; target: number } | null {
  const w = s.weeks[weekKey()];
  if (!w?.goal) return null;
  if (w.goal === 'giorni') return { done: Math.min(activeDaysThisWeek(s), w.days ?? 4), target: w.days ?? 4 };
  if (w.goal === 'nuovo') {
    const before = new Set(s.results.filter((r) => !daysOfWeekSoFar().includes(r.day)).map((r) => r.ex));
    const newOnes = [...playedThisWeek(s)].filter((e) => !before.has(e));
    return { done: Math.min(1, newOnes.length), target: 1 };
  }
  return { done: w.realDone ? 1 : 0, target: 1 };
}

import { useSyncExternalStore } from 'react';
import type { PlantId } from './data/plants';
import type { Answer } from './data/questionnaire';
import type { ExerciseId, ExerciseOutcome } from './exercises/types';
import { dayKey, weekKey } from './lib/dates';
import { hashString } from './lib/rng';

// Tutti i dati restano sul telefono (localStorage). Nessun server.

export interface Member {
  name: string;
  plant: PlantId;
  /** Probabilità di essere attivo in un giorno (simulazione del gruppo di prova). */
  activity: number;
}

export interface GroupState {
  mode: 'solo' | 'gruppo';
  name: string;
  code: string;
  members: Member[];
  /** true: gruppo dimostrativo simulato su questo telefono. */
  demo: boolean;
}

export interface QuestionnaireRun {
  at: string; // dayKey
  answers: Record<string, Answer>;
}

export interface ResultEntry extends ExerciseOutcome {
  ex: ExerciseId;
  at: string; // ISO
  day: string; // dayKey
  level: number;
}

export interface SessionEntry {
  at: string;
  day: string;
  exercises: ExerciseId[];
}

export type WeeklyGoalId = 'giorni' | 'nuovo' | 'vita';

export interface WeekState {
  goal?: WeeklyGoalId;
  /** Obiettivo "giorni attivi": quanti giorni. */
  days?: number;
  realDone?: boolean;
  groupChallenge?: 'fatta' | 'dopo';
}

export interface Settings {
  text: 'normale' | 'grande' | 'molto';
  contrast: boolean;
  calm: boolean;
  voice: boolean;
}

export interface AppState {
  v: 1;
  onboarded: boolean;
  name: string;
  motivations: string[];
  customMotivation: string;
  plant: PlantId | null;
  questionnaire: QuestionnaireRun[];
  personalGoal: string | null; // id della situazione scelta come obiettivo
  group: GroupState | null;
  sessions: SessionEntry[];
  results: ResultEntry[];
  levels: Partial<Record<ExerciseId, number>>;
  weeks: Record<string, WeekState>;
  replies: { day: string; text: string }[];
  decorations: string[];
  settings: Settings;
  lastOpen: string | null;
  /** Giorno in cui è stato mostrato il "bentornato". */
  welcomeBack: string | null;
  /** Modalità sviluppatore: sbloccata, se le prove salvano i risultati, registro delle ultime prove. */
  devUnlocked: boolean;
  devSave: boolean;
  devLog: DevLogEntry[];
}

export interface DevLogEntry {
  ex: ExerciseId;
  at: string;
  level: number;
  next: number;
  phrase: string;
  correct: number;
  total: number;
}

const KEY = 'mente-in-fiore-v1';

const initial: AppState = {
  v: 1,
  onboarded: false,
  name: '',
  motivations: [],
  customMotivation: '',
  plant: null,
  questionnaire: [],
  personalGoal: null,
  group: null,
  sessions: [],
  results: [],
  levels: {},
  weeks: {},
  replies: [],
  decorations: ['cartellino'],
  settings: { text: 'normale', contrast: false, calm: false, voice: false },
  lastOpen: null,
  welcomeBack: null,
  devUnlocked: false,
  devSave: false,
  devLog: [],
};

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...initial };
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return { ...initial, ...parsed, settings: { ...initial.settings, ...(parsed.settings ?? {}) } };
  } catch {
    return { ...initial };
  }
}

let state: AppState = load();
const listeners = new Set<() => void>();

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* spazio pieno o modalità privata: l'app continua a funzionare in memoria */
  }
}

export function getState(): AppState {
  return state;
}

export function setState(fn: (s: AppState) => AppState) {
  state = fn(state);
  save();
  applySettings(state.settings);
  listeners.forEach((l) => l());
}

export function useApp(): AppState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}

export function applySettings(s: Settings) {
  const html = document.documentElement;
  html.dataset.text = s.text;
  html.classList.toggle('contrast', s.contrast);
  html.classList.toggle('calm', s.calm);
}

// ---------- Azioni ----------

export const actions = {
  update(patch: Partial<AppState>) {
    setState((s) => ({ ...s, ...patch }));
  },

  saveQuestionnaire(answers: Record<string, Answer>) {
    setState((s) => ({ ...s, questionnaire: [...s.questionnaire, { at: dayKey(), answers }] }));
  },

  setGroup(g: GroupState | null) {
    setState((s) => ({ ...s, group: g }));
  },

  recordResult(ex: ExerciseId, level: number, o: ExerciseOutcome, nextLevel: number) {
    const now = new Date();
    setState((s) => ({
      ...s,
      results: [...s.results, { ...o, ex, level, at: now.toISOString(), day: dayKey(now) }],
      levels: { ...s.levels, [ex]: nextLevel },
    }));
  },

  recordSession(exercises: ExerciseId[]) {
    const now = new Date();
    setState((s) => ({
      ...s,
      sessions: [...s.sessions, { at: now.toISOString(), day: dayKey(now), exercises }],
    }));
  },

  updateWeek(patch: WeekState, wk = weekKey()) {
    setState((s) => ({ ...s, weeks: { ...s.weeks, [wk]: { ...s.weeks[wk], ...patch } } }));
  },

  reply(text: string) {
    setState((s) => ({ ...s, replies: [...s.replies, { day: dayKey(), text }] }));
  },

  toggleDecoration(id: string) {
    setState((s) => ({
      ...s,
      decorations: s.decorations.includes(id) ? s.decorations.filter((d) => d !== id) : [...s.decorations, id],
    }));
  },

  setLevel(ex: ExerciseId, level: number) {
    setState((s) => ({ ...s, levels: { ...s.levels, [ex]: level } }));
  },

  logDev(e: DevLogEntry) {
    setState((s) => ({ ...s, devLog: [e, ...s.devLog].slice(0, 30) }));
  },

  setSettings(patch: Partial<Settings>) {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  },

  touchOpen() {
    setState((s) => ({ ...s, lastOpen: dayKey() }));
  },

  resetAll() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* niente */
    }
    state = { ...initial };
    applySettings(state.settings);
    listeners.forEach((l) => l());
  },
};

// ---------- Gruppo di prova ----------

const DEMO_MEMBERS: Member[] = [
  { name: 'Anna', plant: 'ciclamino', activity: 0.75 },
  { name: 'Giorgio', plant: 'ulivo', activity: 0.6 },
  { name: 'Lucia', plant: 'lavanda', activity: 0.7 },
  { name: 'Franco', plant: 'limone', activity: 0.5 },
];

const SPARE: PlantId[] = ['tulipano', 'glicine', 'rosa', 'girasole'];

/** Membri dimostrativi, con piante diverse da quella scelta dall'utente. */
export function demoMembers(userPlant: PlantId | null): Member[] {
  const spare = SPARE.filter((p) => p !== userPlant);
  return DEMO_MEMBERS.map((m, i) => (m.plant === userPlant ? { ...m, plant: spare[i % spare.length] } : m));
}

export function makeCode(seed: string): string {
  const words = ['MELO', 'FICO', 'ROSA', 'PERA', 'SOLE', 'NOCE', 'LIME', 'VITE'];
  const h = hashString(seed);
  return `${words[h % words.length]}-${10 + (h % 90)}`;
}

/** Un membro simulato è stato attivo in quel giorno? (sempre lo stesso esito per lo stesso giorno) */
export function memberActiveOn(m: Member, day: string): boolean {
  return (hashString(m.name + day) % 1000) / 1000 < m.activity;
}

applySettings(state.settings);

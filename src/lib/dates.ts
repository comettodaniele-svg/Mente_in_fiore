// Date in ora locale. dayKey = 'AAAA-MM-GG', weekKey = 'AAAA-Wnn' (settimana ISO, da lunedì).

const pad = (n: number) => String(n).padStart(2, '0');

export function dayKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromDayKey(k: string): Date {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function daysBetween(a: string, b: string): number {
  const ms = fromDayKey(b).getTime() - fromDayKey(a).getTime();
  return Math.round(ms / 86400000);
}

export function weekKey(d: Date = new Date()): string {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${pad(week)}`;
}

/** Lunedì della settimana che contiene d. */
export function weekStart(d: Date = new Date()): Date {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = r.getDay() || 7;
  r.setDate(r.getDate() - (day - 1));
  return r;
}

/** I giorni della settimana corrente fino a oggi compreso. */
export function daysOfWeekSoFar(d: Date = new Date()): string[] {
  const start = weekStart(d);
  const out: string[] = [];
  for (let i = 0; i < 7; i++) {
    const x = addDays(start, i);
    if (x > d) break;
    out.push(dayKey(x));
  }
  return out;
}

export type Season = 'primavera' | 'estate' | 'autunno' | 'inverno';

export function seasonOf(d: Date = new Date()): Season {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const md = m * 100 + day;
  if (md >= 321 && md < 621) return 'primavera';
  if (md >= 621 && md < 923) return 'estate';
  if (md >= 923 && md < 1221) return 'autunno';
  return 'inverno';
}

export const seasonLabel: Record<Season, string> = {
  primavera: 'Primavera',
  estate: 'Estate',
  autunno: 'Autunno',
  inverno: 'Inverno',
};

const MONTHS = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
export const monthName = (m: number) => MONTHS[m];

const WEEKDAYS = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
export const weekdayName = (d: Date) => WEEKDAYS[d.getDay()];

export function relativeDay(k: string, today = dayKey()): string {
  const diff = daysBetween(k, today);
  if (diff === 0) return 'Oggi';
  if (diff === 1) return 'Ieri';
  if (diff < 7) return weekdayName(fromDayKey(k)).replace(/^./, (c) => c.toUpperCase());
  const d = fromDayKey(k);
  return `${d.getDate()} ${monthName(d.getMonth())}`;
}

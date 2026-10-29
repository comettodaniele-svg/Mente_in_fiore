// I progressi: costanza (giorni attivi), l'obiettivo personale a 5 gradini,
// le situazioni quotidiane a confronto e i risultati degli esercizi. Nessun grafico complicato.
import { ChevronRight } from 'lucide-react';
import { useApp } from '../store';
import { Card, Screen, Steps } from '../components/ui';
import { navigate } from '../router';
import { activeDays, activeDaysInMonth, activeWeeks, firstAnswers, latestAnswers } from '../lib/derive';
import { addDays, dayKey, fromDayKey, monthName } from '../lib/dates';
import { QUESTIONS, answerText, qById, type Answer } from '../data/questionnaire';
import { EXERCISES } from '../exercises';
import type { ResultEntry } from '../store';

const GOAL_STEPS = ['Scelto', 'Primi allenamenti', 'Prova nella vita', 'Abitudine', 'Va meglio'];

function MonthDots({ active }: { active: Set<string> }) {
  const t = new Date();
  const first = new Date(t.getFullYear(), t.getMonth(), 1);
  const lead = (first.getDay() + 6) % 7; // lunedì = 0
  const days = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
  const cells: (string | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => dayKey(addDays(first, i)))];
  const today = dayKey();
  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 text-center text-meta font-bold text-ink-soft mb-1" aria-hidden>
        {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1.5" role="list" aria-label="Giorni attivi del mese">
        {cells.map((k, i) =>
          k ? (
            <span
              key={k}
              role="listitem"
              aria-label={`${fromDayKey(k).getDate()} ${active.has(k) ? ': attivo' : ''}`}
              className={`aspect-square rounded-full flex items-center justify-center text-[0.875rem] font-bold ${
                active.has(k) ? 'bg-leaf text-white' : k > today ? 'text-line-strong' : 'bg-canvas text-ink-soft'
              } ${k === today ? 'ring-2 ring-sun-dark ring-offset-1' : ''}`}
            >
              {fromDayKey(k).getDate()}
            </span>
          ) : (
            <span key={`e${i}`} />
          ),
        )}
      </div>
    </div>
  );
}

const rank = (a: Answer | undefined) => (a === undefined || a === null ? null : a);

export default function Progress() {
  const s = useApp();
  const month = activeDaysInMonth(s);
  const all = activeDays(s);
  const first = firstAnswers(s);
  const latest = latestAnswers(s);
  const hasTwo = s.questionnaire.length >= 2;
  const personal = s.personalGoal ? qById(s.personalGoal) : undefined;

  // Gradini dell'obiettivo personale: fatti concreti, mai ipotesi.
  let goalDone = 0;
  if (personal) {
    const realOnce = Object.values(s.weeks).some((w) => w.realDone);
    const improved = hasTwo && (rank(latest[personal.id]) ?? 9) < (rank(first[personal.id]) ?? -1);
    const checks = [true, s.sessions.length >= 3, realOnce, activeWeeks(s) >= 3, improved];
    while (goalDone < checks.length && checks[goalDone]) goalDone++;
  }

  const changed = QUESTIONS.filter((q) => {
    const a = rank(first[q.id]);
    const b = rank(latest[q.id]);
    return a !== null && b !== null && a !== b;
  });
  const firstDate = s.questionnaire[0] ? fromDayKey(s.questionnaire[0].at) : null;

  const bestOf = (rs: ResultEntry[]) =>
    rs.reduce<ResultEntry | null>((b, r) => (!b ? r : (r.lowerIsBetter ? r.metric < b.metric : r.metric > b.metric) ? r : b), null);

  return (
    <Screen nav>
      <header className="pt-6 pb-4">
        <h1 className="text-h1 font-extrabold">I tuoi progressi</h1>
      </header>
      <div className="flex flex-col gap-5">
        <Card>
          <p className="eyebrow">{monthName(new Date().getMonth()).replace(/^./, (c) => c.toUpperCase())}</p>
          <h2 className="text-h2 font-extrabold mt-1 mb-4">
            {month.length === 0 ? 'Il mese è tutto da scrivere' : `${month.length} ${month.length === 1 ? 'giorno attivo' : 'giorni attivi'} questo mese`}
          </h2>
          <MonthDots active={all} />
          {s.sessions.length > 0 && (
            <p className="text-body font-semibold mt-4">In tutto: {s.sessions.length} {s.sessions.length === 1 ? 'sessione' : 'sessioni'} in {all.size} {all.size === 1 ? 'giorno' : 'giorni'}.</p>
          )}
        </Card>

        {personal && (
          <Card>
            <p className="eyebrow">Il tuo obiettivo</p>
            <h2 className="text-h3 font-extrabold mt-1 mb-4">{personal.goal}</h2>
            <Steps labels={GOAL_STEPS} current={goalDone >= 5 ? -1 : goalDone} done={goalDone} />
            <p className="text-body font-semibold mt-4">
              {[
                '',
                'Prossimo passo: fai tre sessioni.',
                `Prossimo passo: prova nella vita reale. «${personal.challenge}»`,
                'Prossimo passo: tre settimane in cui sei attivo.',
                'Prossimo passo: al prossimo questionario vediamo se va meglio.',
                'Bellissimo: questa situazione ti capita meno di prima.',
              ][goalDone]}
            </p>
          </Card>
        )}

        <Card>
          <h2 className="text-h3 font-extrabold">Le situazioni di tutti i giorni</h2>
          {!hasTwo ? (
            <p className="text-body text-ink-soft mt-1">
              Dopo un mese ti chiederò di nuovo le 12 situazioni: qui vedrai cosa è cambiato.
            </p>
          ) : changed.length === 0 ? (
            <p className="text-body text-ink-soft mt-1">Le risposte sono uguali alla prima volta.</p>
          ) : (
            <ul className="flex flex-col gap-3 mt-3">
              {changed.map((q) => (
                <li key={q.id} className="rounded-2xl bg-canvas p-3">
                  <p className="text-body font-bold leading-snug">{q.goal}</p>
                  <p className="text-meta text-ink-soft mt-0.5">
                    {firstDate ? `A ${monthName(firstDate.getMonth())}` : 'Prima'}: {answerText(first[q.id]).toLowerCase()} · Ora: <strong className="text-ink">{answerText(latest[q.id]).toLowerCase()}</strong>
                  </p>
                </li>
              ))}
            </ul>
          )}
          <button type="button" className="btn-outline w-full mt-4" onClick={() => navigate('/questionario')}>
            Rispondi di nuovo alle domande <ChevronRight size={22} aria-hidden />
          </button>
        </Card>

        <Card>
          <h2 className="text-h3 font-extrabold mb-3">I tuoi esercizi</h2>
          <ul className="flex flex-col gap-3">
            {EXERCISES.map((e) => {
              const rs = s.results.filter((r) => r.ex === e.id);
              const best = bestOf(rs);
              const lvl = s.levels[e.id] ?? 1;
              return (
                <li key={e.id} className="rounded-2xl bg-canvas p-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-body font-bold">{e.name}</p>
                    <p className="text-meta font-bold text-leaf-dark shrink-0">Livello {lvl} di {e.maxLevel}</p>
                  </div>
                  <p className="text-meta text-ink-soft mt-0.5">
                    {best ? `Il tuo risultato migliore: ${e.phrase(best).charAt(0).toLowerCase() + e.phrase(best).slice(1)}` : 'Non ancora provato'}
                  </p>
                </li>
              );
            })}
          </ul>
        </Card>
        <p className="text-meta text-ink-soft text-center px-4">I risultati servono a te per vedere il cammino fatto, non sono una valutazione medica.</p>
      </div>
    </Screen>
  );
}

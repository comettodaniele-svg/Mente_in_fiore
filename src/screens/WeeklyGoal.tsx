// Scelta dell'obiettivo della settimana: tre proposte, una si sceglie, si cambia quando si vuole.
import { useState } from 'react';
import { CalendarCheck, Sparkles, Footprints, Minus, Plus } from 'lucide-react';
import { actions, useApp } from '../store';
import { Screen, TopBar } from '../components/ui';
import { back } from '../router';
import { weekKey } from '../lib/dates';
import { qById } from '../data/questionnaire';
import type { WeeklyGoalId } from '../store';

export default function WeeklyGoal() {
  const s = useApp();
  const wk = s.weeks[weekKey()];
  const [goal, setGoal] = useState<WeeklyGoalId | undefined>(wk?.goal);
  const [days, setDays] = useState(wk?.days ?? 3);
  const personal = s.personalGoal ? qById(s.personalGoal) : undefined;

  const options: { id: WeeklyGoalId; title: string; text: string; Icon: typeof CalendarCheck }[] = [
    { id: 'giorni', title: `${days} giorni attivi`, text: 'Una sessione al giorno, nei giorni che preferisci.', Icon: CalendarCheck },
    { id: 'nuovo', title: 'Prova un esercizio nuovo', text: 'Uno che non hai ancora fatto: la novità fa bene alla mente.', Icon: Sparkles },
    {
      id: 'vita',
      title: personal ? personal.challenge : 'Una sfida nella vita reale',
      text: personal ? `Per «${personal.goal.toLowerCase()}», fuori dall'app.` : 'Una piccola cosa da fare fuori dall\'app.',
      Icon: Footprints,
    },
  ];

  return (
    <Screen>
      <TopBar title="Obiettivo della settimana" />
      <p className="text-body text-ink-soft mb-4">Scegline uno. Puoi cambiarlo quando vuoi.</p>
      <div className="flex flex-col gap-3" role="radiogroup" aria-label="Obiettivo della settimana">
        {options.map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={goal === o.id} onClick={() => setGoal(o.id)} className="choice !items-start !py-4">
            <o.Icon size={30} className="text-leaf shrink-0 mt-0.5" aria-hidden />
            <span className="flex flex-col gap-0.5">
              <span className="text-lead font-extrabold leading-snug">{o.title}</span>
              <span className="text-meta text-ink-soft font-medium">{o.text}</span>
            </span>
          </button>
        ))}
      </div>

      {goal === 'giorni' && (
        <div className="card mt-4 flex items-center justify-between gap-3 fade-up">
          <span className="text-body font-bold">Quanti giorni?</span>
          <div className="flex items-center gap-3">
            <button type="button" className="btn-outline !px-0 w-14" aria-label="Un giorno in meno" disabled={days <= 2} onClick={() => setDays(days - 1)}>
              <Minus size={24} aria-hidden />
            </button>
            <span className="text-h2 font-extrabold w-8 text-center" aria-live="polite">{days}</span>
            <button type="button" className="btn-outline !px-0 w-14" aria-label="Un giorno in più" disabled={days >= 5} onClick={() => setDays(days + 1)}>
              <Plus size={24} aria-hidden />
            </button>
          </div>
        </div>
      )}
      {goal === 'giorni' && <p className="text-meta text-ink-soft mt-2">Tre giorni a settimana bastano per vedere risultati.</p>}

      <button
        type="button"
        className="btn-primary w-full text-lead mt-6"
        disabled={!goal}
        onClick={() => {
          actions.updateWeek({ goal, days: goal === 'giorni' ? days : wk?.days });
          back('/oggi');
        }}
      >
        Scelgo questo
      </button>
    </Screen>
  );
}

// "Oggi": la sessione del giorno, l'obiettivo della settimana e la sfida nella vita reale.
import { useState } from 'react';
import { Play, Clock, Target, Footprints, ChevronRight } from 'lucide-react';
import { actions, useApp } from '../store';
import { Card, Notice, Screen } from '../components/ui';
import { navigate } from '../router';
import { todayPlan, MAX_SESSIONS_PER_DAY } from '../lib/plan';
import { exById } from '../exercises';
import { activeDaysThisWeek, daysSinceQuestionnaire, myPlant, sessionsOn, weeklyGoalProgress } from '../lib/derive';
import { dayKey, fromDayKey, monthName, weekKey, weekdayName } from '../lib/dates';
import { MOTIVATIONS } from '../data/challenges';
import { qById } from '../data/questionnaire';
import { PlantPhoto } from '../art/PlantPhoto';
import { UpdateBanner } from '../components/UpdateBanner';
import { STAGES } from '../data/plants';

function greeting() {
  const h = new Date().getHours();
  return h < 13 ? 'Buongiorno' : h < 18 ? 'Buon pomeriggio' : 'Buonasera';
}

function whyLine(motivations: string[], custom: string): string | null {
  if (!motivations.length) return null;
  const id = motivations[new Date().getDate() % motivations.length];
  if (id === 'mio') return custom ? `Per ${custom.charAt(0).toLowerCase()}${custom.slice(1)}.` : null;
  const m = MOTIVATIONS.find((x) => x.id === id);
  return m ? `Per ${m.label.charAt(0).toLowerCase()}${m.label.slice(1)}.` : null;
}

export default function Today() {
  const s = useApp();
  const day = dayKey();
  const d = fromDayKey(day);
  const done = sessionsOn(s, day);
  const rest = done >= MAX_SESSIONS_PER_DAY;
  const plan = todayPlan(s);
  const plant = myPlant(s);
  const wk = s.weeks[weekKey()];
  const goal = weeklyGoalProgress(s);
  const personal = s.personalGoal ? qById(s.personalGoal) : undefined;
  const why = whyLine(s.motivations, s.customMotivation);
  const since = daysSinceQuestionnaire(s);
  const [later, setLater] = useState(false);

  return (
    <Screen nav bar="Oggi">
      <header className="pt-6 pb-4">
        <p className="eyebrow">{weekdayName(d).replace(/^./, (c) => c.toUpperCase())} {d.getDate()} {monthName(d.getMonth())}</p>
        <h1 className="text-h1 font-extrabold mt-1">{greeting()}{s.name ? `, ${s.name}` : ''}</h1>
        {why && <p className="text-lead text-ink-soft font-medium mt-1">{why}</p>}
      </header>

      <div className="flex flex-col gap-5">
        <UpdateBanner />
        <Card className="!p-0 overflow-hidden">
          <div className="flex items-center gap-4 p-5 pb-3">
            {s.plant && <PlantPhoto species={s.plant} stage={plant.stage} className="w-24 h-24 shrink-0 border-[3px] border-leaf/30" round />}
            <div className="flex-1">
              <p className="eyebrow">{rest ? 'Per oggi basta così' : done === 1 ? 'Sessione completata' : 'La sessione di oggi'}</p>
              <h2 className="text-h3 font-extrabold leading-tight mt-0.5">
                {rest ? 'La tua pianta riposa insieme a te' : done === 1 ? 'Se ti va, puoi farne un\'altra' : 'Tre esercizi, senza fretta'}
              </h2>
              {s.plant && <p className="text-meta text-ink-soft mt-1">La tua pianta: {STAGES[plant.stage].toLowerCase()}</p>}
            </div>
          </div>
          {!rest ? (
            <div className="px-5 pb-5 flex flex-col gap-3">
              <ol className="flex flex-col gap-2">
                {plan.map((id, i) => {
                  const e = exById(id);
                  return (
                    <li key={id} className="flex items-center gap-3 rounded-2xl bg-canvas px-3 py-2.5">
                      <span className="w-8 h-8 rounded-full bg-white border-2 border-line flex items-center justify-center text-body font-extrabold" aria-hidden>{i + 1}</span>
                      <span className="flex flex-col">
                        <span className="text-body font-bold leading-tight">{e.name}</span>
                        <span className="text-meta text-ink-soft leading-tight">{e.trains}</span>
                      </span>
                    </li>
                  );
                })}
              </ol>
              <button type="button" className="btn-primary w-full text-lead !min-h-[4rem]" onClick={() => navigate('/sessione')}>
                <Play size={24} fill="#fff" aria-hidden /> {done === 0 ? 'Inizia la sessione di oggi' : 'Inizia un\'altra sessione'}
              </button>
              <p className="text-center text-meta text-ink-soft flex items-center justify-center gap-1.5">
                <Clock size={18} aria-hidden /> Circa 10 minuti
              </p>
            </div>
          ) : (
            <div className="px-5 pb-5">
              <Notice>Hai fatto due sessioni oggi: è il giusto. Riposare aiuta la memoria. A domani!</Notice>
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Target size={22} className="text-sky" aria-hidden />
            <p className="eyebrow">Obiettivo della settimana</p>
          </div>
          {goal && wk?.goal ? (
            <>
              <h2 className="text-h3 font-extrabold">
                {wk.goal === 'giorni' ? `${goal.target} giorni attivi` : wk.goal === 'nuovo' ? 'Provare un esercizio nuovo' : personal?.challenge ?? 'Una sfida nella vita reale'}
              </h2>
              <div className="flex gap-2 mt-3" aria-label={`${goal.done} su ${goal.target}`}>
                {Array.from({ length: goal.target }, (_, i) => (
                  <span key={i} className={`h-4 flex-1 rounded-full ${i < goal.done ? 'bg-leaf' : 'bg-line'}`} />
                ))}
              </div>
              <p className="text-body mt-2 font-semibold">
                {goal.done >= goal.target ? 'Fatto! Bravissimo.' : wk.goal === 'giorni' ? `Finora ${activeDaysThisWeek(s)} ${activeDaysThisWeek(s) === 1 ? 'giorno' : 'giorni'}: ottimo inizio.` : 'Hai tempo fino a domenica.'}
              </p>
              <button type="button" className="mt-3 min-h-touch text-body font-bold text-sky-text underline underline-offset-4" onClick={() => navigate('/obiettivo')}>
                Cambia obiettivo
              </button>
            </>
          ) : (
            <>
              <h2 className="text-h3 font-extrabold">Scegli il tuo obiettivo</h2>
              <p className="text-body text-ink-soft mt-1">Uno piccolo, che senti alla tua portata.</p>
              <button type="button" className="btn-outline w-full mt-3" onClick={() => navigate('/obiettivo')}>
                Scegli l'obiettivo <ChevronRight size={22} aria-hidden />
              </button>
            </>
          )}
        </Card>

        {personal && (
          <Card className="!bg-sun-tint !border-sun-dark/30">
            <div className="flex items-center gap-2 mb-2">
              <Footprints size={22} className="text-ink" aria-hidden />
              <p className="eyebrow !text-ink">Per «{personal.goal.toLowerCase()}»</p>
            </div>
            <h2 className="text-h3 font-extrabold">{personal.challenge}</h2>
            {wk?.realDone ? (
              <div className="mt-3"><Notice tone="leaf">Fatto questa settimana. Ogni volta conta!</Notice></div>
            ) : later ? (
              <div className="mt-3"><Notice tone="sun">Nessuna fretta: la sfida resta qui fino a domenica.</Notice></div>
            ) : (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button type="button" className="btn-primary" onClick={() => actions.updateWeek({ realDone: true })}>Fatto!</button>
                <button type="button" className="btn-outline" onClick={() => setLater(true)}>Non ancora</button>
              </div>
            )}
          </Card>
        )}

        {since !== null && since >= 28 && (
          <Card>
            <h2 className="text-h3 font-extrabold">Come va con le situazioni di tutti i giorni?</h2>
            <p className="text-body text-ink-soft mt-1">È passato un mese: rispondere di nuovo alle 12 domande ti fa vedere cosa è cambiato.</p>
            <button type="button" className="btn-outline w-full mt-3" onClick={() => navigate('/questionario')}>Rispondi di nuovo</button>
          </Card>
        )}
      </div>
    </Screen>
  );
}

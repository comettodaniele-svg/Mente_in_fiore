// L'angolo personale: la pianta, i suoi stadi e le decorazioni che si sbloccano con la costanza.
import { Check } from 'lucide-react';
import { actions, useApp } from '../store';
import { Card, Screen, Steps, TopBar } from '../components/ui';
import { CornerScene } from '../art/Scenes';
import { PERSONAL_STAGE_AT, STAGES, plantName } from '../data/plants';
import { myPlant, unlockedDecorations } from '../lib/derive';
import { seasonOf } from '../lib/dates';

export default function Corner() {
  const s = useApp();
  if (!s.plant) return null;
  const p = myPlant(s);
  const next = PERSONAL_STAGE_AT[p.stage + 1];
  const missing = next !== undefined ? next - s.sessions.length : 0;
  const decos = unlockedDecorations(s);

  return (
    <Screen>
      <TopBar title="Il tuo angolo" />
      <div className="flex flex-col gap-5">
        <section className="rounded-card overflow-hidden border-2 border-line bg-white">
          <CornerScene season={seasonOf()} species={s.plant} stage={p.stage} blooms={p.blooms} decorations={s.decorations} name={s.name} />
        </section>

        <Card>
          <p className="eyebrow">{plantName(s.plant)}</p>
          <h2 className="text-h3 font-extrabold mt-1 mb-4">{STAGES[p.stage]}</h2>
          <Steps labels={STAGES} current={p.stage >= 4 ? -1 : p.stage} done={p.stage >= 4 ? 5 : p.stage} />
          <p className="text-body font-semibold mt-4">
            {p.stage >= 4
              ? `È fiorita! Ogni tre sessioni sboccia un fiore in più${p.blooms ? `: finora ${p.blooms}` : ''}.`
              : `Ancora ${missing} ${missing === 1 ? 'sessione' : 'sessioni'} e arriva allo stadio «${STAGES[p.stage + 1].toLowerCase()}».`}
          </p>
          <p className="text-meta text-ink-soft mt-2">La tua pianta non appassisce mai: resta com'è durante le pause.</p>
        </Card>

        <Card>
          <h2 className="text-h3 font-extrabold">Decora il tuo angolo</h2>
          <p className="text-body text-ink-soft mt-1 mb-4">Si aggiungono con le settimane in cui sei attivo. Tocca per metterle o toglierle.</p>
          <div className="grid grid-cols-2 gap-3">
            {decos.map((d) => {
              const on = s.decorations.includes(d.id);
              return (
                <button
                  key={d.id}
                  type="button"
                  disabled={!d.unlocked}
                  aria-pressed={d.unlocked ? on : undefined}
                  onClick={() => actions.toggleDecoration(d.id)}
                  className={`rounded-2xl border-2 p-3 min-h-[5.5rem] text-left flex flex-col justify-between gap-1 ${
                    !d.unlocked ? 'bg-canvas border-dashed border-line-strong' : on ? 'bg-leaf-tint border-leaf' : 'bg-white border-line'
                  }`}
                >
                  <span className="text-body font-bold leading-tight flex items-start justify-between gap-2">
                    {d.name}
                    {on && d.unlocked && <Check size={22} strokeWidth={3} className="text-leaf shrink-0" aria-hidden />}
                  </span>
                  <span className="text-meta text-ink-soft leading-tight">
                    {d.unlocked ? (on ? 'Nel tuo angolo' : 'Disponibile') : `Dopo altre ${d.missing} ${d.missing === 1 ? 'settimana attiva' : 'settimane attive'}`}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </Screen>
  );
}

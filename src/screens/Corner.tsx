// L'angolo personale: la pianta, i suoi stadi e le decorazioni che si sbloccano con la costanza.
import { Check } from 'lucide-react';
import { actions, useApp } from '../store';
import { Card, Screen, Steps, TopBar } from '../components/ui';
import { PERSONAL_STAGE_AT, STAGES, plantName } from '../data/plants';
import { myPlant, unlockedDecorations } from '../lib/derive';
import { PlantPhoto } from '../art/PlantPhoto';

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
        <section
          className="relative rounded-card overflow-hidden border-[3px] border-[#CDE5BE]"
          style={{ boxShadow: '0 8px 0 0 #DBE8D3' }}
        >
          <PlantPhoto
            species={s.plant}
            stage={p.stage}
            framing="scene"
            className="w-full aspect-[3/4]"
            label={`${plantName(s.plant)}: ${STAGES[p.stage].toLowerCase()}`}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/70" aria-hidden />
          <div className="absolute top-3 inset-x-3 flex justify-between gap-2">
            <span className="pill bg-white/95 border-2 border-moss text-ink">{s.name ? `L'angolo di ${s.name}` : 'Il mio angolo'}</span>
          </div>
          <p className="absolute bottom-3 inset-x-3 text-center">
            <span className="pill bg-white/95 border-2 border-moss text-leaf-deep !text-body">
              {p.stage >= 4 ? 'La tua pianta è fiorita!' : p.stage === 0 ? 'Il seme è nella terra' : `${STAGES[p.stage]}: sta crescendo`}
            </span>
          </p>
        </section>

        <Card>
          <p className="eyebrow">{plantName(s.plant)}</p>
          <h2 className="text-h3 font-extrabold mt-1 mb-4">{STAGES[p.stage]}</h2>
          <Steps labels={STAGES} current={p.stage >= 4 ? -1 : p.stage} done={p.stage >= 4 ? 5 : p.stage} />
          <p className="text-body font-semibold mt-4">
            {p.stage >= 4
              ? 'È fiorita! Continua a curarla quando vuoi: resterà sempre così.'
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

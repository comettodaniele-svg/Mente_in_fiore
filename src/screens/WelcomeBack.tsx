// Dopo una pausa: il giardino è intatto, si riparte con calma. Nessun riferimento ai giorni persi.
import { actions, useApp } from '../store';
import { Screen } from '../components/ui';
import { navigate } from '../router';
import { PlantPhoto } from '../art/PlantPhoto';
import { myPlant } from '../lib/derive';
import { dayKey } from '../lib/dates';

export default function WelcomeBack() {
  const s = useApp();
  const p = myPlant(s);
  return (
    <Screen className="justify-between text-center">
      <div className="pt-12 flex flex-col items-center gap-4">
        {s.plant && <PlantPhoto species={s.plant} stage={p.stage} className="w-56 h-56 border-[4px] border-white" round />}
        <h1 className="text-hero font-extrabold">Bentornato{s.name ? `, ${s.name}` : ''}!</h1>
        <p className="text-lead text-ink-soft font-medium max-w-[22rem]">Il tuo angolo ti ha aspettato. Ripartiamo con calma: oggi bastano pochi minuti.</p>
      </div>
      <button
        type="button"
        className="btn-primary w-full text-lead !min-h-[4rem] mt-8"
        onClick={() => {
          actions.update({ welcomeBack: dayKey() });
          navigate('/oggi', { replace: true });
        }}
      >
        Iniziamo
      </button>
    </Screen>
  );
}

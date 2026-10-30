// Fine sessione: la pianta cresce e un risultato concreto, confrontato con la volta precedente solo se è migliorato.
import { useMemo } from 'react';
import { useApp } from '../store';
import { Notice, Screen } from '../components/ui';
import { navigate } from '../router';
import { PlantPhoto } from '../art/PlantPhoto';
import { STAGES, plantName } from '../data/plants';
import { myPlant, myPlantBefore } from '../lib/derive';
import { exById } from '../exercises';
import type { ResultEntry } from '../store';

function better(a: ResultEntry, b: ResultEntry) {
  return a.lowerIsBetter ? a.metric < b.metric : a.metric > b.metric;
}

export default function SessionEnd() {
  const s = useApp();
  const now = myPlant(s);
  const before = myPlantBefore(s);
  const grew = now.stage > before.stage || now.blooms > before.blooms;
  const last = s.sessions[s.sessions.length - 1];

  const highlight = useMemo(() => {
    if (!last) return null;
    let best: { text: string; prev?: string } | null = null;
    for (const ex of last.exercises) {
      const all = s.results.filter((r) => r.ex === ex);
      const r = all[all.length - 1];
      if (!r) continue;
      const prev = [...all].reverse().find((p) => p.day !== r.day && p.metricLabel === r.metricLabel);
      const def = exById(ex);
      if (prev && better(r, prev)) return { text: def.phrase(r), prev: def.phrase(prev) };
      if (!best) best = { text: def.phrase(r) };
    }
    return best;
  }, [last, s.results]);

  return (
    <Screen className="text-center items-center">
      <div className="pt-10 flex flex-col items-center gap-3">
        {s.plant && (
          <div className="relative" key={`${now.stage}-${now.blooms}`}>
            <PlantPhoto species={s.plant} stage={now.stage} className={`w-56 h-56 border-[4px] border-white ${grew ? 'grow-in' : ''}`} round label={`${plantName(s.plant)}: ${STAGES[now.stage]}`} />
          </div>
        )}
        <h1 className="text-hero font-extrabold">Ben fatto{s.name ? `, ${s.name}` : ''}!</h1>
        {grew && s.plant && (
          <p className="text-lead font-bold text-leaf-dark">
            {now.stage > before.stage
              ? `La tua pianta è passata da «${STAGES[before.stage].toLowerCase()}» a «${STAGES[now.stage].toLowerCase()}»`
              : 'È sbocciato un fiore nuovo'}
          </p>
        )}
        {!grew && <p className="text-lead text-ink-soft font-medium">La tua pianta ha ricevuto acqua e luce.</p>}
      </div>

      {highlight && (
        <div className="w-full mt-6 text-left">
          <Notice>
            <span className="block text-lead font-bold">Oggi: {highlight.text.charAt(0).toLowerCase() + highlight.text.slice(1)}.</span>
            {highlight.prev && <span className="block mt-1 font-medium">La volta scorsa: {highlight.prev.charAt(0).toLowerCase() + highlight.prev.slice(1)}.</span>}
          </Notice>
        </div>
      )}

      <div className="w-full flex flex-col gap-3 mt-auto pt-8">
        <button type="button" className="btn-primary w-full text-lead !min-h-[4rem]" onClick={() => navigate('/giardino', { replace: true })}>
          Torna al giardino
        </button>
        {s.group?.mode === 'gruppo' && (
          <button type="button" className="btn-outline w-full text-lead" onClick={() => navigate('/giardino?saluto=1', { replace: true })}>
            Manda un saluto al gruppo
          </button>
        )}
      </div>
    </Screen>
  );
}

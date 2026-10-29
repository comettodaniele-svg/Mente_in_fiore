// La sessione: per ogni esercizio una breve presentazione, l'esercizio e un riscontro concreto.
import { useEffect, useMemo, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { actions, getState, useApp } from '../store';
import { Listen, Notice, Screen } from '../components/ui';
import { navigate, useRoute } from '../router';
import { todayPlan, levelOf } from '../lib/plan';
import { EXERCISES, exById } from '../exercises';
import type { ExerciseId, ExerciseOutcome } from '../exercises/types';
import { qById } from '../data/questionnaire';
import { speak, stopSpeaking } from '../lib/speech';

type Phase = 'intro' | 'play' | 'result';

export default function Session() {
  const s = useApp();
  // #/sessione?ex=sassi,colpo permette di provare esercizi precisi (utile per i test).
  const route = useRoute();
  const plan = useMemo(() => {
    const m = route.match(/[?&]ex=([a-z,]+)/);
    const chosen = (m?.[1].split(',') ?? []).filter((x): x is ExerciseId => EXERCISES.some((e) => e.id === x));
    return chosen.length ? chosen : todayPlan(getState());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<Phase>('intro');
  const [outcome, setOutcome] = useState<ExerciseOutcome | null>(null);
  const [completed, setCompleted] = useState<ExerciseId[]>([]);
  const [paused, setPaused] = useState(false);
  const [run, setRun] = useState(0);

  const id = plan[i];
  const def = exById(id);
  const level = levelOf(s, id);
  const personal = s.personalGoal ? qById(s.personalGoal) : undefined;
  const helpsGoal = personal && def.domains.some((d) => personal.domains.includes(d));

  useEffect(() => {
    if (phase === 'intro' && s.settings.voice) speak(`${def.name}. ${def.instructions(level)}`);
    return () => stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, i]);

  function finishSession(done: ExerciseId[]) {
    if (done.length > 0) {
      actions.recordSession(done);
      navigate('/fine', { replace: true });
    } else {
      navigate('/oggi', { replace: true });
    }
  }

  function onDone(o: ExerciseOutcome) {
    const next = def.adapt(level, o);
    actions.recordResult(id, level, o, next);
    setOutcome(o);
    setCompleted((c) => [...c, id]);
    setPhase('result');
    if (getState().settings.voice) speak(def.phrase(o));
  }

  function nextExercise() {
    if (i + 1 >= plan.length) {
      finishSession([...completed]);
      return;
    }
    setI(i + 1);
    setOutcome(null);
    setPhase('intro');
  }

  const Ex = def.component;

  return (
    <Screen>
      <header className="flex items-center gap-3 pt-4 pb-3 min-h-[4.5rem]">
        <p className="flex-1 text-body font-extrabold">Esercizio {i + 1} di {plan.length}</p>
        <button type="button" className="btn-outline !min-h-[3rem] !px-4" onClick={() => { stopSpeaking(); setPaused(true); }}>
          <Pause size={20} aria-hidden /> Pausa
        </button>
      </header>

      {paused ? (
        <div className="flex flex-col gap-4 pt-6 fade-up">
          <h1 className="text-h1 font-extrabold">In pausa</h1>
          <p className="text-lead text-ink-soft">
            {completed.length > 0
              ? `Hai già fatto ${completed.length === 1 ? 'un esercizio' : `${completed.length} esercizi`}: conta per la tua pianta anche se ti fermi qui.`
              : 'Puoi riprendere quando vuoi.'}
          </p>
          <button type="button" className="btn-primary w-full text-lead" onClick={() => { setPaused(false); if (phase === 'play') setRun((r) => r + 1); }}>
            <Play size={22} fill="#fff" aria-hidden /> {phase === 'play' ? 'Ricomincia questo esercizio' : 'Riprendi'}
          </button>
          <button type="button" className="btn-outline w-full text-lead" onClick={() => finishSession(completed)}>
            Ho finito per oggi
          </button>
        </div>
      ) : phase === 'intro' ? (
        <div className="flex flex-col gap-4 pt-2 fade-up" key={`intro-${i}`}>
          <p className="eyebrow">{def.trains}</p>
          <h1 className="text-h1 font-extrabold">{def.name}</h1>
          <p className="text-lead font-medium">{def.instructions(level)}</p>
          {helpsGoal && <Notice tone="sun">Ti aiuta a: {personal!.goal.toLowerCase()}</Notice>}
          <div className="flex justify-center"><Listen text={def.instructions(level)} /></div>
          <button type="button" className="btn-primary w-full text-lead !min-h-[4rem] mt-2" onClick={() => { stopSpeaking(); setPhase('play'); }}>
            Comincia
          </button>
        </div>
      ) : phase === 'play' ? (
        <div className="pt-2" key={`play-${i}-${run}`}>
          <Ex level={level} onDone={onDone} />
        </div>
      ) : (
        outcome && (
          <div className="flex flex-col gap-4 pt-6 fade-up" key={`res-${i}`}>
            <p className="eyebrow">{def.name}</p>
            <h1 className="text-h1 font-extrabold">{outcome.correct >= outcome.total * 0.6 ? 'Ben fatto!' : 'Grazie per l\'impegno!'}</h1>
            <p className="text-lead font-semibold">{def.phrase(outcome)}.</p>
            {def.adapt(level, outcome) > level && <Notice>La prossima volta sarà un pochino più impegnativo.</Notice>}
            {def.adapt(level, outcome) < level && <Notice tone="sky">La prossima volta sarà più tranquillo.</Notice>}
            <button type="button" className="btn-primary w-full text-lead !min-h-[4rem] mt-2" onClick={nextExercise}>
              {i + 1 >= plan.length ? 'Guarda la tua pianta' : 'Prossimo esercizio'}
            </button>
          </div>
        )
      )}
    </Screen>
  );
}

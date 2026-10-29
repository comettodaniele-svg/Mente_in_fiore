// Il primo avvio: benvenuto, nome, il proprio "perché", questionario, obiettivo, pianta, gruppo.
import { useMemo, useState } from 'react';
import { Check, Users, User, KeyRound } from 'lucide-react';
import { actions, demoMembers, getState, makeCode, useApp } from '../store';
import { MOTIVATIONS } from '../data/challenges';
import { QUESTIONS, type Answer } from '../data/questionnaire';
import { PLANTS, type PlantId } from '../data/plants';
import { Plant } from '../art/Plant';
import { Dots, Notice, Screen, TopBar } from '../components/ui';
import { QuestionnaireFlow } from './Questionnaire';
import { navigate } from '../router';
import { InviteCard } from './Invite';

type Step = 'welcome' | 'name' | 'why' | 'quiz' | 'goal' | 'plant' | 'group' | 'join' | 'invite';
const ORDER: Step[] = ['welcome', 'name', 'why', 'quiz', 'goal', 'plant', 'group'];

export default function Onboarding() {
  const s = useApp();
  const [step, setStep] = useState<Step>('welcome');
  const go = (st: Step) => {
    setStep(st);
    window.scrollTo(0, 0);
  };
  const prev = () => {
    const i = ORDER.indexOf(step);
    if (step === 'join' || step === 'invite') go('group');
    else if (i > 0) go(ORDER[i - 1]);
  };
  const progress = Math.max(0, ORDER.indexOf(step === 'join' || step === 'invite' ? 'group' : step) - 1);

  function finish() {
    actions.update({ onboarded: true });
    navigate('/oggi', { replace: true });
  }

  if (step === 'welcome') return <Welcome onNext={() => go('name')} />;

  if (step === 'quiz') {
    return (
      <Screen>
        <QuestionnaireFlow
          initial={s.questionnaire[0]?.answers}
          onExit={prev}
          onDone={(a) => {
            if (s.questionnaire.length === 0) actions.saveQuestionnaire(a);
            else actions.update({ questionnaire: [{ ...s.questionnaire[0], answers: a }, ...s.questionnaire.slice(1)] });
            go('goal');
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <TopBar onBack={prev} right={<div className="flex-1"><Dots total={ORDER.length - 1} current={progress} /></div>} />
      {step === 'name' && <NameStep onNext={() => go('why')} />}
      {step === 'why' && <WhyStep onNext={() => go('quiz')} />}
      {step === 'goal' && <GoalStep onNext={() => go('plant')} />}
      {step === 'plant' && <PlantStep onNext={() => go('group')} />}
      {step === 'group' && <GroupStep onCreate={() => go('invite')} onJoin={() => go('join')} onSolo={finish} />}
      {step === 'join' && <JoinStep onDone={finish} />}
      {step === 'invite' && (
        <div className="flex flex-col gap-5 fade-up">
          <h1 className="text-h1 font-extrabold">Invita qualcuno</h1>
          <InviteCard />
          <button type="button" className="btn-primary w-full text-lead" onClick={finish}>Entra nel giardino</button>
        </div>
      )}
    </Screen>
  );
}

function Welcome({ onNext }: { onNext: () => void }) {
  return (
    <Screen className="justify-between">
      <div className="pt-10 flex flex-col items-center text-center gap-4">
        <div className="flex items-end justify-center -space-x-6" aria-hidden>
          <Plant species="lavanda" stage={4} size={110} className="grow-in" />
          <Plant species="girasole" stage={4} size={150} className="grow-in" />
          <Plant species="tulipano" stage={4} size={110} className="grow-in" />
        </div>
        <h1 className="text-hero font-extrabold mt-2">Benvenuto in<br />Mente in fiore</h1>
        <p className="text-lead text-ink-soft font-medium max-w-[22rem]">
          Pochi minuti al giorno per tenere la mente attiva, insieme a chi vuoi tu.
        </p>
      </div>
      <div className="flex flex-col gap-3 pt-8">
        <button type="button" className="btn-primary w-full text-lead !min-h-[4rem]" onClick={onNext}>Iniziamo</button>
        <p className="text-center text-meta text-ink-soft">I tuoi dati restano su questo telefono.</p>
      </div>
    </Screen>
  );
}

function NameStep({ onNext }: { onNext: () => void }) {
  const s = useApp();
  const [name, setName] = useState(s.name);
  return (
    <form
      className="flex flex-col gap-5 fade-up"
      onSubmit={(e) => {
        e.preventDefault();
        actions.update({ name: name.trim() });
        onNext();
      }}
    >
      <h1 className="text-h1 font-extrabold">Come ti chiami?</h1>
      <p className="text-body text-ink-soft">Lo useremo per salutarti e sul cartellino del tuo angolo.</p>
      <label className="flex flex-col gap-2">
        <span className="text-body font-bold">Il tuo nome</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="given-name"
          className="min-h-touch rounded-btn border-2 border-line-strong bg-white px-4 text-lead font-semibold focus:border-leaf outline-none"
          maxLength={24}
        />
      </label>
      <button type="submit" className="btn-primary w-full text-lead mt-2" disabled={!name.trim()}>Continua</button>
    </form>
  );
}

function WhyStep({ onNext }: { onNext: () => void }) {
  const s = useApp();
  const [picked, setPicked] = useState<string[]>(s.motivations);
  const [custom, setCustom] = useState(s.customMotivation);
  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 2 ? [p[1], id] : [...p, id]));
  const ok = picked.length > 0 && (!picked.includes('mio') || custom.trim().length > 0);
  return (
    <div className="flex flex-col gap-4 fade-up">
      <h1 className="text-h1 font-extrabold">Cosa ti sta più a cuore?</h1>
      <p className="text-body text-ink-soft">Scegli una o due cose. Te le ricorderemo nei momenti giusti.</p>
      <div className="flex flex-col gap-3">
        {[...MOTIVATIONS, { id: 'mio', label: 'Lo scrivo io…' }].map((m) => {
          const on = picked.includes(m.id);
          return (
            <button key={m.id} type="button" aria-pressed={on} onClick={() => toggle(m.id)} className="choice">
              <span className={`w-8 h-8 shrink-0 rounded-lg border-2 flex items-center justify-center ${on ? 'bg-leaf border-leaf' : 'bg-white border-line-strong'}`} aria-hidden>
                {on && <Check size={20} strokeWidth={3.2} color="#fff" />}
              </span>
              <span className="text-lead">{m.label}</span>
            </button>
          );
        })}
      </div>
      {picked.includes('mio') && (
        <label className="flex flex-col gap-2 fade-up">
          <span className="text-body font-bold">Con parole tue</span>
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Per esempio: tornare a fare le parole crociate"
            className="min-h-touch rounded-btn border-2 border-line-strong bg-white px-4 text-body font-semibold focus:border-leaf outline-none"
            maxLength={60}
          />
        </label>
      )}
      <button
        type="button"
        className="btn-primary w-full text-lead mt-2"
        disabled={!ok}
        onClick={() => {
          actions.update({ motivations: picked, customMotivation: custom.trim() });
          onNext();
        }}
      >
        Continua
      </button>
      <p className="text-meta text-ink-soft text-center">Poi ti farò 12 domande su situazioni di tutti i giorni.</p>
    </div>
  );
}

function GoalStep({ onNext }: { onNext: () => void }) {
  const s = useApp();
  const answers: Record<string, Answer> = s.questionnaire[0]?.answers ?? {};
  const top = useMemo(() => {
    const scored = QUESTIONS.map((q) => ({ q, v: answers[q.id] ?? -1 })).filter((x) => (x.v ?? -1) > 0);
    scored.sort((a, b) => (b.v ?? 0) - (a.v ?? 0));
    const list = scored.slice(0, 3).map((x) => x.q);
    // Se non è emerso nulla, proponiamo tre obiettivi comuni.
    return list.length ? list : QUESTIONS.filter((q) => ['lettura', 'nomi', 'spesa'].includes(q.id));
  }, [answers]);
  const [picked, setPicked] = useState<string | null>(s.personalGoal);
  return (
    <div className="flex flex-col gap-4 fade-up">
      <h1 className="text-h1 font-extrabold">Da dove vuoi cominciare?</h1>
      <p className="text-body text-ink-soft">Scegli una cosa da migliorare. Gli esercizi e le sfide della settimana partiranno da qui. Potrai cambiarla quando vuoi.</p>
      <div className="flex flex-col gap-3">
        {top.map((q) => (
          <button key={q.id} type="button" role="radio" aria-checked={picked === q.id} onClick={() => setPicked(q.id)} className="choice !items-start !py-4 flex-col !gap-1">
            <span className="text-lead font-extrabold">{q.goal}</span>
            <span className="text-meta text-ink-soft font-medium">Hai risposto: «{q.text.toLowerCase()}»</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        className="btn-primary w-full text-lead mt-2"
        disabled={!picked}
        onClick={() => {
          actions.update({ personalGoal: picked });
          onNext();
        }}
      >
        Continua
      </button>
    </div>
  );
}

function PlantStep({ onNext }: { onNext: () => void }) {
  const s = useApp();
  const [picked, setPicked] = useState<PlantId | null>(s.plant);
  const taken = useMemo(() => {
    const m: Partial<Record<PlantId, string>> = {};
    if (s.group?.mode === 'gruppo') s.group.members.forEach((x) => (m[x.plant] = x.name));
    return m;
  }, [s.group]);
  return (
    <div className="flex flex-col gap-4 fade-up">
      <h1 className="text-h1 font-extrabold">Scegli la tua pianta</h1>
      <p className="text-body text-ink-soft">Crescerà con te, sessione dopo sessione. Non appassisce mai, anche quando fai una pausa.</p>
      <div className="grid grid-cols-2 gap-3">
        {PLANTS.map((p) => {
          const owner = taken[p.id];
          const on = picked === p.id;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={!!owner}
              onClick={() => setPicked(p.id)}
              className={`relative rounded-card border-2 bg-white p-3 flex flex-col items-center text-center gap-1 min-h-[12rem] ${
                on ? 'border-leaf bg-leaf-tint' : 'border-line'
              } ${owner ? 'opacity-55' : ''}`}
              style={{ boxShadow: on ? '0 4px 0 0 #378500' : '0 4px 0 0 #E5E7EB' }}
            >
              {on && (
                <span className="absolute top-2 right-2 w-8 h-8 rounded-full bg-leaf flex items-center justify-center" aria-hidden>
                  <Check size={20} strokeWidth={3.2} color="#fff" />
                </span>
              )}
              <Plant species={p.id} stage={4} size={96} />
              <span className="text-lead font-extrabold leading-tight">{p.name}</span>
              <span className="text-meta text-ink-soft leading-tight">{owner ? `Già nel giardino di ${owner}` : p.note}</span>
            </button>
          );
        })}
      </div>
      <div className="sticky bottom-0 pt-3 pb-2 bg-canvas">
        <button
          type="button"
          className="btn-primary w-full text-lead"
          disabled={!picked}
          onClick={() => {
            actions.update({ plant: picked });
            onNext();
          }}
        >
          {picked ? `Scelgo ${PLANTS.find((p) => p.id === picked)?.name.toLowerCase()}` : 'Scegli una pianta'}
        </button>
      </div>
    </div>
  );
}

function GroupStep({ onCreate, onJoin, onSolo }: { onCreate: () => void; onJoin: () => void; onSolo: () => void }) {
  const [name, setName] = useState('Gli amici del giovedì');
  const [asking, setAsking] = useState(false);
  function create() {
    const st = getState();
    actions.setGroup({
      mode: 'gruppo',
      name: name.trim() || 'Il nostro giardino',
      code: makeCode(st.name + Date.now()),
      members: demoMembers(st.plant),
      demo: true,
    });
    onCreate();
  }
  return (
    <div className="flex flex-col gap-4 fade-up">
      <h1 className="text-h1 font-extrabold">Il tuo gruppo</h1>
      <p className="text-body text-ink-soft">Il giardino cresce con le sessioni di tutti. Nessuno vede i punteggi degli altri.</p>
      {!asking ? (
        <>
          <button type="button" className="choice !py-4" onClick={() => setAsking(true)}>
            <Users size={30} className="text-leaf shrink-0" aria-hidden />
            <span className="flex flex-col">
              <span className="text-lead font-extrabold">Crea un giardino nuovo</span>
              <span className="text-meta text-ink-soft font-medium">Poi inviti amici, familiari o un nipote</span>
            </span>
          </button>
          <button type="button" className="choice !py-4" onClick={onJoin}>
            <KeyRound size={30} className="text-sky shrink-0" aria-hidden />
            <span className="flex flex-col">
              <span className="text-lead font-extrabold">Entra in un giardino</span>
              <span className="text-meta text-ink-soft font-medium">Se qualcuno ti ha dato un codice</span>
            </span>
          </button>
          <button type="button" className="choice !py-4" onClick={() => {
            actions.setGroup({ mode: 'solo', name: 'Il mio giardino', code: '', members: [], demo: false });
            onSolo();
          }}>
            <User size={30} className="text-ink-soft shrink-0" aria-hidden />
            <span className="flex flex-col">
              <span className="text-lead font-extrabold">Per ora preferisco da solo</span>
              <span className="text-meta text-ink-soft font-medium">Puoi unirti a un gruppo più avanti</span>
            </span>
          </button>
        </>
      ) : (
        <form className="flex flex-col gap-4 fade-up" onSubmit={(e) => { e.preventDefault(); create(); }}>
          <label className="flex flex-col gap-2">
            <span className="text-body font-bold">Come si chiama il vostro giardino?</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-h-touch rounded-btn border-2 border-line-strong bg-white px-4 text-lead font-semibold focus:border-leaf outline-none"
              maxLength={32}
            />
          </label>
          <Notice tone="sky">In questa versione di prova il gruppo è simulato su questo telefono, con quattro amici di esempio.</Notice>
          <button type="submit" className="btn-primary w-full text-lead">Crea il giardino</button>
        </form>
      )}
    </div>
  );
}

function JoinStep({ onDone }: { onDone: () => void }) {
  const [code, setCode] = useState('');
  const valid = /^[A-Za-z]{3,5}-?\d{2}$/.test(code.trim());
  return (
    <form
      className="flex flex-col gap-4 fade-up"
      onSubmit={(e) => {
        e.preventDefault();
        const st = getState();
        actions.setGroup({ mode: 'gruppo', name: 'Gli amici del giovedì', code: code.trim().toUpperCase(), members: demoMembers(st.plant), demo: true });
        onDone();
      }}
    >
      <h1 className="text-h1 font-extrabold">Entra in un giardino</h1>
      <label className="flex flex-col gap-2">
        <span className="text-body font-bold">Scrivi il codice che hai ricevuto</span>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="MELO-42"
          autoCapitalize="characters"
          className="min-h-[4rem] rounded-btn border-2 border-line-strong bg-white px-4 text-h2 font-extrabold tracking-widest text-center focus:border-leaf outline-none"
          maxLength={8}
        />
      </label>
      <Notice tone="sky">In questa versione di prova non c'è ancora un collegamento tra telefoni: entrerai in un giardino di esempio.</Notice>
      <button type="submit" className="btn-primary w-full text-lead" disabled={!valid}>Entra</button>
    </form>
  );
}

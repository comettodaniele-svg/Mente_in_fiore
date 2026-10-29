// Il giardino condiviso: l'albero comune, le aiuole di ognuno, i messaggi e la sfida fuori dall'app.
import { useEffect, useRef, useState } from 'react';
import { UserPlus, Footprints, ChevronRight } from 'lucide-react';
import { actions, demoMembers, getState, makeCode, useApp } from '../store';
import { Avatar, Card, Notice, Screen, Steps } from '../components/ui';
import { navigate, useRoute } from '../router';
import { GardenScene, type PlotInfo } from '../art/Scenes';
import { STAGES, personalStage, plantName } from '../data/plants';
import { groupFeed, groupSessionsThisWeek, memberTotalSessions, myPlant, treeStage } from '../lib/derive';
import { dayKey, relativeDay, seasonLabel, seasonOf, weekKey } from '../lib/dates';
import { QUICK_REPLIES, challengeForWeek } from '../data/challenges';

export default function Garden() {
  const s = useApp();
  const route = useRoute();
  const repliesRef = useRef<HTMLDivElement>(null);
  const season = seasonOf();
  const group = s.group?.mode === 'gruppo' ? s.group : null;
  const mine = myPlant(s);
  const since = s.sessions[0]?.day ?? dayKey();
  const tStage = treeStage(s);
  const total = groupSessionsThisWeek(s);
  const wk = s.weeks[weekKey()];
  const challenge = challengeForWeek(weekKey());
  const today = dayKey();
  const repliedToday = s.replies.filter((r) => r.day === today).map((r) => r.text);
  const [justSent, setJustSent] = useState<string | null>(null);

  useEffect(() => {
    if (route.includes('saluto=1')) repliesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [route]);

  const plots: PlotInfo[] = [
    ...(s.plant ? [{ name: s.name || 'Tu', species: s.plant, stage: mine.stage, blooms: mine.blooms, me: true }] : []),
    ...(group?.members ?? []).map((m) => {
      const st = personalStage(memberTotalSessions(m, since));
      return { name: m.name, species: m.plant, stage: st.stage, blooms: st.blooms };
    }),
  ];

  const sceneLabel = group
    ? `Il giardino del gruppo. Al centro il melograno comune, nello stadio ${STAGES[tStage].toLowerCase()}. Intorno le aiuole: ${plots.map((p) => `${p.me ? 'la tua' : p.name} con ${plantName(p.species).toLowerCase()}`).join(', ')}.`
    : `Il tuo giardino, con ${s.plant ? plantName(s.plant).toLowerCase() : 'la tua pianta'} e il melograno.`;

  function startGroup() {
    const st = getState();
    actions.setGroup({ mode: 'gruppo', name: 'Il nostro giardino', code: makeCode(st.name + Date.now()), members: demoMembers(st.plant), demo: true });
    navigate('/invita');
  }

  return (
    <Screen nav>
      <header className="pt-6 pb-3 flex flex-col gap-2">
        <p className="eyebrow">{group ? 'Giardino del gruppo' : 'Il tuo giardino'} · {seasonLabel[season]}</p>
        <h1 className="text-h1 font-extrabold">{group ? group.name : 'Il mio giardino'}</h1>
        {group && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex -space-x-2">
              {group.members.map((m) => <Avatar key={m.name} name={m.name} size="sm" />)}
              <Avatar name="Tu" me size="sm" />
            </div>
            <span className="text-body text-ink-soft font-semibold ml-1">{group.members.length + 1} persone</span>
          </div>
        )}
      </header>

      <div className="flex flex-col gap-5">
        <section className="rounded-card overflow-hidden border-2 border-line bg-white">
          <GardenScene season={season} treeStage={tStage} plots={plots} label={sceneLabel} />
          <p className="px-5 py-4 text-body text-ink-soft font-medium">
            {group ? 'L\'albero al centro cresce con le sessioni di tutti. Ogni aiuola è l\'angolo di una persona.' : 'Il melograno cresce con le tue sessioni della settimana.'}
          </p>
        </section>

        <button type="button" className="btn-primary w-full text-lead !min-h-[4rem]" onClick={() => navigate('/oggi')}>
          Vai alla sessione di oggi
        </button>

        <Card>
          <p className="eyebrow">Obiettivo della settimana</p>
          <h2 className="text-h3 font-extrabold mt-1 mb-4">Far fiorire il melograno</h2>
          <Steps labels={STAGES} current={tStage >= 4 ? -1 : tStage} done={tStage >= 4 ? 5 : tStage} />
          <p className="text-body font-semibold mt-4">
            {total === 0
              ? 'La settimana è appena cominciata: il primo seme aspetta.'
              : `${group ? 'Insieme avete fatto' : 'Hai fatto'} ${total} ${total === 1 ? 'sessione' : 'sessioni'} questa settimana.${tStage >= 4 ? ' Il melograno è fiorito!' : ''}`}
          </p>
        </Card>

        <button type="button" className="card text-left flex items-center gap-4 !py-4" onClick={() => navigate('/angolo')}>
          <div className="flex-1">
            <h2 className="text-h3 font-extrabold">Il tuo angolo</h2>
            <p className="text-body text-ink-soft mt-0.5">
              {s.plant ? `${plantName(s.plant)}: ${STAGES[mine.stage].toLowerCase()}.` : ''} Resta com'è anche quando fai una pausa.
            </p>
          </div>
          <ChevronRight size={28} className="text-ink-soft shrink-0" aria-hidden />
        </button>

        {group ? (
          <>
            <Card>
              <h2 className="text-h3 font-extrabold mb-3">Dal gruppo</h2>
              <ul className="flex flex-col gap-3">
                {groupFeed(s).map((f, i) => (
                  <li key={`${f.who}-${f.day}-${i}`} className="flex items-center gap-3">
                    <Avatar name={f.who} size="sm" />
                    <div>
                      <p className="text-body leading-snug"><strong>{f.who}</strong> {f.text}</p>
                      <p className="text-meta text-ink-soft">{relativeDay(f.day)}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div ref={repliesRef} className="mt-5">
                <p className="text-body font-bold mb-2">Rispondi al gruppo:</p>
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_REPLIES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      aria-pressed={repliedToday.includes(r)}
                      onClick={() => { actions.reply(r); setJustSent(r); }}
                      className={`btn !px-2 !text-meta border-2 ${repliedToday.includes(r) ? 'bg-leaf text-white border-leaf-dark' : 'bg-white border-line'}`}
                      style={{ boxShadow: repliedToday.includes(r) ? '0 3px 0 0 #1F5100' : '0 3px 0 0 #CBD5E1' }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                {justSent && <div className="mt-3"><Notice>Hai mandato «{justSent}» al gruppo.</Notice></div>}
              </div>
            </Card>

            <Card className="!bg-sun-tint !border-sun-dark/30">
              <div className="flex items-center gap-2 mb-1">
                <Footprints size={22} aria-hidden />
                <p className="eyebrow !text-ink">Sfida fuori dall'app</p>
              </div>
              <h2 className="text-h3 font-extrabold">{challenge.title}</h2>
              <p className="text-body mt-1">{challenge.text}</p>
              {wk?.groupChallenge === 'fatta' ? (
                <div className="mt-3"><Notice>Bellissimo! Nel giardino è comparso un sentiero.</Notice></div>
              ) : wk?.groupChallenge === 'dopo' ? (
                <div className="mt-3 flex flex-col gap-2">
                  <Notice tone="sun">Nessuna fretta: la sfida resta qui fino a domenica.</Notice>
                  <button type="button" className="btn-primary w-full" onClick={() => actions.updateWeek({ groupChallenge: 'fatta' })}>L'abbiamo fatta!</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button type="button" className="btn-primary" onClick={() => actions.updateWeek({ groupChallenge: 'fatta' })}>Fatta!</button>
                  <button type="button" className="btn-outline" onClick={() => actions.updateWeek({ groupChallenge: 'dopo' })}>Non ancora</button>
                </div>
              )}
            </Card>

            <button type="button" className="btn-outline w-full" onClick={() => navigate('/invita')}>
              <UserPlus size={22} aria-hidden /> Invita qualcuno
            </button>
          </>
        ) : (
          <Card>
            <h2 className="text-h3 font-extrabold">Un giardino da condividere?</h2>
            <p className="text-body text-ink-soft mt-1">Con amici o familiari il melograno cresce più in fretta, e vi mandate un saluto ogni tanto.</p>
            <button type="button" className="btn-outline w-full mt-4" onClick={startGroup}>
              <UserPlus size={22} aria-hidden /> Crea un giardino condiviso
            </button>
          </Card>
        )}
      </div>
    </Screen>
  );
}

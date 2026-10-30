// Il giardino condiviso, sul modello della schermata di Stitch:
// la mappa con l'albero comune e i nodi delle attività di oggi, le aiuole di ognuno,
// la scheda dell'attività scelta, l'obiettivo della settimana, i messaggi e la sfida fuori dall'app.
import { useEffect, useRef, useState } from 'react';
import { UserPlus, Footprints, Check, Play, Sprout, Leaf, MessagesSquare, Clock, Flower2, Sun as SunIcon } from 'lucide-react';
import { actions, demoMembers, getState, makeCode, useApp } from '../store';
import { Avatar, Notice, Screen, Steps, TONES, toneFor } from '../components/ui';
import { navigate, useRoute } from '../router';
import type { PlotInfo } from '../art/Scenes';
import { PlantPhoto } from '../art/PlantPhoto';
import { GARDEN_BY_SEASON } from '../art/illustration';
import { STAGES, personalStage, plantName, type PlantId } from '../data/plants';
import { groupFeed, groupSessionsThisWeek, memberTotalSessions, myPlant, sessionsOn, treeStage } from '../lib/derive';
import { dayKey, relativeDay, seasonLabel, seasonOf, weekKey } from '../lib/dates';
import { QUICK_REPLIES, challengeForWeek } from '../data/challenges';
import { MAX_SESSIONS_PER_DAY, todayPlan } from '../lib/plan';
import { exById } from '../exercises';
import { domainLabel } from '../data/domains';
import { EX_LOOK } from '../exercises/icons';
import type { ExerciseId } from '../exercises/types';

type Sel = { kind: 'ex'; id: ExerciseId } | { kind: 'plot'; name: string; me: boolean } | null;

export default function Garden() {
  const s = useApp();
  const route = useRoute();
  const repliesRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
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
  const [sel, setSel] = useState<Sel>(null);

  const rest = sessionsOn(s, today) >= MAX_SESSIONS_PER_DAY;
  const plan = todayPlan(s);
  const doneToday = new Set(s.results.filter((r) => r.day === today).map((r) => r.ex));
  const nextEx = plan.find((id) => !doneToday.has(id)) ?? plan[0];

  useEffect(() => {
    if (route.includes('saluto=1')) repliesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [route]);

  const members = group?.members ?? [];
  const plots: (PlotInfo & { tone: number })[] = [
    ...members.map((m, i) => {
      const st = personalStage(memberTotalSessions(m, since));
      return { name: m.name, species: m.plant, stage: st.stage, blooms: st.blooms, tone: i };
    }),
  ];
  const meplot = s.plant ? { name: s.name || 'Tu', species: s.plant, stage: mine.stage, blooms: mine.blooms, me: true, tone: 0 } : null;
  // L'utente sta al centro della fila di aiuole.
  const row = [...plots];
  if (meplot) row.splice(Math.floor(row.length / 2), 0, meplot);

  const sceneLabel = group
    ? `Il giardino del gruppo. Al centro il melograno comune, nello stadio ${STAGES[tStage].toLowerCase()}.`
    : `Il tuo giardino, con il melograno nello stadio ${STAGES[tStage].toLowerCase()}.`;

  function choose(x: Sel) {
    setSel(x);
    setJustSent(null);
    setTimeout(() => sheetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  }

  function startGroup() {
    const st = getState();
    actions.setGroup({ mode: 'gruppo', name: 'Il nostro giardino', code: makeCode(st.name + Date.now()), members: demoMembers(st.plant), demo: true });
    navigate('/invita');
  }

  // Nodo del sentiero: un'attività di oggi.
  function Node({ id, big = false }: { id: ExerciseId; big?: boolean }) {
    const def = exById(id);
    const look = EX_LOOK[id];
    const t = TONES[look.tone];
    const done = doneToday.has(id);
    const isNext = id === nextEx && !done && !rest;
    const color = done ? '#58CC02' : isNext ? '#46A302' : t.ring;
    const shade = done ? '#398200' : isNext ? '#2A6900' : t.text;
    const size = big ? 'w-[4.5rem] h-[4.5rem]' : 'w-16 h-16';
    return (
      <div className="flex flex-col items-center relative">
        {isNext && (
          <span className="mb-1.5 pill bg-orange text-ink border-2 border-white !text-[0.8125rem] uppercase tracking-wide" style={{ boxShadow: '0 3px 0 0 #CC7800' }}>
            Tocca per iniziare
          </span>
        )}
        <button
          type="button"
          onClick={() => choose({ kind: 'ex', id })}
          aria-label={`${def.name}${done ? ', già fatto oggi' : isNext ? ', il prossimo' : ''}`}
          aria-pressed={sel?.kind === 'ex' && sel.id === id}
          className={`node ${size} ${isNext ? 'ring-4 ring-leaf/30' : ''}`}
          style={{ background: color, boxShadow: `0 6px 0 0 ${shade}` }}
        >
          {done ? <Check size={34} strokeWidth={3.4} aria-hidden /> : <look.Icon size={big ? 36 : 30} strokeWidth={2.6} aria-hidden />}
        </button>
        <span className="mt-1.5 px-2 py-0.5 bg-white/95 rounded-xl border-2 border-moss text-center max-w-[7.5rem]">
          <span className="block text-[0.8125rem] font-extrabold leading-tight">{def.name}</span>
          <span className="block text-[0.6875rem] font-extrabold uppercase tracking-wide leading-tight" style={{ color: done ? '#2A6900' : t.text }}>
            {done ? 'Fatto oggi ✓' : domainLabel[def.domains[0]]}
          </span>
        </span>
      </div>
    );
  }

  // Contenuto della scheda in basso alla mappa.
  const current: Sel = sel ?? (nextEx && !rest ? { kind: 'ex', id: nextEx } : meplot ? { kind: 'plot', name: meplot.name, me: true } : null);
  let sheet: { badge: string; title: string; text: string; meta: string; cta: string; onCta: () => void; Icon: typeof Sprout; tone: number } | null = null;
  if (current?.kind === 'ex') {
    const def = exById(current.id);
    const done = doneToday.has(current.id);
    sheet = {
      badge: done ? 'Già fatto oggi' : 'Attività di oggi',
      title: def.name,
      text: `${def.trains}. ${def.instructions(s.levels[current.id] ?? 1)}`,
      meta: rest ? 'Per oggi hai fatto abbastanza: a domani!' : 'Sessione di oggi: circa 10 minuti, 3 esercizi senza fretta',
      cta: rest ? 'Guarda il tuo angolo' : done ? 'Continua la sessione' : 'Coltiva insieme al gruppo',
      onCta: () => navigate(rest ? '/angolo' : '/sessione'),
      Icon: EX_LOOK[current.id].Icon,
      tone: EX_LOOK[current.id].tone,
    };
    if (!group && !rest && !done) sheet.cta = 'Inizia la sessione di oggi';
  } else if (current?.kind === 'plot') {
    if (current.me) {
      sheet = {
        badge: 'La tua aiuola',
        title: `Il tuo angolo: ${s.plant ? plantName(s.plant).toLowerCase() : ''}`,
        text: `${STAGES[mine.stage]}. Il tuo angolo resta bello e curato anche quando ti prendi una pausa.`,
        meta: 'Nessun fiore può appassire',
        cta: 'Vai al tuo angolo',
        onCta: () => navigate('/angolo'),
        Icon: Flower2,
        tone: 0,
      };
    } else {
      const p = plots.find((x) => x.name === current.name);
      sheet = {
        badge: 'Aiuola di un compagno',
        title: `Angolo di ${current.name}`,
        text: `${current.name} coltiva ${p ? plantName(p.species).toLowerCase() : 'una pianta'} e fa crescere il melograno insieme a te. Manda un pensiero gentile!`,
        meta: 'Insieme per far fiorire il giardino comune',
        cta: `Manda un fiore a ${current.name}`,
        onCta: () => {
          actions.reply(`Un fiore per ${current.name}`);
          setJustSent(`un fiore a ${current.name}`);
        },
        Icon: Flower2,
        tone: p?.tone ?? 0,
      };
    }
  }

  return (
    <Screen nav bar={group ? 'Giardino condiviso' : 'Il mio giardino'}>
      {/* Intestazione del gruppo */}
      <section className="pt-5 pb-4 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="pill bg-leaf-tint border-2 border-leaf/30 text-leaf-deep uppercase tracking-wide">
            <Leaf size={16} aria-hidden /> {group ? 'Gruppo' : 'Da solo'} · {seasonLabel[season]}
          </span>
          {group && <span className="pill bg-white border-2 border-moss text-ink-soft">{members.length + 1} compagni</span>}
        </div>
        <h1 className="text-h1 font-extrabold tracking-tight">{group ? group.name : 'Il mio giardino'}</h1>
        {group && (
          <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border-2 border-moss">
            <div className="flex items-center -space-x-2">
              {members.map((m, i) => <Avatar key={m.name} name={m.name} size="sm" tone={i} />)}
              <span className="ml-3"><Avatar name="Tu" me size="sm" /></span>
            </div>
            <span className="text-meta font-extrabold text-leaf-deep pr-1">{total} sessioni</span>
          </div>
        )}
      </section>

      <div className="flex flex-col gap-5">
        {/* LA MAPPA DEL GIARDINO: l'illustrazione della stagione fa da sfondo, sopra i sentieri e le aiuole (come in Stitch) */}
        <section
          className="relative rounded-card overflow-hidden bg-[#FAF8F2] border-[3px] border-[#CDE5BE]"
          style={{ boxShadow: '0 8px 0 0 #DBE8D3' }}
          aria-label="Mappa del giardino"
        >
          <img src={GARDEN_BY_SEASON[season]} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover object-[50%_30%]" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/75" aria-hidden />
          <p className="sr-only">{sceneLabel}</p>

          <div className="relative flex flex-col justify-between gap-2 min-h-[32rem] p-3">
            {/* Etichette in alto */}
            <div className="flex items-center justify-between gap-2">
              <span className="pill bg-white/95 border-2 border-moss text-ink !text-[0.8125rem] !whitespace-normal leading-tight">
                <Sprout size={18} className="text-leaf shrink-0" aria-hidden /> I sentieri dell'albero
              </span>
              <span className="pill bg-white/95 border-2 border-moss text-ink-soft !text-[0.8125rem] !whitespace-normal leading-tight">
                <SunIcon size={18} className="text-orange shrink-0" aria-hidden /> Fase {STAGES[tStage].toLowerCase()}
              </span>
            </div>

            {/* I tre nodi delle attività di oggi, sopra la chioma del melograno */}
            <div className="relative px-1 pt-2">
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 360 300" preserveAspectRatio="none" aria-hidden>
                <path d="M 70 60 Q 130 110 180 170" fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" opacity="0.7" />
                <path d="M 290 60 Q 230 110 180 170" fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" opacity="0.7" />
                <path d="M 70 60 Q 130 110 180 170" fill="none" stroke="#46A302" strokeWidth="4" strokeDasharray="6 6" />
                <path d="M 290 60 Q 230 110 180 170" fill="none" stroke="#46A302" strokeWidth="4" strokeDasharray="6 6" />
              </svg>
              <div className="relative flex items-start justify-between">
                <Node id={plan[0]} />
                <Node id={plan[2]} />
              </div>
              <div className="relative flex justify-center mt-1">
                <Node id={plan[1]} big />
              </div>
            </div>

            {/* Le aiuole, davanti all'albero */}
            <div>
              <p className="text-center mb-2">
                <span className="pill bg-sun-tint/95 border-2 border-sun-edge text-[#5C491B] !text-[0.8125rem] uppercase tracking-wider">
                  {group ? 'Le aiuole dei compagni' : 'La tua aiuola'}
                </span>
              </p>
              <div className="flex items-end justify-around gap-1">
                {row.map((p) => {
                  const me = 'me' in p && p.me;
                  const t = me ? null : TONES[p.tone % TONES.length];
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => choose({ kind: 'plot', name: p.name, me: !!me })}
                      aria-label={me ? 'Il tuo angolo' : `Aiuola di ${p.name}: ${plantName(p.species).toLowerCase()}`}
                      className="flex flex-col items-center gap-1 min-w-[3.5rem]"
                    >
                      <span
                        className={`${me ? 'w-[4.25rem] h-[4.25rem]' : 'w-14 h-14'} rounded-full flex items-end justify-center overflow-hidden border-[3px]`}
                        style={{
                          background: me ? '#EEFAE6' : t!.bg,
                          borderColor: me ? '#46A302' : t!.ring,
                          boxShadow: `0 4px 0 0 ${me ? '#357C01' : t!.edge}`,
                        }}
                      >
                        <PlantPhoto species={p.species as PlantId} stage={p.stage} className="w-full h-full" />
                      </span>
                      <span className={`text-[0.8125rem] font-extrabold leading-tight px-1.5 rounded-md ${me ? 'bg-white border-2 border-moss' : 'bg-white/85 text-ink'}`}>
                        {me ? 'Il tuo angolo' : p.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Scheda dell'attività o dell'aiuola scelta */}
        {sheet && (
          <div ref={sheetRef} className="card flex flex-col gap-3" aria-live="polite">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="pill mb-1 uppercase tracking-wide border-2" style={{ background: TONES[sheet.tone].bg, color: TONES[sheet.tone].text, borderColor: TONES[sheet.tone].edge }}>
                  {sheet.badge}
                </span>
                <h2 className="text-h3 font-extrabold leading-snug mt-1">{sheet.title}</h2>
              </div>
              <span className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2" style={{ background: TONES[sheet.tone].bg, borderColor: TONES[sheet.tone].edge }} aria-hidden>
                <sheet.Icon size={28} style={{ color: TONES[sheet.tone].text }} />
              </span>
            </div>
            <p className="text-body font-semibold text-ink-soft">{sheet.text}</p>
            <p className="inline-flex items-center gap-2 text-meta font-bold text-ink-soft bg-canvas px-3.5 py-2 rounded-xl border-2 border-moss">
              <Clock size={20} className="text-leaf shrink-0" aria-hidden /> {sheet.meta}
            </p>
            {justSent ? (
              <Notice>Hai mandato {justSent}.</Notice>
            ) : (
              <button type="button" className="btn-primary w-full !min-h-[4rem]" onClick={sheet.onCta}>
                {current?.kind === 'ex' && !rest ? <Play size={24} fill="#fff" aria-hidden /> : <Flower2 size={24} aria-hidden />} {sheet.cta}
              </button>
            )}
          </div>
        )}

        {/* Obiettivo della settimana */}
        <section className="card flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-h3 font-extrabold leading-snug">Obiettivo della settimana: far fiorire il melograno</h2>
              <p className="text-meta font-semibold text-ink-soft mt-0.5">Ogni sessione nutre l'albero {group ? 'di tutti' : ''}</p>
            </div>
            <span className="w-12 h-12 rounded-2xl bg-leaf-tint border-2 border-leaf/30 flex items-center justify-center shrink-0" aria-hidden>
              <Sprout size={28} className="text-leaf" />
            </span>
          </div>
          <Steps labels={STAGES} current={tStage >= 4 ? -1 : tStage} done={tStage >= 4 ? 5 : tStage} />
          <div className="bg-leaf-tint rounded-2xl p-3.5 border-2 border-leaf/25 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-white border-2 border-leaf/30 flex items-center justify-center shrink-0" aria-hidden>
              <Flower2 size={22} className="text-leaf" />
            </span>
            <p className="text-body font-bold text-leaf-deep leading-tight">
              {total === 0
                ? 'La settimana è appena cominciata: il primo seme aspetta.'
                : `${group ? 'Insieme avete fatto' : 'Hai fatto'} ${total} ${total === 1 ? 'sessione' : 'sessioni'} questa settimana.${tStage >= 4 ? ' Il melograno è fiorito!' : ''}`}
            </p>
          </div>
        </section>

        {group ? (
          <>
            {/* Messaggi dal gruppo */}
            <section className="card flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-h3 font-extrabold">Messaggi dal gruppo</h2>
                  <p className="text-meta font-semibold text-ink-soft">I pensieri gentili degli amici</p>
                </div>
                <MessagesSquare size={28} className="text-leaf" aria-hidden />
              </div>
              <ul className="flex flex-col gap-2.5">
                {groupFeed(s).map((f, i) => {
                  const idx = members.findIndex((m) => m.name === f.who);
                  const t = toneFor(f.who, idx >= 0 ? idx : undefined);
                  return (
                    <li key={`${f.who}-${f.day}-${i}`} className="flex items-center gap-3 p-3 rounded-2xl border-2" style={{ background: t.soft, borderColor: t.edge }}>
                      <Avatar name={f.who} size="sm" tone={idx >= 0 ? idx : undefined} />
                      <div>
                        <p className="text-body font-bold leading-snug">{f.who} {f.text}</p>
                        <p className="text-meta text-ink-soft">{relativeDay(f.day)}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div ref={repliesRef} className="flex flex-col gap-2.5">
                <p className="text-body font-extrabold text-ink-soft">Rispondi con un pensiero:</p>
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_REPLIES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      aria-pressed={repliedToday.includes(r)}
                      onClick={() => { actions.reply(r); setJustSent(null); }}
                      className="btn-reply"
                    >
                      {r}
                    </button>
                  ))}
                </div>
                {QUICK_REPLIES.some((r) => repliedToday.includes(r)) && (
                  <p className="text-center">
                    <span className="pill bg-leaf-tint border-2 border-leaf/40 text-leaf-deep"><Check size={18} aria-hidden /> Messaggio inviato agli amici</span>
                  </p>
                )}
              </div>
            </section>

            {/* Sfida fuori dall'app */}
            <section className="rounded-card p-5 bg-sun-tint border-2 border-sun-edge flex flex-col gap-3.5" style={{ boxShadow: '0 6px 0 0 #F0D28C' }}>
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-2xl bg-orange flex items-center justify-center shrink-0" style={{ boxShadow: '0 3px 0 0 #CC7800' }} aria-hidden>
                  <Footprints size={28} color="#fff" />
                </span>
                <div>
                  <h2 className="text-h3 font-extrabold text-[#3D2B00] leading-snug">Invito all'aperto: {challenge.title.toLowerCase()}</h2>
                  <p className="text-meta font-bold text-[#735200]">Sfida fuori dall'app</p>
                </div>
              </div>
              <p className="text-body font-medium text-[#5C491B]">{challenge.text} Senza fretta, per stare bene.</p>
              {wk?.groupChallenge === 'fatta' ? (
                <Notice>Che bello, registrato con gioia! Nel giardino è comparso un sentiero.</Notice>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" className="btn-primary" onClick={() => actions.updateWeek({ groupChallenge: 'fatta' })}>Fatta!</button>
                  <button
                    type="button"
                    aria-pressed={wk?.groupChallenge === 'dopo'}
                    className="btn-outline !border-sun-edge"
                    onClick={() => actions.updateWeek({ groupChallenge: 'dopo' })}
                  >
                    Non ancora
                  </button>
                </div>
              )}
              {wk?.groupChallenge === 'dopo' && <p className="text-center text-body font-extrabold text-[#735200]">Nessun pensiero, c'è tempo con calma.</p>}
            </section>

            <button type="button" className="btn-outline w-full" onClick={() => navigate('/invita')}>
              <UserPlus size={22} aria-hidden /> Invita qualcuno
            </button>
          </>
        ) : (
          <section className="card">
            <h2 className="text-h3 font-extrabold">Un giardino da condividere?</h2>
            <p className="text-body text-ink-soft mt-1">Con amici o familiari il melograno cresce più in fretta, e vi mandate un saluto ogni tanto.</p>
            <button type="button" className="btn-outline w-full mt-4" onClick={startGroup}>
              <UserPlus size={22} aria-hidden /> Crea un giardino condiviso
            </button>
          </section>
        )}
      </div>
    </Screen>
  );
}

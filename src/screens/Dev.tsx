// Modalità sviluppatore: tutti gli esercizi, livello regolabile, prove senza toccare i progressi.
import { Minus, Plus, Play, ListChecks } from 'lucide-react';
import { actions, useApp } from '../store';
import { Card, Notice, Screen, TopBar } from '../components/ui';
import { navigate } from '../router';
import { EXERCISES, exById } from '../exercises';
import { domainLabel } from '../data/domains';
import { levelOf } from '../lib/plan';
import { clearProgress, resetLevels, seedDemoData } from '../lib/devtools';
import { relativeDay, dayKey } from '../lib/dates';

export default function Dev() {
  const s = useApp();
  const tryEx = (ids: string[]) => navigate(`/sessione?ex=${ids.join(',')}&prova=1`);

  return (
    <Screen>
      <TopBar title="Modalità sviluppatore" onBack={() => navigate('/io')} />
      <div className="flex flex-col gap-5">
        <Card>
          <label className="flex items-center justify-between gap-4 min-h-touch">
            <span className="flex flex-col">
              <span className="text-body font-bold">Salva i risultati delle prove</span>
              <span className="text-meta text-ink-soft">Se è spento, le prove non cambiano livelli, pianta e progressi.</span>
            </span>
            <input
              type="checkbox"
              checked={s.devSave}
              onChange={(e) => actions.update({ devSave: e.target.checked })}
              className="w-8 h-8 accent-[#46A302] shrink-0"
            />
          </label>
          <button type="button" className="btn-primary w-full mt-3" onClick={() => tryEx(EXERCISES.map((e) => e.id))}>
            <ListChecks size={22} aria-hidden /> Prova tutti gli esercizi in fila
          </button>
        </Card>

        <section className="flex flex-col gap-3" aria-label="Esercizi">
          {EXERCISES.map((e) => {
            const lv = levelOf(s, e.id);
            return (
              <Card key={e.id} className="!p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-lead font-extrabold leading-tight">{e.name}</h2>
                    <p className="text-meta text-ink-soft">{e.domains.map((d) => domainLabel[d]).join(' · ')}</p>
                  </div>
                  <code className="text-meta text-ink-soft">{e.id}</code>
                </div>
                <p className="text-meta mt-2">{e.instructions(lv)}</p>
                <div className="flex items-center gap-3 mt-3">
                  <button type="button" className="btn-outline !px-0 w-14 shrink-0" aria-label={`${e.name}: livello più facile`} disabled={lv <= 1} onClick={() => actions.setLevel(e.id, lv - 1)}>
                    <Minus size={22} aria-hidden />
                  </button>
                  <div className="flex-1 text-center">
                    <p className="text-lead font-extrabold" aria-live="polite">Livello {lv}</p>
                    <div className="flex gap-1 mt-1" aria-hidden>
                      {Array.from({ length: e.maxLevel }, (_, k) => (
                        <span key={k} className={`h-2 flex-1 rounded-full ${k < lv ? 'bg-leaf' : 'bg-line'}`} />
                      ))}
                    </div>
                  </div>
                  <button type="button" className="btn-outline !px-0 w-14 shrink-0" aria-label={`${e.name}: livello più difficile`} disabled={lv >= e.maxLevel} onClick={() => actions.setLevel(e.id, lv + 1)}>
                    <Plus size={22} aria-hidden />
                  </button>
                </div>
                <button type="button" className="btn-primary w-full mt-3" onClick={() => tryEx([e.id])}>
                  <Play size={20} fill="#fff" aria-hidden /> Prova a livello {lv} di {e.maxLevel}
                </button>
              </Card>
            );
          })}
        </section>

        <Card>
          <h2 className="text-h3 font-extrabold mb-2">Ultime prove</h2>
          {s.devLog.length === 0 ? (
            <p className="text-body text-ink-soft">Nessuna prova ancora.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {s.devLog.map((l) => (
                <li key={l.at} className="rounded-2xl bg-canvas p-3">
                  <p className="text-body font-bold">
                    {exById(l.ex).name} · livello {l.level} → {l.next}
                  </p>
                  <p className="text-meta text-ink-soft">
                    {l.phrase} · {l.correct}/{l.total} · {relativeDay(dayKey(new Date(l.at)))} {new Date(l.at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="text-h3 font-extrabold mb-3">Dati e schermate</h2>
          <div className="flex flex-col gap-3">
            <button type="button" className="btn-outline w-full" onClick={() => seedDemoData()}>Aggiungi 3 settimane di dati di esempio</button>
            <button type="button" className="btn-outline w-full" onClick={resetLevels}>Riporta tutti gli esercizi al livello 1</button>
            <button type="button" className="btn-outline w-full" onClick={clearProgress}>Cancella sessioni e risultati</button>
            <button type="button" className="btn-outline w-full" onClick={() => navigate('/bentornato')}>Mostra la schermata «Bentornato»</button>
            <button type="button" className="btn-outline w-full" onClick={() => navigate('/fine')}>Mostra la fine sessione</button>
            <button type="button" className="btn-outline w-full" onClick={() => { actions.update({ onboarded: false }); navigate('/inizio', { replace: true }); }}>
              Rivedi il primo avvio (i dati restano)
            </button>
          </div>
          <div className="mt-4">
            <Notice tone="sky">Sessioni: {s.sessions.length} · risultati: {s.results.length} · pianta: {s.plant ?? '—'} · gruppo: {s.group?.mode ?? '—'}</Notice>
          </div>
        </Card>

        <button type="button" className="btn-outline w-full" onClick={() => { actions.update({ devUnlocked: false }); navigate('/io', { replace: true }); }}>
          Esci dalla modalità sviluppatore
        </button>
      </div>
    </Screen>
  );
}

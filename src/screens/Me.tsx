// "Io": profilo, leggibilità, gruppo, dati.
import { useState } from 'react';
import { actions, useApp, type Settings } from '../store';
import { Card, Notice, Screen } from '../components/ui';
import { navigate } from '../router';
import { PlantPhoto } from '../art/PlantPhoto';
import { plantName } from '../data/plants';
import { canSpeak } from '../lib/speech';
import { qById } from '../data/questionnaire';
import { UpdateBanner } from '../components/UpdateBanner';
import { VERSION, checkForUpdate, isApp, useUpdate } from '../lib/update';

function Toggle({ label, hint, on, onChange, disabled }: { label: string; hint?: string; on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className="w-full flex items-center justify-between gap-4 min-h-touch py-2 text-left disabled:opacity-50"
    >
      <span className="flex flex-col">
        <span className="text-body font-bold">{label}</span>
        {hint && <span className="text-meta text-ink-soft">{hint}</span>}
      </span>
      <span className={`relative shrink-0 w-[4.25rem] h-10 rounded-full border-2 transition-colors ${on ? 'bg-leaf border-leaf-dark' : 'bg-line border-line-strong'}`} aria-hidden>
        <span className={`absolute top-1 w-7 h-7 rounded-full bg-white shadow transition-all ${on ? 'left-[2.1rem]' : 'left-1'}`} />
      </span>
    </button>
  );
}

const TEXT_OPTS: { id: Settings['text']; label: string }[] = [
  { id: 'normale', label: 'Normale' },
  { id: 'grande', label: 'Grande' },
  { id: 'molto', label: 'Molto grande' },
];

export default function Me() {
  const s = useApp();
  const [confirmReset, setConfirmReset] = useState(false);
  const [taps, setTaps] = useState(0);
  const upd = useUpdate();
  // Come su Android: toccare 5 volte la versione sblocca la modalità sviluppatore.
  function tapVersion() {
    const n = taps + 1;
    setTaps(n);
    if (n >= 5) {
      actions.update({ devUnlocked: true });
      navigate('/sviluppatore');
    }
  }
  const personal = s.personalGoal ? qById(s.personalGoal) : undefined;

  return (
    <Screen nav bar="Profilo">
      <header className="pt-6 pb-4 flex items-center gap-4">
        {s.plant && <PlantPhoto species={s.plant} className="w-20 h-20 shrink-0 border-[3px] border-leaf/30" round />}
        <div>
          <h1 className="text-h1 font-extrabold">{s.name || 'Io'}</h1>
          {s.plant && <p className="text-body text-ink-soft">La tua pianta: {plantName(s.plant).toLowerCase()}</p>}
        </div>
      </header>

      <div className="flex flex-col gap-5">
        <UpdateBanner />
        <Card>
          <h2 className="text-h3 font-extrabold mb-1">Leggibilità</h2>
          <p className="text-body text-ink-soft mb-3">Prova: questo testo cambia mentre scegli.</p>
          <p className="text-body font-bold mb-2">Dimensione del testo</p>
          <div className="grid grid-cols-3 gap-2 mb-4" role="radiogroup" aria-label="Dimensione del testo">
            {TEXT_OPTS.map((o) => (
              <button key={o.id} type="button" role="radio" aria-checked={s.settings.text === o.id} onClick={() => actions.setSettings({ text: o.id })} className="choice !px-2 justify-center text-center !text-meta !font-bold">
                {o.label}
              </button>
            ))}
          </div>
          <div className="divide-y-2 divide-line">
            <Toggle label="Contrasto più forte" on={s.settings.contrast} onChange={(v) => actions.setSettings({ contrast: v })} />
            <Toggle
              label="Leggi ad alta voce le istruzioni"
              hint={canSpeak() ? undefined : 'Non disponibile su questo dispositivo'}
              on={s.settings.voice}
              disabled={!canSpeak()}
              onChange={(v) => actions.setSettings({ voice: v })}
            />
            <Toggle label="Riduci le animazioni" on={s.settings.calm} onChange={(v) => actions.setSettings({ calm: v })} />
          </div>
        </Card>

        <Card>
          <h2 className="text-h3 font-extrabold mb-3">Il mio percorso</h2>
          <p className="text-body"><span className="text-ink-soft">Obiettivo:</span> <strong>{personal?.goal ?? '—'}</strong></p>
          <button type="button" className="btn-outline w-full mt-4" onClick={() => navigate('/questionario')}>Rispondi di nuovo alle domande</button>
        </Card>

        <Card>
          <h2 className="text-h3 font-extrabold mb-1">Il gruppo</h2>
          {s.group?.mode === 'gruppo' ? (
            <>
              <p className="text-body">{s.group.name} · codice <strong>{s.group.code}</strong></p>
              <button type="button" className="btn-outline w-full mt-4" onClick={() => navigate('/invita')}>Invita qualcuno</button>
              <button type="button" className="btn-outline w-full mt-3" onClick={() => actions.setGroup({ mode: 'solo', name: 'Il mio giardino', code: '', members: [], demo: false })}>
                Esci dal gruppo
              </button>
            </>
          ) : (
            <p className="text-body text-ink-soft">Stai usando l'app da solo. Puoi creare un giardino condiviso dalla schermata Giardino.</p>
          )}
        </Card>

        <Card>
          <h2 className="text-h3 font-extrabold mb-1">I tuoi dati</h2>
          <p className="text-body text-ink-soft">Tutto resta su questo telefono: nessun dato viene inviato altrove.</p>
          {!confirmReset ? (
            <button type="button" className="btn-outline w-full mt-4" onClick={() => setConfirmReset(true)}>Ricomincia da capo</button>
          ) : (
            <div className="mt-4 flex flex-col gap-3 fade-up">
              <Notice tone="sun">Vuoi davvero cancellare tutto? Pianta, progressi e risposte andranno persi.</Notice>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" className="btn-outline" onClick={() => setConfirmReset(false)}>No, tieni</button>
                <button
                  type="button"
                  className="btn bg-petal text-white"
                  style={{ boxShadow: '0 4px 0 0 #B82329' }}
                  onClick={() => {
                    actions.resetAll();
                    navigate('/', { replace: true });
                  }}
                >
                  Sì, cancella
                </button>
              </div>
            </div>
          )}
        </Card>
        <Card>
          <h2 className="text-h3 font-extrabold mb-1">Aggiornamenti</h2>
          <p className="text-body">Versione installata: <strong>{VERSION}</strong></p>
          {isApp() ? (
            <>
              <button type="button" className="btn-outline w-full mt-4" disabled={upd.status === 'checking'} onClick={() => checkForUpdate(true)}>
                {upd.status === 'checking' ? 'Controllo in corso…' : 'Controlla se ci sono aggiornamenti'}
              </button>
              {upd.status === 'none' && <p className="text-body font-semibold text-leaf-deep mt-3">Hai già l'ultima versione.</p>}
              {upd.status === 'error' && <p className="text-body text-ink-soft mt-3">Non riesco a controllare: verifica la connessione a internet.</p>}
            </>
          ) : (
            <p className="text-body text-ink-soft mt-1">Nella versione web l'app si aggiorna da sola.</p>
          )}
        </Card>

        {s.devUnlocked && (
          <button type="button" className="btn-outline w-full" onClick={() => navigate('/sviluppatore')}>
            Modalità sviluppatore
          </button>
        )}
        <button type="button" onClick={tapVersion} className="text-meta text-ink-soft text-center px-4 min-h-touch">
          Mente in fiore · versione di prova {VERSION}. Non è un dispositivo medico e non fa diagnosi.
          {taps > 1 && taps < 5 && !s.devUnlocked && <span className="block font-bold">Ancora {5 - taps} tocchi per la modalità sviluppatore</span>}
        </button>
      </div>
    </Screen>
  );
}

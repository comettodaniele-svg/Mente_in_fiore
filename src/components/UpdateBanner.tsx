import { Download } from 'lucide-react';
import { useUpdate } from '../lib/update';

/** Avviso di aggiornamento disponibile, con il pulsante per scaricare il nuovo APK. */
export function UpdateBanner() {
  const { status, info } = useUpdate();
  if (status !== 'available' || !info) return null;
  return (
    <section className="rounded-card p-4 bg-sky-tint border-2 border-sky/40 flex flex-col gap-3 fade-up" role="status">
      <div>
        <p className="text-lead font-extrabold">È disponibile la versione {info.version}</p>
        <p className="text-body text-ink-soft">Si installa sopra quella attuale: i tuoi progressi restano.</p>
      </div>
      <a className="btn-primary w-full" href={info.url}>
        <Download size={22} aria-hidden /> Scarica l'aggiornamento
      </a>
      <p className="text-meta text-ink-soft">Quando il download è finito, tocca il file e scegli «Aggiorna».</p>
    </section>
  );
}

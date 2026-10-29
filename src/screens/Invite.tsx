import { useState } from 'react';
import { MessageCircle, MessageSquare, Megaphone } from 'lucide-react';
import { useApp } from '../store';
import { Notice, Screen, TopBar } from '../components/ui';

export function InviteCard() {
  const s = useApp();
  const [spoken, setSpoken] = useState(false);
  const code = s.group?.code || '—';
  const text = `Ciao! Ho iniziato "Mente in fiore": pochi minuti al giorno per tenere la mente attiva, facendo crescere un giardino insieme. Entra nel mio giardino con il codice ${code}.`;
  return (
    <div className="flex flex-col gap-4">
      <p className="text-body text-ink-soft">Puoi invitare amici, familiari o un nipote. Dai loro questo codice:</p>
      <div className="card text-center !py-6">
        <p className="eyebrow">Codice del giardino</p>
        <p className="text-hero font-extrabold tracking-[0.18em] mt-1 text-leaf-deep" aria-label={`Codice: ${code.split('').join(' ')}`}>{code}</p>
      </div>
      <a className="btn-primary w-full" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer">
        <MessageCircle size={24} aria-hidden /> Invia su WhatsApp
      </a>
      <a className="btn-outline w-full" href={`sms:?&body=${encodeURIComponent(text)}`}>
        <MessageSquare size={24} aria-hidden /> Invia per SMS
      </a>
      <button type="button" className="btn-outline w-full" onClick={() => setSpoken(true)}>
        <Megaphone size={24} aria-hidden /> Dillo a voce
      </button>
      {spoken && (
        <Notice>
          Leggi il codice lettera per lettera: <strong>{code.split('').join(' ')}</strong>
        </Notice>
      )}
      {s.group?.demo && <p className="text-meta text-ink-soft">In questa versione di prova il codice non collega ancora telefoni diversi.</p>}
    </div>
  );
}

export default function Invite() {
  return (
    <Screen>
      <TopBar title="Invita qualcuno" />
      <InviteCard />
    </Screen>
  );
}

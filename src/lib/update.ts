// Aggiornamenti dell'app Android: all'apertura controlla l'ultima "Release" su GitHub
// e, se c'è una versione più recente, propone di scaricare il nuovo APK.
// Ogni APK è firmato con la stessa chiave, quindi si installa sopra il precedente senza perdere i dati.
import { useSyncExternalStore } from 'react';
import { Capacitor } from '@capacitor/core';

const REPO = 'comettodaniele-svg/Mente_in_fiore';

/** Numero di build, inserito da GitHub durante la costruzione (0 in sviluppo). */
export const BUILD = Number(import.meta.env.VITE_BUILD ?? 0) || 0;
export const VERSION = BUILD ? `0.1.${BUILD}` : 'sviluppo';

export const isApp = () => Capacitor.isNativePlatform();

export interface UpdateInfo {
  version: string;
  build: number;
  url: string;
  notes: string;
}

type Status = 'idle' | 'checking' | 'none' | 'available' | 'error';

let status: Status = 'idle';
let info: UpdateInfo | null = null;
let checkedAt = 0;
const listeners = new Set<() => void>();
let snapshot: { status: Status; info: UpdateInfo | null } = { status, info };

function emit() {
  snapshot = { status, info };
  listeners.forEach((l) => l());
}

const PREFIX = `https://github.com/${REPO}/releases/download/`;

function valid(build: unknown, url: unknown): build is number {
  return Number.isInteger(build) && (build as number) > 0 && typeof url === 'string' && url.startsWith(PREFIX) && url.endsWith('.apk');
}

/** 1) Il file version.json che GitHub pubblica a ogni build sul ramo "update" (nessun limite di richieste). */
async function fromVersionFile(): Promise<UpdateInfo | null> {
  try {
    const r = await fetch(`https://raw.githubusercontent.com/${REPO}/update/version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!r.ok) return null;
    const v = await r.json();
    const build = Number(v?.build);
    if (!valid(build, v?.apk)) return null;
    return { version: `0.1.${build}`, build, url: String(v.apk), notes: '' };
  } catch {
    return null;
  }
}

/** 2) In alternativa, l'ultima Release tramite l'API di GitHub (al massimo 60 richieste l'ora per rete). */
async function fromReleasesApi(): Promise<UpdateInfo | null> {
  const r = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { cache: 'no-store' });
  if (!r.ok) throw new Error(`GitHub ha risposto ${r.status}`);
  const rel = await r.json();
  const m = String(rel.tag_name ?? '').match(/^v?0\.1\.(\d{1,6})$/);
  const asset = (rel.assets ?? []).find((a: { name: string }) => /\.apk$/i.test(a.name));
  const build = m ? Number(m[1]) : 0;
  const url = asset?.browser_download_url;
  return valid(build, url) ? { version: `0.1.${build}`, build, url: String(url), notes: String(rel.body ?? '') } : null;
}

export async function checkForUpdate(force = false): Promise<void> {
  if (!isApp() && !force) return; // la versione web è sempre aggiornata
  if (status === 'checking') return;
  if (!force && Date.now() - checkedAt < 30 * 60 * 1000) return;
  status = 'checking';
  emit();
  try {
    const latest = (await fromVersionFile()) ?? (await fromReleasesApi());
    checkedAt = Date.now();
    if (latest && latest.build > BUILD) {
      info = latest;
      status = 'available';
    } else {
      info = null;
      status = 'none';
    }
  } catch (e) {
    console.warn('Controllo aggiornamenti non riuscito:', e);
    status = 'error'; // senza rete: nessun messaggio invadente
  }
  emit();
}

export function useUpdate() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => snapshot,
  );
}

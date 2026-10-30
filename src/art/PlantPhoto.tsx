// Le piante si mostrano solo con le immagini fornite (create con Gemini), ritagliate o leggermente modificate.
// Gli stadi di crescita si ottengono dalla stessa foto:
//  0 Seme       → la parte dell'aiuola con la sola terra (in alto a sinistra in ogni foto)
//  1-3          → la foto della pianta, più chiara e meno colorata, che si "accende" stadio dopo stadio
//  4 Fiori      → la foto originale
// Se in futuro arrivano foto per ogni stadio, basta aggiungerle in STAGE_PHOTOS.
import type { CSSProperties } from 'react';
import { PLANT_PHOTO } from './illustration';
import type { PlantId } from '../data/plants';

/** Foto opzionali per i singoli stadi: { pomodoro: { 2: '...' } }. */
export const STAGE_PHOTOS: Partial<Record<PlantId, Partial<Record<number, string>>>> = {};

const VEIL = [0, 0.5, 0.32, 0.14, 0];
const SATURATION = [1, 0.3, 0.55, 0.8, 1];

export function PlantPhoto({
  species,
  stage = 4,
  className = '',
  round = false,
  label,
  framing = 'plant',
}: {
  species: PlantId;
  stage?: number;
  className?: string;
  round?: boolean;
  label?: string;
  /** 'plant': stretto sulla pianta (per icone e cerchi); 'scene': tutta l'aiuola. */
  framing?: 'plant' | 'scene';
}) {
  const st = Math.max(0, Math.min(4, stage));
  const own = STAGE_PHOTOS[species]?.[st];
  const src = own ?? PLANT_PHOTO[species];
  let img: CSSProperties;
  if (own) {
    img = { objectPosition: '50% 50%' };
  } else if (st === 0) {
    // Solo terra: ingrandisce l'aiuola vuota in alto a sinistra della foto.
    img = { objectPosition: '0% 25%', transform: 'scale(3) translate(30%, 25%)' };
  } else {
    img =
      framing === 'plant'
        ? { objectPosition: '56% 50%', transform: 'scale(1.35)', transformOrigin: '56% 50%' }
        : { objectPosition: '50% 50%' };
    img.filter = `saturate(${SATURATION[st]})`;
  }
  return (
    <span
      className={`relative block overflow-hidden ${round ? 'rounded-full' : ''} ${className}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" style={img} draggable={false} />
      {!own && VEIL[st] > 0 && <span className="absolute inset-0 bg-white" style={{ opacity: VEIL[st] }} />}
    </span>
  );
}

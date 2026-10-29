export type PlantId =
  | 'rosa'
  | 'girasole'
  | 'lavanda'
  | 'ulivo'
  | 'limone'
  | 'glicine'
  | 'tulipano'
  | 'ciclamino';

export type Species = PlantId | 'melograno';

export interface PlantInfo {
  id: PlantId;
  name: string;
  /** Una riga sul carattere della pianta, mostrata nella scelta. */
  note: string;
}

export const PLANTS: PlantInfo[] = [
  { id: 'girasole', name: 'Girasole', note: 'Alto e solare' },
  { id: 'rosa', name: 'Rosa', note: 'Classica e profumata' },
  { id: 'lavanda', name: 'Lavanda', note: 'Calma e resistente' },
  { id: 'ulivo', name: 'Ulivo', note: 'Paziente, dura una vita' },
  { id: 'limone', name: 'Limone', note: 'Fiori bianchi, frutti gialli' },
  { id: 'glicine', name: 'Glicine', note: 'Grappoli che scendono' },
  { id: 'tulipano', name: 'Tulipano', note: 'Elegante e semplice' },
  { id: 'ciclamino', name: 'Ciclamino', note: 'Fiorisce anche d\'inverno' },
];

export const plantName = (id: Species) =>
  id === 'melograno' ? 'Melograno' : PLANTS.find((p) => p.id === id)?.name ?? id;

export const STAGES = ['Seme', 'Germoglio', 'Foglie', 'Boccioli', 'Fiori'] as const;

/** Sessioni totali necessarie per arrivare a ciascuno stadio della pianta personale. */
export const PERSONAL_STAGE_AT = [0, 1, 4, 8, 13];

export function personalStage(totalSessions: number): { stage: number; blooms: number } {
  let stage = 0;
  PERSONAL_STAGE_AT.forEach((t, i) => {
    if (totalSessions >= t) stage = i;
  });
  // Dopo la fioritura, un fiore in più ogni 3 sessioni (fino a 6).
  const blooms = stage === 4 ? Math.min(6, Math.floor((totalSessions - 13) / 3)) : 0;
  return { stage, blooms };
}

export interface DecorInfo {
  id: string;
  name: string;
  /** Settimane attive necessarie. */
  weeks: number;
}

export const DECORATIONS: DecorInfo[] = [
  { id: 'cartellino', name: 'Cartellino col nome', weeks: 0 },
  { id: 'vaso', name: 'Vaso di terracotta', weeks: 1 },
  { id: 'panchina', name: 'Panchina', weeks: 2 },
  { id: 'sassi', name: 'Sassi colorati', weeks: 3 },
  { id: 'lanterna', name: 'Lanterna', weeks: 4 },
  { id: 'casetta', name: 'Casetta per uccelli', weeks: 6 },
];

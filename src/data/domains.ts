export type Domain =
  | 'attenzione'
  | 'velocita'
  | 'lavoro'
  | 'memoria'
  | 'prospettica'
  | 'esecutive'
  | 'linguaggio'
  | 'spaziale';

export const domainLabel: Record<Domain, string> = {
  attenzione: 'Attenzione',
  velocita: 'Velocità',
  lavoro: 'Memoria di lavoro',
  memoria: 'Memoria',
  prospettica: 'Ricordarsi di fare',
  esecutive: 'Controllo e ragionamento',
  linguaggio: 'Parole',
  spaziale: 'Orientamento',
};

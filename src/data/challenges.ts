// Sfide della settimana fuori dall'app, a rotazione.
export interface Challenge {
  title: string;
  text: string;
  /** Versione per chi usa l'app da solo. */
  solo: string;
}

export const CHALLENGES: Challenge[] = [
  { title: 'Una passeggiata insieme', text: 'Anche solo in due, quando vi va questa settimana.', solo: 'Una passeggiata in un posto che ti piace, magari con qualcuno.' },
  { title: 'Un ricordo di scuola', text: 'Raccontatevi un ricordo dei tempi della scuola, a voce o per telefono.', solo: 'Racconta a qualcuno un ricordo dei tempi della scuola.' },
  { title: 'Una ricetta di famiglia', text: 'Scambiatevi una ricetta di famiglia e provate a cucinarla.', solo: 'Cucina una ricetta di famiglia che non fai da tempo.' },
  { title: 'Una telefonata inattesa', text: 'Chiamate una persona che non sentite da un po\'.', solo: 'Chiama una persona che non senti da un po\'.' },
  { title: 'Un nuovo percorso', text: 'Fate un giro in una zona del quartiere che conoscete poco.', solo: 'Fai un giro in una zona del quartiere che conosci poco.' },
  { title: 'Una canzone di una volta', text: 'Ascoltate insieme una canzone della vostra giovinezza e raccontate dove eravate.', solo: 'Ascolta una canzone della tua giovinezza e ricorda dove eri.' },
];

export function challengeForWeek(weekKey: string): Challenge {
  const n = Number(weekKey.split('W')[1] ?? 0);
  return CHALLENGES[n % CHALLENGES.length];
}

export const QUICK_REPLIES = ['Bravi tutti!', 'Ti penso', 'Grazie'] as const;

export const MOTIVATIONS = [
  { id: 'indipendenza', label: 'Restare indipendente' },
  { id: 'nipoti', label: 'Stare dietro ai nipoti' },
  { id: 'lettura', label: 'Leggere senza stancarmi' },
  { id: 'forma', label: 'Tenere la mente in forma' },
] as const;

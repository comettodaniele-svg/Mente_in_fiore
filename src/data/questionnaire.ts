import type { Domain } from './domains';

// Situazioni quotidiane, formulate senza linguaggio medico.
// goal: come la situazione diventa un obiettivo positivo, con le parole della persona.
// challenge: la piccola sfida nella vita reale collegata.

export interface QItem {
  id: string;
  text: string;
  domains: Domain[];
  goal: string;
  challenge: string;
}

export const QUESTIONS: QItem[] = [
  {
    id: 'lettura',
    text: 'Perdo il filo quando leggo una pagina di un libro o del giornale',
    domains: ['attenzione'],
    goal: 'Leggere senza distrarmi',
    challenge: 'Leggi una pagina intera di fila, con il telefono in un\'altra stanza',
  },
  {
    id: 'spesa',
    text: 'Dimentico cosa dovevo comprare se le cose sono più di quattro',
    domains: ['lavoro', 'memoria'],
    goal: 'Ricordare la lista della spesa',
    challenge: 'Fai la spesa senza guardare la lista, tenendola in tasca di riserva',
  },
  {
    id: 'nomi',
    text: 'Dimentico il nome di persone conosciute da poco',
    domains: ['memoria'],
    goal: 'Ricordare i nomi',
    challenge: 'Usa il nome di una persona nuova prima di salutarla',
  },
  {
    id: 'appuntamenti',
    text: 'Mi capita di dimenticare un appuntamento o una cosa da fare',
    domains: ['prospettica'],
    goal: 'Ricordarmi degli impegni',
    challenge: 'Ricorda gli impegni della settimana senza guardare il calendario, poi controlla',
  },
  {
    id: 'stanza',
    text: 'Entro in una stanza e non ricordo cosa ci sono andato a fare',
    domains: ['prospettica', 'lavoro'],
    goal: 'Ricordare cosa stavo per fare',
    challenge: 'Prima di cambiare stanza, ripeti a mezza voce cosa vai a fare',
  },
  {
    id: 'lento',
    text: 'Mi sento più lento di prima nelle cose di tutti i giorni',
    domains: ['velocita'],
    goal: 'Sentirmi più pronto',
    challenge: 'Fai un gioco di carte o un rompicapo veloce con qualcuno',
  },
  {
    id: 'conversazione',
    text: 'Faccio fatica a seguire una conversazione con più persone',
    domains: ['lavoro', 'attenzione'],
    goal: 'Seguire le conversazioni',
    challenge: 'A una cena o una telefonata, riassumi a te stesso cosa si è detto',
  },
  {
    id: 'organizzare',
    text: 'Fatico a organizzare le cose da fare in una giornata',
    domains: ['esecutive'],
    goal: 'Organizzare la giornata',
    challenge: 'La sera scrivi tre cose da fare domani, in ordine',
  },
  {
    id: 'abitudine',
    text: 'Faccio una cosa per abitudine anche quando volevo fare diversamente',
    domains: ['esecutive'],
    goal: 'Fermarmi prima di fare in automatico',
    challenge: 'Cambia una piccola abitudine per un giorno, per esempio un percorso diverso',
  },
  {
    id: 'parola',
    text: 'Cerco una parola e non mi viene',
    domains: ['linguaggio'],
    goal: 'Trovare le parole',
    challenge: 'Racconta a qualcuno un film o un libro che ti è piaciuto',
  },
  {
    id: 'orientamento',
    text: 'Mi oriento con difficoltà in un posto nuovo',
    domains: ['spaziale'],
    goal: 'Orientarmi meglio',
    challenge: 'Fai un percorso nuovo nel quartiere e torna senza aiuti',
  },
  {
    id: 'oggetti',
    text: 'Non ricordo dove ho messo occhiali, chiavi o telefono',
    domains: ['memoria', 'spaziale'],
    goal: 'Ritrovare le mie cose',
    challenge: 'Scegli un posto fisso per le chiavi e usalo tutta la settimana',
  },
];

export type Answer = 0 | 1 | 2 | null; // mai, a volte, spesso, non mi riguarda

export const ANSWER_LABEL: Record<string, string> = {
  '0': 'Mai',
  '1': 'A volte',
  '2': 'Spesso',
  null: 'Non mi riguarda',
};

export const answerText = (a: Answer | undefined) =>
  a === undefined ? '—' : ANSWER_LABEL[String(a)];

export const qById = (id: string) => QUESTIONS.find((q) => q.id === id);

# Mente in fiore

Allenamento della mente per persone dai 60 anni in su: pochi minuti al giorno, un giardino da far crescere insieme.

**Versione di prova (0.1).** Tutti i dati restano sul telefono. Il gruppo è simulato con quattro amici di esempio: non c'è ancora un collegamento tra telefoni diversi. Non è un dispositivo medico e non fa diagnosi.

## Come provarla

- **Sul web:** la versione online è su GitHub Pages (Settings → Pages mostra l'indirizzo).
- **Su Android:** nella sezione *Releases* scarica `MenteInFiore.apk` e aprila sul telefono.

Entrambe si aggiornano da sole a ogni modifica sul ramo `main`.

## Cosa c'è

- **Primo avvio:** nome, il proprio "perché", 12 situazioni quotidiane (mai / a volte / spesso / non mi riguarda), scelta dell'obiettivo personale, scelta della pianta, gruppo o uso da soli.
- **Sessione del giorno:** 3 esercizi scelti in base alle situazioni indicate, al massimo 2 sessioni al giorno.
- **8 esercizi adattivi** (la difficoltà sale o scende in base ai risultati):

| Esercizio | Allena | Modello di riferimento |
| --- | --- | --- |
| Colpo d'occhio | Velocità, sguardo laterale | Campo visivo utile (studio ACTIVE) |
| Il sentiero dei sassi | Memoria di lavoro visuo-spaziale | Blocchi di Corsi |
| Come prima? | Aggiornamento della memoria di lavoro | n-back |
| Trova i girasoli | Attenzione selettiva + ricordarsi di fare | Ricerca visiva + memoria prospettica |
| La lista della spesa | Memoria verbale | Apprendimento e riconoscimento di liste |
| Solo i fiori | Controllo degli impulsi | Go/No-Go |
| Cosa viene dopo? | Ragionamento | Completamento di serie |
| Parole del giardino | Linguaggio | Categorie e accesso al lessico |

- **Giardino condiviso:** melograno comune che cresce con le sessioni della settimana, un'aiuola per persona, risposte rapide, sfida settimanale fuori dall'app.
- **Angolo personale:** la pianta in 5 stadi (non appassisce mai) e decorazioni che si sbloccano con le settimane attive.
- **Progressi:** giorni attivi del mese, obiettivo personale a 5 gradini, confronto del questionario dopo un mese, risultati migliori.
- **Leggibilità:** testo normale / grande / molto grande, contrasto forte, lettura ad alta voce, animazioni ridotte.

Scelte di design: niente punti, medaglie, classifiche o contatori di giorni consecutivi; le pause non vengono punite.

## Per sviluppatori

```bash
npm install
npm run dev          # versione web in locale
npm run build        # build in dist/
npm run android:sync # copia la build nel progetto Android (poi apri android/ con Android Studio)
```

Tecnologie: React + TypeScript + Vite + Tailwind; Capacitor per Android. Stile da Google Stitch ("Tactile Botanical").

# Tris (Tic-Tac-Toe) Web Game

Un'applicazione web autonoma del gioco Tris (Tic-Tac-Toe) sviluppata in HTML5, CSS3 e JavaScript ES6 standard, senza dipendenze runtime esterne (offline al 100%).

## Caratteristiche e Requisiti

- **Griglia 3x3**: Il giocatore umano gioca con il simbolo **X** e inizia per primo; il computer gioca con **O**.
- **Tre Livelli di Difficoltà**:
  - **Facile**: Scelta casuale con distribuzione uniforme tra le caselle libere.
  - **Medio**: Ricerca prioritaria di una vittoria immediata per 'O', blocco prioritario di una vittoria immediata per 'X', altrimenti fallback su mossa libera.
  - **Difficile**: Algoritmo Minimax a informazione perfetta; garanzia matematica di invincibilità (nessuna sconfitta possibile contro qualsiasi sequenza legale di mosse).
- **Validazione Mosse e Gestione Turni**: Rifiuto di mosse su caselle occupate o a partita terminata; inibizione dell'input durante l'elaborazione del computer.
- **Rilevamento Fine Partita ed Esito**: Identificazione di vittoria orizzontale, verticale, diagonale o pareggio; evidenziazione del tris vincente e messaggi espliciti.
- **Accessibilità e Usabilità**: Controlli accessibili tramite tastiera (`Enter`/`Space`), semantica ARIA (`role="grid"`, `role="gridcell"`, `aria-label`, `aria-disabled`, `aria-live="polite"`), e layout responsive per desktop e dispositivi mobili.
- **Separazione Architetturale**: Modulo logico dell'engine (`engine.js`) e modulo decisionale AI (`ai.js`) completamente disaccoppiati dal DOM e testabili in Node.js.

## Struttura del Progetto

```
.
├── build.js                 # Script di build per generare la cartella dist/
├── index.html               # File HTML principale accessibile e semantico
├── mozart-software.json     # Manifest di profilo web-game per Mozart
├── package.json             # Configurazione npm (test e build scripts)
├── style.css                # Foglio di stile responsive e accessibile
├── src/
│   ├── ai.js                # Algoritmi decisionali (Facile, Medio, Difficile Minimax)
│   ├── app.js               # Entry point browser che inizializza la UI
│   ├── engine.js            # Engine di gioco puro privo di effetti collaterali
│   └── ui_controller.js     # Gestore eventi, accessibilità e rendering
└── test/
    ├── ai.test.js           # Test suite AI e simulazione esaustiva albero Minimax
    ├── engine.test.js       # Test suite per regole, transizioni e condizioni terminali
    └── ui_controller.test.js# Test suite per controller UI e interazioni
```

## Esecuzione e Test

### Esecuzione dei Test Automatizzati
I test utilizzano il test runner nativo di Node.js (`node:test`):
```bash
npm test
```

I test coprono:
1. Creazione dello stato iniziale, validazione mosse, rilevamento vittoria per righe, colonne, diagonali e pareggio.
2. Rifiuto di mosse non valide (celle occupate, turni errati, indici fuori scala, gioco terminato).
3. Priorità delle scelte dell'AI a livello Medio (vittoria immediata vs blocco vs fallback).
4. Verifica esaustiva dell'invincibilità dell'algoritmo Minimax a livello Difficile (esplorazione esaustiva dell'intero albero di gioco legale: l'umano non vince mai).
5. Comportamento del controller UI (rendering, click su celle occupate ignorati, blocco input durante il turno AI, reset e navigazione da tastiera).

### Build del Profilo Web-Game
Per creare l'artifact pronto per la distribuzione nella cartella `dist/`:
```bash
npm run build
```

Il manifest `mozart-software.json` configura il profilo `web-game` per l'integrazione continua in Mozart.

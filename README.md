# sbb-clock
# Tobia Miniutti – Progetti Web e Sperimentazioni Tecniche

Questo repository contiene il codice sorgente del mio sito personale, sviluppato per raccogliere e presentare progetti informatici, prototipi e sperimentazioni front-end. L'obiettivo è mantenere una base pulita, accessibile e facilmente estendibile, utile come portfolio tecnico ed esercitazione pratica.

## Descrizione

Il sito è composto da una struttura semplice in HTML, CSS e JavaScript. Non utilizza framework complessi o build tool, per garantire portabilità, caricamento immediato e compatibilità completa con GitHub Pages. Ogni progetto ha una sua pagina dedicata e una logica modulare.

## Progetti attivi

### SBB Clock

Replica interattiva e fedele dell’orologio delle Ferrovie Federali Svizzere (SBB).  
Implementato in JavaScript puro, include:

- sincronizzazione con il tempo reale
- lancetta dei secondi con effetto "scatto ritardato" originale SBB
- pulsante fullscreen visibile e funzionante su tutti i dispositivi (tranne iPhone: è stata appositamente progettata una funzione per nascondere il menù azioni)
- supporto per il tasto F da tastiera
- layout responsivo desktop e mobile

### Diritti

Sezione con informativa legale sull'uso dell’orologio digitale SBB e riferimenti ufficiali alla documentazione pubblica fornita dalle Ferrovie Svizzere (incluse licenze e condizioni d’uso del design originale).

### Home

Pagina introduttiva con una panoramica dei progetti pubblicati e link diretti alle sezioni interne del sito.

## Struttura del progetto

/
├── index.html          # Pagina principale
├── clock.html          # Progetto SBB Clock
├── diritti.html        # Informazioni legali
├── sbbUhr-1.3.js       # Logica orologio
├── style.css           # Foglio di stile globale
├── favicon.png         # Icona del sito
└── assets/             # File multimediali e immagini

## Tecnologie utilizzate

- HTML5 semantico
- CSS3 con media queries e layout responsive
- JavaScript (ES5/ES6) senza dipendenze esterne
- Hosting tramite GitHub Pages

## Obiettivi del progetto

- Centralizzare e documentare in modo chiaro i progetti web sviluppati individualmente
- Utilizzare codice leggibile e facilmente manutenibile
- Offrire esempi concreti di interfacce dinamiche, ottimizzate e multipiattaforma

## Hosting

Il sito è ospitato su GitHub Pages. Ogni modifica al branch `main` viene automaticamente riflessa online.

## Licenza

Questo repository è distribuito con licenza MIT.  
Per maggiori dettagli, consultare il file `LICENSE`.

## Contatti

Autore: Tobia Miniutti  
Email: [tobia.miniutti@gmail.com]  
GitHub: [https://github.com/tobiaminiutti](https://github.com/tobiaminiutti)
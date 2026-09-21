# miniutti.it

Portfolio statico di Tobia Miniutti, progettato per GitHub Pages su `https://miniutti.it`.

Il sito usa HTML, CSS e JavaScript senza framework o dipendenze runtime. La home è costruita come un giardino illustrato a livelli, con parallax progressivo e una navigazione liquid-glass dotata di fallback leggibile. I tre casi studio sono generati da una fonte dati unica; il modulo contatti viene validato e inoltrato da un Cloudflare Worker separato.

## Struttura

- `content/`: contenuti verificati dei progetti.
- `public/`: sorgenti statiche e copie direttamente ispezionabili delle pagine.
- `scripts/`: generazione, build, validazione, preview, budget e browser QA.
- `cloudflare-worker/`: endpoint `/api/contact`, limiti, Turnstile e inoltro verso Make.
- `dist/`: output statico generato e pronto per GitHub Pages.
- `docs/`: decisioni, provenienza asset, risultati di verifica e istruzioni operative.
- `source-assets/`: sorgenti grafiche e materiale storico escluso dal deploy.

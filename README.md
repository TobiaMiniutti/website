# miniutti.it

Portfolio statico di Tobia Miniutti, progettato per GitHub Pages su `https://miniutti.it`.

Il sito usa HTML, CSS e JavaScript senza framework o dipendenze runtime. La home è costruita come un giardino illustrato a livelli, con parallax progressivo e una navigazione liquid-glass dotata di fallback leggibile. I tre casi studio sono generati da una fonte dati unica; il modulo contatti viene validato e inoltrato da un Cloudflare Worker separato.

## Avvio locale

Requisiti: Node.js 22 o successivo e npm.

```bash
npm ci
npm run check
npm run preview
```

Apri `http://127.0.0.1:4173/`. L’anteprima serve esclusivamente `dist/`, cioè lo stesso tipo di artefatto usato dal deploy.

`npm run build` usa la site key di test ufficiale di Turnstile. L’output ottenuto è adatto esclusivamente all’anteprima locale e non deve essere pubblicato. La build non invia messaggi reali. Una build di produzione richiede una site key pubblica reale:

```bash
TURNSTILE_SITE_KEY="la-site-key-pubblica" npm run build:production
```

In PowerShell:

```powershell
$env:TURNSTILE_SITE_KEY = "la-site-key-pubblica"
npm run build:production
Remove-Item Env:TURNSTILE_SITE_KEY
```

Il cellulare pubblico è facoltativo. Se approvato, configura insieme `MOBILE_PHONE_DISPLAY` e `MOBILE_PHONE_TEL`; in caso contrario non viene mostrato alcun placeholder.

## Comandi

- `npm run generate:projects` aggiorna le copie statiche dei tre casi studio in `public/` a partire da `content/projects.mjs` e dagli screenshot scoperti automaticamente.
- `npm run build` crea `dist/`, genera i casi studio, sostituisce le variabili pubbliche e calcola gli hash CSP per gli script JSON-LD inline.
- `npm run build:production` applica gli stessi passaggi ma rifiuta le key Turnstile ufficiali di test.
- `npm test` valida sorgenti, JavaScript, generazione delle gallerie e Worker.
- `npm run check` crea e valida l’artefatto e poi esegue tutti i test automatici.
- `npm run preview` serve `dist/` con una policy esplicita per slash, file HTML e 404.
- `npm run report:budgets` misura dimensioni raw e gzip rispetto ai budget del progetto.
- `npm run browser:qa` esegue route, responsive, tastiera, mock del form e screenshot quando `PLAYWRIGHT_MODULE_PATH` e `CHROME_PATH` puntano a installazioni locali disponibili.

## Struttura

- `content/`: contenuti verificati dei progetti.
- `public/`: sorgenti statiche e copie direttamente ispezionabili delle pagine.
- `scripts/`: generazione, build, validazione, preview, budget e browser QA.
- `cloudflare-worker/`: endpoint `/api/contact`, limiti, Turnstile e inoltro verso Make.
- `dist/`: output statico generato e pronto per GitHub Pages.
- `docs/`: decisioni, provenienza asset, risultati di verifica e istruzioni operative.
- `source-assets/`: sorgenti grafiche e materiale storico escluso dal deploy.

## Artwork e screenshot

Le sei sorgenti botaniche sono conservate in `source-assets/botanical/`. Per rigenerare AVIF, WebP e immagine social occorre rendere disponibile Sharp e lanciare:

```powershell
$env:SHARP_MODULE_PATH = "file:///percorso/al/modulo/sharp/dist/index.cjs"
node scripts/optimize-botanical-assets.mjs
Remove-Item Env:SHARP_MODULE_PATH
```

Le gallerie accettano screenshot autentici con nomi `screenshot-N.png|jpg|jpeg|webp|avif`. Cartelle, controlli, didascalie e flusso di pubblicazione sono descritti in [SCREENSHOTS.md](SCREENSHOTS.md). In assenza di immagini, la pagina non genera alcun segnaposto.

## Documentazione

- [Implementazione e verifiche](docs/IMPLEMENTATION_REPORT.md)
- [Asset e licenze](docs/ASSETS.md)
- [Screenshot dei progetti](SCREENSHOTS.md)
- [Avvisi di terze parti](THIRD_PARTY_NOTICES.md)
- [Deploy GitHub Pages e Worker](docs/DEPLOYMENT.md)
- [Misurazione post-lancio](docs/POST_LAUNCH_MEASUREMENT.md)
- [Stato di avanzamento](docs/PROGRESS.md)

Nessun DNS, segreto, servizio esterno o ambiente di produzione viene modificato dai comandi locali.

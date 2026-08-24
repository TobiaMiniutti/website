# miniutti.it

Portfolio statico di Tobia Miniutti. Il sito usa HTML semantico, CSS modulare e piccoli moduli JavaScript senza framework runtime.

## Sviluppo

Richiede Node.js 22 o successivo.

```bash
npm run build
npm test
npm run preview
```

Il deploy pubblica esclusivamente `public/`. I metadati canonici dei progetti sono in `content/projects/`; `npm run build` valida i campi e rigenera la sitemap. Il validatore controlla che le pagine statiche siano sincronizzate con la fonte dati.

## Progetti

Ogni file JSON richiede: `slug`, `title`, `category`, `status`, `summary`, `role`, `scope`, `technologies`, `cover`, `context`, `approach` e `outcome`. Non inserire clienti, date, tecnologie o risultati senza una fonte verificabile. Immagini e file pubblici vanno in `public/assets/`; non pubblicare archivi sorgente, credenziali o documenti interni.

## Configurazione pubblica

Le variabili Actions richieste sono `TURNSTILE_SITE_KEY` e `MOBILE_PHONE_DISPLAY`. `GA_MEASUREMENT_ID` è facoltativa: se assente o non valida, Analytics resta disattivato. I segreti Worker restano descritti in `docs/DEPLOYMENT.md`.

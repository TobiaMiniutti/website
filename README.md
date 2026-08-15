# miniutti.it

Sito statico di Tobia Miniutti, con design originale preservato e struttura di pubblicazione separata dalla logica server-side. La V3 migliora contenuti, footer, metadati social, protezione anti-abuso e affidabilità del modulo contatti.

## Struttura

- `public/`: unico contenuto distribuito da GitHub Pages
- `cloudflare-worker/`: endpoint sicuro del modulo contatti
- `.github/workflows/`: validazione e deploy automatici
- `scripts/`: controlli contro regressioni e ripubblicazione di contenuti legacy
- `docs/DEPLOYMENT.md`: configurazione completa

## Contenuti pubblici

Il deploy contiene soltanto Home, Contatti, Privacy, conferma invio e 404. Login, dashboard, vecchi progetti, test e demo non sono inclusi.

## Avvio rapido

Consulta [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). Prima del deploy sono obbligatori la site key Turnstile, il numero mobile corrente e le credenziali Cloudflare indicate nella guida.

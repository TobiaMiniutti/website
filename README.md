# miniutti.it

Sito statico di Tobia Miniutti, con design originale preservato e struttura di pubblicazione separata dalla logica server-side.

## Struttura

- `public/`: unico contenuto distribuito da GitHub Pages
- `cloudflare-worker/`: endpoint sicuro del modulo contatti
- `.github/workflows/`: validazione e deploy automatici
- `scripts/`: controlli contro regressioni e ripubblicazione di contenuti legacy
- `docs/DEPLOYMENT.md`: configurazione completa

## Contenuti pubblici

Il deploy contiene soltanto Home, Contatti, Privacy, conferma invio e 404. Login, dashboard, vecchi progetti, test e demo non sono inclusi.

## Avvio rapido

Consulta [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). Prima del deploy sono obbligatorie la site key Turnstile e le credenziali Cloudflare indicate nella guida.

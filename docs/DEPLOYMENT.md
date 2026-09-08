# Distribuzione di miniutti.it

## Sito su GitHub Pages

Il workflow canonico è `.github/workflows/deploy-pages.yml`. Usa Node 22, `npm ci`, type-check, test, build, pre-render e validazione prima di caricare esclusivamente `dist/`.

In **Settings → Pages** selezionare GitHub Actions. In **Settings → Secrets and variables → Actions → Variables** configurare:

- `TURNSTILE_SITE_KEY`: site key pubblica autorizzata per `miniutti.it` e `www.miniutti.it`;
- `MOBILE_PHONE_DISPLAY`: recapito mobile pubblico;
- `GA_MEASUREMENT_ID`: facoltativo, solo nel formato GA4 `G-...`;
- `GA_DATA_RETENTION`: obbligatorio se GA4 è attivo, con il valore verificato nella proprietà.

Il workflow ricava il formato `tel:` del cellulare e interrompe il deploy per chiavi di test, placeholder o configurazioni GA incomplete. `CNAME` viene copiato nel risultato Vite.

## Worker Cloudflare

Il workflow indipendente `.github/workflows/deploy-worker.yml` pubblica il Worker su:

- `miniutti.it/api/contact`
- `www.miniutti.it/api/contact`

Actions secrets richiesti:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `TURNSTILE_SECRET_KEY`
- `MAKE_WEBHOOK_URL`

Il Worker applica origine esatta, schema e lunghezze, honeypot, verifica Turnstile con azione e hostname, massimo tre invii al minuto per email e sessanta complessivi, timeout e tre tentativi di inoltro. I log non devono contenere messaggio, email o token.

## DNS, redirect e header

Il dominio deve rimanere compatibile con GitHub Pages e attraversare Cloudflare perché la route Worker intercetti `/api/contact`. Mantenere il redirect permanente da `www.miniutti.it/*` a `https://miniutti.it/${1}`.

Configurare e verificare sulle risposte Cloudflare:

- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` solo dopo verifica HTTPS di tutti i sottodomini;
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: strict-origin-when-cross-origin`;
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`;
- `X-Frame-Options: DENY`;
- CSP coerente con `SECURITY.md`.

Una meta CSP non garantisce `frame-ancestors`: il controllo clickjacking deve essere un header di risposta effettivo.

## Collaudo dopo il deploy

- verificare Home, indice progetti, quattro dettagli, Privacy, Preferenze e 404;
- provare menu mobile, ancore e URL diretti;
- rifiutare gli analitici e confermare zero richieste Google e zero cookie GA;
- accettare e verificare un solo caricamento GA4, poi revocare;
- inviare il modulo, verificare Turnstile, gestione errori e conferma;
- controllare header reali dal dominio pubblico;
- confermare che `dist/` non contenga placeholder, webhook, segreti o indirizzi interni.

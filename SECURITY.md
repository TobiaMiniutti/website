# Sicurezza

Segnalazioni: **tobia@miniutti.it**.

## Principi

- Nessun segreto nel client, nelle variabili Vite o nel repository.
- Verifica Turnstile obbligatoria nel Worker con origine, hostname e azione esatti.
- Schema chiuso, limiti di dimensione, honeypot e rate limiting server-side.
- Timeout, retry limitati, risposte non memorizzabili e log minimizzati.
- Nessun login o pannello amministrativo pubblico.
- Contenuti progetto tipizzati e controllati a build time; nessun HTML utente.
- Analitici assenti prima del consenso esplicito e revocabili.

## Content Security Policy

La meta CSP permette solo risorse locali, i due video dall’host CloudFront indicato, Turnstile e gli endpoint GA4 necessari. Google viene comunque caricato solo dopo consenso. `style-src 'unsafe-inline'` è limitato agli stili perché Motion applica trasformazioni inline; non sono ammessi `unsafe-eval`, wildcard o script inline.

Gli header HSTS, `X-Content-Type-Options`, `Permissions-Policy`, `Referrer-Policy`, `X-Frame-Options` e una CSP di risposta con `frame-ancestors 'none'` devono essere configurati sul proxy Cloudflare e verificati in produzione. GitHub Pages non consente di definirli dal repository.

## Verifica locale

```bash
npm run check
```

La validazione controlla route statiche, H1, canonical, CSP, placeholder, riferimenti a segreti o indirizzi privati e unicità del workflow del sito. I test del Worker restano separati ma inclusi nel comando completo.

# Stato del redesign botanico

Aggiornato il 15 settembre 2026.

## Implementato

- Home trasformata in un giardino illustrato stratificato, con composizioni dedicate desktop/mobile, copy HTML vivo e parallax contenuto.
- Navigazione compatta liquid-glass con fallback progressivo, modalità opaca per trasparenza ridotta e licenza MIT conservata.
- Sezione “Alcuni dei miei progetti” con esattamente MNS Warehouse, Ricettario AI e Little Printer Revival, nell’ordine richiesto e senza visual fabbricati.
- Archivio e tre casi studio generati da `content/projects.mjs`, con testi prudenti e naturali.
- Gallerie automatiche basate su file: zero screenshot significa zero interfaccia; nomi, formato reale, dimensioni e duplicati vengono validati prima di sostituire `dist/`.
- Secure Garage Access rimosso da navigazione, dati, metadati, sitemap e output pubblico; la vecchia route restituisce 404.
- Contatti, conferma condizionale, privacy, 404, Worker e contratto del form preservati nel nuovo sistema visivo.
- Sei sorgenti botaniche, dodici varianti AVIF/WebP e social card ottimizzate; artwork precedente archiviato fuori da `public/`.
- Font locali, build statica, CSP con hash, validator, preview server, workflow GitHub Pages e Worker.

## Decisioni stabili

- Canonical: `https://miniutti.it` senza `www`.
- GitHub Pages resta la piattaforma del sito; nessun framework, migrazione o deploy alternativo.
- Nessun cellulare finché non viene fornito un numero approvato.
- Nessuna data, metrica, cliente, demo, repository o immagine progetto non verificati.
- Le gallerie accettano soltanto screenshot autentici forniti nel repository.
- Movimento disattivato con `prefers-reduced-motion`; trasparenza sostituita da una superficie opaca con `prefers-reduced-transparency`.
- Nessuna consegna email reale durante i test locali.

## Verifica corrente

La build, il validator, i test e il browser QA vengono rieseguiti dopo ogni correzione. I risultati finali e le limitazioni dell’ambiente sono registrati in `docs/IMPLEMENTATION_REPORT.md` e nel report macchina `docs/screenshots/browser-qa.json`.

## Restano esterni

- `MINIUTTI_MASTER_CONTEXT.md` non è presente nei materiali accessibili.
- Provenienza/licenza del logo e verifica organizzativa dei dati privacy.
- Screenshot autentici, date, metriche e link pubblici dei progetti, se il titolare desidera aggiungerli.
- Configurazione GitHub Pages, DNS, redirect, header Cloudflare e segreti.
- Invio autorizzato end-to-end su staging o produzione.
- Test su dispositivi reali, Safari/iOS, Firefox, Android e screen reader.

Le istruzioni di rilascio sono in `docs/DEPLOYMENT.md`; il flusso delle gallerie è in `SCREENSHOTS.md`.

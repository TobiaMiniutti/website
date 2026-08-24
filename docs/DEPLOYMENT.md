# Deploy e collaudo di miniutti.it

## GitHub Pages

La pubblicazione distribuisce soltanto `public/`. Configura GitHub Pages con sorgente **GitHub Actions** e crea queste variabili Actions:

- `TURNSTILE_SITE_KEY`: site key autorizzata per `miniutti.it` e `www.miniutti.it`;
- `MOBILE_PHONE_DISPLAY`: numero pubblico nel formato desiderato;
- `GA_MEASUREMENT_ID`: facoltativa, nel formato `G-…`. Se manca o non è valida, il sito non carica Analytics.

Il workflow valida sito e Worker, genera la sitemap e sostituisce i placeholder nell’artefatto. Non stampa valori segreti. Prima di attivare GA, verificare nella proprietà la conservazione configurata e aggiornare Privacy e tabella cookie.

## Cloudflare Worker

I segreti Actions necessari sono `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `TURNSTILE_SECRET_KEY` e `MAKE_WEBHOOK_URL`. Il Worker resta sulle route `miniutti.it/api/contact` e `www.miniutti.it/api/contact`.

Il flusso mantiene controllo esatto dell’origine, payload massimo di 16 KiB, allowlist dei tipi di richiesta, honeypot, verifica Turnstile di action e hostname, limiti per email e globali, tre tentativi di inoltro e log senza contenuto del messaggio.

## Consenso e Analytics

`assets/js/consent.js` imposta tutti gli stati Google su `denied` prima di qualsiasi misurazione. Il tag viene creato dinamicamente solo dopo consenso analitico e soltanto con un Measurement ID valido. Il record locale `miniutti_consent_v1` contiene versione, timestamp e categorie; scade dopo massimo sei mesi.

Collaudo manuale in una finestra privata:

1. prima della scelta, verificare che non esistano richieste a `googletagmanager.com` o `google-analytics.com`;
2. provare chiusura, rifiuto, personalizzazione e accettazione;
3. ricaricare e verificare la persistenza;
4. riaprire dal footer, revocare e verificare assenza di nuovi eventi e rimozione dei cookie `_ga` quando tecnicamente possibile;
5. usare Google Tag Assistant solo dopo aver accettato;
6. confermare che URL o eventi non contengano dati del modulo.

## Collaudo locale

Con Node.js 22 o successivo:

```bash
npm run build
npm test
npm run preview
```

Verificare Home, indice progetti, tre schede, Privacy, Preferenze, compatibilità Contatti, conferma e 404. Provare tastiera, menu mobile, focus, 200% zoom, reduced motion e larghezze 320, 375, 768, 1024, 1440 e 1920 px. Il modulo reale richiede dominio autorizzato, placeholder sostituiti e Worker pubblicato.

## Contenuti progetto

I dati canonici sono in `content/projects/*.json`. Campi obbligatori: slug, titolo, categoria, stato, sintesi, ruolo, ambito, tecnologie, cover, contesto, approccio ed esito/stato attuale. Le pagine pubbliche devono restare sincronizzate: il validatore interrompe il deploy in caso di differenze.

Per gallerie e download usare solo file locali approvati, con nomi descrittivi, testo alternativo o didascalia e dimensioni note. Non pubblicare sorgenti, backup, report interni, database, endpoint privati o credenziali.

## Verifiche del titolare prima della produzione

- approvare o sostituire le tre schede iniziali con lavori portfolio documentati;
- fornire eventuali immagini, gallerie, download e video hero approvati;
- verificare la durata dati della proprietà GA4;
- sottoporre Privacy e informazioni cookie a revisione legale/professionale;
- verificare variabili, dominio Turnstile, invio Make/Zoho e numeri pubblici in un deploy di staging o produzione;
- mantenere su Cloudflare HSTS (solo dopo verifica sottodomini), `nosniff`, Referrer Policy, Permissions Policy e protezione frame.

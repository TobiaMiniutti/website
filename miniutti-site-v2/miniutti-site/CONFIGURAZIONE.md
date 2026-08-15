# Pubblicazione di miniutti.it

## 1. GitHub Pages

Pubblica nella root del repository i file presenti in questa cartella. La nuova versione contiene solo la landing, l’informativa privacy e la pagina 404: login, dashboard, vecchi progetti e pagine di test non sono inclusi.

Prima del push sostituisci in `assets/config.js`:

- `INSERISCI_LA_SITE_KEY_TURNSTILE` con la **site key pubblica** del widget Turnstile;
- l’URL `contact-api.miniutti.it` solo se scegli un hostname diverso per il Worker.

## 2. Cloudflare Turnstile

Nel pannello Cloudflare crea un widget Turnstile:

- hostname consentiti: `miniutti.it` e `www.miniutti.it`;
- modalità: Managed;
- conserva la site key per `assets/config.js`;
- conserva la secret key esclusivamente nei secret del Worker.

## 3. Cloudflare Worker per il modulo

Da `cloudflare-worker/`:

```bash
npm install
npx wrangler login
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put CONTACT_WEBHOOK_URL
npm run deploy
```

Imposta come route/dominio personalizzato del Worker `contact-api.miniutti.it`.

`CONTACT_WEBHOOK_URL` deve contenere il nuovo webhook Make. Il vecchio URL era pubblicato nel JavaScript e va rigenerato su Make, perché resta recuperabile dalla cronologia Git anche dopo la rimozione.

## 4. Rendere il sito non pubblico

`robots.txt` e i meta tag inclusi chiedono ai motori di ricerca di non indicizzare il sito, ma **non sono una protezione di accesso**.

Per bloccare realmente la visualizzazione:

1. Cloudflare Zero Trust → Access → Applications;
2. crea un’applicazione Self-hosted per `www.miniutti.it` (e per `miniutti.it`, se usato);
3. crea una policy Allow limitata alla tua email;
4. abilita One-time PIN oppure il provider di identità che preferisci;
5. verifica che l’hostname GitHub Pages diretto non resti raggiungibile pubblicamente.

Se il repository o il sito GitHub Pages rimane pubblico, i file possono comunque essere consultati attraverso GitHub o l’hostname `github.io`. Per vera riservatezza serve anche una pubblicazione privata compatibile oppure spostare temporaneamente il sito su Cloudflare Pages protetto da Access.

## 5. Controlli finali

- prova invio riuscito e invio senza Turnstile;
- verifica che la notifica arrivi correttamente;
- prova il sito da smartphone;
- controlla che vecchie URL restituiscano la nuova 404;
- non salvare mai secret key o webhook nel repository.

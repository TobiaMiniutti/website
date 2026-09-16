# Deploy di miniutti.it

Il repository prepara due componenti indipendenti:

1. un artefatto statico `dist/` per GitHub Pages;
2. un Cloudflare Worker per `POST /api/contact`.

Il deploy non viene eseguito dai comandi locali e non è stato eseguito durante il redesign.

## GitHub Pages

In GitHub:

1. seleziona **Settings → Pages → Source → GitHub Actions**;
2. configura il custom domain esattamente come `miniutti.it`;
3. in **Settings → Secrets and variables → Actions → Variables** aggiungi `TURNSTILE_SITE_KEY` con la site key pubblica autorizzata per `miniutti.it` e, durante la transizione, `www.miniutti.it`;
4. solo se esiste un cellulare approvato per la pubblicazione, aggiungi entrambe le variabili:
   - `MOBILE_PHONE_DISPLAY`, per esempio `+39 333 123 4567`;
   - `MOBILE_PHONE_TEL`, in formato E.164, per esempio `+393331234567`.

Il workflow `.github/workflows/deploy-pages.yml` usa Node 24, installa dal lockfile, esegue test e build di produzione, valida `dist/` e pubblica soltanto quell’artefatto. La build si interrompe se manca la site key, se viene usata una key Turnstile ufficiale di test, se il cellulare è configurato solo a metà, se resta un placeholder o se uno screenshot progetto è corrotto/ambiguo.

Gli screenshot autentici dei tre progetti vanno aggiunti prima della build seguendo `SCREENSHOTS.md`. Non modificare `dist/` direttamente: il workflow lo ricrea da `public/` e dai contenuti strutturati.

## Dominio canonico e DNS

Tutti i canonical, il sitemap e i due file `CNAME` indicano `https://miniutti.it` come origine autorevole.

Nel controllo del 14 settembre 2026 il dominio pubblico `miniutti.it` reindirizzava invece a `www.miniutti.it`. Prima del rilascio occorre allineare:

- custom domain in GitHub Pages;
- record DNS;
- eventuale Bulk Redirect o Redirect Rule in Cloudflare.

La direzione prevista è `www.miniutti.it/*` → `https://miniutti.it/${1}` con redirect permanente. Il file `CNAME` nell’artefatto non modifica da solo l’impostazione del custom domain su GitHub.

## Cloudflare Worker

Configura questi **GitHub Actions secrets**:

- `CLOUDFLARE_ACCOUNT_ID`;
- `CLOUDFLARE_API_TOKEN`, limitato alla modifica di Workers Scripts e Workers Routes per la zona interessata;
- `TURNSTILE_SECRET_KEY`;
- `MAKE_WEBHOOK_URL`.

Il workflow `.github/workflows/deploy-worker.yml` esegue i test e passa i due segreti applicativi a `cloudflare/wrangler-action@v4`. Il file pubblico non contiene né la secret key Turnstile né l’URL Make.

Le route dichiarate in `cloudflare-worker/wrangler.toml` sono:

- `miniutti.it/api/contact`;
- `www.miniutti.it/api/contact` durante la migrazione canonica.

Prima del primo deploy verifica che gli identificativi delle due configurazioni Rate Limiting siano validi nell’account Cloudflare. Il Worker applica 3 tentativi/minuto per email e 60 richieste/minuto complessive, verifica `action`, hostname e token Turnstile e ritenta Make solo per errori di rete o HTTP temporanei.

## Header HTTP

La build genera una CSP meta compatibile con le risorse della singola pagina e con hash SHA-256 per il JSON-LD inline. Una meta CSP non può applicare `frame-ancestors`; GitHub Pages non interpreta file arbitrari `_headers`.

Sul proxy Cloudflare configura e verifica sulle risposte HTML:

- `Strict-Transport-Security: max-age=31536000; includeSubDomains` solo dopo aver confermato HTTPS su ogni sottodominio; valuta `preload` separatamente;
- `Content-Security-Policy` equivalente o più restrittiva rispetto alla policy generata;
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: strict-origin-when-cross-origin`;
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`;
- `X-Frame-Options: DENY` come compatibilità, oltre a `frame-ancestors 'none'` nell’header CSP.

La pagina contatti deve consentire `https://challenges.cloudflare.com` in `script-src` e `frame-src`, e `'self'` in `connect-src`.

## Verifica prima del rilascio

Esegui:

```bash
npm ci
npm test
TURNSTILE_SITE_KEY="site-key-reale" npm run build:production
npm run validate:dist
npm run preview
```

Poi controlla su staging o produzione:

- `200` per tutte le sette rotte indicizzabili, `404` reale per `/progetti/secure-garage-access/` e per un percorso inesistente;
- redirect canonico `www` → apex e assenza del redirect opposto;
- certificato HTTPS e header effettivi;
- widget Turnstile con hostname autorizzato;
- un invio di test esplicitamente autorizzato, verificando Worker → Make → casella email e Reply-To;
- informazioni operative dell’informativa privacy, inclusi fornitore email, categorie di destinatari, trasferimenti e criteri di conservazione;
- assenza di placeholder e segreti nell’artefatto pubblicato.

I test automatici locali intercettano `/api/contact`: non inviano email e non dimostrano la consegna reale.

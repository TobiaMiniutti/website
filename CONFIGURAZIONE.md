# Configurazione e pubblicazione

## Cloudflare Turnstile

1. Crea un widget Turnstile in modalità **Managed**.
2. Autorizza `miniutti.it` e `www.miniutti.it`.
3. In `index.html` sostituisci `INSERISCI_LA_SITE_KEY_TURNSTILE` con la site key pubblica.

## Worker del modulo

Da `cloudflare-worker/`:

```bash
npm install
npx wrangler login
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put CONTACT_WEBHOOK_URL
npm run deploy
```

Assegna al Worker il dominio `contact-api.miniutti.it`. Usa un **nuovo** webhook Make: il precedente era pubblico nel vecchio JavaScript e va rigenerato.

## Sostituzione del repository

Elimina i vecchi file prima di caricare questa versione. Non devono rimanere online login, dashboard, progetti, pagine di test o file secondari.

`robots.txt` e `noindex` impediscono l'indicizzazione, ma non proteggono l'accesso. Per rendere l'intero sito privato occorre Cloudflare Access e bisogna impedire l'accesso diretto all'hostname GitHub Pages.

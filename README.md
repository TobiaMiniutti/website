# miniutti.it

Portfolio statico di Tobia Miniutti. La versione 4 adotta il sistema visivo **Signature Systems / Kinetic Index** e conserva il modulo di contatto protetto dal Worker Cloudflare separato.

## Architettura

- React 19 + TypeScript + Vite 7
- Tailwind CSS 4 con configurazione CSS-first
- Motion per ingressi e interazioni selettive
- pagine HTML pre-renderizzate per ogni route pubblica
- Outfit e Inter auto-ospitati nel bundle
- Worker Cloudflare indipendente in `cloudflare-worker/`

I contenuti dei progetti risiedono in `src/data/projects.ts`: aggiungere un progetto pubblicato genera automaticamente pagina, route statica, metadati e collegamenti senza duplicare markup.

## Route

- `/`
- `/progetti/`
- `/progetti/<slug>/`
- `/privacy/`
- `/preferenze-cookie/`
- `/conferma-invio/`
- `404.html`

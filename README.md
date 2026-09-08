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

## Comandi

```bash
npm ci
npm run dev
npm run check
```

`npm run check` esegue type-check, test mirati, build statica, pre-render e validazione finale.

## Route

- `/`
- `/progetti/`
- `/progetti/<slug>/`
- `/privacy/`
- `/preferenze-cookie/`
- `/conferma-invio/`
- `404.html`

Gli URL storici `/privacy.html`, `/contatti.html` e `/conferma-invio.html` contengono stub di compatibilità. Contatti rimanda a `/#contatti`.

## Variabili pubbliche

Copiare `.env.example` in `.env` solo per lo sviluppo locale. Nessun segreto del Worker deve essere prefissato con `VITE_`.

| Variabile | Obbligatoria in produzione | Uso |
| --- | --- | --- |
| `VITE_TURNSTILE_SITE_KEY` | sì | site key pubblica Turnstile |
| `VITE_MOBILE_PHONE_DISPLAY` | sì | numero mostrato nel sito |
| `VITE_MOBILE_PHONE_TEL` | sì | numero normalizzato per `tel:` |
| `VITE_GA_MEASUREMENT_ID` | no | abilita GA4 solo dopo consenso |
| `VITE_GA_DATA_RETENTION` | se GA4 è attivo | periodo verificato nella proprietà GA4 |

Senza un measurement ID GA4 valido, gli analitici restano disabilitati. In sviluppo Turnstile usa la site key pubblica di test Cloudflare; il workflow rifiuta questa chiave in produzione.

## Privacy e contenuti da verificare

Prima di attivare GA4, verificare e documentare il periodo di conservazione effettivo della proprietà. L’informativa è allineata all’implementazione tecnica, ma non sostituisce una revisione legale professionale.

I progetti non includono date, stati, link, file o risultati quantitativi non verificati. Questi campi possono essere compilati in `src/data/projects.ts` quando diventano pubblici.

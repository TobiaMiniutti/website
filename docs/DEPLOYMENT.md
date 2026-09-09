# Deploy di miniutti.it

## 1. Repository GitHub

1. Carica il contenuto di questa cartella nella root della repository.
2. In **Settings → Pages**, seleziona **GitHub Actions** come sorgente.
3. In **Settings → Secrets and variables → Actions → Variables**, crea `TURNSTILE_SITE_KEY` con la site key del widget Turnstile autorizzato per `miniutti.it` e `www.miniutti.it`.
4. Nella stessa sezione crea `MOBILE_PHONE_DISPLAY` con il numero di cellulare corrente nel formato pubblico desiderato, ad esempio `+39 333 123 4567`. Il workflow genera automaticamente il valore compatto usato nei link telefonici e interrompe il deploy se il recapito non è configurato.
5. Il workflow distribuisce esclusivamente `public/`. Tutto ciò che si trova fuori da questa cartella non può diventare una pagina del sito per errore.

## 2. Worker Cloudflare

Nel repository aggiungi questi **Actions secrets**:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN` con permesso di modifica Workers Scripts e Workers Routes per la zona
- `TURNSTILE_SECRET_KEY`
- `MAKE_WEBHOOK_URL`

Il workflow **Deploy contact worker** pubblica il Worker sulle route:

- `miniutti.it/api/contact`
- `www.miniutti.it/api/contact`

L’URL Make non deve mai essere inserito nei file HTML o JavaScript pubblici.

Il Worker applica due limiti nativi Cloudflare: massimo 3 invii al minuto per indirizzo email verificato e 60 invii complessivi al minuto. Gli invii validi verso Make vengono ritentati fino a tre volte in caso di errore temporaneo; gli eventi tecnici sono disponibili nei log del Worker senza registrare il contenuto dei messaggi.

## 3. DNS e proxy

Il record DNS del dominio personalizzato deve restare compatibile con GitHub Pages e passare dal proxy Cloudflare affinché la route Worker intercetti `/api/contact`. Verifica sia il dominio principale sia `www`.

## 4. Header consigliati in Cloudflare

Configura una Transform Rule per le pagine HTML:

- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` solo dopo aver verificato che ogni sottodominio supporti HTTPS
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `X-Frame-Options: DENY`

Configura inoltre una **Redirect Rule** permanente (`301`) da `www.miniutti.it/*` a `https://miniutti.it/${1}`. In questo modo URL canonici, sitemap e traffico pubblico convergono su un solo dominio.

## 5. Rendere privato tutto il sito

`robots.txt`, `noindex`, link rimossi e JavaScript **non impediscono l’accesso**. Per richiedere autenticazione sul dominio:

1. Apri **Cloudflare Zero Trust → Access controls → Applications**.
2. Crea una **Self-hosted application** per `miniutti.it` e, se usato, `www.miniutti.it`.
3. Crea una policy `Allow` limitata ai tuoi indirizzi email o al tuo provider di identità.
4. Imposta una durata sessione breve e testa in navigazione privata.

Nota importante: Access protegge il dominio che passa da Cloudflare, non eventuali URL alternativi `github.io` né il contenuto di una repository pubblica. Se il contenuto deve essere davvero riservato, usa una repository privata e un hosting senza origine pubblica alternativa, ad esempio Cloudflare Pages collegato a GitHub e protetto da Access.

## 6. Collaudo

Esegui localmente:

```bash
npm test
```

Poi verifica in produzione:

- navigazione Home/Contatti/Privacy/404;
- invio valido del modulo;
- rifiuto di un invio senza Turnstile;
- risposta `429` dopo il superamento del limite configurato;
- presenza corretta di email, cellulare e fisso nel footer;
- assenza di `login.html`, `progetti.html` e vecchie demo;
- nessun segreto o webhook nell’HTML pubblicato.

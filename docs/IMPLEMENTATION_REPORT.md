# Rapporto di implementazione — miniutti.it

Aggiornato il 16 settembre 2026.

## Esito e perimetro

Il progetto è un sito statico in italiano con una direzione botanica immersiva, identità personale di Tobia Miniutti, tre progetti pubblici, form di contatto collegato al Worker esistente, metadata SEO e pubblicazione prevista tramite GitHub Pages.

L’artefatto comprende nove pagine HTML: sette URL indicizzabili e due pagine di utilità `noindex`. Il lavoro di questa iterazione rifinisce il redesign botanico già approvato; non sostituisce l’artwork, non cambia piattaforma, non modifica DNS e non pubblica il sito.

Le verifiche locali non equivalgono a una certificazione di accessibilità, a dati di campo o a una garanzia di posizionamento. Nessuna email reale è stata inviata.

## Materiali e limiti delle fonti

- Sono stati ispezionati sorgenti, build, script, Worker, test, workflow, sitemap, robots, documentazione e asset del progetto corrente.
- Sono stati letti `example_prompts.txt`, il prompt di correzione botanica e i riferimenti visivi forniti dal proprietario.
- `MINIUTTI_MASTER_CONTEXT.md` e le sue varianti di nome sono stati cercati nei materiali accessibili, ma non sono stati trovati. Non viene quindi dichiarato come letto o verificato.
- Lo stile scuro menzionato per le email non è stato trasferito al sito botanico.
- Le descrizioni dei progetti restano prudenti: non vengono inventati clienti, metriche, date, repository pubblici, disponibilità open source o funzioni non dimostrate.

## Le cinque correzioni di questa iterazione

| Area | Correzione implementata | Criterio di verifica |
| --- | --- | --- |
| Immersione dell’hero | I tre piani botanici seguono un solo modello di camera verso un punto di fuga. Il primo piano cresce e si apre verso i bordi, il piano intermedio cambia più lentamente e la distanza resta stabile. | Fotogrammi a circa 0%, 30%, 65% e 100%; scorrimento inverso; resize; ingresso diretto; assenza di overflow e bordi scoperti. |
| Introduzione e CTA | “Sviluppo web, sistemi digitali e automazioni” usa un campo tonale locale compatto. “Contattami” è un vero link con nucleo scuro, bordo materico, target comodo e stati hover, active e focus senza spostamenti. | Ispezione sul background renderizzato durante tutta la porzione utile dell’animazione, su desktop e mobile, inclusi reduced transparency e focus da tastiera. |
| Pannello contatti | Il pannello chiaro della home torna a dimensionarsi sul contenuto reale; il giardino decorativo resta separato dal flusso. | Confronto prima/dopo alla stessa viewport; testo ingrandito; messaggi di errore; stato di invio; risposta positiva/negativa controllata. |
| Pagine progetto | Rimossi campo, wrapper e titolo “Il mio contributo”. Le informazioni di paternità realmente documentate sono state integrate nella narrazione. | Scansione di sorgente e HTML generato; nessun box sostitutivo o spazio vuoto; distinzione BERG preservata nel progetto Little Printer Revival. |
| Identità navbar | Rimosso soltanto il wordmark visibile “miniutti.it” accanto al logo, anche nel menu mobile. Rimane un link logo-only con nome accessibile “Tobia Miniutti — Homepage”. | Controllo desktop/mobile/zoom; immagine con `alt=""` dentro contenitore decorativo; nessuna base bianca; dominio conservato in canonical, metadata, email, CNAME e footer. |

## Movimento botanico

L’hero mantiene le composizioni approvate: distanza, vegetazione intermedia e foglie in primo piano, ciascuna con variante desktop e mobile in AVIF/WebP. Testo, logo e controlli non sono trasformati insieme alle immagini.

Il modello corrente usa progressione normalizzata sulla geometria reale dell’hero:

- desktop: distanza `1 → 1,03`, piano intermedio `1 → 1,15`, primo piano `1 → 1,46`;
- mobile: distanza `1 → 1,025`, piano intermedio `1 → 1,10`, primo piano `1 → 1,36`;
- punto di fuga condiviso: circa `58% 61%` su desktop e `52% 63%` su mobile;
- spostamento verso l’esterno derivato dallo stesso punto di fuga, non animazioni indipendenti per foglia;
- aggiornamenti tramite `requestAnimationFrame`, proprietà `transform` e variabili CSS;
- geometria ricalcolata su resize, orientamento, `pageshow` e completamento dei font;
- lavoro sospeso quando la scena è fuori vista o la pagina è nascosta;
- scorrimento nativo, senza intercettazione di wheel/touch e senza scroll snap.

Con `prefers-reduced-motion: reduce` la composizione botanica completa resta statica. Se JavaScript non parte, le immagini rimangono nel flusso visivo valido e i contenuti HTML restano utilizzabili.

## Contrasto e interazioni principali

Il nome, l’introduzione e le azioni restano contenuti HTML selezionabili sopra l’artwork. La leggibilità non dipende soltanto da un’ombra: il copy breve usa una superficie locale chiara, mentre “Contattami” usa una superficie quasi piena verde scuro con testo bianco, bordo e focus ring visibile.

Le foglie decorative hanno `pointer-events: none` e non possono coprire il target interattivo. Il link di contatto conserva la navigazione reale; la destinazione dispone di offset per la testata persistente. In modalità reduced transparency le superfici diventano opache senza rimuovere contenuti o funzioni.

## Causa verificata e riparazione del pannello contatti

La causa non era l’altezza intrinseca dell’immagine: la regola della superficie `.contact-content` applicava `min-height: max(720px, 95svh)` e `justify-content: flex-end`. Il pannello era quindi obbligato a riempire quasi una viewport e spingeva il contenuto in basso, producendo la grande area vuota osservata.

La riparazione rimuove il vincolo alla fonte con `min-height: 0`, `height: auto` e `justify-content: flex-start`. Le immagini `.contact-garden` e `.contact-foliage` rimangono livelli assoluti nel contenitore della sezione e non partecipano al calcolo dell’altezza del pannello. Padding e spazio per feedback reali restano intenzionali; il pannello può ancora crescere per testo a capo, errori, challenge e zoom.

Evidenza prima della correzione:

- [contatto desktop 1440 px](./evidence/before/contact-desktop-1440.png)
- [contatto mobile 390 px](./evidence/before/contact-mobile-390.png)

Percorsi riservati all’evidenza finale, da completare dopo l’ultima build verificata:

- `docs/evidence/after/contact-desktop-1440.png`
- `docs/evidence/after/contact-mobile-390.png`

## Identità e navigazione

La navbar usa il logo trasparente, senza disco bianco e senza testo adiacente. La derivata `logo-nav.png` evita di scaricare il master 720 × 720 per una resa di poche decine di pixel; l’originale resta disponibile come sorgente. Il link del logo ha un solo nome accessibile, mentre l’immagine è decorativa, così screen reader e testo alternativo non annunciano due volte la stessa destinazione.

Il dialog mobile conserva apertura, chiusura con Escape, ritorno del focus e target tattili. La testata del dialog usa lo stesso link logo-only e non introduce slogan o etichette sostitutive.

## Progetti e galleria

I tre progetti pubblici, nello stesso ordine in home e archivio, sono:

1. MNS Warehouse;
2. Culina;
3. Little Printer Revival.

Le pagine sono editoriali e non mostrano liste tecnologiche artificiali. La paternità documentata è espressa direttamente nel racconto. Per Little Printer Revival la Little Printer e il progetto originale sono attribuiti a BERG; Tobia descrive il lavoro di analisi, recupero e sviluppo della piattaforma sostitutiva senza appropriarsi del prodotto originale.

La galleria è generata solo quando esistono file validi `screenshot-N.ext` nella cartella del progetto. Il generatore ordina per indice numerico, legge le dimensioni, rifiuta duplicati, file corrotti o estensioni incoerenti e non emette titolo, cornice, dialog o placeholder per cartelle vuote. Le miniature sono link HTML alle immagini originali; il dialog è un miglioramento progressivo con tastiera e ripristino del focus.

## Mappa delle route

| URL | Funzione | Indicizzazione |
| --- | --- | --- |
| `/` | Home botanica, profilo, tre progetti e contatto | Sì |
| `/progetti/` | Archivio dei tre progetti | Sì |
| `/progetti/mns-warehouse/` | Caso studio MNS Warehouse | Sì |
| `/progetti/culina/` | Caso studio Culina | Sì |
| `/progetti/little-printer-revival/` | Caso studio Little Printer Revival | Sì |
| `/contatti.html` | Modulo e contatti diretti | Sì |
| `/privacy.html` | Informativa privacy | Sì |
| `/conferma-invio.html` | Esito prudente dopo una sessione di invio | No, `noindex, follow` |
| `/404.html` | Recupero da URL inesistente | No, `noindex, follow` |

La sitemap contiene soltanto i sette URL indicizzabili. Canonical, dati strutturati e navigazione interna usano `https://miniutti.it`; le pagine progetto condividono l’identificatore persona `https://miniutti.it/#person`.

## Form di contatto e Worker

Il contratto pubblico resta `POST /api/contact` con nome, email, organizzazione facoltativa, categoria, messaggio, honeypot, consenso privacy e token Turnstile. Il client conserva il testo dopo errori, espone feedback per campo, gestisce timeout e stati della challenge e considera riuscito l’invio soltanto dopo risposta HTTP positiva con `{ ok: true }`.

Il Worker continua a validare lato server, limita la dimensione del body, controlla origin, hostname e action Turnstile, applica rate limiting e inoltra a Make senza token o consenso. I retry sono limitati agli errori temporanei e mantengono lo stesso request ID. I test automatici coprono 21 casi Worker e 7 casi del discovery delle gallerie.

Le risposte usate durante il test funzionale sono controllate e separate dalla configurazione sottoposta a Lighthouse. Non è stato eseguito un invio email reale.

## Artwork, materiali e prestazioni

Il sistema visivo usa una scena di giardino illustrata in luce mattutina, con verde, avorio e violetto attenuato. Sono disponibili tre piani separati per desktop e tre per mobile; i livelli intermedi e di primo piano mantengono trasparenza reale. I master sono conservati in `source-assets/botanical/`, mentre il sito usa varianti AVIF/WebP ottimizzate.

Le misure di performance non vengono ottenute rimuovendo il giardino o disabilitando l’animazione per l’user agent di Lighthouse. Le ottimizzazioni applicate riguardano:

- precaricamento soltanto dell’immagine botanica critica per il profilo media attivo;
- `fetchpriority="high"` sul candidato LCP pertinente;
- dimensioni intrinseche su immagini e screenshot;
- logo navbar a risoluzione proporzionata all’uso;
- font locali con subset e pesi effettivamente usati;
- liquid glass limitato alla navbar e mai rigenerato durante lo scroll;
- nessuna animazione di blur, larghezza o altezza;
- contenuti inferiori presenti nell’HTML, anche quando gli enhancement sono differiti.

Il componente liquid glass deriva dall’implementazione MIT indicata in `THIRD_PARTY_NOTICES.md`, con displacement dove supportato e fallback a superficie sfocata o opaca. Non è applicato a superfici full-screen.

## Lighthouse: contratto di misura

Lo script `scripts/run-lighthouse-matrix.mjs` fissa Lighthouse `13.4.1`, inventaria i sette URL indicizzabili e usa i profili standard mobile e desktop. Ogni URL/profilo viene misurato con tre navigazioni pulite e sequenziali, senza retry automatici. Ogni esecuzione salva JSON e HTML originali fuori da `public/` e `dist/`.

Gate:

- Performance: mediana di almeno 91 per ciascuna coppia URL/profilo, con range e singole esecuzioni conservate;
- Accessibilità: almeno 98 in ogni esecuzione valida;
- SEO: 100 in ogni esecuzione valida;
- Best Practices: almeno 91 in ogni esecuzione valida.

404 e conferma vengono controllate per stato, funzioni, accessibilità e `noindex`, ma sono intenzionalmente escluse dal gate SEO.

Comando ripetibile in PowerShell, con la preview della build già attiva su `127.0.0.1:4173`:

```powershell
$env:BASE_URL = "http://127.0.0.1:4173"
$env:AUDIT_RUNS = "3"
$env:AUDIT_LABEL = "final"
node scripts/run-lighthouse-matrix.mjs
```

Condizioni registrate dallo script: identità hash dell’artefatto, versione Chrome/Lighthouse, viewport, emulazione, throttling, URL, timestamp, user agent, reset dello storage e percorso di ogni report. La misurazione locale non viene descritta come verifica del sito già pubblicato.

## Baseline Lighthouse precedente alle correzioni

La baseline è stata acquisita sulla build di produzione locale della home il 16 settembre 2026, prima delle correzioni. È una singola esecuzione per profilo, utile come confronto iniziale ma non come statistica finale a tre run. Chrome era `152.0.7977.83` e Lighthouse `13.4.1`.

| Profilo | Performance | Accessibilità | SEO | Best Practices | FCP | LCP | TBT | CLS | Speed Index | TTI | Report |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Mobile, 412 × 823 @ 1,75 | 70 | 100 | 100 | 100 | 1.510 ms | 2.335 ms | 2.038 ms | 0,00004 | 1.936 ms | 4.219 ms | [JSON](./audits/baseline/home-mobile.report.json) · [HTML](./audits/baseline/home-mobile.report.html) |
| Desktop, 1350 × 940 @ 1 | 81 | 100 | 100 | 100 | 406 ms | 474 ms | 423 ms | 0,00154 | 740 ms | 1.000 ms | [JSON](./audits/baseline/home-desktop.report.json) · [HTML](./audits/baseline/home-desktop.report.html) |

Timestamp dei report: `2026-09-16T12:10:42.113Z` mobile e `2026-09-16T12:11:42.476Z` desktop. La baseline evidenzia soprattutto Total Blocking Time elevato; non autorizza da sola conclusioni sul comportamento reale degli utenti.

## Lighthouse finale

La tabella seguente deve essere sostituita soltanto con risultati originali prodotti dalla matrice finale. Non si combinano categorie o metriche provenienti da esecuzioni diverse.

<!-- LIGHTHOUSE_FINAL_TABLE -->

## Evidenze visuali finali previste

I file finali devono essere prodotti dalla stessa build sottoposta ai controlli e conservati fuori dall’output pubblico:

- hero desktop: `docs/evidence/after/hero-desktop-0.png`, `hero-desktop-30.png`, `hero-desktop-65.png`, `hero-desktop-100.png`;
- hero mobile: `docs/evidence/after/hero-mobile-0.png`, `hero-mobile-30.png`, `hero-mobile-65.png`, `hero-mobile-100.png`;
- scorrimento: `docs/evidence/after/hero-forward-scroll-desktop.webm` se il runtime di cattura video è disponibile;
- pannello contatti: `docs/evidence/after/contact-desktop-1440.png` e `contact-mobile-390.png`;
- screenshot completi di regressione: `docs/screenshots/` con il relativo `browser-qa.json`.

Il confronto del pannello deve usare le stesse viewport dei file “before”. I fotogrammi dell’hero devono mostrare anche testo e “Contattami”, così la leggibilità può essere valutata sul background effettivamente renderizzato.

## Verifiche funzionali e accessibilità

La matrice browser deve coprire almeno 320–430 px, tablet, desktop comune e landscape breve, oltre a 200% di testo e reflow a 400% dove applicabile. I controlli richiesti includono:

- scorrimento avanti e indietro dell’hero e ingresso diretto a `#contatti`;
- assenza di overflow orizzontale, immagini rotte, errori console e richieste 404 inattese;
- skip link, ordine di Tab, menu mobile, Escape e ripristino del focus;
- CTA leggibile e raggiungibile durante la sua intera permanenza a schermo;
- pannello contatti naturale in stato iniziale, errori, invio e risposta controllata;
- reduced motion statico e reduced transparency opaco ma completo;
- galleria a zero, una e più immagini, fallback ai link originali e rimozione di immagini fallite;
- navigazione tra i tre progetti, link footer/privacy e caricamento diretto delle route annidate;
- nessuna sezione “Il mio contributo” e nessun wordmark visibile nella navbar.

I controlli automatici supportano l’ispezione manuale, ma non sostituiscono screen reader e dispositivi reali.

## Limitazioni e attività esterne

1. `MINIUTTI_MASTER_CONTEXT.md` non è presente nei materiali accessibili; eventuali requisiti aggiuntivi non possono essere verificati.
2. Non è stato autorizzato o eseguito un deploy. I risultati locali descrivono `dist/`, non la versione live.
3. Non è stato inviato alcun messaggio reale attraverso Turnstile, Worker, Make o il provider email; il test end-to-end di consegna resta esterno.
4. Nell’ambiente corrente non sono disponibili verifiche su browser reali Firefox, WebKit/Safari, iOS o Android. I test disponibili sono Chromium desktop/headless e browser integrato; questa limitazione va mantenuta esplicita.
5. Non è stato eseguito un audit con screen reader reale. Lighthouse non certifica WCAG e un SEO 100 non garantisce visibilità o posizione nei risultati di ricerca.
6. DNS, redirect apex/`www`, configurazione GitHub Pages, header edge e dati reali dell’informativa devono essere riconfermati sull’origine pubblica dopo un rilascio autorizzato.

## Riferimenti tecnici

- W3C, contrasto minimo WCAG: <https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html>
- web.dev, animazioni ad alte prestazioni: <https://web.dev/articles/animations-guide>
- Chrome, Lighthouse: <https://developer.chrome.com/docs/lighthouse/overview/>
- Chrome, scoring Performance: <https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/>
- Chrome, scoring Accessibilità: <https://developer.chrome.com/docs/lighthouse/accessibility/scoring/>
- MDN, `backdrop-filter`: <https://developer.mozilla.org/docs/Web/CSS/backdrop-filter>
- GitHub Pages, custom workflow: <https://docs.github.com/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages>
- Cloudflare Turnstile: <https://developers.cloudflare.com/turnstile/>
- WCAG 2.2: <https://www.w3.org/TR/WCAG22/>

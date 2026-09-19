# Manifest degli asset

Aggiornato il 15 settembre 2026.

## Giardino illustrato

Le sei sorgenti sono state generate appositamente per questo redesign con ImageGen integrato. Le composizioni desktop e mobile sono distinte; non sono crop reciproci. I livelli intermedi e in primo piano sono PNG RGBA con trasparenza reale e sono stati generati usando i rispettivi livelli già approvati come riferimento di composizione, luce e palette.

| Livello | Sorgente non pubblica | Output AVIF | Output WebP | Dimensioni | Alpha |
| --- | ---: | ---: | ---: | ---: | --- |
| Distanza desktop | `garden-distance-desktop.png`, 3.313.553 B | 150.019 B | 229.164 B | 1536 × 1024 | No |
| Piano medio desktop | `garden-midground-desktop.png`, 2.561.719 B | 121.239 B | 342.942 B | 1536 × 1024 | Sì |
| Primo piano desktop | `garden-foreground-desktop.png`, 2.643.567 B | 138.017 B | 371.338 B | 1536 × 1024 | Sì |
| Distanza mobile | `garden-distance-mobile.png`, 3.367.979 B | 158.673 B | 243.602 B | 1024 × 1536 | No |
| Piano medio mobile | `garden-midground-mobile.png`, 2.561.469 B | 131.291 B | 379.766 B | 1024 × 1536 | Sì |
| Primo piano mobile | `garden-foreground-mobile.png`, 2.335.979 B | 111.769 B | 295.844 B | 1024 × 1536 | Sì |

Le sorgenti si trovano in `source-assets/botanical/`; gli output pubblici sono in `public/assets/images/`. `scripts/optimize-botanical-assets.mjs` li rigenera in AVIF e WebP e crea `og-miniutti-garden.webp` (1200 × 630, 190.434 B) dalla composizione desktop completa.

Gli output sono illustrazioni concettuali, non fotografie del luogo e non prove dei progetti. Sono stati ispezionati per trasparenza, bordi, spazio tipografico, prospettiva, coerenza della luce e assenza di testo, loghi, persone, architetture, percorsi turistici e watermark. I livelli condividono una composizione coerente, ma non sono una segmentazione deterministica: spostamenti parallax estremi potrebbero scoprire basi vegetali inventate. Il sito usa quindi escursioni contenute.

La provenienza e i sei prompt finali sono registrati in [BOTANICAL_IMAGEGEN_PROMPTS.md](BOTANICAL_IMAGEGEN_PROMPTS.md).

## Identità esistente

| Asset | Uso | Origine | Stato |
| --- | --- | --- | --- |
| `public/assets/images/logo.png` | Segno nel menu e nel footer | Già presente nel progetto consegnato | Autore e licenza da confermare con il titolare |
| `public/assets/images/favicon.png` | Icona browser | Già presente nel progetto consegnato | Autore e licenza da confermare con il titolare |

## Materiale archiviato e non distribuito

- I precedenti WebP minerali e la social card sono conservati in `source-assets/legacy-mineral/` e non sono più inclusi in `public/` o nel nuovo `dist/`.
- Le sorgenti minerali precedenti restano in `source-assets/hero-constructed-landscape-desktop.png` e `source-assets/hero-constructed-landscape-mobile.png` per tracciabilità.
- `source-assets/legacy-porta-brandeburgo.jpg` era la vecchia fotografia hero. Non aveva provenienza o autorizzazione verificabile nel repository; rimane esclusa dall’artefatto pubblico.
- Nessuna immagine di progetto viene fabbricata. Le gallerie appaiono soltanto quando vengono aggiunti screenshot autentici secondo [SCREENSHOTS.md](../SCREENSHOTS.md).

## Font

| Famiglia | Uso | File | Licenza |
| --- | --- | --- | --- |
| Instrument Serif | Titoli display | `instrument-serif-latin-400.woff2`, `instrument-serif-latin-ext-400.woff2` | SIL Open Font License 1.1 |
| Outfit | Testo e interfaccia | `outfit-latin-400.woff2`, `outfit-latin-500.woff2`, `outfit-latin-600.woff2` | SIL Open Font License 1.1 |

I font sono ospitati localmente e limitati ai pesi necessari. Copyright, repository e licenze sono riportati in `public/assets/fonts/LICENSES.md`.

## Codice di terze parti

`public/assets/js/liquid-glass.js` deriva dal progetto MIT `deepika-builds/liquid-glass`, fissato al commit `98ed97bd99def529493fd37177228810f6422f6d`. Il copyright e la licenza completa sono conservati in [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md) e distribuiti con l’artefatto in `public/assets/js/liquid-glass.LICENSE.txt`. Il sito lo usa soltanto come miglioramento decorativo della navigazione, con fallback sfocato o opaco.

## Riferimenti visivi

Le cinque immagini fornite dall’utente sono state usate esclusivamente per estrarre principi di profondità, ritmo, atmosfera e continuità tra hero e chiusura. Nessun loro asset è incluso nel sito e nessuna composizione è stata copiata. La trasformazione è riepilogata in `docs/IMPLEMENTATION_REPORT.md`.

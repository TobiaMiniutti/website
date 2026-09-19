# Screenshot dei progetti

Le gallerie dei casi studio sono generate automaticamente durante la build. Non occorre modificare HTML o JavaScript: basta aggiungere immagini autentiche nelle cartelle previste.

## Cartelle e nomi

Usa esclusivamente queste directory:

- `public/assets/projects/mns-warehouse/`
- `public/assets/projects/ricettario-ai/`
- `public/assets/projects/little-printer-revival/`

I file devono chiamarsi `screenshot-N.ext`, dove `N` è un intero positivo e `ext` è `png`, `jpg`, `jpeg`, `webp` oppure `avif`.

Esempi validi:

```text
public/assets/projects/ricettario-ai/screenshot-1.webp
public/assets/projects/ricettario-ai/screenshot-2.png
public/assets/projects/ricettario-ai/screenshot-10.avif
```

I numeri possono avere intervalli e vengono ordinati numericamente. Non usare due file che rappresentano lo stesso numero, per esempio `screenshot-01.png` e `screenshot-1.webp`: la build li considera un duplicato e si interrompe.

## Didascalie facoltative

Le didascalie si configurano in `content/project-screenshot-captions.json`, usando lo slug del progetto e il numero presente nel nome del file:

```json
{
  "mns-warehouse": {},
  "ricettario-ai": {
    "2": "Raccolta personale delle ricette"
  },
  "little-printer-revival": {}
}
```

Senza una didascalia configurata, la pagina usa una descrizione neutra e veritiera. Se una cartella non contiene screenshot, il relativo caso studio non mostra alcun titolo, contenitore o segnaposto di galleria.

## Prima di aggiungere un’immagine

- Usa soltanto schermate autentiche del progetto indicato.
- Rimuovi dati personali, credenziali, token, email, indirizzi, notifiche e informazioni riservate.
- Verifica il diritto di pubblicare loghi, fotografie e contenuti di terzi visibili nell’interfaccia.
- Preferisci immagini nitide nella dimensione originale; non ingrandire file piccoli e non incorporare cornici finte.
- Ricorda che tutto ciò che si trova in `public/` diventa pubblicamente scaricabile.

La build controlla nome, indice, formato reale, estensione e dimensioni. Un file corrotto, mascherato con un’estensione diversa o ambiguo blocca la build prima che il precedente `dist/` venga sostituito.

## Flusso di pubblicazione

1. Copia gli screenshot nelle cartelle sopra e, se utile, aggiungi le didascalie JSON.
2. Esegui `npm run check` oppure gli equivalenti comandi Node descritti nel `README.md`.
3. Apri `npm run preview` e verifica miniature, immagine a piena risoluzione, tastiera e resa mobile.
4. Registra le modifiche in Git e inviale al repository remoto.
5. Avvia il workflow di deploy GitHub Pages con la site key Turnstile di produzione configurata.

Non modificare manualmente `dist/`: viene rigenerata a ogni build.

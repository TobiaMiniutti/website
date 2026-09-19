# Piano di misurazione post-lancio

Questo piano parte solo dopo l’autorizzazione alla pubblicazione. Non promette posizioni, AI Overview o tempi di indicizzazione.

## Search Console

1. Verificare la proprietà dominio `miniutti.it` tramite DNS.
2. Inviare `https://miniutti.it/sitemap.xml` dopo aver corretto il redirect `www` → apex.
3. Ispezionare home, archivio e tre casi studio; controllare canonical selezionato e stato di indicizzazione.
4. Annotare data di rilascio e successive modifiche sostanziali.

## Gruppi da osservare

- branded: “Tobia Miniutti”, “miniutti.it”, “Miniutti”;
- portfolio: “Tobia Miniutti progetti” e i tre nomi progetto;
- competenze: sviluppo web, sistemi digitali, automazione e infrastrutture, con Bologna solo dove la relazione è genuina.

Misurare impressioni, clic, CTR e posizione per pagina e gruppo su finestre di almeno 28 giorni. Non interpretare una singola giornata o una singola schermata come andamento stabile.

## Pagine

- Home: segnali di identità e query branded.
- `/progetti/`: scoperta e distribuzione verso i casi.
- Casi studio: query specifiche e contributo alle query di competenza.
- Contatti: non ottimizzare per volume; controllare soltanto indicizzazione e usabilità.

## Web Vitals e comportamento

- Raccogliere dati di campo disponibili in Search Console/CrUX per LCP, INP e CLS al 75° percentile.
- Confrontare i target LCP ≤ 2,5 s, INP ≤ 200 ms e CLS ≤ 0,1 senza presentare il laboratorio come dato reale.
- Controllare gli errori Worker per categoria e i `429`, senza registrare il contenuto dei messaggi.
- Verificare periodicamente route 404, sitemap, redirect canonico, certificato e header.

## Aggiornamenti esterni suggeriti

Solo previa autorizzazione, collegare al sito profili autentici di Tobia e aggiornare quei profili con il dominio canonico. Aggiungere `sameAs` esclusivamente dopo aver verificato proprietà e URL pubblico. Eventuale outreach o pubblicazione dei casi studio deve usare prove autentiche e non viene eseguito automaticamente.

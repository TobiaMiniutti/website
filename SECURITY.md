# Sicurezza

Per segnalazioni di sicurezza: **tobia@miniutti.it**.

## Principi applicati

- Nessun segreto nel codice client o nel repository.
- Verifica Turnstile obbligatoria nel Worker tramite Siteverify.
- Controllo esatto di origine, hostname e azione Turnstile.
- Limiti server-side su dimensioni e valori del modulo.
- Risposte non memorizzabili e messaggi di errore non diagnostici.
- Nessun login o pannello amministrativo pubblico.

Gli header che richiedono una risposta HTTP (HSTS, `X-Content-Type-Options`, `Permissions-Policy`, CSP completa con `frame-ancestors`) devono essere configurati sul proxy Cloudflare; una pagina GitHub Pages non consente di impostarli direttamente.

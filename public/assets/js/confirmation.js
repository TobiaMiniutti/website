"use strict";

const confirmationTitle = document.querySelector("#confirmation-title");
const confirmationCopy = document.querySelector("#confirmation-copy");
const confirmationKicker = document.querySelector("#confirmation-kicker");

try {
  const stored = Number(sessionStorage.getItem("miniutti-contact-confirmed"));
  sessionStorage.removeItem("miniutti-contact-confirmed");
  const recent = Number.isFinite(stored) && stored > 0 && Date.now() - stored < 15 * 60 * 1000;

  if (recent) {
    if (confirmationKicker) confirmationKicker.textContent = "Richiesta ricevuta dal sistema";
    if (confirmationTitle) confirmationTitle.textContent = "Richiesta accettata.";
    if (confirmationCopy) confirmationCopy.textContent = "Il sistema ha accettato i dati del modulo per l’inoltro. Se vuoi aggiungere un dettaglio, puoi scrivere direttamente via email.";
  }
} catch {
  // La pagina mantiene il testo prudente quando lo storage non è disponibile.
}

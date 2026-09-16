"use strict";

const form = document.querySelector("#contact-form");
const submitButton = form?.querySelector(".form-submit");
const formStatus = document.querySelector("#form-status");
const challengeStatus = document.querySelector("#challenge-status");
const challengeWrap = document.querySelector(".turnstile-wrap");
const allowedSubjects = new Set([
  "collaboration",
  "project-evaluation",
  "web-development",
  "systems",
  "media",
  "other-digital",
  "other",
]);

let turnstileToken = "";
let submitting = false;
let challengeLoadTimer = 0;

const setChallengeStatus = (message, state = "") => {
  if (!challengeStatus) return;
  challengeStatus.textContent = message;
  challengeStatus.dataset.state = state;
};

window.onTurnstileApiReady = () => {
  window.clearTimeout(challengeLoadTimer);
  setChallengeStatus("Completa la verifica anti-spam per inviare.");
};

window.onTurnstileSuccess = (token) => {
  turnstileToken = token;
  setChallengeStatus("Verifica completata.", "success");
};

window.onTurnstileExpired = () => {
  turnstileToken = "";
  setChallengeStatus("La verifica è scaduta. Completala di nuovo.", "error");
};

window.onTurnstileError = () => {
  window.clearTimeout(challengeLoadTimer);
  turnstileToken = "";
  setChallengeStatus("La verifica non è disponibile. Ricarica la pagina o usa l’email diretta.", "error");
};

window.onTurnstileTimeout = () => {
  turnstileToken = "";
  setChallengeStatus("La verifica ha impiegato troppo tempo. Riprova.", "error");
};

const challengeScript = document.querySelector('script[src^="https://challenges.cloudflare.com/turnstile/"]');
challengeScript?.addEventListener("error", () => {
  window.clearTimeout(challengeLoadTimer);
  window.onTurnstileError();
});
challengeLoadTimer = window.setTimeout(() => {
  if (!turnstileToken && typeof window.turnstile === "undefined") window.onTurnstileError();
}, 8_000);

const field = (name) => form?.elements.namedItem(name);

const setFieldError = (name, message) => {
  const control = field(name);
  const error = document.querySelector(`#${name}-error`);
  if (control instanceof HTMLElement) {
    if (message) control.setAttribute("aria-invalid", "true");
    else control.removeAttribute("aria-invalid");
  }
  if (error) error.textContent = message;
};

const validateField = (name) => {
  const control = field(name);
  if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement)) return true;

  const value = control.value.trim();
  let message = "";

  if (name === "name" && value.length < 2) message = "Inserisci almeno 2 caratteri.";
  if (name === "name" && value.length > 100) message = "Il nome può contenere al massimo 100 caratteri.";
  if (name === "email" && !value) message = "Inserisci il tuo indirizzo email.";
  else if (name === "email" && (control.validity.typeMismatch || value.length > 254)) message = "Inserisci un indirizzo email valido.";
  if (name === "organization" && value.length > 120) message = "L’organizzazione può contenere al massimo 120 caratteri.";
  if (name === "subject" && !allowedSubjects.has(value)) message = "Seleziona un argomento.";
  if (name === "message" && value.length < 10) message = "Scrivi almeno 10 caratteri.";
  if (name === "message" && value.length > 4000) message = "Il messaggio può contenere al massimo 4.000 caratteri.";
  if (name === "privacyAccepted" && control instanceof HTMLInputElement && !control.checked) message = "Conferma di aver letto l’informativa privacy.";

  setFieldError(name, message);
  return !message;
};

const validateForm = () => {
  const names = ["name", "email", "organization", "subject", "message", "privacyAccepted"];
  const valid = names.map(validateField).every(Boolean);
  if (!valid) {
    const firstInvalid = form?.querySelector('[aria-invalid="true"]');
    firstInvalid?.focus();
  }
  return valid;
};

const setFormStatus = (message, state = "") => {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.dataset.state = state;
};

const resetChallenge = () => {
  turnstileToken = "";
  if (window.turnstile && typeof window.turnstile.reset === "function") window.turnstile.reset();
  setChallengeStatus("Completa di nuovo la verifica anti-spam.");
};

const responseMessage = (status, serverMessage) => {
  if (status === 422) return "Alcuni dati non sono validi. Controlla il modulo e riprova.";
  if (status === 403) return "La verifica anti-spam non è più valida. Completala di nuovo.";
  if (status === 429) return "Hai effettuato troppi tentativi. Attendi un minuto e riprova.";
  if (status === 503) return "Il servizio è temporaneamente non disponibile. Riprova più tardi o usa l’email diretta.";
  return typeof serverMessage === "string" && serverMessage ? serverMessage : "Non è stato possibile inviare la richiesta. Riprova o usa l’email diretta.";
};

if (form instanceof HTMLFormElement && submitButton instanceof HTMLButtonElement) {
  ["name", "email", "organization", "subject", "message", "privacyAccepted"].forEach((name) => {
    const control = field(name);
    control?.addEventListener(control instanceof HTMLSelectElement || control?.type === "checkbox" ? "change" : "blur", () => validateField(name));
  });

  const message = field("message");
  message?.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting || !validateForm()) return;

    if (!turnstileToken) {
      setChallengeStatus("Completa la verifica anti-spam prima di inviare.", "error");
      challengeWrap?.setAttribute("tabindex", "-1");
      challengeWrap?.focus();
      return;
    }

    submitting = true;
    submitButton.disabled = true;
    submitButton.textContent = "Invio in corso…";
    setFormStatus("Invio della richiesta in corso.");

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12_000);
    const payload = {
      name: String(field("name")?.value || "").trim(),
      email: String(field("email")?.value || "").trim(),
      organization: String(field("organization")?.value || "").trim(),
      subject: String(field("subject")?.value || ""),
      message: String(field("message")?.value || "").trim(),
      website: String(field("website")?.value || ""),
      privacyAccepted: Boolean(field("privacyAccepted")?.checked),
      turnstileToken,
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "same-origin",
        signal: controller.signal,
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.ok !== true) {
        setFormStatus(responseMessage(response.status, result.error), "error");
        if (response.status !== 422) resetChallenge();
        return;
      }

      try {
        sessionStorage.setItem("miniutti-contact-confirmed", String(Date.now()));
      } catch {
        // La conferma resta prudente se lo storage del browser non è disponibile.
      }
      window.location.assign("/conferma-invio.html");
    } catch (error) {
      const timedOut = error instanceof DOMException && error.name === "AbortError";
      setFormStatus(
        timedOut
          ? "Il servizio non ha risposto in tempo. Il modulo è rimasto compilato: riprova o usa l’email diretta."
          : "La connessione si è interrotta. Il modulo è rimasto compilato: riprova o usa l’email diretta.",
        "error",
      );
      resetChallenge();
    } finally {
      window.clearTimeout(timeout);
      submitting = false;
      submitButton.disabled = false;
      submitButton.textContent = "Invia il messaggio";
    }
  });
}

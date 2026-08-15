"use strict";

const form = document.querySelector("#contact-form");
const submitButton = document.querySelector("#submit-button");
const statusMessage = document.querySelector("#form-status");

const setStatus = (message, state = "") => {
  statusMessage.textContent = message;
  statusMessage.dataset.state = state;
};

const getTurnstileToken = () => {
  const tokenField = form.elements.namedItem("cf-turnstile-response");
  return tokenField instanceof HTMLInputElement ? tokenField.value : "";
};

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("");

  if (!form.reportValidity()) return;

  const turnstileToken = getTurnstileToken();
  if (!turnstileToken) {
    setStatus("Completa la verifica Cloudflare prima di inviare.", "error");
    return;
  }

  const data = new FormData(form);
  const payload = {
    name: String(data.get("name") || "").trim(),
    email: String(data.get("email") || "").trim(),
    organization: String(data.get("organization") || "").trim(),
    subject: String(data.get("subject") || "").trim(),
    message: String(data.get("message") || "").trim(),
    privacyAccepted: data.get("privacyAccepted") === "on",
    turnstileToken,
  };

  submitButton.disabled = true;
  submitButton.textContent = "Invio…";
  setStatus("Invio della richiesta in corso.");

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || "Non è stato possibile inviare il messaggio.");
    }

    window.location.assign("conferma-invio.html");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Non è stato possibile inviare il messaggio.", "error");
    if (window.turnstile) window.turnstile.reset();
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Invia";
  }
});

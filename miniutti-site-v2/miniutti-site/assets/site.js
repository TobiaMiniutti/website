(() => {
  "use strict";

  const form = document.querySelector("#contact-form");
  const status = document.querySelector("#form-status");
  const submitButton = form?.querySelector("button[type='submit']");
  const config = window.MINIUTTI_CONFIG || {};
  let widgetId = null;

  document.querySelector("#year").textContent = new Date().getFullYear();

  const setStatus = (message, type = "") => {
    status.textContent = message;
    status.className = `form-status ${type}`.trim();
  };

  const markValidity = () => {
    let firstInvalid = null;
    for (const field of form.querySelectorAll("input[required], textarea[required]")) {
      const valid = field.checkValidity();
      field.setAttribute("aria-invalid", String(!valid));
      if (!valid && !firstInvalid) firstInvalid = field;
    }
    firstInvalid?.focus();
    return !firstInvalid;
  };

  const renderTurnstile = () => {
    if (!window.turnstile) {
      window.setTimeout(renderTurnstile, 100);
      return;
    }

    if (!config.turnstileSiteKey || config.turnstileSiteKey.startsWith("INSERISCI_")) {
      setStatus("Configurazione Turnstile da completare prima della pubblicazione.", "error");
      submitButton.disabled = true;
      return;
    }

    widgetId = window.turnstile.render("#turnstile-container", {
      sitekey: config.turnstileSiteKey,
      action: "contact",
      theme: "dark",
      size: "flexible",
      "error-callback": () => setStatus("Verifica di sicurezza non disponibile. Ricarica la pagina.", "error"),
      "expired-callback": () => setStatus("Verifica scaduta: completala nuovamente.", "error")
    });
  };

  renderTurnstile();

  form?.addEventListener("input", (event) => {
    if (event.target.matches("input, textarea")) event.target.removeAttribute("aria-invalid");
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("");

    if (!markValidity()) {
      setStatus("Controlla i campi evidenziati.", "error");
      return;
    }

    const token = widgetId === null ? "" : window.turnstile.getResponse(widgetId);
    if (!token) {
      setStatus("Completa la verifica di sicurezza.", "error");
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    data.turnstileToken = token;
    submitButton.disabled = true;
    setStatus("Invio in corso…");

    try {
      const response = await fetch(config.contactApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Invio non riuscito");

      form.reset();
      window.turnstile.reset(widgetId);
      setStatus("Messaggio inviato correttamente. Ti risponderò appena possibile.", "success");
    } catch (error) {
      window.turnstile.reset(widgetId);
      setStatus(error.message || "Non è stato possibile inviare il messaggio. Riprova.", "error");
    } finally {
      submitButton.disabled = false;
    }
  });
})();

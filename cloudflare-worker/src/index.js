const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };

function jsonResponse(origin, status, body) {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: {
      ...JSON_HEADERS,
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      "Cache-Control": "no-store",
      "Vary": "Origin"
    }
  });
}

const clean = value => typeof value === "string" ? value.trim() : "";

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigins = new Set((env.ALLOWED_ORIGINS || "https://www.miniutti.it,https://miniutti.it")
      .split(",").map(value => value.trim()).filter(Boolean));

    if (!allowedOrigins.has(origin)) return new Response("Forbidden", { status: 403 });
    if (request.method === "OPTIONS") return jsonResponse(origin, 204, {});

    const url = new URL(request.url);
    if (request.method !== "POST" || url.pathname !== "/contact") {
      return jsonResponse(origin, 404, { message: "Risorsa non disponibile." });
    }

    if (!(request.headers.get("Content-Type") || "").includes("application/json")) {
      return jsonResponse(origin, 415, { message: "Richiesta non valida." });
    }

    let input;
    try {
      const rawBody = await request.text();
      if (new TextEncoder().encode(rawBody).byteLength > 12_000) {
        return jsonResponse(origin, 413, { message: "Richiesta troppo grande." });
      }
      input = JSON.parse(rawBody);
    } catch {
      return jsonResponse(origin, 400, { message: "Richiesta non valida." });
    }

    const payload = {
      name: clean(input.name),
      email: clean(input.email).toLowerCase(),
      message: clean(input.message)
    };
    const token = clean(input.turnstileToken);
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email);

    if (!payload.name || payload.name.length > 100 || !emailOk || payload.email.length > 254 ||
        !payload.message || payload.message.length > 5000 || !token || token.length > 2048) {
      return jsonResponse(origin, 400, { message: "Controlla i dati inseriti." });
    }

    const verificationBody = new FormData();
    verificationBody.set("secret", env.TURNSTILE_SECRET_KEY);
    verificationBody.set("response", token);
    verificationBody.set("remoteip", request.headers.get("CF-Connecting-IP") || "");
    verificationBody.set("idempotency_key", crypto.randomUUID());

    let verification;
    try {
      const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body: verificationBody
      });
      verification = result.ok ? await result.json() : { success: false };
    } catch {
      return jsonResponse(origin, 503, { message: "Verifica di sicurezza non disponibile. Riprova." });
    }

    const allowedHostnames = new Set((env.TURNSTILE_HOSTNAMES || "miniutti.it,www.miniutti.it")
      .split(",").map(value => value.trim()).filter(Boolean));
    if (!verification.success || verification.action !== "contact" || !allowedHostnames.has(verification.hostname)) {
      return jsonResponse(origin, 400, { message: "Verifica di sicurezza non riuscita. Riprova." });
    }

    let upstream;
    try {
      upstream = await fetch(env.CONTACT_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, source: "miniutti.it", receivedAt: new Date().toISOString() })
      });
    } catch {
      return jsonResponse(origin, 502, { message: "Invio temporaneamente non disponibile. Riprova." });
    }

    if (!upstream.ok) {
      return jsonResponse(origin, 502, { message: "Invio temporaneamente non disponibile. Riprova." });
    }
    return jsonResponse(origin, 200, { ok: true });
  }
};

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };

function response(origin, status, body) {
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

function allowedOrigins(env) {
  return new Set((env.ALLOWED_ORIGINS || "https://www.miniutti.it,https://miniutti.it")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean));
}

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

async function verifyTurnstile(token, ip, env) {
  const body = new FormData();
  body.set("secret", env.TURNSTILE_SECRET_KEY);
  body.set("response", token);
  if (ip) body.set("remoteip", ip);
  body.set("idempotency_key", crypto.randomUUID());

  const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body
  });
  if (!verification.ok) return { success: false };
  return verification.json();
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = allowedOrigins(env);
    if (!allowed.has(origin)) return new Response("Forbidden", { status: 403 });

    if (request.method === "OPTIONS") return response(origin, 204, {});
    const url = new URL(request.url);
    if (request.method !== "POST" || url.pathname !== "/contact") {
      return response(origin, 404, { message: "Risorsa non disponibile." });
    }

    const contentType = request.headers.get("Content-Type") || "";
    const contentLength = Number(request.headers.get("Content-Length") || 0);
    if (!contentType.includes("application/json") || contentLength > 12_000) {
      return response(origin, 415, { message: "Richiesta non valida." });
    }

    let input;
    try {
      const rawBody = await request.text();
      if (new TextEncoder().encode(rawBody).byteLength > 12_000) {
        return response(origin, 413, { message: "Richiesta troppo grande." });
      }
      input = JSON.parse(rawBody);
    } catch {
      return response(origin, 400, { message: "Richiesta non valida." });
    }

    if (clean(input.company_website)) return response(origin, 200, { ok: true });

    const payload = {
      name: clean(input.name),
      email: clean(input.email).toLowerCase(),
      subject: clean(input.subject),
      message: clean(input.message)
    };
    const token = clean(input.turnstileToken);
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email);

    if (!payload.name || payload.name.length > 100 || !emailOk || payload.email.length > 254 ||
        !payload.subject || payload.subject.length > 140 || payload.message.length < 10 ||
        payload.message.length > 5000 || !token || token.length > 2048) {
      return response(origin, 400, { message: "Controlla i dati inseriti." });
    }

    let turnstile;
    try {
      turnstile = await verifyTurnstile(token, request.headers.get("CF-Connecting-IP"), env);
    } catch {
      return response(origin, 503, { message: "Verifica di sicurezza non disponibile. Riprova." });
    }

    const hostnames = new Set((env.TURNSTILE_HOSTNAMES || "miniutti.it,www.miniutti.it")
      .split(",").map(value => value.trim()).filter(Boolean));
    if (!turnstile.success || turnstile.action !== "contact" || !hostnames.has(turnstile.hostname)) {
      return response(origin, 400, { message: "Verifica di sicurezza non riuscita. Riprova." });
    }

    let upstream;
    try {
      upstream = await fetch(env.CONTACT_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          source: "miniutti.it",
          receivedAt: new Date().toISOString()
        })
      });
    } catch {
      return response(origin, 502, { message: "Invio temporaneamente non disponibile. Riprova." });
    }

    if (!upstream.ok) return response(origin, 502, { message: "Invio temporaneamente non disponibile. Riprova." });
    return response(origin, 200, { ok: true });
  }
};

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const MAX_BODY_BYTES = 16_384;
const ALLOWED_SUBJECTS = new Set(["collaboration", "web-development", "systems", "media", "other"]);

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  },
});

const normalized = (value, maxLength) => typeof value === "string" ? value.trim().slice(0, maxLength) : "";
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;

export function validatePayload(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;

  const payload = {
    name: normalized(input.name, 100),
    email: normalized(input.email, 254).toLowerCase(),
    organization: normalized(input.organization, 120),
    subject: normalized(input.subject, 40),
    message: normalized(input.message, 4000),
    privacyAccepted: input.privacyAccepted === true,
    turnstileToken: normalized(input.turnstileToken, 2048),
  };

  if (
    payload.name.length < 2 ||
    !isEmail(payload.email) ||
    !ALLOWED_SUBJECTS.has(payload.subject) ||
    payload.message.length < 10 ||
    !payload.privacyAccepted ||
    !payload.turnstileToken
  ) return null;

  return payload;
}

export function isAllowedOrigin(origin, configuredOrigins) {
  const allowed = String(configuredOrigins || "https://miniutti.it,https://www.miniutti.it")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return allowed.includes(origin);
}

async function verifyTurnstile(token, request, env) {
  const body = new FormData();
  body.set("secret", env.TURNSTILE_SECRET_KEY);
  body.set("response", token);
  body.set("remoteip", request.headers.get("CF-Connecting-IP") || "");
  body.set("idempotency_key", crypto.randomUUID());

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    body,
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) return false;

  const result = await response.json();
  const acceptedHostnames = String(env.ALLOWED_HOSTNAMES || "miniutti.it,www.miniutti.it")
    .split(",")
    .map((value) => value.trim());

  return result.success === true && result.action === "contact" && acceptedHostnames.includes(result.hostname);
}

async function forwardMessage(payload, request, env) {
  const response = await fetch(env.MAKE_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "miniutti-contact-worker/1.0",
    },
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      organization: payload.organization,
      subject: payload.subject,
      message: payload.message,
      submittedAt: new Date().toISOString(),
      requestId: request.headers.get("CF-Ray") || crypto.randomUUID(),
    }),
    signal: AbortSignal.timeout(10_000),
  });
  return response.ok;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/api/contact") return json({ error: "Not found" }, 404);
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

    const origin = request.headers.get("Origin") || "";
    if (!isAllowedOrigin(origin, env.ALLOWED_ORIGINS)) return json({ error: "Request not allowed" }, 403);

    const contentType = request.headers.get("Content-Type") || "";
    const length = Number(request.headers.get("Content-Length") || "0");
    if (!contentType.startsWith("application/json") || length > MAX_BODY_BYTES) {
      return json({ error: "Invalid request" }, 400);
    }

    let input;
    try {
      const raw = await request.text();
      if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return json({ error: "Invalid request" }, 400);
      input = JSON.parse(raw);
    } catch {
      return json({ error: "Invalid request" }, 400);
    }

    const payload = validatePayload(input);
    if (!payload) return json({ error: "Controlla i dati inseriti e riprova." }, 422);

    try {
      if (!await verifyTurnstile(payload.turnstileToken, request, env)) {
        return json({ error: "Verifica Cloudflare non valida. Riprova." }, 403);
      }
      if (!await forwardMessage(payload, request, env)) throw new Error("Forwarding failed");
      return json({ ok: true }, 202);
    } catch {
      return json({ error: "Servizio temporaneamente non disponibile. Riprova più tardi." }, 503);
    }
  },
};

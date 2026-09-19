import test from "node:test";
import assert from "node:assert/strict";
import worker, {
  forwardMessage,
  isAllowedOrigin,
  isTemporaryForwardFailure,
  validatePayload,
} from "../src/index.js";

const validPayload = {
  name: "Mario Rossi",
  email: "mario@example.com",
  organization: "Example",
  subject: "collaboration",
  message: "Messaggio sufficientemente lungo.",
  privacyAccepted: true,
  turnstileToken: "token",
};

const makeContactRequest = (payload = validPayload, headers = {}) => new Request("https://miniutti.it/api/contact", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Origin: "https://miniutti.it",
    ...headers,
  },
  body: JSON.stringify(payload),
});

const makeEnv = (overrides = {}) => ({
  TURNSTILE_SECRET_KEY: "test-secret",
  MAKE_WEBHOOK_URL: "https://hook.example/contact",
  ALLOWED_ORIGINS: "https://miniutti.it",
  ALLOWED_HOSTNAMES: "miniutti.it",
  CONTACT_EMAIL_RATE_LIMITER: { limit: async () => ({ success: true }) },
  CONTACT_GLOBAL_RATE_LIMITER: { limit: async () => ({ success: true }) },
  ...overrides,
});

test("accepts a valid payload", () => {
  assert.equal(validatePayload(validPayload)?.email, "mario@example.com");
});

test("accepts every public request category", () => {
  for (const subject of ["collaboration", "project-evaluation", "web-development", "systems", "media", "other-digital", "other"]) {
    assert.equal(validatePayload({ ...validPayload, subject })?.subject, subject);
  }
});

test("rejects invalid fields", () => {
  assert.equal(validatePayload({ ...validPayload, email: "invalid" }), null);
  assert.equal(validatePayload({ ...validPayload, message: "short" }), null);
  assert.equal(validatePayload({ ...validPayload, subject: "admin" }), null);
  assert.equal(validatePayload({ ...validPayload, privacyAccepted: false }), null);
});

for (const [field, maxLength] of [
  ["name", 100],
  ["organization", 120],
  ["message", 4000],
  ["turnstileToken", 2048],
]) {
  test(`${field} accepts its exact length limit and rejects one character more`, () => {
    assert.equal(validatePayload({ ...validPayload, [field]: "x".repeat(maxLength) })?.[field].length, maxLength);
    assert.equal(validatePayload({ ...validPayload, [field]: "x".repeat(maxLength + 1) }), null);
  });
}

test("email accepts 254 characters and rejects 255", () => {
  assert.equal(validatePayload({ ...validPayload, email: `${"a".repeat(242)}@example.com` })?.email.length, 254);
  assert.equal(validatePayload({ ...validPayload, email: `${"a".repeat(243)}@example.com` }), null);
});

test("keeps the optional organization empty and rejects it when oversized", () => {
  assert.equal(validatePayload({ ...validPayload, organization: "" })?.organization, "");
  assert.equal(validatePayload({ ...validPayload, organization: "x".repeat(121) }), null);
});

test("does not include the honeypot in the validated payload", () => {
  const payload = validatePayload({ ...validPayload, website: "https://spam.example" });

  assert.ok(payload);
  assert.equal(Object.hasOwn(payload, "website"), false);
});

test("checks the exact default origin", () => {
  assert.equal(isAllowedOrigin("https://miniutti.it"), true);
  assert.equal(isAllowedOrigin("https://www.miniutti.it"), true);
  assert.equal(isAllowedOrigin("https://miniutti.it.evil.example"), false);
  assert.equal(isAllowedOrigin("https://miniutti.it/"), false);
});

test("parses a comma-separated origin allowlist", () => {
  const configuredOrigins = " https://preview.miniutti.it, ,https://miniutti.it  ";

  assert.equal(isAllowedOrigin("https://preview.miniutti.it", configuredOrigins), true);
  assert.equal(isAllowedOrigin("https://miniutti.it", configuredOrigins), true);
  assert.equal(isAllowedOrigin("https://www.miniutti.it", configuredOrigins), false);
  assert.equal(isAllowedOrigin("", configuredOrigins), false);
});

test("retains the 16 KB request-body limit", async () => {
  const jsonAtSize = (size) => {
    const prefix = '{"website":"bot","padding":"';
    const suffix = '"}';
    return `${prefix}${"x".repeat(size - prefix.length - suffix.length)}${suffix}`;
  };
  const makeRequest = (body) => new Request("https://worker.example/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://miniutti.it",
    },
    body,
  });
  const env = { ALLOWED_ORIGINS: "https://miniutti.it" };

  assert.equal((await worker.fetch(makeRequest(jsonAtSize(16_384)), env)).status, 202);
  assert.equal((await worker.fetch(makeRequest(jsonAtSize(16_385)), env)).status, 400);
});

test("classifies only temporary HTTP failures as retryable", () => {
  for (const status of [408, 425, 429, 500, 502, 503, 504, 599]) {
    assert.equal(isTemporaryForwardFailure(status), true, `${status} should be retryable`);
  }
  for (const status of [300, 400, 401, 403, 404, 409, 422]) {
    assert.equal(isTemporaryForwardFailure(status), false, `${status} should not be retryable`);
  }
});

test("does not retry a permanent Make rejection", async (t) => {
  let attempts = 0;
  t.mock.method(console, "warn", () => {});
  t.mock.method(globalThis, "fetch", async () => {
    attempts += 1;
    return new Response(null, { status: 422 });
  });

  const forwarded = await forwardMessage(
    validPayload,
    new Request("https://worker.example/api/contact"),
    { MAKE_WEBHOOK_URL: "https://hook.example/contact" },
  );

  assert.equal(forwarded, false);
  assert.equal(attempts, 1);
});

test("retries a temporary Make failure with one stable request ID", async (t) => {
  const attempts = [];
  t.mock.method(console, "warn", () => {});
  t.mock.method(globalThis, "fetch", async (url, options) => {
    attempts.push({
      url,
      requestIdHeader: new Headers(options.headers).get("X-Request-ID"),
      payload: JSON.parse(options.body),
    });
    return new Response(null, { status: attempts.length === 1 ? 503 : 204 });
  });

  const forwarded = await forwardMessage(
    validPayload,
    new Request("https://worker.example/api/contact"),
    { MAKE_WEBHOOK_URL: "https://hook.example/contact" },
  );

  assert.equal(forwarded, true);
  assert.equal(attempts.length, 2);
  assert.equal(attempts[0].requestIdHeader, attempts[1].requestIdHeader);
  assert.equal(attempts[0].payload.requestId, attempts[0].requestIdHeader);
  assert.deepEqual(attempts[0].payload, attempts[1].payload);
});

test("retries a network error", async (t) => {
  let attempts = 0;
  t.mock.method(console, "warn", () => {});
  t.mock.method(globalThis, "fetch", async () => {
    attempts += 1;
    if (attempts === 1) throw new TypeError("network unavailable");
    return new Response(null, { status: 204 });
  });

  const forwarded = await forwardMessage(
    validPayload,
    new Request("https://worker.example/api/contact", { headers: { "CF-Ray": "ray-123" } }),
    { MAKE_WEBHOOK_URL: "https://hook.example/contact" },
  );

  assert.equal(forwarded, true);
  assert.equal(attempts, 2);
});

test("accepts a complete request only after Turnstile and forwarding succeed", async (t) => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls.push({ url: String(url), options });
    if (String(url).includes("siteverify")) {
      return Response.json({ success: true, action: "contact", hostname: "miniutti.it" });
    }
    return new Response(null, { status: 204 });
  });

  const response = await worker.fetch(makeContactRequest(), makeEnv());
  const result = await response.json();
  const forwarded = JSON.parse(calls[1].options.body);

  assert.equal(response.status, 202);
  assert.deepEqual(result, { ok: true });
  assert.equal(calls.length, 2);
  assert.equal(forwarded.email, validPayload.email);
  assert.equal(Object.hasOwn(forwarded, "turnstileToken"), false);
  assert.equal(Object.hasOwn(forwarded, "privacyAccepted"), false);
});

test("rejects a failed Turnstile check before rate limits and forwarding", async (t) => {
  let rateLimitCalls = 0;
  let fetchCalls = 0;
  t.mock.method(globalThis, "fetch", async () => {
    fetchCalls += 1;
    return Response.json({ success: false });
  });
  const env = makeEnv({
    CONTACT_EMAIL_RATE_LIMITER: { limit: async () => { rateLimitCalls += 1; return { success: true }; } },
  });

  const response = await worker.fetch(makeContactRequest(), env);

  assert.equal(response.status, 403);
  assert.equal(fetchCalls, 1);
  assert.equal(rateLimitCalls, 0);
});

test("returns 429 when either rate limiter refuses the request", async (t) => {
  let forwardingCalls = 0;
  t.mock.method(globalThis, "fetch", async (url) => {
    if (String(url).includes("siteverify")) {
      return Response.json({ success: true, action: "contact", hostname: "miniutti.it" });
    }
    forwardingCalls += 1;
    return new Response(null, { status: 204 });
  });
  const env = makeEnv({
    CONTACT_EMAIL_RATE_LIMITER: { limit: async () => ({ success: false }) },
  });

  const response = await worker.fetch(makeContactRequest(), env);

  assert.equal(response.status, 429);
  assert.equal(response.headers.get("Retry-After"), "60");
  assert.equal(forwardingCalls, 0);
});

test("honeypot requests return a neutral response without external calls", async (t) => {
  let fetchCalls = 0;
  t.mock.method(globalThis, "fetch", async () => {
    fetchCalls += 1;
    return new Response(null, { status: 500 });
  });

  const response = await worker.fetch(makeContactRequest({ website: "bot.example" }), makeEnv());

  assert.equal(response.status, 202);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(fetchCalls, 0);
});

import test from "node:test";
import assert from "node:assert/strict";
import { isAllowedOrigin, validatePayload } from "../src/index.js";

const validPayload = {
  name: "Mario Rossi",
  email: "mario@example.com",
  organization: "Example",
  subject: "collaboration",
  message: "Messaggio sufficientemente lungo.",
  privacyAccepted: true,
  turnstileToken: "token",
};

test("accepts a valid payload", () => {
  assert.equal(validatePayload(validPayload)?.email, "mario@example.com");
});

test("accepts every public request category", () => {
  for (const subject of ["collaboration", "project-evaluation", "web-development", "systems", "media", "other-digital", "other"]) {
    assert.equal(validatePayload({ ...validPayload, subject })?.subject, subject);
  }
});

test("rejects invalid and oversized fields", () => {
  assert.equal(validatePayload({ ...validPayload, email: "invalid" }), null);
  assert.equal(validatePayload({ ...validPayload, message: "short" }), null);
  assert.equal(validatePayload({ ...validPayload, subject: "admin" }), null);
  assert.equal(validatePayload({ ...validPayload, privacyAccepted: false }), null);
});

test("checks the exact origin", () => {
  assert.equal(isAllowedOrigin("https://miniutti.it"), true);
  assert.equal(isAllowedOrigin("https://miniutti.it.evil.example"), false);
});

import { describe, expect, it } from "vitest";
import { createConsentRecord, parseConsent } from "./consent";
import { siteConfig } from "../config";

describe("consent record", () => {
  it("creates a versioned record that expires within six months", () => {
    const now = Date.UTC(2026, 8, 8);
    const record = createConsentRecord(true, now);
    expect(record.version).toBe(siteConfig.consentVersion);
    expect(record.analytics).toBe(true);
    expect(Date.parse(record.expiresAt) - now).toBe(siteConfig.consentLifetimeDays * 86_400_000);
  });
  it("rejects expired, malformed, or obsolete records", () => {
    const now = Date.UTC(2026, 8, 8);
    expect(parseConsent("not-json", now)).toBeNull();
    expect(parseConsent(JSON.stringify(createConsentRecord(false, now - 200 * 86_400_000)), now)).toBeNull();
    expect(parseConsent(JSON.stringify({ ...createConsentRecord(false, now), version: "old" }), now)).toBeNull();
  });
  it("accepts a current rejection decision", () => {
    const now = Date.UTC(2026, 8, 8);
    expect(parseConsent(JSON.stringify(createConsentRecord(false, now)), now)?.analytics).toBe(false);
  });
});

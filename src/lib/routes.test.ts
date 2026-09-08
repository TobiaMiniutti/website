import { describe, expect, it } from "vitest";
import { canonicalFor, normalizePath, routes } from "./routes";

describe("static routes", () => {
  it("normalizes compatibility URLs", () => {
    expect(normalizePath("/privacy.html")).toBe("/privacy/");
    expect(normalizePath("/conferma-invio.html")).toBe("/conferma-invio/");
  });
  it("includes every published project route", () => {
    expect(routes.filter((route) => route.path.startsWith("/progetti/")).length).toBe(5);
  });
  it("uses self-referencing canonical URLs", () => {
    expect(canonicalFor("/progetti/culina/")).toBe("https://miniutti.it/progetti/culina/");
  });
});

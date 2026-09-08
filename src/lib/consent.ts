import { hasAnalytics, siteConfig } from "../config";

export type ConsentRecord = {
  version: string;
  analytics: boolean;
  decidedAt: string;
  expiresAt: string;
};

export const CONSENT_STORAGE_KEY = "miniutti-consent";

export function parseConsent(raw: string | null, now = Date.now()): ConsentRecord | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<ConsentRecord>;
    if (
      value.version !== siteConfig.consentVersion ||
      typeof value.analytics !== "boolean" ||
      typeof value.decidedAt !== "string" ||
      typeof value.expiresAt !== "string"
    ) return null;
    const decidedAt = Date.parse(value.decidedAt);
    const expiresAt = Date.parse(value.expiresAt);
    if (!Number.isFinite(decidedAt) || !Number.isFinite(expiresAt) || decidedAt > now || expiresAt <= now) return null;
    return value as ConsentRecord;
  } catch {
    return null;
  }
}

export function createConsentRecord(analytics: boolean, now = Date.now()): ConsentRecord {
  return {
    version: siteConfig.consentVersion,
    analytics,
    decidedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + siteConfig.consentLifetimeDays * 86_400_000).toISOString(),
  };
}

export function initializeConsentDefaults() {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(...args: unknown[]) { window.dataLayer.push(args); };
  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500,
  });
}

let analyticsLoaded = false;
let pageViewSent = false;

export function enableAnalytics() {
  if (typeof document === "undefined" || !hasAnalytics) return false;
  initializeConsentDefaults();
  window.gtag("consent", "update", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  if (!analyticsLoaded && !document.querySelector("script[data-miniutti-ga]")) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(siteConfig.gaMeasurementId)}`;
    script.dataset.miniuttiGa = "true";
    document.head.append(script);
    analyticsLoaded = true;
    window.gtag("js", new Date());
    window.gtag("config", siteConfig.gaMeasurementId, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      send_page_view: false,
    });
  }
  if (!pageViewSent) {
    window.gtag("event", "page_view", {
      page_location: window.location.href,
      page_path: `${window.location.pathname}${window.location.search}`,
      page_title: document.title,
    });
    pageViewSent = true;
  }
  return true;
}

function expireCookie(name: string, domain?: string) {
  const domainPart = domain ? `; domain=${domain}` : "";
  document.cookie = `${name}=; Max-Age=0; path=/${domainPart}; SameSite=Lax`;
}

export function disableAnalytics() {
  if (typeof document === "undefined") return;
  initializeConsentDefaults();
  window.gtag("consent", "update", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  const names = document.cookie.split(";").map((part) => part.trim().split("=")[0]).filter((name) => /^_ga(?:_|$)/.test(name));
  for (const name of names) {
    expireCookie(name);
    expireCookie(name, location.hostname);
    expireCookie(name, `.${location.hostname}`);
    const registrable = location.hostname.split(".").slice(-2).join(".");
    if (registrable) expireCookie(name, `.${registrable}`);
  }
  pageViewSent = false;
}

export const consentServices = [
  { category: "Necessari", service: "Preferenze miniutti.it", storage: CONSENT_STORAGE_KEY, duration: "180 giorni", purpose: "Ricorda la scelta sul consenso." },
  { category: "Necessari", service: "Cloudflare Turnstile", storage: "Tecnologie di sicurezza gestite da Cloudflare", duration: "Limitata alla verifica", purpose: "Protegge il modulo quando viene richiesto il contatto." },
  { category: "Analitici", service: "Google Analytics 4", storage: "_ga, _ga_<container>", duration: hasAnalytics ? siteConfig.gaDataRetention : "Non attivo", purpose: "Misura in forma aggregata l’uso del sito, solo dopo consenso." },
] as const;

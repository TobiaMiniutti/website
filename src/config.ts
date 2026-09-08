export const siteConfig = {
  origin: "https://miniutti.it",
  name: "miniutti.it",
  owner: "Tobia Miniutti",
  location: "Bologna, Italia",
  email: "tobia@miniutti.it",
  privacyEmail: "privacy@miniutti.it",
  landlineDisplay: "+39 051 1947 1903",
  landlineTel: "+3905119471903",
  mobileDisplay: import.meta.env.VITE_MOBILE_PHONE_DISPLAY?.trim() || "",
  mobileTel: import.meta.env.VITE_MOBILE_PHONE_TEL?.trim() || "",
  turnstileSiteKey: import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() || "1x00000000000000000000AA",
  gaMeasurementId: import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() || "",
  gaDataRetention: import.meta.env.VITE_GA_DATA_RETENTION?.trim() || "da verificare nella proprietà prima dell’attivazione",
  heroVideo: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260517_222138_3e3205be-3364-417b-a64a-bfe087acbec4.mp4",
  methodVideo: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260505_101331_74f9b798-3f00-4e86-8a01-377aa16ffeaa.mp4",
  consentVersion: "2026-09-08",
  consentLifetimeDays: 180,
} as const;

export const hasPublicMobile = Boolean(siteConfig.mobileDisplay && /^\+?[\d\s().-]{6,}$/.test(siteConfig.mobileDisplay) && /^\+\d{7,15}$/.test(siteConfig.mobileTel));
export const hasAnalytics = import.meta.env.PROD && /^G-[A-Z0-9]{6,}$/.test(siteConfig.gaMeasurementId);

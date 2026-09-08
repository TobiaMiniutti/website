/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TURNSTILE_SITE_KEY?: string;
  readonly VITE_MOBILE_PHONE_DISPLAY?: string;
  readonly VITE_MOBILE_PHONE_TEL?: string;
  readonly VITE_GA_MEASUREMENT_ID?: string;
  readonly VITE_GA_DATA_RETENTION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  dataLayer: unknown[];
  gtag: (...args: unknown[]) => void;
  turnstile?: {
    render: (container: HTMLElement, options: Record<string, unknown>) => string;
    reset: (widgetId?: string) => void;
    remove: (widgetId: string) => void;
  };
}

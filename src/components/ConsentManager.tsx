import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { createConsentRecord, disableAnalytics, enableAnalytics, parseConsent, CONSENT_STORAGE_KEY, type ConsentRecord } from "../lib/consent";

type ConsentContextValue = {
  consent: ConsentRecord | null;
  save: (analytics: boolean) => void;
  reopen: () => void;
  preferencesOpen: boolean;
  closePreferences: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function useConsent() {
  const context = useContext(ConsentContext);
  if (!context) throw new Error("useConsent must be used within ConsentManager");
  return context;
}

export function ConsentManager({ children, suppressBanner = false }: { children: React.ReactNode; suppressBanner?: boolean }) {
  const [consent, setConsent] = useState<ConsentRecord | null>(null);
  const [ready, setReady] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    let raw: string | null = null;
    try { raw = localStorage.getItem(CONSENT_STORAGE_KEY); } catch { raw = null; }
    const stored = parseConsent(raw);
    setConsent(stored);
    setReady(true);
    if (stored?.analytics) enableAnalytics();
    else disableAnalytics();
  }, []);

  const save = useCallback((analytics: boolean) => {
    const record = createConsentRecord(analytics);
    try { localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record)); } catch { /* The choice still applies to this page view. */ }
    setConsent(record);
    setPreferencesOpen(false);
    if (analytics) enableAnalytics();
    else disableAnalytics();
  }, []);

  const value = useMemo(() => ({
    consent,
    save,
    reopen: () => setPreferencesOpen(true),
    preferencesOpen,
    closePreferences: () => setPreferencesOpen(false),
  }), [consent, preferencesOpen, save]);

  return (
    <ConsentContext.Provider value={value}>
      {children}
      {ready && !consent && !suppressBanner && <CookieBanner onSave={save} />}
      {preferencesOpen && <QuickPreferences current={consent?.analytics ?? false} onSave={save} onClose={() => setPreferencesOpen(false)} />}
    </ConsentContext.Provider>
  );
}

function CookieBanner({ onSave }: { onSave: (analytics: boolean) => void }) {
  return (
    <section className="cookie-banner" aria-label="Preferenze sui cookie" aria-live="polite">
      <button className="cookie-close" type="button" onClick={() => onSave(false)} aria-label="Chiudi e rifiuta i cookie non necessari">
        <X aria-hidden="true" size={20} />
      </button>
      <p className="eyebrow">PRIVACY · SCELTA</p>
      <h2>Solo ciò che scegli.</h2>
      <p>Il sito usa una memoria tecnica per conservare la tua scelta. Google Analytics resta spento finché non lo autorizzi. Chiudere equivale a rifiutare gli strumenti non necessari.</p>
      <div className="cookie-links"><a href="/privacy/">Privacy</a><a href="/preferenze-cookie/">Dettagli e preferenze</a></div>
      <div className="cookie-actions">
        <button type="button" className="button button-equal" onClick={() => onSave(true)}>Accetta tutti</button>
        <button type="button" className="button button-equal" onClick={() => onSave(false)}>Rifiuta non necessari</button>
        <a className="button button-equal" href="/preferenze-cookie/">Personalizza</a>
      </div>
    </section>
  );
}

function QuickPreferences({ current, onSave, onClose }: { current: boolean; onSave: (analytics: boolean) => void; onClose: () => void }) {
  const [analytics, setAnalytics] = useState(current);
  const titleId = "quick-preferences-title";
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = document.querySelector<HTMLElement>("[data-quick-preferences]");
    dialog?.focus();
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") { onClose(); return; }
      if (event.key !== "Tab" || !dialog) return;
      const items = [...dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled])')];
      if (!items.length) return;
      const first = items[0];
      const last = items.at(-1)!;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handler);
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = previousOverflow; previous?.focus(); };
  }, [onClose]);
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="quick-preferences" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} data-quick-preferences>
        <button className="cookie-close" type="button" onClick={onClose} aria-label="Chiudi preferenze"><X aria-hidden="true" size={20} /></button>
        <p className="eyebrow">PREFERENZE</p>
        <h2 id={titleId}>Controlla gli analitici.</h2>
        <div className="preference-row"><div><strong>Necessari</strong><p>Sempre attivi per sicurezza e memoria della scelta.</p></div><span className="always-on">Sempre attivi</span></div>
        <label className="preference-row preference-control"><div><strong>Analitici</strong><p>Google Analytics 4, senza pubblicità.</p></div><input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} /></label>
        <div className="cookie-actions"><button className="button button-dark" type="button" onClick={() => onSave(analytics)}>Salva preferenze</button><a className="text-link" href="/preferenze-cookie/">Apri i dettagli</a></div>
      </section>
    </div>
  );
}

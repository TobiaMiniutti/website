import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, LoaderCircle } from "lucide-react";
import { hasPublicMobile, siteConfig } from "../config";
import { Reveal } from "./Reveal";

type FormState = "idle" | "loading" | "error";

export function ContactSection() {
  const formRef = useRef<HTMLFormElement>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const [token, setToken] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [status, setStatus] = useState("");

  useEffect(() => {
    let cancelled = false;
    const render = () => {
      if (cancelled || !turnstileRef.current || !window.turnstile || widgetId.current) return;
      widgetId.current = window.turnstile.render(turnstileRef.current, {
        sitekey: siteConfig.turnstileSiteKey,
        action: "contact",
        theme: "dark",
        language: "it",
        size: "flexible",
        callback: (value: string) => setToken(value),
        "expired-callback": () => setToken(""),
        "error-callback": () => { setToken(""); setStatus("La verifica Cloudflare non è disponibile. Riprova tra poco."); },
      });
    };
    const existing = document.querySelector<HTMLScriptElement>('script[data-turnstile]');
    if (existing) { if (window.turnstile) render(); else existing.addEventListener("load", render, { once: true }); }
    else {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.dataset.turnstile = "true";
      script.addEventListener("load", render, { once: true });
      document.head.append(script);
    }
    return () => { cancelled = true; if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current); };
  }, []);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state === "loading") return;
    const form = formRef.current;
    if (!form || !form.reportValidity()) { setStatus("Controlla i campi indicati prima di inviare."); return; }
    if (!token) { setStatus("Completa la verifica Cloudflare prima di inviare."); turnstileRef.current?.focus(); return; }
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || "").trim(), email: String(data.get("email") || "").trim(),
      organization: String(data.get("organization") || "").trim(), subject: String(data.get("subject") || "").trim(),
      message: String(data.get("message") || "").trim(), website: String(data.get("website") || "").trim(),
      privacyAccepted: data.get("privacyAccepted") === "on", turnstileToken: token,
    };
    setState("loading"); setStatus("Invio della richiesta in corso.");
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Non è stato possibile inviare il messaggio.");
      window.location.assign("/conferma-invio/");
    } catch (error) {
      setState("error"); setStatus(error instanceof Error ? error.message : "Non è stato possibile inviare il messaggio.");
      window.turnstile?.reset(widgetId.current); setToken("");
    } finally { setState((current) => current === "error" ? "error" : "idle"); }
  };

  return (
    <section id="contatti" className="contact-section" aria-labelledby="contact-title">
      <div className="section-index light" aria-hidden="true">05 / CONTATTO</div>
      <div className="contact-threshold" aria-hidden="true"><span>IL PUNTO DI CONTATTO</span><i /></div>
      <div className="contact-layout">
        <Reveal className="contact-intro"><p className="eyebrow">PARLIAMO DEL CONTESTO</p><h2 id="contact-title">Facciamo incontrare idea e possibilità.</h2><p>Descrivi il problema, l’obiettivo e gli eventuali vincoli. Valuterò direttamente il contesto per costruire una risposta concreta, senza formule standard.</p><div className="direct-contacts"><a href={`mailto:${siteConfig.email}`}><span>Email</span>{siteConfig.email}<ArrowUpRight aria-hidden="true" size={18} /></a>{hasPublicMobile && <a href={`tel:${siteConfig.mobileTel}`}><span>Cellulare</span>{siteConfig.mobileDisplay}</a>}<a href={`tel:${siteConfig.landlineTel}`}><span>Fisso</span>{siteConfig.landlineDisplay}</a></div></Reveal>
        <Reveal className="form-shell" delay={.08}>
          <form ref={formRef} onSubmit={submit} noValidate aria-describedby="form-safety form-status">
            <div className="form-grid"><Field id="name" label="Nome e cognome"><input id="name" name="name" type="text" autoComplete="name" minLength={2} maxLength={100} required /></Field><Field id="email" label="Email"><input id="email" name="email" type="email" autoComplete="email" inputMode="email" maxLength={254} required /></Field></div>
            <div className="form-grid"><Field id="organization" label="Organizzazione" optional><input id="organization" name="organization" type="text" autoComplete="organization" maxLength={120} /></Field><Field id="subject" label="Tipo di richiesta"><select id="subject" name="subject" required defaultValue=""><option value="" disabled>Seleziona</option><option value="collaboration">Collaborazione</option><option value="project-evaluation">Valutazione progetto</option><option value="web-development">Sviluppo web</option><option value="systems">Sistemi e infrastrutture</option><option value="media">Digital media</option><option value="other-digital">Altro progetto digitale</option><option value="other">Altro</option></select></Field></div>
            <Field id="message" label="Messaggio"><textarea id="message" name="message" minLength={10} maxLength={4000} required aria-describedby="form-safety" /><p id="form-safety" className="field-hint">Da 10 a 4.000 caratteri. Non inserire password o dati sensibili.</p></Field>
            <div className="honeypot" aria-hidden="true"><label htmlFor="website">Sito web</label><input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" /></div>
            <label className="privacy-check"><input name="privacyAccepted" type="checkbox" required /><span>Dichiaro di aver letto l’<a href="/privacy/" target="_blank" rel="noopener noreferrer">informativa privacy</a>. Questa presa visione non autorizza gli analitici.</span></label>
            <div className="form-end"><div ref={turnstileRef} className="turnstile-slot" tabIndex={-1} aria-label="Verifica di sicurezza Cloudflare" /><button className="submit-button" type="submit" disabled={state === "loading"}>{state === "loading" ? <LoaderCircle className="spin" aria-hidden="true" /> : <Check aria-hidden="true" />}<span>{state === "loading" ? "Invio…" : "Invia richiesta"}</span></button></div>
            <p id="form-status" className="form-status" role="status" aria-live="polite" data-state={state}>{status}</p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

function Field({ id, label, optional = false, children }: { id: string; label: string; optional?: boolean; children: React.ReactNode }) {
  return <div className="field"><label htmlFor={id}>{label}{optional ? <span>Facoltativo</span> : <b aria-hidden="true">*</b>}</label>{children}</div>;
}

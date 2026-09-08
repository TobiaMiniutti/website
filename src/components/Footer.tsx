import { ArrowUpRight } from "lucide-react";
import { hasPublicMobile, siteConfig } from "../config";
import { useConsent } from "./ConsentManager";
import { Signature } from "./Signature";

export function Footer() {
  const { reopen } = useConsent();
  return (
    <footer className="site-footer">
      <div className="footer-signature"><Signature /><p className="eyebrow">MINIUTTI.IT / BOLOGNA</p><h2>Tobia Miniutti</h2><p>Web Solutions | Digital Media</p></div>
      <div className="footer-nav"><p className="eyebrow">INDICE</p><a href="/#home">Home</a><a href="/#progetti">Progetti</a><a href="/privacy/">Privacy</a><button type="button" onClick={reopen}>Rivedi le preferenze cookie</button></div>
      <div className="footer-contact"><p className="eyebrow">CONTATTI</p><a href={`mailto:${siteConfig.email}`}>{siteConfig.email}<ArrowUpRight aria-hidden="true" size={16} /></a>{hasPublicMobile && <a href={`tel:${siteConfig.mobileTel}`}>{siteConfig.mobileDisplay}</a>}<a href={`tel:${siteConfig.landlineTel}`}>{siteConfig.landlineDisplay}</a><p>{siteConfig.location}</p></div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Tobia Miniutti</span><span>miniutti.it — Tutti i diritti riservati</span><span className="tricolour" aria-hidden="true"><i /><i /><i /></span></div>
    </footer>
  );
}

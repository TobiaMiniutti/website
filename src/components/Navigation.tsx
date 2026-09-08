import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Signature } from "./Signature";

const navItems = [
  { label: "Home", hash: "home" },
  { label: "Metodo", hash: "metodo" },
  { label: "Progetti", hash: "progetti" },
  { label: "Contatti", hash: "contatti" },
] as const;

function linkFor(hash: string, isHome: boolean) {
  return isHome ? `#${hash}` : `/#${hash}`;
}

export function Navigation({ path }: { path: string }) {
  const isHome = path === "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState(isHome ? "home" : "");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isHome || !("IntersectionObserver" in window)) return;
    const observed = navItems.map(({ hash }) => document.getElementById(hash)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActive(visible.target.id);
    }, { rootMargin: "-22% 0px -62%", threshold: [0.05, 0.3] });
    observed.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [isHome]);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () => [...(overlayRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [])];
    focusable()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMenuOpen(false); return; }
      if (event.key !== "Tab") return;
      const items = focusable();
      const first = items[0];
      const last = items.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      triggerRef.current?.focus();
    };
  }, [menuOpen]);

  return (
    <>
      <motion.header className="site-nav" initial={reduceMotion ? false : { opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .72, delay: .08, ease: [.16, 1, .3, 1] }}>
        <div className="site-nav-inner">
          <a className="site-brand" href={linkFor("home", isHome)} aria-label="miniutti.it — Home">
            <Signature />
            <span><strong>miniutti.it</strong><small>Digital systems · Bologna</small></span>
          </a>
          <nav className="desktop-nav" aria-label="Navigazione principale">
            {navItems.map((item) => <a key={item.hash} href={linkFor(item.hash, isHome)} aria-current={isHome && active === item.hash ? "location" : undefined}><span>{item.label}</span></a>)}
          </nav>
          <div className="site-nav-actions">
            <span className="availability"><i />Disponibile per nuovi progetti</span>
            <a className="nav-cta" href={linkFor("contatti", isHome)}>Parliamo <ArrowUpRight aria-hidden="true" size={16} /></a>
          </div>
          <button ref={triggerRef} className="menu-trigger" type="button" aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(true)}>
            <Menu aria-hidden="true" size={21} /><span className="sr-only">Apri menu</span>
          </button>
        </div>
      </motion.header>

      {menuOpen && (
        <motion.div id="mobile-navigation" ref={overlayRef} className="mobile-menu" role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="mobile-menu-head"><a className="site-brand" href={linkFor("home", isHome)} onClick={() => setMenuOpen(false)}><Signature /><span><strong>miniutti.it</strong><small>Digital systems · Bologna</small></span></a><button className="menu-close" type="button" onClick={() => setMenuOpen(false)}><X aria-hidden="true" /><span className="sr-only">Chiudi menu</span></button></div>
          <p id="mobile-menu-title" className="eyebrow">NAVIGAZIONE</p>
          <nav className="mobile-menu-links" aria-label="Navigazione mobile">
            {navItems.map((item, index) => <a key={item.hash} href={linkFor(item.hash, isHome)} onClick={() => setMenuOpen(false)} aria-current={isHome && active === item.hash ? "location" : undefined}><span>0{index + 1}</span>{item.label}</a>)}
          </nav>
          <a className="mobile-menu-cta" href={linkFor("contatti", isHome)} onClick={() => setMenuOpen(false)}>Raccontami il progetto <ArrowUpRight aria-hidden="true" /></a>
        </motion.div>
      )}
    </>
  );
}

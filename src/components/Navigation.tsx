import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Signature } from "./Signature";

const navItems = [
  { label: "Home", hash: "home" },
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
    }, { rootMargin: "-25% 0px -55%", threshold: [0.05, 0.25, 0.6] });
    observed.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [isHome]);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const overlay = overlayRef.current;
    const focusable = () => [...(overlay?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled])') ?? [])];
    focusable()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMenuOpen(false); return; }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items.at(-1)!;
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

  const closeAndScroll = () => setMenuOpen(false);
  return (
    <>
      <motion.header className="identity-rail" initial={reduceMotion ? false : { opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, ease: [.22, 1, .36, 1] }}>
        <a className="identity-link" href={linkFor("home", isHome)} aria-label="miniutti.it — Home">
          <Signature /><span>miniutti.it</span>
        </a>
        <p className="rail-meta">BOLOGNA · SISTEMI DIGITALI</p>
        <button ref={triggerRef} className="menu-trigger" type="button" aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(true)}>
          <Menu aria-hidden="true" size={21} /><span className="sr-only">Apri menu</span>
        </button>
      </motion.header>

      <motion.nav className="floating-nav" aria-label="Navigazione principale" initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, delay: reduceMotion ? 0 : 1.05, ease: [.22, 1, .36, 1] }}>
        <a className="floating-brand" href={linkFor("home", isHome)} aria-label="miniutti.it — Home"><Signature /></a>
        {navItems.map((item) => <a key={item.hash} href={linkFor(item.hash, isHome)} aria-current={isHome && active === item.hash ? "location" : undefined}>{item.label}</a>)}
        <a className="nav-cta" href={linkFor("contatti", isHome)}>Parliamo <ArrowUpRight aria-hidden="true" size={17} /></a>
      </motion.nav>

      {menuOpen && (
        <div id="mobile-navigation" ref={overlayRef} className="mobile-menu" role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title">
          <div className="mobile-menu-head"><a className="identity-link dark" href={linkFor("home", isHome)} onClick={closeAndScroll}><Signature /><span>miniutti.it</span></a><button className="menu-close" type="button" onClick={() => setMenuOpen(false)}><X aria-hidden="true" /><span className="sr-only">Chiudi menu</span></button></div>
          <p id="mobile-menu-title" className="eyebrow">INDICE / NAVIGAZIONE</p>
          <nav className="mobile-menu-links" aria-label="Navigazione mobile">
            {navItems.map((item, index) => <a key={item.hash} href={linkFor(item.hash, isHome)} onClick={closeAndScroll} aria-current={isHome && active === item.hash ? "location" : undefined}><span>0{index + 1}</span>{item.label}</a>)}
          </nav>
          <a className="mobile-menu-cta" href={linkFor("contatti", isHome)} onClick={closeAndScroll}>Parliamo del progetto <ArrowUpRight aria-hidden="true" /></a>
        </div>
      )}
    </>
  );
}

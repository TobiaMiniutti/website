import { ArrowRight, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { siteConfig } from "../config";
import { publishedProjects } from "../data/projects";
import { ContactSection } from "../components/ContactSection";
import { ProjectCard } from "../components/ProjectCard";
import { Reveal } from "../components/Reveal";
import { SmartVideo } from "../components/SmartVideo";
import { StackMarquee } from "../components/StackMarquee";

const capabilities = [
  ["+01", "SVILUPPO WEB"], ["+02", "SISTEMI E AUTOMAZIONE"], ["+03", "DIGITAL MEDIA"],
];

const areas = [
  ["01", "Applicazioni web e gestionali", "Strumenti costruiti intorno a processi, dati e attività operative concrete."],
  ["02", "Automazione e sistemi integrati", "Software, dispositivi e servizi collegati per ridurre attrito e ripetizioni."],
  ["03", "Infrastrutture self-hosted e cloud", "Ambienti controllabili, protetti e pensati per rimanere comprensibili."],
  ["04", "Digital media", "Contenuti e sistemi visivi coerenti con identità, obiettivi e canali."],
];

const method = [
  ["01", "Contesto", "Si parte dal problema reale, dai vincoli e da ciò che deve restare sotto controllo."],
  ["02", "Architettura", "Scelte tecniche proporzionate, confini chiari e sicurezza progettata prima dell’interfaccia."],
  ["03", "Realizzazione", "Il sistema prende forma per parti verificabili, mantenendo continuità tra logica e utilizzo."],
  ["04", "Continuità", "Documentazione, distribuzione e manutenzione vengono considerate come parte del progetto."],
];

export function HomePage() {
  const reduceMotion = useReducedMotion();
  return (
    <>
      <section id="home" className="hero" aria-labelledby="hero-title">
        <SmartVideo src={siteConfig.heroVideo} poster="/assets/images/hero-poster.webp" className="hero-media" />
        <div className="hero-frame">
          <div className="hero-copy">
            <motion.p className="hero-eyebrow" initial={reduceMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, delay: .18, ease: [.22, 1, .36, 1] }}>TOBIA MINIUTTI · BOLOGNA, ITALIA</motion.p>
            <h1 id="hero-title" className="hero-title">
              {["Sistemi digitali,", "progettati", "su misura."].map((line, index) => <span className="clip-line" key={line}><motion.span className={index === 2 ? "signature-word" : ""} initial={reduceMotion ? false : { y: "110%" }} animate={{ y: 0 }} transition={{ duration: .7, delay: reduceMotion ? 0 : .4 + index * .14, ease: [.22, 1, .36, 1] }}>{line}</motion.span></span>)}
            </h1>
            <motion.div className="hero-support" initial={reduceMotion ? false : { opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, delay: reduceMotion ? 0 : .86, ease: [.22, 1, .36, 1] }}><p>Sviluppo web, sistemi digitali e infrastrutture progettati su misura, con precisione per ogni esigenza.</p><div className="hero-actions"><a className="button button-light" href="#progetti">Esplora i progetti <ArrowRight aria-hidden="true" /></a><a className="button button-ghost-light" href="#contatti">Parliamo del progetto <ArrowUpRight aria-hidden="true" /></a></div></motion.div>
          </div>
          <motion.div className="capability-index" aria-label="Ambiti principali" initial={reduceMotion ? false : { opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, delay: reduceMotion ? 0 : .96, ease: [.22, 1, .36, 1] }}>{capabilities.map(([number, label]) => <div key={number}><strong>{number}</strong><span>{label}</span></div>)}</motion.div>
        </div>
      </section>

      <StackMarquee />

      <main id="contenuto" className="porcelain-surface">
        <section className="profile-section" aria-labelledby="profile-title">
          <div className="section-index" aria-hidden="true">01 / PROFILO</div>
          <Reveal className="profile-statement"><p className="eyebrow">PERSONA / SISTEMI</p><h2 id="profile-title">Progetto soluzioni digitali partendo da problemi reali.</h2></Reveal>
          <Reveal className="profile-copy" delay={.08}><p>Unisco sviluppo web, automazione e infrastrutture con un metodo orientato a sicurezza, affidabilità, semplicità d’uso e personalizzazione, curando ogni progetto affinché rimanga solido e duraturo nel tempo.</p></Reveal>
          <Reveal className="profile-image" delay={.14}><picture><source srcSet="/assets/images/porta-brandeburgo-720.webp 720w, /assets/images/porta-brandeburgo-1200.webp 1200w" type="image/webp" /><img src="/assets/images/porta-brandeburgo.jpg" width="3021" height="3113" alt="Dettaglio della Quadriga sopra la Porta di Brandeburgo, fotografata dal basso sotto un cielo nuvoloso" loading="lazy" decoding="async" /></picture><p className="image-caption"><span>ARCHIVIO PERSONALE</span>Quadriga della Porta di Brandeburgo</p></Reveal>
        </section>

        <section className="areas-section" aria-labelledby="areas-title">
          <div className="section-index" aria-hidden="true">02 / AMBITI</div>
          <div className="editorial-heading"><p className="eyebrow">COMPETENZE CONNESSE</p><h2 id="areas-title">Dal codice al sistema che lo sostiene.</h2></div>
          <div className="areas-list">{areas.map(([number, title, copy], index) => <Reveal className="area-row" delay={index * .05} key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></Reveal>)}</div>
        </section>

        <section className="method-section" aria-labelledby="method-title">
          <div className="section-index light" aria-hidden="true">03 / METODO</div>
          <div className="method-media"><SmartVideo src={siteConfig.methodVideo} poster="/assets/images/method-poster.webp" className="method-video" lazy /><div className="method-media-label"><span>SIGNATURE SYSTEMS</span><span>PROCESSO / 04 PASSAGGI</span></div></div>
          <div className="method-copy"><div className="method-heading"><p className="eyebrow">METODO</p><h2 id="method-title">Precisione senza complicare ciò che deve funzionare.</h2></div><ol>{method.map(([number, title, copy]) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></li>)}</ol></div>
        </section>

        <section id="progetti" className="projects-section" aria-labelledby="projects-title">
          <div className="section-index" aria-hidden="true">04 / PROGETTI</div>
          <Reveal className="projects-heading"><p className="eyebrow">SELEZIONE</p><h2 id="projects-title">Sistemi costruiti per esigenze specifiche.</h2><p>Tre progetti che attraversano gestione, prodotto digitale e recupero tecnologico.</p></Reveal>
          <div className="selected-projects">{publishedProjects.slice(0, 3).map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}<Reveal className="all-projects-card"><a href="/progetti/"><span className="eyebrow">ARCHIVIO / 04 PROGETTI</span><strong>Mostra tutti i progetti</strong><p>Apri l’indice completo, con contesto, approccio e dettagli tecnici.</p><ArrowUpRight aria-hidden="true" /></a></Reveal></div>
        </section>

        <ContactSection />
      </main>
    </>
  );
}

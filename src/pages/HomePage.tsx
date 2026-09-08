import { ArrowRight, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { siteConfig } from "../config";
import { publishedProjects } from "../data/projects";
import { ContactSection } from "../components/ContactSection";
import { CreationContinuum } from "../components/CreationContinuum";
import { ProjectCard } from "../components/ProjectCard";
import { Reveal } from "../components/Reveal";
import { SmartVideo } from "../components/SmartVideo";

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
      <CreationContinuum />
      <section id="home" className="hero" aria-labelledby="hero-title">
        <div className="hero-media" aria-hidden="true" />
        <div className="hero-vignette" aria-hidden="true" />
        <div className="hero-frame">
          <div className="hero-copy">
            <motion.p className="hero-eyebrow" initial={reduceMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .16, ease: [.16, 1, .3, 1] }}><span />TOBIA MINIUTTI · DIGITAL CRAFT</motion.p>
            <h1 id="hero-title" className="hero-title">
              {["Sistemi digitali,", "coltivati su misura."].map((line, index) => <span className="clip-line" key={line}><motion.span className={index === 1 ? "signature-word" : ""} initial={reduceMotion ? false : { y: "112%" }} animate={{ y: 0 }} transition={{ duration: .95, delay: reduceMotion ? 0 : .36 + index * .14, ease: [.16, 1, .3, 1] }}>{line}</motion.span></span>)}
            </h1>
            <motion.div className="hero-support" initial={reduceMotion ? false : { opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .75, delay: reduceMotion ? 0 : .72, ease: [.16, 1, .3, 1] }}><p>Web, automazioni e infrastrutture pensati come organismi vivi: chiari da usare, solidi nel tempo, unici nel carattere.</p><div className="hero-actions"><a className="button button-light" href="#progetti">Scopri i progetti <ArrowRight aria-hidden="true" /></a><a className="button button-ghost-light" href="#contatti">Inizia una conversazione <ArrowUpRight aria-hidden="true" /></a></div></motion.div>
          </div>
          <motion.div className="capability-index" aria-label="Ambiti principali" initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: reduceMotion ? 0 : .94, ease: [.16, 1, .3, 1] }}>{capabilities.map(([number, label]) => <div key={number}><strong>{number}</strong><span>{label}</span></div>)}</motion.div>
          <motion.a className="hero-scroll" href="#profilo" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .8, delay: reduceMotion ? 0 : 1.2 }}><span>Scorri per entrare</span><i /></motion.a>
        </div>
      </section>

      <main id="contenuto" className="porcelain-surface">
        <section id="profilo" className="profile-section" aria-labelledby="profile-title">
          <div className="section-index" aria-hidden="true">01 / RADICI</div>
          <Reveal className="profile-statement"><p className="eyebrow">PERSONA / SISTEMI</p><h2 id="profile-title">La tecnologia migliore non si impone. <em>Prende forma intorno alle persone.</em></h2></Reveal>
          <Reveal className="profile-copy" delay={.08}><p>Progetto e realizzo soluzioni digitali a Bologna, unendo sviluppo web, automazione e infrastrutture. Ogni scelta nasce dal contesto: meno rumore, più controllo, un’esperienza che resta comprensibile anche quando il sistema cresce.</p><a className="text-link" href="#metodo">Il mio metodo <ArrowRight aria-hidden="true" size={18} /></a></Reveal>
          <div className="profile-note"><span>INDIPENDENTE</span><span>PROGETTI REALI</span><span>DAL 2019</span></div>
        </section>

        <section className="areas-section" aria-labelledby="areas-title">
          <div className="section-index light" aria-hidden="true">02 / ECOSISTEMA</div>
          <div className="editorial-heading"><p className="eyebrow">COMPETENZE CONNESSE</p><h2 id="areas-title">Dal primo gesto all’infrastruttura invisibile.</h2></div>
          <div className="areas-list">{areas.map(([number, title, copy], index) => <Reveal className="area-row" delay={index * .05} key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></Reveal>)}</div>
        </section>

        <section id="metodo" className="method-section" aria-labelledby="method-title">
          <div className="section-index light" aria-hidden="true">03 / METODO</div>
          <div className="method-media"><SmartVideo src={siteConfig.methodVideo} poster="/assets/images/method-poster.webp" className="method-video" lazy /><div className="method-media-label"><span>ARCHITETTURA IN MOVIMENTO</span><span>PROCESSO / 04 PASSAGGI</span></div></div>
          <div className="method-copy"><div className="method-heading"><p className="eyebrow">METODO</p><h2 id="method-title">Crescere con ordine, senza perdere l’essenziale.</h2></div><ol>{method.map(([number, title, copy]) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></li>)}</ol></div>
        </section>

        <section id="progetti" className="projects-section" aria-labelledby="projects-title">
          <div className="section-index" aria-hidden="true">04 / FRUTTI</div>
          <Reveal className="projects-heading"><p className="eyebrow">PROGETTI SELEZIONATI</p><h2 id="projects-title">Ogni lavoro ha una forma propria.</h2><p>Nessun guscio preconfezionato: struttura, linguaggio e interazione cambiano con il problema da risolvere.</p></Reveal>
          <div className="selected-projects">{publishedProjects.slice(0, 3).map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}<Reveal className="all-projects-card"><a href="/progetti/"><span className="eyebrow">ARCHIVIO / 04 PROGETTI</span><strong>Mostra tutti i progetti</strong><p>Apri l’indice completo, con contesto, approccio e dettagli tecnici.</p><ArrowUpRight aria-hidden="true" /></a></Reveal></div>
        </section>

        <ContactSection />
      </main>
    </>
  );
}

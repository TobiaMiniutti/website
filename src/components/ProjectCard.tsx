import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { Project } from "../data/projects";

export function ProjectVisual({ project }: { project: Project }) {
  if (project.slug === "mns-warehouse") {
    return <div className="project-visual visual-warehouse" aria-hidden="true"><div className="visual-top"><span>WAREHOUSE OS</span><span>LIVE INVENTORY</span></div><div className="warehouse-map"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><div className="visual-bottom"><span>0248 articoli</span><span>12 ubicazioni</span><b>Sincronizzato</b></div></div>;
  }
  if (project.slug === "culina") {
    return <div className="project-visual visual-culina" aria-hidden="true"><div className="culina-word">culina</div><div className="recipe-sheet"><small>RICETTA · 014</small><strong>Pane,<br />tempo,<br />memoria.</strong><span>farina · acqua · sale</span><i /></div><div className="culina-orbit"><span>salva</span><span>cucina</span><span>condividi</span></div></div>;
  }
  if (project.slug === "little-printer-revival") {
    return <div className="project-visual visual-printer" aria-hidden="true"><div className="printer-device"><div className="printer-face"><i /><i /></div><div className="printer-slot" /><div className="receipt"><small>GOOD MORNING</small><strong>Il servizio<br />è di nuovo vivo.</strong><span>08 · 09 · 2026</span></div></div><div className="printer-signal"><i /><i /><i /><i /></div></div>;
  }
  return <div className="project-visual visual-garage" aria-hidden="true"><div className="garage-door"><i /><i /><i /><i /><i /></div><div className="access-pass"><small>ACCESSO SICURO</small><strong>APERTO</strong><span>Autorizzazione verificata</span><i /></div><div className="garage-code">SGA / 04</div></div>;
}

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.article className={`project-card project-card-${project.slug}`} style={{ "--project-accent": project.cover.accent } as React.CSSProperties} initial={reduceMotion ? false : { opacity: 0, y: 44 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .16 }} transition={{ duration: .8, delay: index * .07, ease: [.16, 1, .3, 1] }}>
      <a className="project-card-link" href={`/progetti/${project.slug}/`} aria-label={`${project.title}: apri il progetto`}>
        <ProjectVisual project={project} />
        <div className="project-card-copy">
          <div className="project-card-meta"><p className="eyebrow">{project.category}</p><span>{project.cover.code}</span></div>
          <h3>{project.title}</h3>
          <p>{project.shortDescription}</p>
          <span className="project-open">Esplora il progetto <ArrowUpRight aria-hidden="true" size={19} /></span>
        </div>
      </a>
    </motion.article>
  );
}

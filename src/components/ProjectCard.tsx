import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { Project } from "../data/projects";

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.article className="project-card" style={{ "--project-accent": project.cover.accent } as React.CSSProperties} initial={reduceMotion ? false : { opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: .6, delay: index * .08, ease: [.22, 1, .36, 1] }}>
      <a className="project-card-link" href={`/progetti/${project.slug}/`} aria-label={`${project.title}: apri il progetto`}>
        <div className="project-cover" aria-hidden="true"><span>{project.cover.code}</span><strong>{project.title}</strong><i /></div>
        <div className="project-card-copy"><p className="eyebrow">{project.category}</p><h3>{project.title}</h3><p>{project.shortDescription}</p><span className="project-open">Apri il progetto <ArrowUpRight aria-hidden="true" size={19} /></span></div>
      </a>
    </motion.article>
  );
}

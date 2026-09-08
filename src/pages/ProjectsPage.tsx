import { ArrowUpRight } from "lucide-react";
import { InternalIntro } from "../components/InternalIntro";
import { ProjectCard } from "../components/ProjectCard";
import { publishedProjects } from "../data/projects";

export function ProjectsPage() {
  return <main id="contenuto" className="internal-main"><InternalIntro index="P / 01" eyebrow="INDICE DEI PROGETTI" title="Progetti, sistemi, recuperi." copy="Una raccolta in evoluzione di strumenti digitali e infrastrutture nati da necessità precise. Nessun caso fittizio: solo lavoro descritto per ciò che è verificabile." /><section className="archive-section" aria-labelledby="archive-title"><div className="archive-heading"><p className="eyebrow">ARCHIVIO PUBBLICO</p><h2 id="archive-title">Quattro direzioni, un metodo.</h2></div><div className="archive-grid">{publishedProjects.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}</div></section><section className="internal-cta"><p className="eyebrow">UN PROBLEMA CONCRETO?</p><h2>Partiamo dal contesto.</h2><a className="button button-light" href="/#contatti">Parliamo del progetto <ArrowUpRight aria-hidden="true" /></a></section></main>;
}

import { publishedProjects } from "../data/projects";
import { siteConfig } from "../config";

export type RouteMeta = {
  path: string;
  title: string;
  description: string;
  noindex?: boolean;
  type?: "website" | "article";
};

const baseRoutes: RouteMeta[] = [
  { path: "/", title: "Tobia Miniutti | Sviluppo e sistemi digitali", description: "Sviluppo web, sistemi digitali, infrastrutture, automazione e digital media progettati su misura." },
  { path: "/progetti/", title: "Progetti | Tobia Miniutti", description: "Una selezione di applicazioni web, sistemi digitali, automazioni e progetti di infrastruttura realizzati da Tobia Miniutti." },
  { path: "/privacy/", title: "Privacy | miniutti.it", description: "Informativa sul trattamento dei dati personali degli utenti di miniutti.it." },
  { path: "/preferenze-cookie/", title: "Preferenze cookie | miniutti.it", description: "Gestisci il consenso ai cookie tecnici e agli strumenti analitici di miniutti.it." },
  { path: "/conferma-invio/", title: "Messaggio inviato | miniutti.it", description: "Conferma di ricezione del messaggio inviato a Tobia Miniutti.", noindex: true },
  { path: "/404/", title: "Pagina non trovata | miniutti.it", description: "La pagina richiesta non è disponibile.", noindex: true },
];

export const routes: RouteMeta[] = [
  ...baseRoutes,
  ...publishedProjects.map((project) => ({
    path: `/progetti/${project.slug}/`,
    title: project.seo.title,
    description: project.seo.description,
    type: "article" as const,
  })),
];

export function normalizePath(input: string) {
  const withoutQuery = input.split(/[?#]/)[0] || "/";
  if (withoutQuery === "/index.html") return "/";
  if (withoutQuery === "/privacy.html") return "/privacy/";
  if (withoutQuery === "/contatti.html") return "/";
  if (withoutQuery === "/conferma-invio.html") return "/conferma-invio/";
  if (withoutQuery === "/404.html") return "/404/";
  return withoutQuery === "/" || withoutQuery.endsWith("/") ? withoutQuery : `${withoutQuery}/`;
}

export function routeMeta(path: string) {
  return routes.find((route) => route.path === normalizePath(path)) ?? routes.find((route) => route.path === "/404/")!;
}

export function canonicalFor(path: string) {
  const normalized = normalizePath(path);
  return normalized === "/404/" ? `${siteConfig.origin}/404.html` : `${siteConfig.origin}${normalized}`;
}

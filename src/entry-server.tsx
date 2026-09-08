import { renderToString } from "react-dom/server";
import { App } from "./App";
import { getProject } from "./data/projects";
import { canonicalFor, normalizePath, routeMeta, routes } from "./lib/routes";
import { siteConfig } from "./config";
import "./styles.css";

export function render(url: string) {
  return renderToString(<App url={url} />);
}

export function getStaticRoutes() {
  return routes.map((route) => route.path);
}

function escapeAttribute(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export function renderHead(url: string) {
  const path = normalizePath(url);
  const meta = routeMeta(path);
  const canonical = canonicalFor(path);
  const projectSlug = path.match(/^\/progetti\/([^/]+)\/$/)?.[1];
  const project = projectSlug ? getProject(projectSlug) : undefined;
  const structured = path === "/" ? [
    { "@context": "https://schema.org", "@type": "Person", name: siteConfig.owner, url: siteConfig.origin, email: `mailto:${siteConfig.email}`, address: { "@type": "PostalAddress", addressLocality: "Bologna", addressCountry: "IT" }, knowsAbout: ["Sviluppo web", "Automazione", "Infrastrutture digitali", "Digital media"] },
    { "@context": "https://schema.org", "@type": "WebSite", name: siteConfig.name, url: siteConfig.origin, inLanguage: "it-IT" },
  ] : project ? [
    { "@context": "https://schema.org", "@type": "CreativeWork", name: project.title, description: project.shortDescription, url: canonical, author: { "@type": "Person", name: siteConfig.owner }, keywords: project.tech.join(", "), inLanguage: "it-IT" },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${siteConfig.origin}/` }, { "@type": "ListItem", position: 2, name: "Progetti", item: `${siteConfig.origin}/progetti/` }, { "@type": "ListItem", position: 3, name: project.title, item: canonical }] },
  ] : [];
  const socialImage = `${siteConfig.origin}/assets/images/hero-poster.webp`;
  return [
    `<title>${escapeAttribute(meta.title)}</title>`,
    `<meta name="description" content="${escapeAttribute(meta.description)}">`,
    meta.noindex ? `<meta name="robots" content="noindex, nofollow">` : "",
    `<link rel="canonical" href="${canonical}">`,
    `<meta property="og:type" content="${meta.type === "article" ? "article" : "website"}">`,
    `<meta property="og:locale" content="it_IT">`,
    `<meta property="og:site_name" content="miniutti.it">`,
    `<meta property="og:title" content="${escapeAttribute(meta.title)}">`,
    `<meta property="og:description" content="${escapeAttribute(meta.description)}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:image" content="${socialImage}">`,
    `<meta property="og:image:width" content="1600">`,
    `<meta property="og:image:height" content="1000">`,
    `<meta property="og:image:alt" content="Dettaglio della Porta di Brandeburgo nel sistema visivo di miniutti.it">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeAttribute(meta.title)}">`,
    `<meta name="twitter:description" content="${escapeAttribute(meta.description)}">`,
    `<meta name="twitter:image" content="${socialImage}">`,
    ...structured.map((item) => `<script type="application/ld+json">${JSON.stringify(item).replaceAll("<", "\\u003c")}</script>`),
  ].filter(Boolean).join("\n    ");
}

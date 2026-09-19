import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { projects } from "../content/projects.mjs";
import { discoverProjectGalleries } from "./project-screenshots.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(projectRoot, "public");
const distRoot = path.join(projectRoot, "dist");
const siteOrigin = "https://miniutti.it";

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const serializeJsonLd = (value) => JSON.stringify(value)
  .replaceAll("<", "\\u003c")
  .replaceAll(">", "\\u003e")
  .replaceAll("&", "\\u0026");

const projectUrl = (project) => `${siteOrigin}/progetti/${project.slug}/`;

const renderDirectionIcon = (direction) => `<svg class="direction-icon direction-icon--${direction}" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3.5 10h13m0 0-5-5m5 5-5 5" vector-effect="non-scaling-stroke"></path></svg>`;

const renderMenuIcon = () => `<svg class="menu-icon" viewBox="0 0 24 16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M2 4h20M2 12h20" vector-effect="non-scaling-stroke"></path></svg>`;

const renderHeader = () => `
  <a class="skip-link" href="#contenuto">Vai al contenuto</a>
  <header class="site-header">
    <div class="nav-shell">
      <a class="site-brand" href="/" aria-label="Tobia Miniutti — Homepage"><span class="brand-symbol" aria-hidden="true"><img src="/assets/images/logo-nav.png" alt="" width="96" height="96"></span></a>
      <nav class="desktop-nav" aria-label="Navigazione principale"><a href="/#profilo">Profilo</a><a href="/#competenze">Competenze</a><a href="/progetti/" aria-current="page">Progetti</a><a href="/contatti.html">Contatti</a></nav>
      <a class="header-contact" href="/contatti.html">Scrivimi</a>
      <button class="menu-toggle" type="button" aria-label="Apri il menu" aria-haspopup="dialog" aria-controls="mobile-menu" aria-expanded="false">${renderMenuIcon()}</button>
    </div>
    <dialog class="mobile-menu" id="mobile-menu" aria-label="Menu di navigazione">
      <div class="mobile-menu-head"><a class="site-brand" href="/" aria-label="Tobia Miniutti — Homepage"><span class="brand-symbol" aria-hidden="true"><img src="/assets/images/logo-nav.png" alt="" width="96" height="96"></span></a><button class="menu-close" type="button" aria-label="Chiudi il menu">Chiudi</button></div>
      <nav class="mobile-nav" aria-label="Navigazione mobile"><a href="/">Home</a><a href="/#profilo">Profilo</a><a href="/#competenze">Competenze</a><a href="/progetti/" aria-current="page">Progetti</a><a href="/contatti.html">Contatti</a></nav>
      <p>Tobia Miniutti · Bologna, Italia</p>
    </dialog>
  </header>`;

const renderFooter = () => `
  <footer class="site-footer">
    <div class="footer-grid">
      <div class="footer-brand"><span class="brand-symbol" aria-hidden="true"><img src="/assets/images/logo-nav.png" alt="" width="96" height="96" loading="lazy"></span><h2>Tobia Miniutti</h2><p>Sviluppo web, sistemi digitali e automazioni.</p></div>
      <nav class="footer-nav" aria-label="Link nel piè di pagina"><span>Indice</span><a href="/#profilo">Profilo</a><a href="/progetti/" aria-current="page">Progetti</a><a href="/contatti.html">Contatti</a><a href="/privacy.html">Privacy</a></nav>
      <div class="footer-contact"><span>Contatti diretti</span><a href="mailto:tobia@miniutti.it">tobia@miniutti.it</a><a href="tel:+3905119471903">+39 051 1947 1903</a><!-- MOBILE_PHONE_LINK --><p>Bologna, Italia</p></div>
    </div>
    <div class="footer-bottom"><span>© <span data-current-year>2026</span> Tobia Miniutti</span><span>miniutti.it · Tutti i diritti riservati</span></div>
  </footer>`;

const renderGardenPicture = () => `
        <picture class="case-garden" aria-hidden="true">
          <source media="(max-width: 680px)" srcset="/assets/images/garden-distance-mobile.avif" type="image/avif" width="1024" height="1536">
          <source media="(max-width: 680px)" srcset="/assets/images/garden-distance-mobile.webp" type="image/webp" width="1024" height="1536">
          <source srcset="/assets/images/garden-distance-desktop.avif" type="image/avif" width="1536" height="1024">
          <img src="/assets/images/garden-distance-desktop.webp" alt="" width="1536" height="1024" fetchpriority="high" decoding="async">
        </picture>`;

export function renderGallery(project, screenshots = []) {
  if (!screenshots.length) return "";

  const items = screenshots.map((screenshot) => {
    const defaultCaption = `Schermata ${screenshot.ordinal} di ${project.title}`;
    const caption = screenshot.caption || defaultCaption;
    const alt = defaultCaption;
    return `
          <li class="gallery-item" data-gallery-item>
            <a class="gallery-open" href="${escapeHtml(screenshot.url)}" data-gallery-open data-gallery-src="${escapeHtml(screenshot.url)}" data-gallery-alt="${escapeHtml(alt)}" data-gallery-caption="${escapeHtml(caption)}" data-gallery-width="${screenshot.width}" data-gallery-height="${screenshot.height}" aria-label="Apri ${escapeHtml(defaultCaption)} a grandezza naturale">
              <img src="${escapeHtml(screenshot.url)}" alt="${escapeHtml(alt)}" width="${screenshot.width}" height="${screenshot.height}" loading="lazy" decoding="async">
              <span class="gallery-caption">${escapeHtml(caption)}</span>
            </a>
          </li>`;
  }).join("");

  const first = screenshots[0];
  const oneImageOnly = screenshots.length < 2 ? " hidden" : "";
  return `
      <section class="project-gallery" data-gallery aria-labelledby="${escapeHtml(project.slug)}-gallery-title">
        <div class="gallery-heading">
          <p>Galleria</p>
          <h2 id="${escapeHtml(project.slug)}-gallery-title">Schermate del progetto</h2>
        </div>
        <ul class="gallery-grid" role="list">${items}
        </ul>
        <dialog class="gallery-dialog" data-gallery-dialog aria-label="Galleria di ${escapeHtml(project.title)}">
          <div class="gallery-dialog-inner">
            <button class="gallery-close" type="button" data-gallery-close aria-label="Chiudi la galleria">Chiudi</button>
            <figure class="gallery-stage">
              <img data-gallery-full src="${escapeHtml(first.url)}" alt="Schermata 1 di ${escapeHtml(project.title)}" width="${first.width}" height="${first.height}">
              <figcaption data-gallery-caption>${escapeHtml(first.caption || `Schermata 1 di ${project.title}`)}</figcaption>
            </figure>
            <div class="gallery-controls">
              <button type="button" data-gallery-prev aria-label="Schermata precedente"${oneImageOnly}>${renderDirectionIcon("left")}<span>Precedente</span></button>
              <p data-gallery-status aria-live="polite">Schermata 1 di ${screenshots.length}</p>
              <button type="button" data-gallery-next aria-label="Schermata successiva"${oneImageOnly}><span>Successiva</span>${renderDirectionIcon("right")}</button>
              <a href="${escapeHtml(first.url)}" data-gallery-original>Apri l’immagine originale</a>
            </div>
          </div>
        </dialog>
      </section>`;
}

const renderProjectPage = (project, index, screenshots) => {
  const nextProject = projects[(index + 1) % projects.length];
  const canonicalUrl = projectUrl(project);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${canonicalUrl}#progetto`,
    url: canonicalUrl,
    name: project.title,
    description: project.seoDescription,
    inLanguage: "it-IT",
    genre: project.category,
    author: {
      "@type": "Person",
      "@id": `${siteOrigin}/#person`,
      name: "Tobia Miniutti",
      url: `${siteOrigin}/`,
    },
    isPartOf: { "@id": `${siteOrigin}/progetti/#pagina` },
    ...(screenshots.length ? { image: screenshots.map((screenshot) => `${siteOrigin}${screenshot.url}`) } : {}),
  };

  const story = project.sections.map((section, sectionIndex) => `
        <section class="case-section" data-reveal${sectionIndex === 0 ? " data-bird-stop" : ""}>
          <h2>${escapeHtml(section.title)}</h2>
          ${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n          ")}
        </section>`).join("");

  return `<!doctype html>
<html lang="it" class="no-js">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="description" content="${escapeHtml(project.seoDescription)}">
  <meta name="author" content="Tobia Miniutti">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta name="theme-color" content="#17372f">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="it_IT">
  <meta property="og:site_name" content="miniutti.it">
  <meta property="og:title" content="${escapeHtml(project.title)} | Progetto di Tobia Miniutti">
  <meta property="og:description" content="${escapeHtml(project.seoDescription)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${siteOrigin}/assets/images/og-miniutti-garden.webp">
  <meta property="og:image:alt" content="Un giardino illustrato si apre tra felci, foglie e luce del mattino">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(project.title)} | Progetto di Tobia Miniutti">
  <meta name="twitter:description" content="${escapeHtml(project.seoDescription)}">
  <meta name="twitter:image" content="${siteOrigin}/assets/images/og-miniutti-garden.webp">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; script-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests">
  <title>${escapeHtml(project.title)} | Progetto di Tobia Miniutti</title>
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="icon" href="/assets/images/favicon.png" type="image/png">
  <link rel="preload" href="/assets/fonts/instrument-serif-latin-400.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/css/site.css">
  <link rel="stylesheet" href="/assets/css/botanical.css">
  <script src="/assets/js/liquid-glass.js" defer></script>
  <script src="/assets/js/site.js" defer></script>
  <script type="application/ld+json">${serializeJsonLd(structuredData)}</script>
</head>
<body class="page-case-study">
${renderHeader()}

  <main id="contenuto">
    <article class="case-study">
      <header class="case-hero">
${renderGardenPicture()}
        <div class="case-hero-content">
          <a class="back-link" href="/progetti/">${renderDirectionIcon("left")} Tutti i progetti</a>
          <div class="case-title">
            <p class="eyebrow">${escapeHtml(project.category)}</p>
            <h1>${escapeHtml(project.title)}</h1>
            <p>${escapeHtml(project.lead)}</p>
          </div>
        </div>
      </header>

      <div class="case-story" data-leaf-zone>${story}
      </div>
${renderGallery(project, screenshots)}
      <nav class="case-actions" aria-label="Azioni del progetto">
        <a class="text-link" href="/progetti/">${renderDirectionIcon("left")} Torna ai progetti</a>
        <a class="button" href="/contatti.html">Parliamone</a>
      </nav>
    </article>

    <section class="next-project" aria-labelledby="next-project-title">
      <p>Progetto successivo</p>
      <a href="/progetti/${escapeHtml(nextProject.slug)}/"><span>Continua la visita</span><strong id="next-project-title">${escapeHtml(nextProject.title)} ${renderDirectionIcon("up-right")}</strong></a>
    </section>
  </main>
${renderFooter()}
</body>
</html>
`;
};

const screenshotsFor = (galleries, slug) => {
  if (galleries instanceof Map) return galleries.get(slug) || [];
  return galleries?.[slug] || [];
};

export async function renderProjectPages(outputRoot, { galleries } = {}) {
  const resolvedOutput = path.resolve(outputRoot);
  if (resolvedOutput !== publicRoot && resolvedOutput !== distRoot) {
    throw new Error(`La generazione delle pagine progetto è consentita solo in public o dist: ${resolvedOutput}`);
  }

  const resolvedGalleries = galleries ?? await discoverProjectGalleries(resolvedOutput, projects);
  for (const [index, project] of projects.entries()) {
    const directory = path.join(resolvedOutput, "progetti", project.slug);
    await mkdir(directory, { recursive: true });
    await writeFile(
      path.join(directory, "index.html"),
      renderProjectPage(project, index, screenshotsFor(resolvedGalleries, project.slug)),
      "utf8",
    );
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await renderProjectPages(publicRoot);
  console.log(`Pagine progetto generate in ${publicRoot}`);
}

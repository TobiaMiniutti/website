import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { projects } from "../content/projects.mjs";
import { discoverProjectGalleries } from "./project-screenshots.mjs";

const root = path.resolve(process.argv[2] || "public");
const builtArtifact = path.basename(root).toLowerCase() === "dist";
const errors = [];
const expectedProjects = [
  { slug: "mns-warehouse", title: "MNS Warehouse" },
  { slug: "ricettario-ai", title: "Ricettario AI" },
  { slug: "little-printer-revival", title: "Little Printer Revival" },
];
const expectedIndexableRoutes = [
  "/",
  "/contatti.html",
  "/privacy.html",
  "/progetti/",
  ...expectedProjects.map(({ slug }) => `/progetti/${slug}/`),
];

async function walk(directory) {
  const items = [];
  for (const name of await readdir(directory)) {
    const file = path.join(directory, name);
    if ((await stat(file)).isDirectory()) items.push(...await walk(file));
    else items.push(file);
  }
  return items;
}

const exists = async (file) => {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
};

const routeFor = (file) => {
  const relative = path.relative(root, file).replaceAll("\\", "/");
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) return `/${relative.slice(0, -"index.html".length)}`;
  return `/${relative}`;
};

const resolveLocal = async (file, target) => {
  const clean = decodeURIComponent(target.split(/[?#]/)[0]);
  if (!clean) return true;
  let candidate = clean.startsWith("/") ? path.join(root, clean.slice(1)) : path.resolve(path.dirname(file), clean);
  if (clean === "/") candidate = path.join(root, "index.html");
  else if (clean.endsWith("/")) candidate = path.join(candidate, "index.html");
  if (await exists(candidate)) return true;
  if (!path.extname(candidate) && await exists(`${candidate}.html`)) return true;
  return false;
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const orderedUniqueProjectSlugs = (source) => {
  const found = [];
  for (const match of source.matchAll(/href="\/progetti\/([a-z0-9-]+)\/"/gi)) {
    if (!found.includes(match[1])) found.push(match[1]);
  }
  return found;
};
const sameList = (actual, expected) => actual.length === expected.length && actual.every((value, index) => value === expected[index]);
const visibleText = (markup) => markup
  .replace(/<[^>]+>/g, "")
  .replace(/&(?:nbsp|#160);/gi, " ")
  .trim();

if (!sameList(projects.map(({ slug }) => slug), expectedProjects.map(({ slug }) => slug))) {
  errors.push("content/projects.mjs: devono esistere esattamente i tre progetti richiesti, nell’ordine MNS Warehouse, Ricettario AI, Little Printer Revival");
}
for (const [index, expected] of expectedProjects.entries()) {
  if (projects[index]?.title !== expected.title) errors.push(`content/projects.mjs: titolo inatteso in posizione ${index + 1}`);
  if (projects[index] && Object.hasOwn(projects[index], "contribution")) errors.push(`content/projects.mjs: ${expected.slug} conserva la proprietà contribution rimossa`);
}

const expectedFiles = [
  "index.html",
  "contatti.html",
  "privacy.html",
  "conferma-invio.html",
  "404.html",
  "progetti/index.html",
  ...expectedProjects.map(({ slug }) => `progetti/${slug}/index.html`),
];

for (const expected of expectedFiles) {
  if (!await exists(path.join(root, expected))) errors.push(`File richiesto mancante: ${expected}`);
}
if (await exists(path.join(root, "progetti", "secure-garage-access", "index.html"))) {
  errors.push("La rotta rimossa progetti/secure-garage-access/ è ancora pubblicata");
}

const files = await walk(root);
const htmlFiles = files.filter((file) => path.extname(file).toLowerCase() === ".html");
const indexableRoutes = new Set();
const canonicalUrls = new Set();

if (htmlFiles.length !== expectedFiles.length) {
  errors.push(`Numero pagine HTML inatteso: ${htmlFiles.length}; attese ${expectedFiles.length}`);
}

const publicTextExtensions = new Set([".html", ".xml", ".json", ".js", ".css", ".txt", ".webmanifest"]);
for (const file of files) {
  const label = path.relative(root, file).replaceAll("\\", "/");
  if (/secure-garage-access/i.test(label)) errors.push(`Percorso rimosso ancora presente: ${label}`);
  if (!publicTextExtensions.has(path.extname(file).toLowerCase())) continue;
  const source = await readFile(file, "utf8");
  if (/secure-garage-access|Secure Garage/i.test(source)) errors.push(`${label}: riferimento al progetto rimosso`);
  if (/\b(?:quattro progetti|quattro sistemi)\b/i.test(source)) errors.push(`${label}: conteggio progetti obsoleto`);
}

for (const file of htmlFiles) {
  const source = await readFile(file, "utf8");
  const label = path.relative(root, file).replaceAll("\\", "/");
  const route = routeFor(file);
  const noindex = /<meta\s+name="robots"\s+content="[^"]*noindex/i.test(source);

  if (!/<html\s+lang="it"/i.test(source)) errors.push(`${label}: lingua italiana mancante`);
  if (!/<meta\s+name="viewport"/i.test(source)) errors.push(`${label}: viewport mancante`);
  if (!/http-equiv="Content-Security-Policy"/i.test(source)) errors.push(`${label}: CSP mancante`);
  if (!/<meta\s+name="theme-color"\s+content="#17372f"/i.test(source)) errors.push(`${label}: theme-color botanico mancante`);
  if (!/<a\s+class="skip-link"\s+href="#contenuto"/i.test(source)) errors.push(`${label}: skip link mancante`);
  if (!/id="contenuto"/i.test(source)) errors.push(`${label}: destinazione dello skip link mancante`);
  if ((source.match(/<h1\b/gi) || []).length !== 1) errors.push(`${label}: deve contenere esattamente un H1`);
  if (!/<title>[^<]+<\/title>/i.test(source)) errors.push(`${label}: title mancante`);
  if (!source.includes("Tobia Miniutti")) errors.push(`${label}: identità mancante`);
  if (!source.includes('href="/assets/css/botanical.css"')) errors.push(`${label}: foglio botanico mancante`);
  if (!source.includes('src="/assets/js/liquid-glass.js"')) errors.push(`${label}: script liquid glass mancante`);
  if (!source.includes('src="/assets/js/site.js"')) errors.push(`${label}: script principale mancante`);
  if (/maximum-scale\s*=|user-scalable\s*=\s*no/i.test(source)) errors.push(`${label}: zoom del browser limitato`);

  const forbiddenReference = source.match(
  /fonts\.(?:googleapis|gstatic)\.com|porta-brandeburgo|login\.html|hook\.[a-z0-9-]*\.make\.com/i
  );

  if (forbiddenReference) {
    errors.push(
      `${label}: riferimento esterno o legacy non consentito: ${forbiddenReference[0]}`
    );
  }

  if (!builtArtifact && /379\s*112\s*8232/i.test(source)) {
    errors.push(
      `${label}: numero mobile inserito direttamente; usare MOBILE_PHONE_DISPLAY e MOBILE_PHONE_TEL`
    );
  }

  const brandLinks = [...source.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)]
    .filter((match) => /\bclass="[^"]*\bsite-brand\b/i.test(match[1]));
  if (!brandLinks.length) errors.push(`${label}: link logo della navbar mancante`);
  for (const [, attributes, content] of brandLinks) {
    if (!/\bhref="\/"/i.test(attributes)) errors.push(`${label}: il logo navbar non punta alla homepage`);
    if (!/\baria-label="Tobia Miniutti — Homepage"/i.test(attributes)) errors.push(`${label}: nome accessibile del logo navbar inatteso`);
    if (visibleText(content)) errors.push(`${label}: il logo navbar contiene ancora testo visibile (${visibleText(content)})`);
    const logoImage = content.match(/<img\b[^>]*>/i)?.[0] || "";
    if (!logoImage || !/\balt=""/i.test(logoImage)) errors.push(`${label}: immagine logo navbar non decorativa o mancante`);
  }

  if (builtArtifact && /__[A-Z0-9_]+__|<!--\s*MOBILE_PHONE_(?:LINK|DIRECT)\s*-->/i.test(source)) {
    errors.push(`${label}: placeholder irrisolto nell’artefatto`);
  }
  if (builtArtifact && /data-sitekey="(?:__|0xqa_|qa[_-]|test(?:[_-]|$)|synthetic(?:[_-]|$)|placeholder|replace[_-]?me|your[_-]?site[_-]?key)/i.test(source)) {
    errors.push(`${label}: site key Turnstile sintetica o placeholder nell’artefatto`);
  }

  for (const image of source.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\bwidth="\d+"/i.test(image[0]) || !/\bheight="\d+"/i.test(image[0])) errors.push(`${label}: immagine senza dimensioni esplicite`);
    if (!/\balt="[^"]*"/i.test(image[0])) errors.push(`${label}: immagine senza attributo alt`);
  }

  const ids = [...source.matchAll(/\sid="([^"]+)"/gi)].map((match) => match[1]);
  const seenIds = new Set();
  for (const id of ids) {
    if (seenIds.has(id)) errors.push(`${label}: id duplicato ${id}`);
    seenIds.add(id);
  }
  for (const match of source.matchAll(/\saria-describedby="([^"]+)"/gi)) {
    for (const id of match[1].split(/\s+/)) if (!seenIds.has(id)) errors.push(`${label}: aria-describedby punta a id mancante ${id}`);
  }
  for (const match of source.matchAll(/<(?:input|select|textarea)\b[^>]*\bid="([^"]+)"[^>]*>/gi)) {
    if (!new RegExp(`<label\\b[^>]*\\bfor="${escapeRegExp(match[1])}"`, "i").test(source)) errors.push(`${label}: etichetta mancante per ${match[1]}`);
  }
  for (const match of source.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
    const accessibleName = /aria-label="[^"]+"/i.test(match[1]) || match[2].replace(/<[^>]+>/g, "").trim();
    if (!accessibleName) errors.push(`${label}: pulsante senza nome accessibile`);
  }

  for (const match of source.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|#)/i.test(target)) continue;
    if (!await resolveLocal(file, target)) errors.push(`${label}: risorsa o pagina mancante ${target}`);
  }

  for (const match of source.matchAll(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(match[1]);
    } catch {
      errors.push(`${label}: JSON-LD non valido`);
    }
  }

  if (builtArtifact) {
    const csp = source.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]*)">/i)?.[1] || "";
    for (const match of source.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)) {
      const digest = createHash("sha256").update(match[1], "utf8").digest("base64");
      if (!csp.includes(`'sha256-${digest}'`)) errors.push(`${label}: hash CSP mancante per uno script inline`);
    }
  }

  if (!noindex) {
    indexableRoutes.add(route);
    const canonical = source.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
    const expectedCanonical = `https://miniutti.it${route}`;
    if (canonical !== expectedCanonical) errors.push(`${label}: canonical atteso ${expectedCanonical}`);
    if (canonicalUrls.has(canonical)) errors.push(`${label}: canonical duplicato ${canonical}`);
    canonicalUrls.add(canonical);
    for (const property of ["og:title", "og:description", "og:url"]) {
      if (!source.includes(`property="${property}"`)) errors.push(`${label}: metadata ${property} mancanti`);
    }
    if (!source.includes("og-miniutti-garden.webp")) errors.push(`${label}: immagine social botanica mancante`);
  }
}

if (!sameList([...indexableRoutes].sort(), [...expectedIndexableRoutes].sort())) {
  errors.push(`Rotte indicizzabili inattese: trovate ${[...indexableRoutes].sort().join(", ")}; attese ${[...expectedIndexableRoutes].sort().join(", ")}`);
}

const homePage = await readFile(path.join(root, "index.html"), "utf8");
const panelStart = homePage.search(/class="[^"]*\bproject-panels\b/i);
const panelEnd = panelStart >= 0 ? homePage.indexOf("</section>", panelStart) : -1;
const panelSource = panelStart >= 0 && panelEnd > panelStart ? homePage.slice(panelStart, panelEnd) : "";
if (!panelSource) errors.push("index.html: contenitore project-panels mancante");
if ((panelSource.match(/<article\b[^>]*class="[^"]*\bproject-panel\b/gi) || []).length !== 3) errors.push("index.html: servono esattamente tre pannelli progetto");
if (!sameList(orderedUniqueProjectSlugs(panelSource), expectedProjects.map(({ slug }) => slug))) {
  errors.push("index.html: ordine progetti inatteso; atteso MNS Warehouse, Ricettario AI, Little Printer Revival");
}
if (/<(?:img|picture|source)\b|\/assets\/projects\//i.test(panelSource)) errors.push("index.html: i pannelli progetto devono essere solo testuali");
if (!homePage.includes("Alcuni dei miei progetti")) errors.push("index.html: titolo progetti richiesto mancante");
const contactAction = [...homePage.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)]
  .find((match) => /^Contattami(?:\s|$)/i.test(visibleText(match[2])));
if (!contactAction) errors.push("index.html: azione principale Contattami mancante o non semantica");
else if (!/\bhref="(?!#?$)[^"]+"/i.test(contactAction[1])) errors.push("index.html: Contattami non ha una destinazione navigabile");

const projectIndex = await readFile(path.join(root, "progetti", "index.html"), "utf8");
if (!sameList(orderedUniqueProjectSlugs(projectIndex), expectedProjects.map(({ slug }) => slug))) {
  errors.push("progetti/index.html: devono comparire esattamente i tre progetti richiesti, nell’ordine stabilito");
}
if (/\/assets\/projects\//i.test(projectIndex)) errors.push("progetti/index.html: l’indice non deve usare screenshot o immagini di progetto");
for (const { slug } of expectedProjects) {
  if (!projectIndex.includes(`https://miniutti.it/progetti/${slug}/#progetto`)) errors.push(`progetti/index.html: voce JSON-LD mancante per ${slug}`);
}

let galleries = new Map(expectedProjects.map(({ slug }) => [slug, []]));
try {
  galleries = await discoverProjectGalleries(root, projects);
} catch (error) {
  errors.push(`Gallerie progetto non valide: ${error.message}`);
}
for (const project of expectedProjects) {
  const pageFile = path.join(root, "progetti", project.slug, "index.html");
  if (!await exists(pageFile)) continue;
  const source = await readFile(pageFile, "utf8");
  if (/\bcase-contribution\b|<h[1-6]\b[^>]*>\s*Il mio\s+(?:contributo|ruolo)\s*<\/h[1-6]>/i.test(source)) {
    errors.push(`${project.slug}: box separato sul contributo ancora presente`);
  }
  const screenshots = galleries.get(project.slug) || [];
  const itemCount = (source.match(/\bdata-gallery-item\b/gi) || []).length;
  if (!screenshots.length) {
    if (/\bdata-gallery(?:-|\s|=)|\bproject-gallery\b|>\s*Galleria\s*</i.test(source)) {
      errors.push(`${project.slug}: una cartella screenshot vuota non deve generare galleria, cornice, dialog o intestazione`);
    }
    if (/\/assets\/projects\//i.test(source)) errors.push(`${project.slug}: riferimento a screenshot senza file pubblicati`);
    continue;
  }
  if (!/<(?:section|div)\b[^>]*\bdata-gallery(?:\s|>)/i.test(source)) errors.push(`${project.slug}: contenitore galleria mancante`);
  if (!/\bdata-gallery-dialog\b/i.test(source)) errors.push(`${project.slug}: dialog galleria mancante`);
  if (itemCount !== screenshots.length) errors.push(`${project.slug}: ${itemCount} elementi galleria, attesi ${screenshots.length}`);
  for (const screenshot of screenshots) {
    const imagePattern = new RegExp(`<img\\b[^>]*src="${escapeRegExp(screenshot.url)}"[^>]*>`, "i");
    const image = source.match(imagePattern)?.[0] || "";
    if (!image) errors.push(`${project.slug}: miniatura mancante per ${screenshot.filename}`);
    else {
      if (!image.includes(`width="${screenshot.width}"`) || !image.includes(`height="${screenshot.height}"`)) errors.push(`${project.slug}: dimensioni HTML errate per ${screenshot.filename}`);
      if (!new RegExp(`alt="[^"]*${escapeRegExp(project.title)}[^"]*"`, "i").test(image)) errors.push(`${project.slug}: testo alternativo non contestuale per ${screenshot.filename}`);
    }
  }
}

const contactPage = await readFile(path.join(root, "contatti.html"), "utf8");
for (const required of [
  "cf-turnstile",
  'name="website"',
  'name="privacyAccepted"',
  'data-expired-callback="onTurnstileExpired"',
  'data-error-callback="onTurnstileError"',
  'maxlength="4000"',
  "Invia il messaggio",
  "tobia@miniutti.it",
  "+39 051 1947 1903",
]) {
  if (!contactPage.includes(required)) errors.push(`contatti.html: requisito mancante ${required}`);
}
if (!builtArtifact && !contactPage.includes("__TURNSTILE_SITE_KEY__")) errors.push("contatti.html: placeholder Turnstile sorgente mancante");
if (builtArtifact && contactPage.includes("__TURNSTILE_SITE_KEY__")) errors.push("contatti.html: site key Turnstile non sostituita");

const stylesheets = [
  path.join(root, "assets", "css", "site.css"),
  path.join(root, "assets", "css", "botanical.css"),
];
let combinedCss = "";
for (const cssFile of stylesheets) {
  const css = await readFile(cssFile, "utf8");
  combinedCss += `\n${css}`;
  const label = path.relative(root, cssFile).replaceAll("\\", "/");
  if (/transition\s*:\s*all\b/i.test(css)) errors.push(`${label}: transition all non consentita`);
  if (/fonts\.(?:googleapis|gstatic)\.com/i.test(css)) errors.push(`${label}: font remoto non consentito`);
  for (const match of css.matchAll(/url\((?:"|')?([^"')]+)(?:"|')?\)/g)) {
    const target = match[1];
    if (/^(?:data:|https?:)/i.test(target)) continue;
    if (!await resolveLocal(cssFile, target)) errors.push(`${label}: asset mancante ${target}`);
  }
}
if (!combinedCss.includes(":focus-visible")) errors.push("CSS: stile focus-visible mancante");
if (!combinedCss.includes("prefers-reduced-motion: reduce")) errors.push("CSS: gestione reduced-motion mancante");
if (!combinedCss.includes("prefers-reduced-transparency: reduce")) errors.push("CSS: gestione reduced-transparency mancante");

const assetBudgets = [
  ["assets/images/garden-distance-mobile.avif", 220_000],
  ["assets/images/garden-midground-mobile.avif", 220_000],
  ["assets/images/garden-foreground-mobile.avif", 220_000],
  ["assets/images/garden-distance-desktop.avif", 220_000],
  ["assets/images/garden-midground-desktop.avif", 220_000],
  ["assets/images/garden-foreground-desktop.avif", 220_000],
  ["assets/images/garden-distance-mobile.webp", 420_000],
  ["assets/images/garden-midground-mobile.webp", 420_000],
  ["assets/images/garden-foreground-mobile.webp", 420_000],
  ["assets/images/garden-distance-desktop.webp", 420_000],
  ["assets/images/garden-midground-desktop.webp", 420_000],
  ["assets/images/garden-foreground-desktop.webp", 420_000],
  ["assets/images/og-miniutti-garden.webp", 300_000],
];
let mobileAvifBytes = 0;
let desktopAvifBytes = 0;
for (const [relative, maximum] of assetBudgets) {
  const file = path.join(root, relative);
  if (!await exists(file)) {
    errors.push(`Asset botanico mancante: ${relative}`);
    continue;
  }
  const size = (await stat(file)).size;
  if (size > maximum) errors.push(`${relative}: ${size} byte supera il budget di ${maximum}`);
  if (/mobile\.avif$/.test(relative)) mobileAvifBytes += size;
  if (/desktop\.avif$/.test(relative)) desktopAvifBytes += size;
}
if (mobileAvifBytes > 500_000) errors.push(`Layer AVIF mobili: ${mobileAvifBytes} byte supera il budget combinato di 500000`);
if (desktopAvifBytes > 500_000) errors.push(`Layer AVIF desktop: ${desktopAvifBytes} byte supera il budget combinato di 500000`);

const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
const sitemapRoutes = new Set([...sitemap.matchAll(/<loc>https:\/\/miniutti\.it([^<]*)<\/loc>/g)].map((match) => match[1] || "/"));
if (!sameList([...sitemapRoutes].sort(), [...expectedIndexableRoutes].sort())) {
  errors.push(`sitemap.xml: rotte inattese; trovate ${[...sitemapRoutes].sort().join(", ")}`);
}
for (const route of indexableRoutes) if (!sitemapRoutes.has(route)) errors.push(`sitemap.xml: rotta indicizzabile mancante ${route}`);
for (const route of sitemapRoutes) if (!indexableRoutes.has(route)) errors.push(`sitemap.xml: rotta non indicizzabile o inesistente ${route}`);

const robots = await readFile(path.join(root, "robots.txt"), "utf8");
if (!robots.includes("Sitemap: https://miniutti.it/sitemap.xml")) errors.push("robots.txt: sitemap canonica mancante");
if (/Disallow:\s*\/conferma-invio\.html/i.test(robots)) errors.push("robots.txt: la pagina noindex non deve essere bloccata");

const cname = (await readFile(path.join(root, "CNAME"), "utf8")).trim();
if (cname !== "miniutti.it") errors.push(`CNAME: host inatteso ${cname}`);

const publicNames = new Set(files.map((file) => path.relative(root, file).replaceAll("\\", "/")));
for (const forbidden of [
  "login.html",
  "progetti.html",
  "dashboard.html",
  "clock.html",
  "air.html",
  "gps.html",
  "galleria.html",
  "elementi.html",
  "assets/images/porta-brandeburgo.jpg",
  "assets/images/hero-landscape-mobile.webp",
  "assets/images/hero-landscape-desktop.webp",
  "assets/images/og-miniutti.webp",
  "progetti/secure-garage-access/index.html",
]) {
  if (publicNames.has(forbidden)) errors.push(`File legacy pubblicato: ${forbidden}`);
}
for (const required of ["assets/js/liquid-glass.js", "assets/css/botanical.css"]) {
  if (!publicNames.has(required)) errors.push(`Asset di sistema mancante: ${required}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validazione completata: ${htmlFiles.length} pagine, ${indexableRoutes.size} URL indicizzabili, ${[...galleries.values()].reduce((total, gallery) => total + gallery.length, 0)} screenshot di progetto, nessun errore.`);

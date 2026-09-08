import { readFile, readdir, stat } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";

const root = resolve("dist");
const errors = [];

async function walk(directory) {
  const entries = [];
  for (const name of await readdir(directory)) {
    const path = join(directory, name);
    if ((await stat(path)).isDirectory()) entries.push(...await walk(path));
    else entries.push(path);
  }
  return entries;
}

const files = await walk(root);
const htmlFiles = files.filter((file) => extname(file) === ".html");
const textFiles = files.filter((file) => [".html", ".js", ".css", ".xml", ".txt"].includes(extname(file)));
const expectedRoutes = ["index.html", "progetti/index.html", "privacy/index.html", "preferenze-cookie/index.html", "conferma-invio/index.html", "404.html", "progetti/mns-warehouse/index.html", "progetti/culina/index.html", "progetti/little-printer-revival/index.html", "progetti/secure-garage-access/index.html"];
const names = new Set(files.map((file) => relative(root, file)));

for (const route of expectedRoutes) if (!names.has(route)) errors.push(`Route statica mancante: ${route}`);
for (const file of htmlFiles) {
  const source = await readFile(file, "utf8");
  const label = relative(root, file);
  if (!source.includes('<html lang="it"')) errors.push(`${label}: lingua mancante`);
  if (!source.includes('<meta name="viewport"')) errors.push(`${label}: viewport mancante`);
  if (!source.includes("Content-Security-Policy")) errors.push(`${label}: CSP mancante`);
  if (!source.includes("Tobia Miniutti")) errors.push(`${label}: identità mancante`);
  if (!/<title>[^<]+<\/title>/.test(source)) errors.push(`${label}: titolo mancante`);
  if (!/noindex/.test(source) && !/rel="canonical"/.test(source)) errors.push(`${label}: canonical mancante`);
  for (const match of source.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|#)/.test(target)) continue;
    const clean = target.split(/[?#]/)[0];
    if (!clean) continue;
    let local = clean.startsWith("/") ? join(root, clean) : resolve(file, "..", clean);
    if (clean.endsWith("/")) local = join(local, "index.html");
    try { await stat(local); } catch { errors.push(`${label}: risorsa mancante ${target}`); }
  }
  if (["privacy.html", "contatti.html", "conferma-invio.html"].includes(label)) continue;
  const h1Count = (source.match(/<h1\b/g) || []).length;
  if (h1Count !== 1) errors.push(`${label}: atteso un H1, trovati ${h1Count}`);
}

for (const file of textFiles) {
  const source = await readFile(file, "utf8");
  const label = relative(root, file);
  if (/__(?:TURNSTILE|MOBILE|GA)[A-Z0-9_]*__|G-XXXXXXXXXX|replace-with-public/i.test(source)) errors.push(`${label}: placeholder irrisolto`);
  if (/hook\.(?:eu\d+\.)?make\.com|TURNSTILE_SECRET_KEY|MAKE_WEBHOOK_URL|(?:10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)\d+\.\d+/i.test(source)) errors.push(`${label}: possibile segreto o indirizzo interno`);
}

const contactRedirect = await readFile(join(root, "contatti.html"), "utf8");
if (!contactRedirect.includes("/#contatti")) errors.push("contatti.html: redirect alla sezione contatti mancante");
const home = await readFile(join(root, "index.html"), "utf8");
const clientSource = (await Promise.all(files.filter((file) => extname(file) === ".js").map((file) => readFile(file, "utf8")))).join("\n");
for (const required of ['id="home"', 'id="progetti"', 'id="contatti"', "/api/contact", "Cloudflare", "miniutti-consent"]) {
  if (!`${home}\n${clientSource}`.includes(required)) errors.push(`Home: requisito mancante ${required}`);
}
if (/src="https:\/\/www\.googletagmanager\.com/.test(home)) errors.push("Home: GA caricato direttamente prima del consenso");

const workflows = (await readdir(resolve(".github/workflows"))).filter((name) => /deploy-pages|static/.test(name));
if (workflows.length !== 1) errors.push(`Workflow sito canonici attesi: 1, trovati ${workflows.length}`);

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Validazione completata: ${htmlFiles.length} documenti statici e ${expectedRoutes.length} route verificate.`);

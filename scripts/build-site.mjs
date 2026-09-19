import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { projects } from "../content/projects.mjs";
import { discoverProjectGalleries } from "./project-screenshots.mjs";
import { renderProjectPages } from "./render-project-pages.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(projectRoot, "public");
const outputRoot = path.join(projectRoot, "dist");
const production = process.argv.includes("--production");
const testSiteKey = "1x00000000000000000000AA";
const turnstileTestKeyPattern = /^[123]x0{10,}/i;
const syntheticSiteKeyPattern = /^(?:__|0xqa_|qa[_-]|test(?:[_-]|$)|synthetic(?:[_-]|$)|placeholder|replace[_-]?me|your[_-]?site[_-]?key)/i;

if (outputRoot !== path.join(projectRoot, "dist")) throw new Error("Percorso dist non valido");

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

async function walk(directory) {
  const entries = [];
  for (const name of await readdir(directory)) {
    const file = path.join(directory, name);
    if ((await stat(file)).isDirectory()) entries.push(...await walk(file));
    else entries.push(file);
  }
  return entries;
}

const siteKey = String(process.env.TURNSTILE_SITE_KEY || "").trim() || (production ? "" : testSiteKey);
if (!siteKey) throw new Error("TURNSTILE_SITE_KEY è obbligatoria per una build di produzione");
if (production && turnstileTestKeyPattern.test(siteKey)) throw new Error("Le site key di test Turnstile non sono ammesse in produzione");
if (production && syntheticSiteKeyPattern.test(siteKey)) throw new Error("Placeholder o site key sintetiche QA non sono ammesse in produzione");
if (!/^[A-Za-z0-9_-]{10,80}$/.test(siteKey)) throw new Error("TURNSTILE_SITE_KEY non ha un formato valido");

const mobileDisplay = String(process.env.MOBILE_PHONE_DISPLAY || "").trim();
const mobileTel = String(process.env.MOBILE_PHONE_TEL || "").trim();
if (Boolean(mobileDisplay) !== Boolean(mobileTel)) throw new Error("MOBILE_PHONE_DISPLAY e MOBILE_PHONE_TEL devono essere configurati insieme");
if (mobileDisplay && !/^\+[0-9 ().-]{7,29}$/.test(mobileDisplay)) throw new Error("MOBILE_PHONE_DISPLAY non ha un formato pubblico valido");
if (mobileTel && !/^\+[1-9][0-9]{7,14}$/.test(mobileTel)) throw new Error("MOBILE_PHONE_TEL deve essere in formato E.164");

const footerMobile = mobileDisplay ? `<a href="tel:${escapeHtml(mobileTel)}">${escapeHtml(mobileDisplay)}</a>` : "";
const directMobile = mobileDisplay ? `<a href="tel:${escapeHtml(mobileTel)}"><span>Cellulare</span><strong>${escapeHtml(mobileDisplay)}</strong></a>` : "";

const addCspHashes = (html, isContactPage) => {
  const hashes = [];
  for (const match of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)) {
    const digest = createHash("sha256").update(match[1], "utf8").digest("base64");
    hashes.push(`'sha256-${digest}'`);
  }

  const challengeOrigin = "https://challenges.cloudflare.com";
  const policy = [
    "default-src 'self'",
    "style-src 'self'",
    `font-src 'self'`,
    `img-src 'self' data:${isContactPage ? ` ${challengeOrigin}` : ""}`,
    `script-src 'self'${hashes.length ? ` ${hashes.join(" ")}` : ""}${isContactPage ? ` ${challengeOrigin}` : ""}`,
    `connect-src 'self'${isContactPage ? ` ${challengeOrigin}` : ""}`,
    ...(isContactPage ? [`frame-src ${challengeOrigin}`] : []),
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  return html.replace(
    /<meta\s+http-equiv="Content-Security-Policy"\s+content="[^"]*">/i,
    `<meta http-equiv="Content-Security-Policy" content="${policy}">`,
  );
};

const projectGalleries = await discoverProjectGalleries(sourceRoot, projects);

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });
await cp(sourceRoot, outputRoot, { recursive: true });
await renderProjectPages(outputRoot, { galleries: projectGalleries });

const outputFiles = await walk(outputRoot);
for (const file of outputFiles.filter((entry) => path.extname(entry) === ".html")) {
  let html = await readFile(file, "utf8");
  html = html
    .replaceAll("__TURNSTILE_SITE_KEY__", siteKey)
    .replaceAll("<!-- MOBILE_PHONE_LINK -->", footerMobile)
    .replaceAll("<!-- MOBILE_PHONE_DIRECT -->", directMobile);
  html = addCspHashes(html, path.basename(file) === "contatti.html");

  const unresolved = html.match(/__[A-Z0-9_]+__|<!--\s*MOBILE_PHONE_(?:LINK|DIRECT)\s*-->/g);
  if (unresolved) throw new Error(`${path.relative(outputRoot, file)} contiene placeholder irrisolti: ${unresolved.join(", ")}`);
  await writeFile(file, html, "utf8");
}

console.log(`Build ${production ? "production" : "preview"} completata in ${outputRoot}`);

import { readFile, readdir, stat } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";

const root = resolve("public");
const errors = [];

async function walk(directory) {
  const items = [];
  for (const name of await readdir(directory)) {
    const path = join(directory, name);
    if ((await stat(path)).isDirectory()) items.push(...await walk(path));
    else items.push(path);
  }
  return items;
}

const files = await walk(root);
const htmlFiles = files.filter((file) => extname(file) === ".html");

for (const file of htmlFiles) {
  const source = await readFile(file, "utf8");
  const label = relative(root, file);
  if (!source.includes("<html lang=\"it\"")) errors.push(`${label}: lingua mancante`);
  if (!source.includes("<meta name=\"viewport\"")) errors.push(`${label}: viewport mancante`);
  if (!source.includes("Content-Security-Policy")) errors.push(`${label}: CSP mancante`);
  if (/login\.html|379\s*112\s*8232|hook\.eu1\.make\.com/i.test(source)) {
    errors.push(`${label}: riferimento legacy o segreto esposto`);
  }

  for (const match of source.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target = match[1];
    if (/^(?:https?:|mailto:|#)/.test(target) || target === "/") continue;
    const clean = target.split(/[?#]/)[0];
    const local = clean.startsWith("/") ? join(root, clean) : resolve(file, "..", clean);
    try {
      await stat(local);
    } catch {
      errors.push(`${label}: risorsa mancante ${target}`);
    }
  }
}

const publicNames = new Set(files.map((file) => relative(root, file)));
for (const forbidden of ["login.html", "progetti.html", "dashboard.html", "clock.html", "air.html", "gps.html", "galleria.html", "elementi.html"]) {
  if (publicNames.has(forbidden)) errors.push(`Pagina legacy pubblicata: ${forbidden}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validazione completata: ${htmlFiles.length} pagine, nessun riferimento legacy pubblico.`);

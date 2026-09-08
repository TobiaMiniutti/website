import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { getStaticRoutes, render, renderHead } from "../.ssr/entry-server.js";

const routes = getStaticRoutes();
const shell = await readFile(resolve("dist/index.html"), "utf8");

for (const route of routes) {
  const html = shell.replace("<!--head-outlet-->", renderHead(route)).replace("<!--app-html-->", render(route));
  const destination = route === "/" ? resolve("dist/index.html") : route === "/404/" ? resolve("dist/404.html") : resolve(`dist${route}index.html`);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, html);
}

const redirect = (title, canonical, target) => `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0; url=${target}"><link rel="canonical" href="${canonical}"><title>${title}</title><style>body{background:#0d0d0f;color:#f7f6f2;font:16px system-ui;padding:2rem}a{color:#bf65c7}</style></head><body><p>Tobia Miniutti · Reindirizzamento in corso. <a href="${target}">Continua</a></p></body></html>`;
await writeFile(resolve("dist/privacy.html"), redirect("Privacy | miniutti.it", "https://miniutti.it/privacy/", "/privacy/"));
await writeFile(resolve("dist/contatti.html"), redirect("Contatti | miniutti.it", "https://miniutti.it/#contatti", "/#contatti"));
await writeFile(resolve("dist/conferma-invio.html"), redirect("Messaggio inviato | miniutti.it", "https://miniutti.it/conferma-invio/", "/conferma-invio/"));

const sitemapRoutes = routes.filter((route) => !["/404/", "/conferma-invio/"].includes(route));
await writeFile(resolve("dist/sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapRoutes.map((route) => `  <url><loc>https://miniutti.it${route}</loc></url>`).join("\n")}\n</urlset>\n`);
await writeFile(resolve("dist/robots.txt"), "User-agent: *\nAllow: /\nDisallow: /conferma-invio/\n\nSitemap: https://miniutti.it/sitemap.xml\n");
await rm(resolve(".ssr"), { recursive: true, force: true });
console.log(`Pre-render completato: ${routes.length} route e 3 URL di compatibilità.`);

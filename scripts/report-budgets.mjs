import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

const root = path.resolve(process.argv[2] || "dist");

async function walk(directory) {
  const entries = [];
  for (const name of await readdir(directory)) {
    const file = path.join(directory, name);
    if ((await stat(file)).isDirectory()) entries.push(...await walk(file));
    else entries.push(file);
  }
  return entries;
}

const measurement = async (relative) => {
  const bytes = await readFile(path.join(root, relative));
  return { raw: bytes.byteLength, gzip: gzipSync(bytes, { level: 9 }).byteLength };
};

const sumMeasurements = (entries) => entries.reduce((total, entry) => ({
  raw: total.raw + entry.raw,
  gzip: total.gzip + entry.gzip,
}), { raw: 0, gzip: 0 });

const [html, siteCss, botanicalCss, siteJs, liquidGlassJs, ...artwork] = await Promise.all([
  measurement("index.html"),
  measurement("assets/css/site.css"),
  measurement("assets/css/botanical.css"),
  measurement("assets/js/site.js"),
  measurement("assets/js/liquid-glass.js"),
  measurement("assets/images/garden-distance-mobile.avif"),
  measurement("assets/images/garden-midground-mobile.avif"),
  measurement("assets/images/garden-foreground-mobile.avif"),
  measurement("assets/images/garden-distance-desktop.avif"),
  measurement("assets/images/garden-midground-desktop.avif"),
  measurement("assets/images/garden-foreground-desktop.avif"),
  measurement("assets/images/og-miniutti-garden.webp"),
]);
const css = sumMeasurements([siteCss, botanicalCss]);
const js = sumMeasurements([siteJs, liquidGlassJs]);
const mobileArt = sumMeasurements(artwork.slice(0, 3));
const desktopArt = sumMeasurements(artwork.slice(3, 6));
const socialArt = artwork[6];

const fontFiles = [
  "assets/fonts/instrument-serif-latin-400.woff2",
  "assets/fonts/instrument-serif-latin-ext-400.woff2",
  "assets/fonts/outfit-latin-400.woff2",
  "assets/fonts/outfit-latin-500.woff2",
  "assets/fonts/outfit-latin-600.woff2",
];
const fontBytes = (await Promise.all(fontFiles.map((file) => stat(path.join(root, file))))).reduce((sum, item) => sum + item.size, 0);
const initialMobileUpperBound = html.gzip + css.gzip + js.gzip + mobileArt.raw + fontBytes;
const allFiles = await walk(root);
const artifactBytes = (await Promise.all(allFiles.map((file) => stat(file)))).reduce((sum, item) => sum + item.size, 0);

console.log(JSON.stringify({
  environment: { node: process.version, root },
  homepage: {
    html,
    css,
    initialJavaScript: js,
    mobileArtwork: mobileArt,
    desktopArtwork: desktopArt,
    socialArtwork: socialArt,
    allLocalFontsRaw: fontBytes,
    conservativeInitialMobileFirstPartyBytes: initialMobileUpperBound,
    initialThirdPartyNetworkBytes: 0,
  },
  artifact: { files: allFiles.length, rawBytes: artifactBytes },
  budgetChecks: {
    initialJavaScriptGzipUnder100KB: js.gzip <= 100_000,
    cssGzipUnder50KB: css.gzip <= 50_000,
    fontsRawUnder150KB: fontBytes <= 150_000,
    mobileArtworkUnder500KB: mobileArt.raw <= 500_000,
    initialMobileFirstPartyUnder1MB: initialMobileUpperBound <= 1_000_000,
  },
}, null, 2));

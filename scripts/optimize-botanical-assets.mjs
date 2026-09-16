import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(projectRoot, "source-assets", "botanical");
const outputRoot = path.join(projectRoot, "public", "assets", "images");
const sharpModulePath = process.env.SHARP_MODULE_PATH;

if (!sharpModulePath) {
  throw new Error("Imposta SHARP_MODULE_PATH sul modulo Sharp disponibile prima di rigenerare gli artwork");
}

const { default: sharp } = await import(sharpModulePath);
await mkdir(outputRoot, { recursive: true });

const variants = [
  { name: "garden-distance-desktop", alpha: false },
  { name: "garden-midground-desktop", alpha: true },
  { name: "garden-foreground-desktop", alpha: true },
  { name: "garden-distance-mobile", alpha: false },
  { name: "garden-midground-mobile", alpha: true },
  { name: "garden-foreground-mobile", alpha: true },
];

for (const variant of variants) {
  const source = path.join(sourceRoot, `${variant.name}.png`);
  await sharp(source)
    .webp({
      quality: variant.alpha ? 66 : 72,
      alphaQuality: 82,
      effort: 6,
      smartSubsample: true,
    })
    .toFile(path.join(outputRoot, `${variant.name}.webp`));

  await sharp(source)
    .avif({
      quality: variant.alpha ? 48 : 52,
      effort: 5,
      chromaSubsampling: "4:4:4",
    })
    .toFile(path.join(outputRoot, `${variant.name}.avif`));
}

const desktopComposite = await sharp(path.join(sourceRoot, "garden-distance-desktop.png"))
  .composite([
    { input: path.join(sourceRoot, "garden-midground-desktop.png") },
    { input: path.join(sourceRoot, "garden-foreground-desktop.png") },
  ])
  .png()
  .toBuffer();

await sharp(desktopComposite)
  .resize(1200, 630, { fit: "cover", position: "centre" })
  .webp({ quality: 80, effort: 6, smartSubsample: true })
  .toFile(path.join(outputRoot, "og-miniutti-garden.webp"));

await sharp(path.join(outputRoot, "logo.png"))
  .resize(96, 96, { fit: "contain" })
  .png({ compressionLevel: 9, palette: true, quality: 100 })
  .toFile(path.join(outputRoot, "logo-nav.png"));

console.log(`Ottimizzati ${variants.length} livelli botanici in AVIF/WebP, la social card e il logo di navigazione in ${outputRoot}`);

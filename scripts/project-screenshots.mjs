import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const captionsPath = path.join(projectRoot, "content", "project-screenshot-captions.json");
const filenamePattern = /^screenshot-(\d+)\.(png|jpe?g|webp|avif)$/i;
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const positiveDimensions = (width, height, label) => {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width < 1 || height < 1) {
    throw new Error(`${label}: dimensioni immagine non valide`);
  }
  return { width, height };
};

const pngDimensions = (buffer, label) => {
  if (buffer.length < 45 || !buffer.subarray(0, 8).equals(pngSignature)) return null;
  if (buffer.readUInt32BE(8) !== 13 || buffer.subarray(12, 16).toString("ascii") !== "IHDR") {
    throw new Error(`${label}: intestazione PNG non valida`);
  }
  if (!buffer.includes(Buffer.from("IEND"))) throw new Error(`${label}: PNG incompleto`);
  return { format: "png", ...positiveDimensions(buffer.readUInt32BE(16), buffer.readUInt32BE(20), label) };
};

const jpegDimensions = (buffer, label) => {
  if (buffer.length < 12 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  if (buffer[buffer.length - 2] !== 0xff || buffer[buffer.length - 1] !== 0xd9) {
    throw new Error(`${label}: JPEG incompleto`);
  }

  const startOfFrame = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  let offset = 2;
  while (offset + 8 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    while (buffer[offset] === 0xff) offset += 1;
    const marker = buffer[offset];
    offset += 1;
    if (marker === 0xd8 || marker === 0x01) continue;
    if (marker === 0xd9 || marker === 0xda) break;
    if (offset + 2 > buffer.length) break;
    const segmentLength = buffer.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > buffer.length) break;
    if (startOfFrame.has(marker)) {
      return {
        format: "jpeg",
        ...positiveDimensions(buffer.readUInt16BE(offset + 5), buffer.readUInt16BE(offset + 3), label),
      };
    }
    offset += segmentLength;
  }
  throw new Error(`${label}: dimensioni JPEG non leggibili`);
};

const uint24LE = (buffer, offset) => buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16);

const webpDimensions = (buffer, label) => {
  if (buffer.length < 30 || buffer.subarray(0, 4).toString("ascii") !== "RIFF" || buffer.subarray(8, 12).toString("ascii") !== "WEBP") return null;
  if (buffer.readUInt32LE(4) + 8 > buffer.length) throw new Error(`${label}: WebP incompleto`);

  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const type = buffer.subarray(offset, offset + 4).toString("ascii");
    const size = buffer.readUInt32LE(offset + 4);
    const data = offset + 8;
    if (data + size > buffer.length) throw new Error(`${label}: chunk WebP incompleto`);
    if (type === "VP8X" && size >= 10) {
      return { format: "webp", ...positiveDimensions(uint24LE(buffer, data + 4) + 1, uint24LE(buffer, data + 7) + 1, label) };
    }
    if (type === "VP8L" && size >= 5 && buffer[data] === 0x2f) {
      const bits = buffer.readUInt32LE(data + 1);
      return { format: "webp", ...positiveDimensions((bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1, label) };
    }
    if (type === "VP8 " && size >= 10 && buffer[data + 3] === 0x9d && buffer[data + 4] === 0x01 && buffer[data + 5] === 0x2a) {
      return { format: "webp", ...positiveDimensions(buffer.readUInt16LE(data + 6) & 0x3fff, buffer.readUInt16LE(data + 8) & 0x3fff, label) };
    }
    offset = data + size + (size % 2);
  }
  throw new Error(`${label}: dimensioni WebP non leggibili`);
};

const avifDimensions = (buffer, label) => {
  if (buffer.length < 40 || buffer.subarray(4, 8).toString("ascii") !== "ftyp") return null;
  const brandBlock = buffer.subarray(8, Math.min(buffer.length, buffer.readUInt32BE(0))).toString("ascii");
  if (!brandBlock.includes("avif") && !brandBlock.includes("avis")) return null;
  const marker = buffer.indexOf(Buffer.from("ispe"));
  if (marker < 4 || marker + 16 > buffer.length) throw new Error(`${label}: dimensioni AVIF non leggibili`);
  return {
    format: "avif",
    ...positiveDimensions(buffer.readUInt32BE(marker + 8), buffer.readUInt32BE(marker + 12), label),
  };
};

export const readImageDimensions = (buffer, label = "Immagine") => {
  for (const reader of [pngDimensions, jpegDimensions, webpDimensions, avifDimensions]) {
    const result = reader(buffer, label);
    if (result) return result;
  }
  throw new Error(`${label}: formato o contenuto immagine non riconosciuto`);
};

export async function loadScreenshotCaptions(file = captionsPath) {
  const parsed = JSON.parse(await readFile(file, "utf8"));
  if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") throw new Error(`${file}: il file delle didascalie deve contenere un oggetto JSON`);
  return parsed;
}

export async function discoverProjectScreenshots(publicRoot, project, captions = {}) {
  if (!project || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)) throw new Error("Slug progetto non valido per la galleria");
  const assetsRoot = path.resolve(publicRoot, "assets", "projects");
  const directory = path.resolve(assetsRoot, project.slug);
  if (path.dirname(directory) !== assetsRoot) throw new Error(`Percorso galleria non consentito: ${directory}`);

  let filenames;
  try {
    filenames = await readdir(directory);
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }

  const indexed = new Map();
  for (const filename of filenames) {
    const match = filename.match(filenamePattern);
    if (!match) continue;
    const fileIndex = Number(match[1]);
    if (!Number.isSafeInteger(fileIndex) || fileIndex < 1) throw new Error(`${path.join(directory, filename)}: l’indice deve essere un intero positivo`);
    if (indexed.has(fileIndex)) {
      throw new Error(`${directory}: indice ${fileIndex} duplicato in ${indexed.get(fileIndex)} e ${filename}`);
    }
    indexed.set(fileIndex, filename);
  }

  const expectedFormat = (extension) => extension === ".jpg" || extension === ".jpeg" ? "jpeg" : extension.slice(1);
  const sorted = [...indexed.entries()].sort(([first], [second]) => first - second);
  const screenshots = [];

  for (const [fileIndex, filename] of sorted) {
    const file = path.join(directory, filename);
    const detected = readImageDimensions(await readFile(file), file);
    const extension = path.extname(filename).toLowerCase();
    if (detected.format !== expectedFormat(extension)) {
      throw new Error(`${file}: l’estensione ${extension} non corrisponde al contenuto ${detected.format}`);
    }
    const caption = captions[String(fileIndex)] ?? captions[fileIndex] ?? null;
    if (caption !== null && (typeof caption !== "string" || !caption.trim())) {
      throw new Error(`${file}: la didascalia opzionale deve essere una stringa non vuota`);
    }
    screenshots.push({
      fileIndex,
      ordinal: screenshots.length + 1,
      filename,
      url: `/assets/projects/${project.slug}/${filename}`,
      width: detected.width,
      height: detected.height,
      caption: caption?.trim() || null,
    });
  }
  return screenshots;
}

export async function discoverProjectGalleries(publicRoot, projects, captions = null) {
  const resolvedCaptions = captions || await loadScreenshotCaptions();
  const galleries = new Map();
  for (const project of projects) {
    galleries.set(project.slug, await discoverProjectScreenshots(publicRoot, project, resolvedCaptions[project.slug] || {}));
  }
  return galleries;
}

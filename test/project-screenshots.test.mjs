import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { discoverProjectScreenshots, readImageDimensions } from "../scripts/project-screenshots.mjs";

const project = { slug: "mns-warehouse", title: "MNS Warehouse" };

const box = (type, data) => {
  const result = Buffer.alloc(8 + data.length);
  result.writeUInt32BE(result.length, 0);
  result.write(type, 4, 4, "ascii");
  data.copy(result, 8);
  return result;
};

const png = (width, height) => {
  const signature = Buffer.from("89504e470d0a1a0a", "hex");
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.set([8, 2, 0, 0, 0], 8);
  const chunk = (type, data) => {
    const result = Buffer.alloc(12 + data.length);
    result.writeUInt32BE(data.length, 0);
    result.write(type, 4, 4, "ascii");
    data.copy(result, 8);
    return result;
  };
  return Buffer.concat([signature, chunk("IHDR", ihdrData), chunk("IEND", Buffer.alloc(0))]);
};

const jpeg = (width, height) => {
  const frame = Buffer.alloc(19);
  frame.set([0xff, 0xc0, 0x00, 0x11, 0x08]);
  frame.writeUInt16BE(height, 5);
  frame.writeUInt16BE(width, 7);
  frame.set([3, 1, 0x11, 0, 2, 0x11, 0, 3, 0x11, 0], 9);
  return Buffer.concat([Buffer.from([0xff, 0xd8]), frame, Buffer.from([0xff, 0xd9])]);
};

const webp = (width, height) => {
  const result = Buffer.alloc(30);
  result.write("RIFF", 0, 4, "ascii");
  result.writeUInt32LE(22, 4);
  result.write("WEBP", 8, 4, "ascii");
  result.write("VP8X", 12, 4, "ascii");
  result.writeUInt32LE(10, 16);
  result.writeUIntLE(width - 1, 24, 3);
  result.writeUIntLE(height - 1, 27, 3);
  return result;
};

const avif = (width, height) => {
  const ftyp = Buffer.concat([Buffer.from("avif", "ascii"), Buffer.alloc(4), Buffer.from("mif1avif", "ascii")]);
  const ispe = Buffer.alloc(12);
  ispe.writeUInt32BE(width, 4);
  ispe.writeUInt32BE(height, 8);
  return Buffer.concat([box("ftyp", ftyp), box("ispe", ispe)]);
};

const withFixture = async (callback) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "miniutti-gallery-"));
  const directory = path.join(root, "assets", "projects", project.slug);
  await mkdir(directory, { recursive: true });
  try {
    await callback({ root, directory });
  } finally {
    if (!path.basename(root).startsWith("miniutti-gallery-") || path.dirname(root) !== os.tmpdir()) throw new Error("Percorso fixture non sicuro");
    await rm(root, { recursive: true, force: true });
  }
};

test("empty folder and marker produce no gallery", async () => withFixture(async ({ root, directory }) => {
  await writeFile(path.join(directory, ".gitkeep"), "");
  assert.deepEqual(await discoverProjectScreenshots(root, project), []);
}));

test("discovers one image with dimensions and optional caption", async () => withFixture(async ({ root, directory }) => {
  await writeFile(path.join(directory, "screenshot-01.png"), png(1440, 900));
  const result = await discoverProjectScreenshots(root, project, { 1: "Panoramica verificata" });
  assert.deepEqual(result[0], {
    fileIndex: 1,
    ordinal: 1,
    filename: "screenshot-01.png",
    url: "/assets/projects/mns-warehouse/screenshot-01.png",
    width: 1440,
    height: 900,
    caption: "Panoramica verificata",
  });
}));

test("sorts numeric gaps and ignores unrelated files", async () => withFixture(async ({ root, directory }) => {
  await writeFile(path.join(directory, "screenshot-10.png"), png(1000, 700));
  await writeFile(path.join(directory, "screenshot-02.png"), png(900, 1200));
  await writeFile(path.join(directory, "notes.txt"), "fixture");
  const result = await discoverProjectScreenshots(root, project);
  assert.deepEqual(result.map(({ fileIndex }) => fileIndex), [2, 10]);
  assert.deepEqual(result.map(({ ordinal }) => ordinal), [1, 2]);
}));

test("reads every accepted image format", () => {
  assert.deepEqual(readImageDimensions(png(101, 202)), { format: "png", width: 101, height: 202 });
  assert.deepEqual(readImageDimensions(jpeg(303, 404)), { format: "jpeg", width: 303, height: 404 });
  assert.deepEqual(readImageDimensions(webp(505, 606)), { format: "webp", width: 505, height: 606 });
  assert.deepEqual(readImageDimensions(avif(707, 808)), { format: "avif", width: 707, height: 808 });
});

test("rejects duplicate canonical indices", async () => withFixture(async ({ root, directory }) => {
  await writeFile(path.join(directory, "screenshot-01.png"), png(10, 10));
  await writeFile(path.join(directory, "screenshot-1.webp"), webp(10, 10));
  await assert.rejects(() => discoverProjectScreenshots(root, project), /indice 1 duplicato/);
}));

test("rejects zero and unsafe indices", async () => {
  await withFixture(async ({ root, directory }) => {
    await writeFile(path.join(directory, "screenshot-0.png"), png(10, 10));
    await assert.rejects(() => discoverProjectScreenshots(root, project), /intero positivo/);
  });
  await withFixture(async ({ root, directory }) => {
    await writeFile(path.join(directory, "screenshot-999999999999999999999.png"), png(10, 10));
    await assert.rejects(() => discoverProjectScreenshots(root, project), /intero positivo/);
  });
});

test("rejects corrupt matching files and extension mismatches", async () => {
  await withFixture(async ({ root, directory }) => {
    await writeFile(path.join(directory, "screenshot-01.png"), Buffer.from("not an image"));
    await assert.rejects(() => discoverProjectScreenshots(root, project), /non riconosciuto/);
  });
  await withFixture(async ({ root, directory }) => {
    await writeFile(path.join(directory, "screenshot-01.jpg"), png(10, 10));
    await assert.rejects(() => discoverProjectScreenshots(root, project), /non corrisponde/);
  });
});

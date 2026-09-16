import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const playwrightPath = process.env.PLAYWRIGHT_MODULE_PATH;
const chromePath = process.env.CHROME_PATH;
const pythonPath = process.env.PYTHON_PATH;
const baseUrl = process.env.BASE_URL || "http://127.0.0.1:4173";
const stage = process.env.EVIDENCE_STAGE || "after";

if (!playwrightPath) throw new Error("PLAYWRIGHT_MODULE_PATH è obbligatorio");
if (!chromePath) throw new Error("CHROME_PATH è obbligatorio");
if (!/^[a-z0-9-]+$/i.test(stage)) throw new Error("EVIDENCE_STAGE non valido");

const playwrightSpecifier = playwrightPath.startsWith("file:") ? playwrightPath : pathToFileURL(playwrightPath).href;
const { chromium } = await import(playwrightSpecifier);
const outputRoot = path.join(projectRoot, "docs", "evidence", stage);
await mkdir(outputRoot, { recursive: true });

const browser = await chromium.launch({ executablePath: chromePath, headless: true });
const profiles = [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "mobile-390", width: 390, height: 844 },
];
const heroProgress = [0, 0.3, 0.65, 1];

const run = (command, args) => new Promise((resolve, reject) => {
  const child = spawn(command, args, {
    cwd: projectRoot,
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => { stdout += chunk; });
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  child.on("error", reject);
  child.on("close", (code) => {
    if (code === 0) resolve(stdout.trim());
    else reject(new Error(stderr.trim() || stdout.trim() || `${command} è terminato con codice ${code}`));
  });
});

try {
  for (const profile of profiles) {
    const context = await browser.newContext({
      viewport: { width: profile.width, height: profile.height },
      deviceScaleFactor: 1,
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();
    await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);

    const contact = page.locator(".botanical-contact");
    await contact.scrollIntoViewIfNeeded();
    await contact.screenshot({
      path: path.join(outputRoot, `contact-${profile.name}.png`),
      animations: "disabled",
    });

    if (stage === "after") {
      for (const progress of heroProgress) {
        await page.evaluate((value) => {
          const hero = document.querySelector(".garden-hero");
          if (!(hero instanceof HTMLElement)) return;
          window.scrollTo({ top: hero.offsetTop + hero.offsetHeight * value, behavior: "instant" });
        }, progress);
        await page.waitForTimeout(120);
        const label = String(Math.round(progress * 100)).padStart(3, "0");
        await page.screenshot({
          path: path.join(outputRoot, `hero-${profile.name}-${label}.png`),
          animations: "disabled",
        });
      }
    }
    await context.close();
  }

  if (stage === "after") {
    if (!pythonPath) throw new Error("PYTHON_PATH è obbligatorio per l'evidenza animata WebP");
    const motionContext = await browser.newContext({
      viewport: { width: 960, height: 600 },
      deviceScaleFactor: 1,
      reducedMotion: "no-preference",
    });
    const page = await motionContext.newPage();
    const temporaryFrames = await mkdtemp(path.join(os.tmpdir(), "miniutti-hero-motion-"));
    try {
      await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      const session = await motionContext.newCDPSession(page);
      const frames = [];
      session.on("Page.screencastFrame", async (event) => {
        frames.push(event.data);
        await session.send("Page.screencastFrameAck", { sessionId: event.sessionId });
      });
      await session.send("Page.startScreencast", {
        format: "jpeg",
        quality: 82,
        maxWidth: 960,
        maxHeight: 600,
        everyNthFrame: 1,
      });
      await page.evaluate(async () => {
        const hero = document.querySelector(".garden-hero");
        if (!(hero instanceof HTMLElement)) return;
        const root = document.documentElement;
        const previousBehavior = root.style.scrollBehavior;
        root.style.scrollBehavior = "auto";
        const start = hero.offsetTop;
        const end = start + hero.offsetHeight;
        const animate = (from, to, duration) => new Promise((resolve) => {
          const started = performance.now();
          const tick = (now) => {
            const progress = Math.min(1, (now - started) / duration);
            const eased = progress * progress * (3 - 2 * progress);
            window.scrollTo({ top: from + (to - from) * eased, behavior: "instant" });
            if (progress < 1) requestAnimationFrame(tick);
            else resolve();
          };
          requestAnimationFrame(tick);
        });
        await animate(start, end, 1500);
        await new Promise((resolve) => setTimeout(resolve, 240));
        await animate(end, start, 1500);
        await new Promise((resolve) => setTimeout(resolve, 180));
        root.style.scrollBehavior = previousBehavior;
      });
      await session.send("Page.stopScreencast");
      await session.detach();
      if (frames.length < 2) throw new Error("Chrome DevTools non ha prodotto abbastanza frame per l'evidenza animata");
      for (let index = 0; index < frames.length; index += 1) {
        await writeFile(path.join(temporaryFrames, `${String(index).padStart(4, "0")}.jpg`), Buffer.from(frames[index], "base64"));
      }
      const animatedOutput = path.join(outputRoot, "hero-forward-and-reverse-desktop.webp");
      const encoder = path.join(projectRoot, "scripts", "encode-evidence-webp.py");
      const result = await run(pythonPath, [encoder, temporaryFrames, animatedOutput, "34"]);
      if (result) console.log(result);
    } finally {
      await motionContext.close();
      await rm(temporaryFrames, { recursive: true, force: true });
    }
  }
} finally {
  await browser.close();
}

console.log(`Evidenze ${stage} salvate in ${outputRoot}`);

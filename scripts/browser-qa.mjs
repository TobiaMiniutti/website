import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const playwrightModule = process.env.PLAYWRIGHT_MODULE_PATH;
const chromePath = process.env.CHROME_PATH;
const baseUrl = String(process.env.PREVIEW_URL || "http://127.0.0.1:4173").replace(/\/$/, "");
if (!playwrightModule) throw new Error("Imposta PLAYWRIGHT_MODULE_PATH sul modulo Playwright disponibile");
if (!chromePath) throw new Error("Imposta CHROME_PATH sull’eseguibile Chromium o Chrome disponibile");

const { chromium, firefox, webkit } = await import(playwrightModule);
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(projectRoot, "docs", "screenshots");
await mkdir(outputDirectory, { recursive: true });

const expectedProjects = [
  { slug: "mns-warehouse", title: "MNS Warehouse" },
  { slug: "ricettario-ai", title: "Ricettario AI" },
  { slug: "little-printer-revival", title: "Little Printer Revival" },
];
const indexableRoutes = [
  "/",
  "/contatti.html",
  "/privacy.html",
  "/progetti/",
  ...expectedProjects.map(({ slug }) => `/progetti/${slug}/`),
];
const screenshots = [
  { file: "home-desktop-1440.jpg", route: "/", width: 1440, height: 900 },
  { file: "home-mobile-390.jpg", route: "/", width: 390, height: 844 },
  { file: "projects-desktop-1440.jpg", route: "/progetti/", width: 1440, height: 900 },
  { file: "case-study-desktop-1440.jpg", route: "/progetti/mns-warehouse/", width: 1440, height: 900 },
  { file: "case-study-mobile-390.jpg", route: "/progetti/mns-warehouse/", width: 390, height: 844 },
  { file: "contact-mobile-390.jpg", route: "/contatti.html", width: 390, height: 844 },
];

const browser = await chromium.launch({ executablePath: chromePath, headless: true });
const context = await browser.newContext({ reducedMotion: "no-preference", colorScheme: "light" });
await context.route("https://challenges.cloudflare.com/**", (route) => route.abort("blockedbyclient"));
const page = await context.newPage();
const consoleSignals = [];
const attachConsoleCapture = (targetPage, label) => {
  targetPage.on("console", (message) => {
    if (message.type() === "error") consoleSignals.push({ page: label, message: message.text() });
  });
  targetPage.on("pageerror", (error) => consoleSignals.push({ page: label, message: error.message }));
};
attachConsoleCapture(page, "main");

const waitForStablePage = async (targetPage = page) => {
  await targetPage.evaluate(async () => {
    await document.fonts.ready;
    document.querySelectorAll('img[loading="lazy"]').forEach((image) => { image.loading = "eager"; });
    await Promise.race([
      Promise.all([...document.images].map((image) => image.complete ? undefined : new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      }))),
      new Promise((resolve) => setTimeout(resolve, 5_000)),
    ]);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
};

const layoutChecks = [];
console.log("Browser QA: responsive layout botanico");
for (const viewport of [
  { width: 320, height: 700 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 844, height: 390 },
]) {
  await page.setViewportSize(viewport);
  await page.goto(`${baseUrl}/`, { waitUntil: "load" });
  await waitForStablePage();
  const measured = await page.evaluate(() => {
    const scene = document.querySelector("[data-garden-scene]");
    const hero = scene?.closest(".garden-hero");
    const heroRect = hero?.getBoundingClientRect();
    const layersCoverHero = heroRect ? [...scene.querySelectorAll("[data-parallax-layer]")].map((layer) => {
      const rect = layer.getBoundingClientRect();
      return rect.left <= heroRect.left + 1 && rect.right >= heroRect.right - 1 && rect.top <= heroRect.top + 1 && rect.bottom >= heroRect.bottom - 1;
    }) : [];
    return {
      innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      h1Visible: Boolean(document.querySelector("h1")?.getClientRects().length),
      fonts: document.fonts.status,
      brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).length,
      projectPanels: document.querySelectorAll(".project-panels .project-panel").length,
      sceneOverflowHidden: scene ? getComputedStyle(scene).overflow === "hidden" : false,
      layersCoverHero,
    };
  });
  layoutChecks.push({ ...viewport, ...measured, overflowX: measured.scrollWidth > measured.innerWidth + 1 });
}

console.log("Browser QA: contenuto e ordine dei tre progetti");
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(`${baseUrl}/`, { waitUntil: "load" });
await waitForStablePage();
const homeProjects = await page.evaluate(() => ({
  heading: document.querySelector("#projects-title")?.textContent?.trim(),
  titles: [...document.querySelectorAll(".project-panels .project-panel h3")].map((element) => element.textContent.trim()),
  links: [...document.querySelectorAll(".project-panels .project-panel h3 a")].map((element) => element.getAttribute("href")),
  visualElements: document.querySelectorAll(".project-panels img, .project-panels picture, .project-panels source").length,
  projectAssetsLoaded: performance.getEntriesByType("resource").map(({ name }) => name).filter((name) => /\/assets\/projects\//.test(name)),
  containsRemovedProject: /Secure Garage/i.test(document.querySelector("main")?.textContent || ""),
}));

await page.goto(`${baseUrl}/progetti/`, { waitUntil: "load" });
await waitForStablePage();
const projectIndex = await page.evaluate(() => {
  const slugs = [];
  document.querySelectorAll('main a[href^="/progetti/"]').forEach((link) => {
    const match = link.getAttribute("href")?.match(/^\/progetti\/([a-z0-9-]+)\/$/);
    if (match && !slugs.includes(match[1])) slugs.push(match[1]);
  });
  return {
    slugs,
    rows: document.querySelectorAll(".projects-index .project-row").length,
    projectAssetReferences: [...document.querySelectorAll('main [src*="/assets/projects/"], main [href*="/assets/projects/"]')].length,
    containsRemovedProject: /Secure Garage/i.test(document.querySelector("main")?.textContent || ""),
  };
});

console.log("Browser QA: camera botanica immersiva");
const inspectCameraMotion = async (viewport, pointerExpected) => {
  await page.setViewportSize(viewport);
  await page.goto(`${baseUrl}/`, { waitUntil: "load" });
  await waitForStablePage();
  const readFrame = () => page.evaluate(() => {
    const number = (element, property, fallback = 0) => Number.parseFloat(element.style.getPropertyValue(property)) || fallback;
    const scene = document.querySelector("[data-garden-scene]");
    const hero = scene?.closest(".garden-hero");
    const heroRect = hero?.getBoundingClientRect();
    const layers = [...document.querySelectorAll("[data-parallax-layer]")];
    const introduction = hero?.querySelector(".hero-role");
    const contact = [...(hero?.querySelectorAll("a") || [])].find((link) => /^Contattami(?:\s|$)/i.test(link.textContent.trim()));
    const inspectUsableElement = (element) => {
      if (!element) return { exists: false };
      const rect = element.getBoundingClientRect();
      const headerBottom = document.querySelector(".site-header")?.getBoundingClientRect().bottom || 0;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const onscreen = centerY >= headerBottom && centerY < innerHeight && centerX >= 0 && centerX < innerWidth;
      const x = Math.min(innerWidth - 1, Math.max(0, rect.left + rect.width / 2));
      const y = Math.min(innerHeight - 1, Math.max(0, rect.top + rect.height / 2));
      const topElement = onscreen ? document.elementFromPoint(x, y) : null;
      const style = getComputedStyle(element);
      return {
        exists: true,
        onscreen,
        width: rect.width,
        height: rect.height,
        unobstructed: !onscreen || topElement === element || element.contains(topElement),
        visible: style.visibility !== "hidden" && style.display !== "none" && Number(style.opacity) > 0.2,
        pointerEvents: style.pointerEvents,
        rect: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom },
      };
    };
    return {
      mode: scene?.dataset.cameraMode || null,
      progress: Number.parseFloat(scene?.dataset.cameraProgress || "NaN"),
      interval: {
        start: Number.parseFloat(scene?.dataset.cameraStart || "NaN"),
        end: Number.parseFloat(scene?.dataset.cameraEnd || "NaN"),
      },
      layers: layers.map((layer) => {
        const rect = layer.getBoundingClientRect();
        const style = getComputedStyle(layer);
        return {
          scale: number(layer, "--camera-scale", 1),
          x: number(layer, "--camera-x"),
          y: number(layer, "--camera-y"),
          pointerX: number(layer, "--pointer-x"),
          pointerY: number(layer, "--pointer-y"),
          transform: style.transform,
          transformOrigin: style.transformOrigin,
          rect: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height },
        };
      }),
      layersCoverHero: heroRect ? layers.map((layer) => {
        const rect = layer.getBoundingClientRect();
        return rect.left <= heroRect.left + 1 && rect.right >= heroRect.right - 1 && rect.top <= heroRect.top + 1 && rect.bottom >= heroRect.bottom - 1;
      }) : [],
      introduction: inspectUsableElement(introduction),
      contact: inspectUsableElement(contact),
      overflowX: document.documentElement.scrollWidth > innerWidth + 1,
      scrollY,
    };
  });
  const moveTo = async (progress) => {
    await page.evaluate((requestedProgress) => {
      const scene = document.querySelector("[data-garden-scene]");
      const start = Number.parseFloat(scene?.dataset.cameraStart || "0");
      const end = Number.parseFloat(scene?.dataset.cameraEnd || `${start}`);
      window.scrollTo({ top: start + ((end - start) * requestedProgress), behavior: "instant" });
    }, progress);
    await page.waitForFunction((requestedProgress) => {
      const actual = Number.parseFloat(document.querySelector("[data-garden-scene]")?.dataset.cameraProgress || "NaN");
      return Number.isFinite(actual) && Math.abs(actual - requestedProgress) <= 0.06;
    }, progress, { timeout: 3_000 }).catch(() => {});
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    return readFrame();
  };
  const frames = [];
  for (const progress of [0, 0.3, 0.65, 1]) frames.push({ requestedProgress: progress, ...await moveTo(progress) });
  await moveTo(0.65);
  const reverse = await moveTo(0.3);
  if (pointerExpected) {
    await page.mouse.move(Math.round(viewport.width * 0.78), Math.round(viewport.height * 0.32));
    await page.waitForTimeout(80);
  }
  const pointer = await readFrame();
  const cta = page.getByRole("link", { name: /Contattami/ }).first();
  await cta.focus();
  const ctaAccessibility = await cta.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const support = element.closest(".hero-content, .hero-copy, .hero-intro, .hero-panel");
    const supportStyle = support ? getComputedStyle(support) : null;
    return {
      tagName: element.tagName,
      href: element.getAttribute("href"),
      accessibleName: element.textContent.trim(),
      width: rect.width,
      height: rect.height,
      focusIndicator: style.outlineStyle !== "none" || style.boxShadow !== "none" || style.borderColor !== "rgba(0, 0, 0, 0)",
      supportingSurface: style.backgroundImage !== "none"
        || !/rgba?\([^)]*,\s*0\s*\)$/.test(style.backgroundColor)
        || Boolean(supportStyle && (supportStyle.backgroundImage !== "none" || !/rgba?\([^)]*,\s*0\s*\)$/.test(supportStyle.backgroundColor) || supportStyle.backdropFilter !== "none")),
    };
  });
  return { viewport, pointerExpected, frames, reverse, pointer, ctaAccessibility };
};
const cameraMotion = {
  desktop: await inspectCameraMotion({ width: 1440, height: 900 }, true),
  mobile: await inspectCameraMotion({ width: 390, height: 844 }, false),
};

console.log("Browser QA: rotte dirette e rimozione del progetto dismesso");
const routeChecks = [];
for (const route of indexableRoutes) {
  const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "load" });
  routeChecks.push(await page.evaluate(({ checkedRoute, status }) => {
    const parseAlpha = (color) => {
      const match = color.match(/rgba?\((?:\s*\d+(?:\.\d+)?\s*,){3}\s*(\d+(?:\.\d+)?)\s*\)/i);
      return match ? Number(match[1]) : color === "transparent" ? 0 : 1;
    };
    const brands = [...document.querySelectorAll(".site-brand")];
    return {
      route: checkedRoute,
      status,
      title: document.title,
      h1: document.querySelectorAll("h1").length,
      noindex: /noindex/i.test(document.querySelector('meta[name="robots"]')?.content || ""),
      removedProjectText: /Secure Garage/i.test(document.body.innerText),
      contributionBoxes: document.querySelectorAll(".case-contribution, .project-contribution").length,
      contributionHeading: [...document.querySelectorAll("main h1, main h2, main h3")].some((heading) => /^Il mio (?:contributo|ruolo)$/i.test(heading.textContent.trim())),
      brands: brands.map((brand) => {
        const symbol = brand.querySelector(".brand-symbol");
        const image = brand.querySelector("img");
        return {
          text: brand.textContent.trim(),
          label: brand.getAttribute("aria-label"),
          href: brand.getAttribute("href"),
          imageAlt: image?.getAttribute("alt"),
          symbolBackgroundAlpha: symbol ? parseAlpha(getComputedStyle(symbol).backgroundColor) : 1,
        };
      }),
    };
  }, { checkedRoute: route, status: response?.status() }));
}
for (const route of ["/progetti/secure-garage-access/", "/percorso-inesistente"]) {
  const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "load" });
  routeChecks.push({
    route,
    status: response?.status(),
    title: await page.title(),
    h1: await page.locator("h1").count(),
    noindex: await page.evaluate(() => /noindex/i.test(document.querySelector('meta[name="robots"]')?.content || "")),
    removedProjectText: await page.locator("body").innerText().then((value) => /Secure Garage/i.test(value)),
  });
}
const confirmationResponse = await page.goto(`${baseUrl}/conferma-invio.html`, { waitUntil: "load" });
const confirmationRoute = {
  status: confirmationResponse?.status(),
  noindex: await page.evaluate(() => /noindex/i.test(document.querySelector('meta[name="robots"]')?.content || "")),
  h1: await page.locator("h1").count(),
};

console.log("Browser QA: assenza condizionale delle gallerie vuote");
const emptyGalleryChecks = [];
for (const { slug } of expectedProjects) {
  await page.goto(`${baseUrl}/progetti/${slug}/`, { waitUntil: "load" });
  emptyGalleryChecks.push(await page.evaluate((projectSlug) => ({
    slug: projectSlug,
    galleryRoots: document.querySelectorAll("[data-gallery]").length,
    galleryDialogs: document.querySelectorAll("[data-gallery-dialog]").length,
    galleryItems: document.querySelectorAll("[data-gallery-item]").length,
    galleryHeading: [...document.querySelectorAll("main h2, main h3")].some((heading) => /galleria|schermate/i.test(heading.textContent || "")),
    projectAssetReferences: [...document.querySelectorAll('main [src*="/assets/projects/"], main [href*="/assets/projects/"]')].length,
  }), slug));
}

await page.setViewportSize({ width: 390, height: 844 });
console.log("Browser QA: tastiera e menu mobile");
await page.goto(`${baseUrl}/`, { waitUntil: "load" });
await page.keyboard.press("Tab");
const firstFocus = await page.evaluate(() => ({ text: document.activeElement?.textContent?.trim(), href: document.activeElement?.getAttribute("href") }));
await page.getByRole("button", { name: "Apri il menu" }).click();
const menuOpen = await page.locator("#mobile-menu").evaluate((element) => element.open);
await page.keyboard.press("Escape");
const menuFocusReturned = await page.evaluate(() => document.activeElement?.getAttribute("aria-label") === "Apri il menu");

console.log("Browser QA: ingresso diretto e pannello contatti a crescita naturale");
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(`${baseUrl}/#contatti`, { waitUntil: "load" });
await waitForStablePage();
await page.waitForFunction(() => document.querySelector("#contatti")?.getBoundingClientRect().top < innerHeight, null, { timeout: 2_000 }).catch(() => {});
const directContactHash = await page.evaluate(() => {
  const target = document.querySelector("#contatti");
  const header = document.querySelector(".site-header");
  const targetRect = target?.getBoundingClientRect();
  const headerRect = header?.getBoundingClientRect();
  return {
    hash: location.hash,
    targetExists: Boolean(target),
    targetTop: targetRect?.top ?? null,
    headerBottom: headerRect?.bottom ?? null,
    targetVisible: Boolean(targetRect && targetRect.bottom > Math.max(0, headerRect?.bottom || 0) && targetRect.top < innerHeight),
  };
});

const inspectContactPanel = async (viewport, textScale = 1) => {
  await page.setViewportSize(viewport);
  await page.goto(`${baseUrl}/`, { waitUntil: "load" });
  await waitForStablePage();
  if (textScale !== 1) {
    await page.evaluate((scale) => { document.documentElement.style.fontSize = `${scale * 100}%`; }, textScale);
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  }
  await page.locator(".botanical-contact .contact-content").scrollIntoViewIfNeeded();
  return page.evaluate(({ checkedViewport, scale }) => {
    const panel = document.querySelector(".botanical-contact .contact-content");
    const section = document.querySelector(".botanical-contact");
    if (!panel || !section) return { viewport: checkedViewport, textScale: scale, exists: false };
    const panelRect = panel.getBoundingClientRect();
    const style = getComputedStyle(panel);
    const paddingTop = Number.parseFloat(style.paddingTop) || 0;
    const paddingBottom = Number.parseFloat(style.paddingBottom) || 0;
    const inFlow = [...panel.children].filter((child) => {
      const childStyle = getComputedStyle(child);
      return childStyle.display !== "none" && childStyle.position !== "absolute" && childStyle.position !== "fixed";
    });
    const rects = inFlow.map((child) => child.getBoundingClientRect()).filter((rect) => rect.width || rect.height);
    const contentTop = rects.length ? Math.min(...rects.map((rect) => rect.top)) : panelRect.top + paddingTop;
    const contentBottom = rects.length ? Math.max(...rects.map((rect) => rect.bottom)) : panelRect.top + paddingTop;
    const decorations = [...section.querySelectorAll(".contact-garden, .contact-foliage")].map((element) => ({
      className: element.className,
      position: getComputedStyle(element).position,
    }));
    return {
      viewport: checkedViewport,
      textScale: scale,
      exists: true,
      height: panelRect.height,
      viewportRatio: panelRect.height / innerHeight,
      minHeight: style.minHeight,
      cssHeight: style.height,
      overflowX: style.overflowX,
      overflowY: style.overflowY,
      scrollHeight: panel.scrollHeight,
      clientHeight: panel.clientHeight,
      contentTop,
      contentBottom,
      panelTop: panelRect.top,
      panelBottom: panelRect.bottom,
      paddingTop,
      paddingBottom,
      emptyBefore: Math.max(0, contentTop - panelRect.top - paddingTop),
      emptyAfter: Math.max(0, panelRect.bottom - paddingBottom - contentBottom),
      contentContained: contentTop >= panelRect.top - 1 && contentBottom <= panelRect.bottom + 1,
      overflowPageX: document.documentElement.scrollWidth > innerWidth + 1,
      overflowElements: [...document.querySelectorAll("body *")].flatMap((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        if (style.display === "none" || style.position === "fixed" || (rect.left >= -1 && rect.right <= innerWidth + 1)) return [];
        return [{
          tag: element.tagName.toLowerCase(),
          className: typeof element.className === "string" ? element.className : "",
          text: element.children.length ? "" : (element.textContent || "").trim().slice(0, 80),
          left: rect.left,
          right: rect.right,
          width: rect.width,
        }];
      }).slice(0, 20),
      decorations,
    };
  }, { checkedViewport: viewport, scale: textScale });
};
const contactPanels = {
  desktop: await inspectContactPanel({ width: 1440, height: 900 }),
  mobile: await inspectContactPanel({ width: 390, height: 844 }),
  shortLandscape: await inspectContactPanel({ width: 844, height: 390 }),
  text200Desktop: await inspectContactPanel({ width: 1440, height: 900 }, 2),
  text200Mobile: await inspectContactPanel({ width: 390, height: 844 }, 2),
};

console.log("Browser QA: contrazione viewport del modulo (approssimazione tastiera virtuale)");
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${baseUrl}/contatti.html`, { waitUntil: "load" });
await page.getByLabel(/^Messaggio/).focus();
await page.setViewportSize({ width: 390, height: 500 });
await page.getByLabel(/^Messaggio/).scrollIntoViewIfNeeded();
const compactFormViewport = await page.evaluate(() => {
  const field = document.activeElement;
  const rect = field?.getBoundingClientRect();
  return {
    focusedField: field?.id,
    visible: Boolean(rect && rect.bottom > 0 && rect.top < innerHeight),
    fullyVisible: Boolean(rect && rect.top >= 0 && rect.bottom <= innerHeight),
    rect: rect ? { top: rect.top, bottom: rect.bottom, height: rect.height } : null,
    overflowX: document.documentElement.scrollWidth > innerWidth + 1,
  };
});

console.log("Browser QA: liquid glass, fallback e trasparenza ridotta");
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(`${baseUrl}/`, { waitUntil: "load" });
await page.waitForFunction(() => {
  const shell = document.querySelector(".nav-shell");
  return shell && ["has-liquid-glass", "glass-frosted", "glass-opaque"].some((name) => shell.classList.contains(name));
});
const glass = await page.evaluate(() => {
  const shell = document.querySelector(".nav-shell");
  const style = getComputedStyle(shell);
  return {
    state: ["has-liquid-glass", "glass-frosted", "glass-opaque"].find((name) => shell.classList.contains(name)) || null,
    liquidFunctionAvailable: typeof window.liquidGlass === "function",
    backdropFilter: style.backdropFilter || style.webkitBackdropFilter || "none",
    filter: style.filter,
  };
});

const transparencyContext = await browser.newContext({ reducedMotion: "no-preference", colorScheme: "light" });
const transparencyPage = await transparencyContext.newPage();
attachConsoleCapture(transparencyPage, "reduced-transparency");
const cdp = await transparencyContext.newCDPSession(transparencyPage);
let reducedTransparency;
try {
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-transparency", value: "reduce" }] });
  await transparencyPage.goto(`${baseUrl}/`, { waitUntil: "load" });
  await transparencyPage.waitForFunction(() => document.querySelector(".nav-shell")?.classList.contains("glass-opaque"));
  reducedTransparency = await transparencyPage.evaluate(() => ({
    mediaMatches: matchMedia("(prefers-reduced-transparency: reduce)").matches,
    opaque: document.querySelector(".nav-shell")?.classList.contains("glass-opaque") || false,
    enhanced: document.querySelector(".nav-shell")?.classList.contains("has-liquid-glass") || false,
  }));
} catch (error) {
  reducedTransparency = { mediaMatches: false, opaque: false, enhanced: false, error: error.message };
}
await transparencyContext.close();

const fallbackContext = await browser.newContext({ reducedMotion: "no-preference", colorScheme: "light" });
const fallbackPage = await fallbackContext.newPage();
attachConsoleCapture(fallbackPage, "glass-fallback");
await fallbackPage.route("**/assets/js/liquid-glass.js", (route) => route.fulfill({
  status: 200,
  contentType: "application/javascript; charset=utf-8",
  body: 'window.liquidGlass = () => { throw new Error("synthetic glass failure"); };',
}));
await fallbackPage.goto(`${baseUrl}/`, { waitUntil: "load" });
await fallbackPage.waitForFunction(() => document.querySelector(".nav-shell")?.classList.contains("glass-opaque"));
const glassFailureFallback = await fallbackPage.evaluate(() => ({
  opaque: document.querySelector(".nav-shell")?.classList.contains("glass-opaque") || false,
  enhanced: document.querySelector(".nav-shell")?.classList.contains("has-liquid-glass") || false,
}));
await fallbackContext.close();

console.log("Browser QA: movimento ridotto");
const reducedMotionContext = await browser.newContext({ reducedMotion: "reduce", colorScheme: "light" });
const reducedMotionPage = await reducedMotionContext.newPage();
attachConsoleCapture(reducedMotionPage, "reduced-motion");
await reducedMotionPage.setViewportSize({ width: 1440, height: 900 });
await reducedMotionPage.goto(`${baseUrl}/`, { waitUntil: "load" });
await reducedMotionPage.evaluate(() => window.scrollTo({ top: 420, behavior: "instant" }));
await reducedMotionPage.waitForTimeout(120);
const reducedMotion = await reducedMotionPage.evaluate(() => ({
  mediaMatches: matchMedia("(prefers-reduced-motion: reduce)").matches,
  cameraMode: document.querySelector("[data-garden-scene]")?.dataset.cameraMode,
  cameraProgress: Number.parseFloat(document.querySelector("[data-garden-scene]")?.dataset.cameraProgress || "NaN"),
  cameraLayers: [...document.querySelectorAll("[data-parallax-layer]")].map((layer) => ({
    scale: Number.parseFloat(layer.style.getPropertyValue("--camera-scale")) || 1,
    x: Number.parseFloat(layer.style.getPropertyValue("--camera-x")) || 0,
    y: Number.parseFloat(layer.style.getPropertyValue("--camera-y")) || 0,
    pointerX: Number.parseFloat(layer.style.getPropertyValue("--pointer-x")) || 0,
    pointerY: Number.parseFloat(layer.style.getPropertyValue("--pointer-y")) || 0,
  })),
  revealAnimations: [...document.querySelectorAll("[data-reveal]")].reduce((total, element) => total + element.getAnimations().length, 0),
  overflowX: document.documentElement.scrollWidth > innerWidth + 1,
}));
await reducedMotionContext.close();

console.log("Browser QA: galleria sintetica, tastiera, elemento singolo ed errore immagine");
await page.setViewportSize({ width: 1280, height: 800 });
await page.goto(`${baseUrl}/progetti/mns-warehouse/`, { waitUntil: "load" });
const fixtureUrl = page.url();
await page.evaluate(() => {
  const fixture = document.createElement("div");
  fixture.id = "synthetic-gallery-fixture";
  fixture.innerHTML = `
    <section data-gallery aria-label="Galleria sintetica">
      <div>
        <figure data-gallery-item>
          <a href="/assets/images/garden-distance-desktop.webp" data-gallery-open data-gallery-src="/assets/images/garden-distance-desktop.webp" data-gallery-alt="Schermata sintetica uno di MNS Warehouse" data-gallery-caption="Dettaglio sintetico uno" data-gallery-width="1536" data-gallery-height="1024">
            <img src="/assets/images/garden-distance-desktop.webp" alt="Schermata sintetica uno di MNS Warehouse" width="1536" height="1024">
          </a>
        </figure>
        <figure data-gallery-item>
          <a href="/assets/images/garden-foreground-desktop.webp" data-gallery-open data-gallery-src="/assets/images/garden-foreground-desktop.webp" data-gallery-alt="Schermata sintetica due di MNS Warehouse" data-gallery-caption="Dettaglio sintetico due" data-gallery-width="1536" data-gallery-height="1024">
            <img src="/assets/images/garden-foreground-desktop.webp" alt="Schermata sintetica due di MNS Warehouse" width="1536" height="1024">
          </a>
        </figure>
      </div>
      <dialog data-gallery-dialog aria-label="Anteprima sintetica">
        <button type="button" data-gallery-close aria-label="Chiudi la galleria">Chiudi</button>
        <button type="button" data-gallery-prev aria-label="Schermata precedente">Precedente</button>
        <button type="button" data-gallery-next aria-label="Schermata successiva">Successiva</button>
        <img data-gallery-full src="" alt="" width="1" height="1">
        <p data-gallery-caption></p>
        <p data-gallery-status aria-live="polite"></p>
        <a data-gallery-original href="">Apri l’immagine originale</a>
      </dialog>
    </section>`;
  document.querySelector("main").append(fixture);
  document.dispatchEvent(new CustomEvent("miniutti:gallery-init", { detail: { root: fixture } }));
});
await page.locator("#synthetic-gallery-fixture [data-gallery-item] img").first().waitFor({ state: "visible" });
const firstGalleryLink = page.locator("#synthetic-gallery-fixture [data-gallery-open]").first();
await firstGalleryLink.click();
const galleryDialog = page.locator("#synthetic-gallery-fixture [data-gallery-dialog]");
await galleryDialog.waitFor({ state: "visible" });
const initialModal = await page.evaluate((expectedUrl) => {
  const fixture = document.querySelector("#synthetic-gallery-fixture");
  const image = fixture.querySelector("[data-gallery-full]");
  return {
    urlUnchanged: location.href === expectedUrl,
    dialogOpen: fixture.querySelector("[data-gallery-dialog]").open,
    status: fixture.querySelector("[data-gallery-status]").textContent,
    caption: fixture.querySelector("[data-gallery-dialog] [data-gallery-caption]").textContent,
    widthAttribute: image.getAttribute("width"),
    heightAttribute: image.getAttribute("height"),
    renderedWidth: image.getBoundingClientRect().width,
    alt: image.alt,
  };
}, fixtureUrl);
await page.keyboard.press("ArrowRight");
const nextModal = await page.evaluate(() => ({
  status: document.querySelector("#synthetic-gallery-fixture [data-gallery-status]").textContent,
  caption: document.querySelector("#synthetic-gallery-fixture [data-gallery-dialog] [data-gallery-caption]").textContent,
  alt: document.querySelector("#synthetic-gallery-fixture [data-gallery-full]").alt,
}));
await page.keyboard.press("ArrowLeft");
await page.keyboard.press("Escape");
await page.waitForFunction(() => !document.querySelector("#synthetic-gallery-fixture [data-gallery-dialog]")?.open);
const focusRestored = await page.evaluate(() => document.activeElement === document.querySelector("#synthetic-gallery-fixture [data-gallery-open]"));
await page.evaluate(() => document.querySelectorAll("#synthetic-gallery-fixture [data-gallery-item]")[1].remove());
await firstGalleryLink.click();
const singleItem = await page.evaluate(() => ({
  status: document.querySelector("#synthetic-gallery-fixture [data-gallery-status]").textContent,
  previousHidden: document.querySelector("#synthetic-gallery-fixture [data-gallery-prev]").hidden,
  nextHidden: document.querySelector("#synthetic-gallery-fixture [data-gallery-next]").hidden,
}));
await page.evaluate(() => document.querySelector("#synthetic-gallery-fixture [data-gallery-full]").dispatchEvent(new Event("error")));
await page.waitForFunction(() => !document.querySelector("#synthetic-gallery-fixture [data-gallery]"));
await page.waitForTimeout(60);
const failureHandling = await page.evaluate(() => ({
  galleryRemoved: !document.querySelector("#synthetic-gallery-fixture [data-gallery]"),
  focusOutsideRemovedGallery: document.activeElement !== document.body && !document.querySelector("#synthetic-gallery-fixture")?.contains(document.activeElement),
}));
const syntheticGallery = { initialModal, nextModal, focusRestored, singleItem, failureHandling };

let apiMode = "failure";
console.log("Browser QA: stati del modulo contatti senza consegna reale");
await page.route("**/api/contact", async (route) => {
  if (apiMode === "failure") await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Servizio temporaneamente non disponibile." }) });
  else await route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ ok: true }) });
});
await page.goto(`${baseUrl}/contatti.html`, { waitUntil: "load" });
const submitButton = page.locator('#contact-form button[type="submit"]');
await submitButton.click();
const invalidForm = {
  invalidFields: await page.locator('[aria-invalid="true"]').count(),
  focusedField: await page.evaluate(() => document.activeElement?.id),
  buttonLabel: (await submitButton.innerText()).trim(),
};
await page.getByLabel(/^Nome/).fill("Utente Test");
await page.getByLabel(/^Email/).fill("qa@example.invalid");
await page.getByLabel(/^Organizzazione/).fill("Verifica locale");
await page.getByLabel(/^Argomento/).selectOption("systems");
await page.getByLabel(/^Messaggio/).fill("Messaggio sintetico usato esclusivamente nel test locale intercettato.");
await page.getByLabel(/Ho letto/).check();
await page.evaluate(() => window.onTurnstileSuccess("token-locale-di-test"));
await submitButton.click();
await page.locator('#form-status[data-state="error"]').waitFor();
const failurePath = {
  status: await page.locator("#form-status").innerText(),
  messagePreserved: (await page.getByLabel(/^Messaggio/).inputValue()).startsWith("Messaggio sintetico"),
  submitEnabled: await submitButton.isEnabled(),
  challengeReset: (await page.locator("#challenge-status").innerText()).includes("di nuovo"),
};
apiMode = "success";
await page.evaluate(() => window.onTurnstileSuccess("secondo-token-locale-di-test"));
await submitButton.click();
await page.waitForURL(`${baseUrl}/conferma-invio.html`);
const successPath = {
  title: await page.locator("h1").innerText(),
  copy: await page.locator("#confirmation-copy").innerText(),
};

console.log("Browser QA: screenshot finali a pagina intera");
for (const capture of screenshots) {
  await page.setViewportSize({ width: capture.width, height: capture.height });
  await page.goto(`${baseUrl}${capture.route}`, { waitUntil: "load" });
  await waitForStablePage();
  if (capture.route === "/contatti.html") {
    await page.evaluate(() => window.onTurnstileError?.());
  }
  await page.screenshot({ path: path.join(outputDirectory, capture.file), fullPage: true, type: "jpeg", quality: 82 });
}

console.log("Browser QA: disponibilità motori aggiuntivi");
const engineAvailability = [{ engine: "chromium", executable: chromePath, available: true, smokePassed: true, version: browser.version() }];
for (const [name, engine, configuredPath] of [
  ["firefox", firefox, process.env.FIREFOX_PATH],
  ["webkit", webkit, process.env.WEBKIT_PATH],
]) {
  const executable = configuredPath || engine.executablePath();
  try {
    await access(executable);
    const extraBrowser = await engine.launch({ executablePath: configuredPath || undefined, headless: true });
    const extraPage = await extraBrowser.newPage();
    const response = await extraPage.goto(`${baseUrl}/`, { waitUntil: "load" });
    const smokePassed = response?.status() === 200 && await extraPage.locator("h1").count() === 1;
    engineAvailability.push({ engine: name, executable, available: true, smokePassed, version: extraBrowser.version() });
    await extraBrowser.close();
  } catch (error) {
    engineAvailability.push({ engine: name, executable, available: false, smokePassed: false, reason: error.code === "ENOENT" ? "runtime non installato" : error.message });
  }
}

const expectedConsoleSignals = consoleSignals.filter(({ message }) => /ERR_BLOCKED_BY_CLIENT|net::ERR_FAILED|status of (?:404|503)|status code (?:404|503)/i.test(message));
const unexpectedConsoleErrors = consoleSignals.filter(({ message }) => !/ERR_BLOCKED_BY_CLIENT|net::ERR_FAILED|status of (?:404|503)|status code (?:404|503)/i.test(message));
const report = {
  recordedAt: new Date().toISOString(),
  browser: `Chrome ${browser.version()}`,
  baseUrl,
  indexableRouteCount: indexableRoutes.length,
  layoutChecks,
  projects: { home: homeProjects, index: projectIndex },
  cameraMotion,
  routeChecks,
  confirmationRoute,
  emptyGalleryChecks,
  keyboard: { firstFocus, menuOpen, menuFocusReturned },
  directContactHash,
  contactPanels,
  compactFormViewport,
  glass: { actual: glass, reducedTransparency, failureFallback: glassFailureFallback },
  reducedMotion,
  syntheticGallery,
  contactMocks: { invalidForm, failurePath, successPath, realDeliveryAttempted: false },
  engineAvailability,
  expectedConsoleSignals,
  consoleErrors: unexpectedConsoleErrors,
  screenshots: screenshots.map(({ file, route, width, height }) => ({ file, route, width, height, fullPage: true })),
};

const sameList = (actual, expected) => actual.length === expected.length && actual.every((value, index) => value === expected[index]);
const failedReasons = [];
for (const item of layoutChecks) {
  if (item.overflowX) failedReasons.push(`overflow orizzontale a ${item.width}×${item.height}`);
  if (!item.h1Visible) failedReasons.push(`H1 non visibile a ${item.width}×${item.height}`);
  if (item.brokenImages > 0) failedReasons.push(`${item.brokenImages} immagini rotte a ${item.width}×${item.height}`);
  if (item.projectPanels !== 3) failedReasons.push(`pannelli progetto ${item.projectPanels} a ${item.width}×${item.height}`);
  if (!item.sceneOverflowHidden || item.layersCoverHero.length !== 3 || item.layersCoverHero.some((covered) => !covered)) failedReasons.push(`copertura giardino incompleta a ${item.width}×${item.height}`);
}
if (homeProjects.heading !== "Alcuni dei miei progetti") failedReasons.push("titolo sezione progetti home inatteso");
if (!sameList(homeProjects.titles, expectedProjects.map(({ title }) => title))) failedReasons.push("ordine o titoli dei progetti home inattesi");
if (!sameList(homeProjects.links, expectedProjects.map(({ slug }) => `/progetti/${slug}/`))) failedReasons.push("link dei progetti home inattesi");
if (homeProjects.visualElements !== 0 || homeProjects.projectAssetsLoaded.length) failedReasons.push("la home carica immagini di progetto");
if (homeProjects.containsRemovedProject) failedReasons.push("la home cita il progetto rimosso");
if (!sameList(projectIndex.slugs, expectedProjects.map(({ slug }) => slug)) || projectIndex.rows !== 3) failedReasons.push("indice progetti diverso dai tre casi richiesti");
if (projectIndex.projectAssetReferences !== 0 || projectIndex.containsRemovedProject) failedReasons.push("indice progetti con immagini o riferimenti rimossi");

for (const [name, result] of Object.entries(cameraMotion)) {
  const [start, thirty, sixtyFive, end] = result.frames;
  if (result.frames.length !== 4 || result.frames.some((frame) => frame.mode !== "immersive" || !Number.isFinite(frame.progress) || Math.abs(frame.progress - frame.requestedProgress) > 0.08)) {
    failedReasons.push(`intervallo camera ${name} non segue 0/30/65/100%`);
    continue;
  }
  if (result.frames.some((frame) => frame.layers.length !== 3 || frame.layersCoverHero.some((covered) => !covered) || frame.overflowX)) {
    failedReasons.push(`camera ${name} espone bordi, overflow o layer mancanti`);
  }
  const startScales = start.layers.map(({ scale }) => scale);
  const endScales = end.layers.map(({ scale }) => scale);
  const growth = endScales.map((value, index) => value - startScales[index]);
  if (startScales.some((value) => Math.abs(value - 1) > 0.025) || growth.some((value) => value <= 0.01)) failedReasons.push(`camera ${name} non parte dalla composizione statica o non avanza`);
  if (!(growth[0] < growth[1] && growth[1] < growth[2])) failedReasons.push(`profondità prospettica ${name} non progressiva`);
  const startForeground = start.layers[2]?.rect;
  const closeForeground = sixtyFive.layers[2]?.rect;
  if (!startForeground || !closeForeground || closeForeground.width <= startForeground.width * 1.12 || closeForeground.left >= startForeground.left - 2 || closeForeground.right <= startForeground.right + 2) {
    failedReasons.push(`fogliame in primo piano ${name} non si espande verso entrambi i bordi`);
  }
  const origins = new Set(end.layers.map(({ transformOrigin }) => transformOrigin));
  if (origins.size !== 1 || [...origins].some((origin) => !origin || origin === "0px 0px")) failedReasons.push(`punto di fuga ${name} incoerente fra i layer`);
  for (const frame of result.frames) {
    for (const element of [frame.introduction, frame.contact]) {
      if (element.exists && element.onscreen && (!element.visible || !element.unobstructed || element.pointerEvents === "none")) failedReasons.push(`testo o CTA ostruiti nella camera ${name} al ${Math.round(frame.requestedProgress * 100)}%`);
    }
  }
  if (!Number.isFinite(result.reverse.progress) || Math.abs(result.reverse.progress - 0.3) > 0.08 || result.reverse.layers.some((layer, index) => layer.scale >= sixtyFive.layers[index].scale)) {
    failedReasons.push(`ricostruzione in scroll inverso ${name} non valida`);
  }
  if (result.pointerExpected && !result.pointer.layers.some(({ pointerX, pointerY }) => Math.abs(pointerX) > 0.1 || Math.abs(pointerY) > 0.1)) failedReasons.push("risposta della camera al puntatore assente");
  if (result.ctaAccessibility.tagName !== "A" || !result.ctaAccessibility.href || !/^Contattami(?:\s|$)/i.test(result.ctaAccessibility.accessibleName) || result.ctaAccessibility.width < 44 || result.ctaAccessibility.height < 44 || !result.ctaAccessibility.focusIndicator || !result.ctaAccessibility.supportingSurface) {
    failedReasons.push(`azione Contattami ${name} non mantiene semantica, contrast support surface, focus o target 44px`);
  }
}
for (const item of routeChecks) {
  const missing = item.route === "/progetti/secure-garage-access/" || item.route === "/percorso-inesistente";
  if (item.status !== (missing ? 404 : 200) || item.h1 !== 1 || item.noindex !== missing || item.removedProjectText) failedReasons.push(`risposta inattesa per ${item.route}`);
  if (!missing) {
    if (!item.brands?.length || item.brands.some((brand) => brand.text || brand.label !== "Tobia Miniutti — Homepage" || brand.href !== "/" || brand.imageAlt !== "" || brand.symbolBackgroundAlpha > 0.01)) failedReasons.push(`identità logo-only navbar non conforme per ${item.route}`);
    if (item.contributionBoxes || item.contributionHeading) failedReasons.push(`box Il mio contributo ancora presente per ${item.route}`);
  }
}
if (confirmationRoute.status !== 200 || !confirmationRoute.noindex || confirmationRoute.h1 !== 1) failedReasons.push("pagina conferma non valida o indicizzabile");
if (emptyGalleryChecks.some((item) => item.galleryRoots || item.galleryDialogs || item.galleryItems || item.galleryHeading || item.projectAssetReferences)) failedReasons.push("una cartella screenshot vuota genera ancora una galleria o un placeholder");
if (firstFocus.href !== "#contenuto" || !menuOpen || !menuFocusReturned) failedReasons.push("navigazione tastiera/menu mobile non conforme");
if (directContactHash.hash !== "#contatti" || !directContactHash.targetExists || !directContactHash.targetVisible || directContactHash.targetTop < directContactHash.headerBottom - 2) failedReasons.push("ingresso diretto #contatti coperto dalla navbar o non visibile");
for (const [name, panel] of Object.entries(contactPanels)) {
  if (!panel.exists || panel.minHeight !== "0px" || !panel.contentContained || panel.overflowPageX || panel.scrollHeight > panel.clientHeight + 2) failedReasons.push(`pannello contatti ${name} vincolato, tagliato o in overflow`);
  if (panel.decorations?.some(({ position }) => position !== "absolute")) failedReasons.push(`media decorativi contatti ${name} ancora nel flusso`);
  if (!name.startsWith("text200") && name !== "shortLandscape" && (panel.viewportRatio >= 0.82 || panel.emptyAfter > Math.max(80, panel.height * 0.2))) failedReasons.push(`pannello contatti ${name} conserva spazio verticale anomalo`);
}
if (contactPanels.text200Desktop.height < contactPanels.desktop.height || contactPanels.text200Mobile.height < contactPanels.mobile.height) failedReasons.push("pannello contatti non cresce con testo al 200%");
if (compactFormViewport.focusedField !== "message" || !compactFormViewport.visible || compactFormViewport.overflowX) failedReasons.push("modulo contatti non resta usabile con viewport ridotta da tastiera virtuale");
if (!glass.liquidFunctionAvailable || !glass.state) failedReasons.push("liquid glass o fallback non inizializzato");
if (!reducedTransparency.mediaMatches || !reducedTransparency.opaque || reducedTransparency.enhanced) failedReasons.push("fallback per trasparenza ridotta non attivo");
if (!glassFailureFallback.opaque || glassFailureFallback.enhanced) failedReasons.push("fallback liquid glass in errore non attivo");
if (!reducedMotion.mediaMatches || reducedMotion.cameraMode !== "static" || Math.abs(reducedMotion.cameraProgress) > 0.001 || reducedMotion.cameraLayers.length !== 3 || reducedMotion.cameraLayers.some(({ scale, x, y, pointerX, pointerY }) => Math.abs(scale - 1) > 0.001 || Math.abs(x) > 0.01 || Math.abs(y) > 0.01 || Math.abs(pointerX) > 0.01 || Math.abs(pointerY) > 0.01) || reducedMotion.revealAnimations || reducedMotion.overflowX) failedReasons.push("preferenza movimento ridotto non mantiene la composizione statica completa");
if (!syntheticGallery.initialModal.urlUnchanged || !syntheticGallery.initialModal.dialogOpen || syntheticGallery.initialModal.status !== "Schermata 1 di 2" || syntheticGallery.initialModal.caption !== "Dettaglio sintetico uno" || syntheticGallery.initialModal.widthAttribute !== "1536" || syntheticGallery.initialModal.heightAttribute !== "1024" || syntheticGallery.initialModal.renderedWidth <= 0) failedReasons.push("apertura galleria sintetica non valida");
if (syntheticGallery.nextModal.status !== "Schermata 2 di 2" || syntheticGallery.nextModal.caption !== "Dettaglio sintetico due") failedReasons.push("navigazione galleria sintetica non valida");
if (!syntheticGallery.focusRestored) failedReasons.push("focus non restituito dopo Escape dalla galleria");
if (syntheticGallery.singleItem.status !== "Schermata 1 di 1" || !syntheticGallery.singleItem.previousHidden || !syntheticGallery.singleItem.nextHidden) failedReasons.push("galleria a elemento singolo non valida");
if (!syntheticGallery.failureHandling.galleryRemoved || !syntheticGallery.failureHandling.focusOutsideRemovedGallery) failedReasons.push("errore immagine galleria non gestito in sicurezza");
if (invalidForm.focusedField !== "name" || invalidForm.invalidFields < 4 || invalidForm.buttonLabel !== "Invia il messaggio") failedReasons.push("validazione iniziale modulo non conforme");
if (!failurePath.messagePreserved || !failurePath.submitEnabled || !failurePath.challengeReset) failedReasons.push("percorso errore modulo non conforme");
if (successPath.title !== "Richiesta accettata.") failedReasons.push("percorso successo modulo non conforme");
if (unexpectedConsoleErrors.length) failedReasons.push(`${unexpectedConsoleErrors.length} errori console inattesi`);
if (engineAvailability.some(({ available, smokePassed }) => available && !smokePassed)) failedReasons.push("smoke test fallito su un motore browser disponibile");

report.failedReasons = failedReasons;
await writeFile(path.join(outputDirectory, "browser-qa.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
await context.close();
await browser.close();

if (failedReasons.length) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}
const additionalEngines = engineAvailability.filter(({ engine, available }) => engine !== "chromium" && available).map(({ engine }) => engine);
console.log(`Browser QA completato con Chrome ${report.browser.replace("Chrome ", "")}; ${indexableRoutes.length} rotte indicizzabili, ${screenshots.length} screenshot, motori aggiuntivi: ${additionalEngines.join(", ") || "non installati"}.`);

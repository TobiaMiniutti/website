import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { access, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const LIGHTHOUSE_VERSION = "13.4.1";
const THRESHOLDS = Object.freeze({
  performanceMedian: 0.91,
  accessibilityEveryRun: 0.98,
  seoEveryRun: 1,
  bestPracticesEveryRun: 0.91,
});
const ROUTES = Object.freeze([
  { id: "home", path: "/" },
  { id: "contatti", path: "/contatti.html" },
  { id: "privacy", path: "/privacy.html" },
  { id: "progetti", path: "/progetti/" },
  { id: "mns-warehouse", path: "/progetti/mns-warehouse/" },
  { id: "culina", path: "/progetti/culina/" },
  { id: "little-printer-revival", path: "/progetti/little-printer-revival/" },
]);
const PROFILES = Object.freeze([
  { id: "mobile", arguments: [] },
  { id: "desktop", arguments: ["--preset=desktop"] },
]);
const METRICS = Object.freeze({
  fcp: "first-contentful-paint",
  lcp: "largest-contentful-paint",
  tbt: "total-blocking-time",
  cls: "cumulative-layout-shift",
  si: "speed-index",
});

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baseUrl = String(process.env.BASE_URL || "http://127.0.0.1:4173").replace(/\/+$/, "");
const auditRuns = Number.parseInt(process.env.AUDIT_RUNS || "3", 10);
const auditLabel = String(process.env.AUDIT_LABEL || "refinement").trim().replace(/[^a-z0-9._-]+/gi, "-") || "refinement";
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const outputDirectory = path.resolve(process.env.AUDIT_OUTPUT_DIR || path.join(projectRoot, "docs", "audits", `${auditLabel}-${timestamp}`));

if (!/^https?:\/\//i.test(baseUrl)) throw new Error("BASE_URL deve essere un URL HTTP(S)");
if (!Number.isInteger(auditRuns) || auditRuns < 3 || auditRuns > 9) throw new Error("AUDIT_RUNS deve essere un intero compreso tra 3 e 9");

const isInside = (parent, child) => {
  const relative = path.relative(parent, child);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
};
for (const forbidden of [path.join(projectRoot, "public"), path.join(projectRoot, "dist")]) {
  if (isInside(forbidden, outputDirectory)) throw new Error("AUDIT_OUTPUT_DIR deve restare fuori da public/ e dist/");
}

const commandExists = async (candidate) => {
  if (!candidate || !/[\\/]/.test(candidate)) return true;
  try {
    await access(path.resolve(candidate));
    return true;
  } catch {
    return false;
  }
};

const runCommand = (command, arguments_, { allowFailure = false } = {}) => new Promise((resolve, reject) => {
  const commandScript = process.platform === "win32" && /\.(?:cmd|bat)$/i.test(command);
  const quoteCmd = (value) => {
    const text = String(value);
    if (/[\0\r\n"]/.test(text)) throw new Error("Argomento della CLI Windows non valido");
    return `"${text.replaceAll("%", "%%")}"`;
  };
  const executable = commandScript ? (process.env.ComSpec || "cmd.exe") : command;
  const commandLine = [quoteCmd(command), ...arguments_.map(quoteCmd)].join(" ");
  const childArguments = commandScript
    ? ["/d", "/s", "/c", `"${commandLine}"`]
    : arguments_;
  const child = spawn(executable, childArguments, {
    cwd: projectRoot,
    env: process.env,
    shell: false,
    windowsVerbatimArguments: commandScript,
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => { stdout += chunk; });
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  child.on("error", reject);
  child.on("close", (code) => {
    const result = { code: code ?? -1, stdout, stderr };
    if (!allowFailure && code !== 0) reject(Object.assign(new Error(`${command} è terminato con codice ${code}: ${stderr.trim() || stdout.trim()}`), result));
    else resolve(result);
  });
});

const findExecutable = async (names) => {
  const locator = process.platform === "win32" ? "where.exe" : "which";
  for (const name of names) {
    try {
      const result = await runCommand(locator, [name], { allowFailure: true });
      const first = result.stdout.split(/\r?\n/).map((entry) => entry.trim()).find(Boolean);
      if (result.code === 0 && first) return first;
    } catch {
      // Continue through the bounded candidate list.
    }
  }
  return null;
};

const resolveLighthouse = async () => {
  if (process.env.LIGHTHOUSE_BIN) {
    if (!await commandExists(process.env.LIGHTHOUSE_BIN)) throw new Error(`LIGHTHOUSE_BIN non esiste: ${process.env.LIGHTHOUSE_BIN}`);
    return process.env.LIGHTHOUSE_BIN;
  }
  const local = path.join(projectRoot, "node_modules", ".bin", process.platform === "win32" ? "lighthouse.cmd" : "lighthouse");
  if (await commandExists(local)) return local;
  const fromPath = await findExecutable(process.platform === "win32" ? ["lighthouse.cmd", "lighthouse"] : ["lighthouse"]);
  if (fromPath) return fromPath;
  const appDataCandidate = process.env.APPDATA ? path.join(process.env.APPDATA, "npm", "lighthouse.cmd") : null;
  if (appDataCandidate && await commandExists(appDataCandidate)) return appDataCandidate;
  throw new Error("Lighthouse non trovato. Installa lighthouse@13.4.1 oppure imposta LIGHTHOUSE_BIN.");
};

const resolveChrome = async () => {
  const candidates = [
    process.env.CHROME_PATH,
    process.platform === "win32" && process.env.PROGRAMFILES ? path.join(process.env.PROGRAMFILES, "Google", "Chrome", "Application", "chrome.exe") : null,
    process.platform === "win32" && process.env["PROGRAMFILES(X86)"] ? path.join(process.env["PROGRAMFILES(X86)"], "Google", "Chrome", "Application", "chrome.exe") : null,
    process.platform === "win32" && process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Google", "Chrome", "Application", "chrome.exe") : null,
    process.platform === "darwin" ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : null,
    process.platform === "linux" ? "/usr/bin/google-chrome" : null,
    process.platform === "linux" ? "/usr/bin/google-chrome-stable" : null,
    process.platform === "linux" ? "/usr/bin/chromium" : null,
  ].filter(Boolean);
  for (const candidate of candidates) if (await commandExists(candidate)) return path.resolve(candidate);
  const fromPath = await findExecutable(["google-chrome", "google-chrome-stable", "chromium", "chrome"]);
  if (fromPath) return fromPath;
  throw new Error("Chrome non trovato. Imposta CHROME_PATH sull’eseguibile usato per gli audit.");
};

async function walk(directory) {
  const entries = [];
  try {
    for (const name of await readdir(directory)) {
      const file = path.join(directory, name);
      if ((await stat(file)).isDirectory()) entries.push(...await walk(file));
      else entries.push(file);
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  return entries;
}

const artifactIdentity = async () => {
  const files = (await walk(path.join(projectRoot, "dist"))).sort();
  if (!files.length) return { type: "dist-sha256", value: null, files: 0 };
  const hash = createHash("sha256");
  for (const file of files) {
    hash.update(path.relative(path.join(projectRoot, "dist"), file).replaceAll("\\", "/"));
    hash.update("\0");
    hash.update(await readFile(file));
    hash.update("\0");
  }
  return { type: "dist-sha256", value: hash.digest("hex"), files: files.length };
};

const fetchPage = async (route) => {
  const url = `${baseUrl}${route}`;
  try {
    const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(20_000), headers: { "cache-control": "no-cache" } });
    const body = await response.text();
    return {
      route,
      url,
      finalUrl: response.url,
      status: response.status,
      ok: response.ok,
      noindex: /<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(body),
    };
  } catch (error) {
    return { route, url, status: null, ok: false, noindex: false, error: error.message };
  }
};

const score = (lhr, category) => lhr.categories?.[category]?.score;
const metric = (lhr, auditId) => {
  const audit = lhr.audits?.[auditId];
  return {
    numericValue: Number.isFinite(audit?.numericValue) ? audit.numericValue : null,
    numericUnit: audit?.numericUnit || null,
    displayValue: audit?.displayValue || null,
  };
};
const median = (numbers) => {
  const sorted = [...numbers].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
const percent = (value) => Number.isFinite(value) ? Math.round(value * 100) : null;
const fixedMetric = (value, digits = 0) => Number.isFinite(value) ? value.toFixed(digits) : "—";

const locateReports = async (stem) => {
  const names = await readdir(outputDirectory);
  const prefix = path.basename(stem);
  const json = [`${prefix}.report.json`, `${prefix}.json`].find((name) => names.includes(name));
  const html = [`${prefix}.report.html`, `${prefix}.html`].find((name) => names.includes(name));
  return {
    json: json ? path.join(outputDirectory, json) : null,
    html: html ? path.join(outputDirectory, html) : null,
  };
};

await mkdir(outputDirectory, { recursive: true });
const lighthouseBinary = await resolveLighthouse();
const chromePath = await resolveChrome();
const versionResult = await runCommand(lighthouseBinary, ["--version"]);
const lighthouseVersion = versionResult.stdout.trim().match(/\d+\.\d+\.\d+/)?.[0] || versionResult.stderr.trim().match(/\d+\.\d+\.\d+/)?.[0];
if (lighthouseVersion !== LIGHTHOUSE_VERSION) {
  throw new Error(`Versione Lighthouse non valida: trovata ${lighthouseVersion || "sconosciuta"}, richiesta ${LIGHTHOUSE_VERSION}`);
}

console.log(`Inventario delle ${ROUTES.length} rotte indicizzabili su ${baseUrl}`);
const inventory = [];
for (const route of ROUTES) inventory.push(await fetchPage(route.path));
const utilityRoutes = [
  await fetchPage("/conferma-invio.html"),
  await fetchPage("/__lighthouse-verifica-404__"),
];
const inventoryFailures = inventory.filter((item) => item.status !== 200 || item.noindex);
if (utilityRoutes[0].status !== 200 || !utilityRoutes[0].noindex) inventoryFailures.push({ ...utilityRoutes[0], utilityExpectation: "200 + noindex" });
if (utilityRoutes[1].status !== 404 || !utilityRoutes[1].noindex) inventoryFailures.push({ ...utilityRoutes[1], utilityExpectation: "404 + noindex" });

const results = [];
let matrixBlocked = inventoryFailures.length ? "Inventario HTTP non valido; matrice non avviata" : null;
auditMatrix: for (const route of ROUTES) {
  for (const profile of PROFILES) {
    for (let run = 1; run <= auditRuns; run += 1) {
      if (matrixBlocked) break auditMatrix;
      const stem = path.join(outputDirectory, `${route.id}-${profile.id}-run-${run}`);
      const url = `${baseUrl}${route.path}`;
      console.log(`Lighthouse ${profile.id} ${route.path} — esecuzione ${run}/${auditRuns}`);
      const startedAt = new Date().toISOString();
      const cliArguments = [
        url,
        "--quiet",
        "--only-categories=performance,accessibility,seo,best-practices",
        "--output=json",
        "--output=html",
        `--output-path=${stem}`,
        `--chrome-path=${chromePath}`,
        "--chrome-flags=--headless",
        ...profile.arguments,
      ];
      const command = await runCommand(lighthouseBinary, cliArguments, { allowFailure: true });
      const reports = await locateReports(stem);
      const record = {
        route: route.path,
        routeId: route.id,
        profile: profile.id,
        run,
        url,
        startedAt,
        completedAt: new Date().toISOString(),
        commandExitCode: command.code,
        cliArguments,
        reports,
        valid: false,
      };
      try {
        if (!reports.json || !reports.html) throw new Error("Lighthouse non ha prodotto entrambi i report JSON e HTML originali");
        const lhr = JSON.parse(await readFile(reports.json, "utf8"));
        if (lhr.lighthouseVersion !== LIGHTHOUSE_VERSION) throw new Error(`Il report usa Lighthouse ${lhr.lighthouseVersion}`);
        if (lhr.runtimeError) throw new Error(`Lighthouse runtimeError: ${lhr.runtimeError.code || "errore"} — ${lhr.runtimeError.message || "senza dettaglio"}`);
        const categories = {
          performance: score(lhr, "performance"),
          accessibility: score(lhr, "accessibility"),
          seo: score(lhr, "seo"),
          bestPractices: score(lhr, "best-practices"),
        };
        if (Object.values(categories).some((value) => !Number.isFinite(value))) throw new Error("Una o più categorie richieste non hanno prodotto un punteggio valido");
        record.valid = true;
        if (command.code !== 0) {
          record.cleanupWarning = command.stderr.trim().slice(0, 8_000) || command.stdout.trim().slice(0, 8_000) || `Lighthouse è uscito con codice ${command.code} dopo avere scritto report validi`;
        }
        record.finalUrl = lhr.finalDisplayedUrl || lhr.finalUrl;
        record.fetchTime = lhr.fetchTime;
        record.lighthouseVersion = lhr.lighthouseVersion;
        record.userAgent = lhr.userAgent;
        record.environment = lhr.environment;
        record.configSettings = {
          formFactor: lhr.configSettings?.formFactor,
          throttlingMethod: lhr.configSettings?.throttlingMethod,
          throttling: lhr.configSettings?.throttling,
          screenEmulation: lhr.configSettings?.screenEmulation,
          emulatedUserAgent: lhr.configSettings?.emulatedUserAgent,
          disableStorageReset: lhr.configSettings?.disableStorageReset,
        };
        record.categories = categories;
        record.metrics = Object.fromEntries(Object.entries(METRICS).map(([key, auditId]) => [key, metric(lhr, auditId)]));
        record.gates = {
          accessibility: categories.accessibility >= THRESHOLDS.accessibilityEveryRun,
          seo: categories.seo === THRESHOLDS.seoEveryRun,
          bestPractices: categories.bestPractices >= THRESHOLDS.bestPracticesEveryRun,
        };
      } catch (error) {
        record.error = error.message;
        record.stderr = command.stderr.trim().slice(0, 8_000) || undefined;
      }
      results.push(record);
      if (!record.valid) {
        matrixBlocked = `Misurazione non valida per ${route.path} (${profile.id}, run ${run}): ${record.error}`;
        break auditMatrix;
      }
    }
  }
}

const groups = [];
for (const route of ROUTES) {
  for (const profile of PROFILES) {
    const runs = results.filter((result) => result.routeId === route.id && result.profile === profile.id);
    const validRuns = runs.filter((result) => result.valid);
    const performances = validRuns.map((result) => result.categories.performance);
    const performanceMedian = performances.length === auditRuns ? median(performances) : null;
    const group = {
      route: route.path,
      routeId: route.id,
      profile: profile.id,
      expectedRuns: auditRuns,
      validRuns: validRuns.length,
      performance: {
        median: performanceMedian,
        min: performances.length ? Math.min(...performances) : null,
        max: performances.length ? Math.max(...performances) : null,
      },
      everyRun: {
        accessibility: validRuns.length === auditRuns && validRuns.every((result) => result.gates.accessibility),
        seo: validRuns.length === auditRuns && validRuns.every((result) => result.gates.seo),
        bestPractices: validRuns.length === auditRuns && validRuns.every((result) => result.gates.bestPractices),
      },
    };
    group.pass = validRuns.length === auditRuns
      && performanceMedian >= THRESHOLDS.performanceMedian
      && group.everyRun.accessibility
      && group.everyRun.seo
      && group.everyRun.bestPractices;
    groups.push(group);
  }
}

const runMetadata = {
  createdAt: new Date().toISOString(),
  label: auditLabel,
  baseUrl,
  sourceKind: /^https?:\/\/(?:127\.0\.0\.1|localhost)(?::|\/|$)/i.test(baseUrl) ? "local-production-build" : "remote-origin",
  artifactIdentity: await artifactIdentity(),
  lighthouseVersion,
  lighthouseBinary,
  chromePath,
  chromeUserAgents: [...new Set(results.filter(({ valid }) => valid).map(({ environment, userAgent }) => environment?.hostUserAgent || userAgent).filter(Boolean))],
  profileConfigurations: Object.fromEntries(PROFILES.map(({ id }) => {
    const sample = results.find((result) => result.valid && result.profile === id);
    return [id, sample?.configSettings || null];
  })),
  auditRuns,
  execution: "sequential clean-navigation CLI invocations; no retries",
  cacheConditions: "Each Lighthouse CLI invocation starts an isolated Chrome profile and uses Lighthouse's default storage reset.",
  thresholds: THRESHOLDS,
  routes: ROUTES,
  profiles: PROFILES.map(({ id }) => id),
  inventory,
  utilityRoutes,
  inventoryFailures,
  matrixBlocked,
  groups,
  results,
  pass: inventoryFailures.length === 0 && groups.every((group) => group.pass),
};

const markdown = [
  `# Lighthouse matrix — ${auditLabel}`,
  "",
  `- Timestamp: ${runMetadata.createdAt}`,
  `- Origin: ${baseUrl}`,
  `- Measurement type: ${runMetadata.sourceKind}`,
  `- Build identity: ${runMetadata.artifactIdentity.value || "dist non disponibile"} (${runMetadata.artifactIdentity.files} file)` ,
  `- Lighthouse: ${lighthouseVersion}`,
  `- Chrome: ${runMetadata.chromeUserAgents.join("; ") || "nessun report valido"}`,
  `- Runs: ${auditRuns} per route/profile, sequential, clean navigation, no retries`,
  `- Gates: Performance median ≥ 91; Accessibility ≥ 98, SEO = 100, Best Practices ≥ 91 in every valid run`,
  ...(matrixBlocked ? [`- Matrix blocked: ${matrixBlocked}`] : []),
  "",
  "The 404 and confirmation utilities are checked for status/noindex behavior but are intentionally excluded from the SEO score gate.",
  "",
  "## Aggregate gates",
  "",
  "| Route | Profile | Valid runs | Performance median (range) | A11y every run | SEO every run | BP every run | Result |",
  "| --- | --- | ---: | ---: | --- | --- | --- | --- |",
  ...groups.map((group) => `| ${group.route} | ${group.profile} | ${group.validRuns}/${group.expectedRuns} | ${percent(group.performance.median) ?? "—"} (${percent(group.performance.min) ?? "—"}–${percent(group.performance.max) ?? "—"}) | ${group.everyRun.accessibility ? "pass" : "fail"} | ${group.everyRun.seo ? "pass" : "fail"} | ${group.everyRun.bestPractices ? "pass" : "fail"} | ${group.pass ? "PASS" : "FAIL"} |`),
  "",
  "## Raw runs",
  "",
  "| Route | Profile | Run | Perf | A11y | SEO | BP | FCP ms | LCP ms | TBT ms | CLS | SI ms | Reports | Notes |",
  "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |",
  ...results.map((result) => {
    if (!result.valid) return `| ${result.route} | ${result.profile} | ${result.run} | invalid | — | — | — | — | — | — | — | — | — | ${result.error?.replaceAll("|", "\\|") || "no report"} |`;
    const html = path.basename(result.reports.html);
    const json = path.basename(result.reports.json);
    const note = result.cleanupWarning ? `valid reports; CLI exit ${result.commandExitCode}, cleanup warning in JSON` : "";
    return `| ${result.route} | ${result.profile} | ${result.run} | ${percent(result.categories.performance)} | ${percent(result.categories.accessibility)} | ${percent(result.categories.seo)} | ${percent(result.categories.bestPractices)} | ${fixedMetric(result.metrics.fcp.numericValue)} | ${fixedMetric(result.metrics.lcp.numericValue)} | ${fixedMetric(result.metrics.tbt.numericValue)} | ${fixedMetric(result.metrics.cls.numericValue, 4)} | ${fixedMetric(result.metrics.si.numericValue)} | [HTML](./${html}) · [JSON](./${json}) | ${note} |`;
  }),
  "",
  `Overall result: **${runMetadata.pass ? "PASS" : "FAIL"}**. Automated scores are not accessibility certification or a guarantee of search ranking.`,
  "",
].join("\n");

await writeFile(path.join(outputDirectory, "summary.json"), `${JSON.stringify(runMetadata, null, 2)}\n`, "utf8");
await writeFile(path.join(outputDirectory, "summary.md"), markdown, "utf8");
console.log(`Report Lighthouse salvati in ${outputDirectory}`);
if (!runMetadata.pass) process.exitCode = 1;

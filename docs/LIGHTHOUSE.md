# Lighthouse quality gates

This project pins the measurement contract to the official Lighthouse CLI `13.4.1`. Lighthouse is intentionally not a project dependency: `package-lock.json` remains dependency-free and audit reports stay outside `public/` and `dist/`.

Lighthouse is an automated signal, not an accessibility certification, a guarantee of search ranking, or a substitute for the browser and manual reviews in this repository.

## Audited routes and gates

The matrix audits these seven indexable routes, separately on the standard Lighthouse mobile profile and the official desktop preset:

- `/`
- `/contatti.html`
- `/privacy.html`
- `/progetti/`
- `/progetti/mns-warehouse/`
- `/progetti/ricettario-ai/`
- `/progetti/little-printer-revival/`

For every URL/profile pair, the runner performs three sequential clean-navigation CLI invocations. It does not retry failures or rerun unchanged code. Acceptance requires:

- Performance median at least `0.91`; the runner also exposes the full range and every lower run.
- Accessibility at least `0.98` in every valid run.
- SEO exactly `1.00` in every valid run.
- Best Practices at least `0.91` in every valid run.

`/conferma-invio.html` and a genuine missing route are checked for their intended status and `noindex` behavior, but they are excluded from the SEO score gate. Forcing an SEO score on an intentional confirmation or 404 page would test the wrong contract.

## Reproducible setup

Use Node.js 22 or newer, Google Chrome, and the official Lighthouse CLI. Install the exact CLI version globally without changing this project's dependency graph:

```powershell
npm install --global lighthouse@13.4.1
```

Build the static artifact and start its production-style local server in one terminal:

```powershell
node scripts/build-site.mjs
node scripts/validate-site.mjs dist
node scripts/serve-site.mjs dist
```

In a second PowerShell terminal, configure the exact tools and run the matrix:

```powershell
$env:LIGHTHOUSE_BIN = (Get-Command lighthouse.cmd).Source
$env:CHROME_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$env:BASE_URL = 'http://127.0.0.1:4173'
$env:AUDIT_RUNS = '3'
$env:AUDIT_LABEL = 'after-refinement'
$env:AUDIT_OUTPUT_DIR = (Join-Path $PWD 'docs\audits\after-refinement')
node scripts/run-lighthouse-matrix.mjs
```

The runner also tries a project-local or PATH-provided `lighthouse` executable when `LIGHTHOUSE_BIN` is omitted, and common Chrome locations when `CHROME_PATH` is omitted. Explicit paths are preferred in recorded release evidence.

The mobile run uses Lighthouse's documented default mobile configuration. The desktop run adds only `--preset=desktop`. Both use the default simulated throttling supplied by Lighthouse 13.4.1; the script does not weaken throttling, alter viewports, suppress categories, or detect the audit user agent. Each run requests the Performance, Accessibility, SEO, and Best Practices categories together and saves the original HTML and JSON emitted by that invocation.

## Baseline and after comparison

Capture a baseline before source changes and an after matrix from the revised artifact under identical conditions. Use separate output directories and keep all reports:

```powershell
$env:AUDIT_LABEL = 'baseline'
$env:AUDIT_OUTPUT_DIR = (Join-Path $PWD 'docs\audits\baseline-matrix')
node scripts/run-lighthouse-matrix.mjs

$env:AUDIT_LABEL = 'after-refinement'
$env:AUDIT_OUTPUT_DIR = (Join-Path $PWD 'docs\audits\after-refinement')
node scripts/run-lighthouse-matrix.mjs
```

Every output directory contains:

- one original JSON and one original HTML report per URL/profile/run;
- `summary.json`, including build SHA-256 identity, Chrome user agent, Lighthouse configuration, timestamps, route inventory, raw metrics, gates, and invalid runs;
- `summary.md`, linking each displayed score to the corresponding original reports and listing FCP, LCP, TBT, CLS, and Speed Index.

On some Windows installations Lighthouse 13.4.1 writes complete reports and then returns a non-zero exit code because Chrome's temporary profile cannot be removed immediately (`EPERM`). The runner accepts that narrow cleanup condition only when both original reports exist, the JSON parses, `runtimeError` is absent, and all four requested category scores are present. It preserves the exit code and stderr as `cleanupWarning`. Any missing/incomplete report or Lighthouse runtime error remains a failed run.

Do not delete a low run, combine categories from different reports, or repeatedly run unchanged code until a favorable sample appears. Fix the identified cause, produce a new labeled matrix, and retain the failed set as evidence.

## Local versus deployed origin

A localhost matrix measures the exact static `dist/` artifact served by the repository, not `https://miniutti.it`. Its summary labels itself `local-production-build` and records a deterministic SHA-256 over all files in `dist/`.

A deployed-origin matrix must use the same revised artifact after deployment is separately authorized and completed:

```powershell
$env:BASE_URL = 'https://miniutti.it'
$env:AUDIT_LABEL = 'deployed-verification'
$env:AUDIT_OUTPUT_DIR = (Join-Path $PWD 'docs\audits\deployed-verification')
node scripts/run-lighthouse-matrix.mjs
```

The deployed pass is the only one that can verify host-dependent behavior such as the real CDN, TLS, caching, redirects, edge headers, and production third-party availability. A local pass must never be described as a live-site pass. A missing tool, unreachable origin, invalid report, or unavailable network is recorded as a failure, not converted into a passing score.

References: [Chrome Lighthouse overview](https://developer.chrome.com/docs/lighthouse/overview/), [Lighthouse CLI](https://github.com/GoogleChrome/lighthouse#using-the-node-cli), [Lighthouse performance scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/), [accessibility scoring](https://developer.chrome.com/docs/lighthouse/accessibility/scoring/).

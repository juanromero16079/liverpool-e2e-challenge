# Automatización E2E — Liverpool México

[![E2E Tests](https://github.com/juanromero16079/liverpool-e2e-challenge/actions/workflows/test.yml/badge.svg)](https://github.com/juanromero16079/liverpool-e2e-challenge/actions/workflows/test.yml)

Proyecto **Playwright + TypeScript** para [Liverpool México](https://www.liverpool.com.mx/): flujo de búsqueda, interceptación de `/api/plp/search`, validación UI vs API y bonus (visual, a11y, performance, multi-browser).

## Requisitos del reto

- Búsqueda **playstation 5**, filtro **White** (UI: **Blanco**), orden **Menor precio**, top **5** en consola
- Interceptación + cross-validation (≥ 3/5 IDs, discrepancias en log)
- Reporte HTML, screenshots al fallar, CI en GitHub Actions

## Bonus

| Feature | Implementación |
|---------|----------------|
| Visual regression | `tests/liverpool-bonus.spec.ts` — `toHaveScreenshot` con máscaras en precios/imágenes |
| axe-core | Mismo spec — reporte JSON adjunto + log en consola |
| Performance | Tiempo búsqueda → grid visible (límite `MAX_LOAD_MS`, default 45s) |
| Multi-browser | Proyectos `chromium`, `firefox`, `webkit` + matrix en CI |
| Data-driven | `SEARCH_TERM` env + test opcional en `liverpool-search.spec.ts` |

## Instalación

```bash
npm ci
npx playwright install chromium firefox webkit
```

## Ejecución local

Liverpool (Akamai) bloquea **headless**; usa headed:

```bash
npm run test:headed
```

Solo Chromium:

```bash
npm run test:chromium
```

Headless (puede fallar por WAF):

```bash
npm test
```

Actualizar snapshots visuales (Chromium):

```bash
npm run test:update-snapshots
```

Parámetros:

```bash
cross-env HEADED=1 SEARCH_TERM="xbox series x" npm test
cross-env HEADED=1 MAX_LOAD_MS=60000 npm test
```

Reporte HTML:

```bash
npm run test:report
```

## CI (GitHub Actions)

Workflow: [`.github/workflows/test.yml`](.github/workflows/test.yml)

- Matrix **chromium / firefox / webkit** en paralelo (3 jobs)
- **Xvfb + `HEADED=1`** en cada job
- Artefactos: `playwright-report-<browser>`, diffs visuales en fallo

Repo: https://github.com/juanromero16079/liverpool-e2e-challenge

## Estructura

```
src/
  config/     testConfig.ts
  flows/      challengeSearchFlow.ts
  pages/      Page objects
  services/   Interceptor, parser, validator
tests/
  liverpool-search.spec.ts
  liverpool-bonus.spec.ts
  *-snapshots/   baselines visuales por browser
```

## Entrega

Enviar link del repo a **s_fuentesrj@hitss.com** (ver [`TEST_STRATEGY.md`](TEST_STRATEGY.md)).

# Test Strategy — Liverpool PLP Search

## 1. What would I not automate in this flow, and why?

- **Checkout, payment, and account-specific flows** (login, saved addresses, Mi crédito): high PII/fraud risk, heavy 3DS and inventory coupling, and poor ROI for a catalog search smoke test.
- **Marketing modals, store picker, and geo-dependent availability**: copy and defaults change often; asserting copy creates noise without protecting core search behavior.
- **Exact sponsored placement or carousel ordering** when not deterministic: ads and personalization shift results; I validate product identity and price alignment instead of absolute rank beyond the applied sort.

## 2. If Liverpool added a CAPTCHA to the search flow, how would I handle it?

- **Default:** mark the test `@requires-live` and **skip in CI** when a CAPTCHA challenge is detected, with a clear failure artifact (screenshot + URL).
- **Lower environments:** run against a **staging** build with CAPTCHA disabled or a test key, keeping the same page objects and interceptors.
- **Limited production checks:** optional manual/nightly job with **human-in-the-loop** (paused step) or approved vendor test mode—never store bypass secrets in the repo.
- **Shift left:** keep **API contract tests** on `/api/plp/search` with recorded fixtures so most regressions are caught without hitting CAPTCHA on every commit.

## 3. Flakiness risks and mitigations

| Risk | Mitigation |
|------|------------|
| Akamai bot detection | Use headed Chromium under **Xvfb** in CI; fail fast with a explicit message if blocked |
| Async PLP reloads after filter/sort | Wait on **`/api/plp/search`** responses, not fixed sleeps |
| Overlays (cookies, promos) | Centralized dismiss helper in `BasePage` |
| Price formatting (MXN, promos) | Shared parsers; compare numeric values with small tolerance |
| DOM refactors | Stable `data-testid` on cards/prices; page objects isolate selectors |

## 4. Adding this to a team CI pipeline with 50+ suites

- **Tag and shard:** `@liverpool-smoke` on a schedule (e.g. nightly) rather than every PR; keep a **5-minute API contract** job on PRs using fixtures.
- **Resource isolation:** dedicated worker pool, `workers: 1`, retries only on CI, artifact upload on failure.
- **Secrets & quotas:** no credentials in repo; cap parallel external hits to avoid rate limits.
- **Reporting:** publish HTML report as artifact; surface discrepancy logs in CI summary for quick triage.
- **Ownership:** document environment variables (`SEARCH_TERM`, `HEADED`, `MAX_LOAD_MS`) and on-call playbooks for third-party outages or WAF changes.

**Bonus:** visual baselines mask volatile PLP fields; axe excludes pagination inputs and attaches JSON; performance measures search→grid only; browsers run in parallel via CI matrix (not concurrent workers against production).

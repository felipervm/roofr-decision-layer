# Roofr / The Decision Layer

Independent research and analytical prototype by Felipe Mattos. **Not affiliated with Roofr.**

## Problem framing
Roofr already provides real-time Performance Dashboards (Job, Lead, Team, Lost Jobs) and CRM automations. The concept does not claim otherwise. It explores an adjacent hypothesis: an *exception-first quality review* could help roofing operators know which stale/incomplete records need attention before interpreting reports or automating action.

## What is actually implemented
- Executive editorial landing (`index.html`, `styles.css`, `app.js`).
- Reproducible **synthetic** dataset of 1,200 fictional roofing jobs; fixed seed 418, generated with Python standard library.
- Working lead-source filtering; derived open jobs, stale activity (10+ days), missing next-step, missing lost-job reason; pipeline distribution.
- Simple test suite verifying data consistency.
- Suggested 4-week pilot with measurement plan.

## Run
```sh
python scripts/analyze.py
python -m http.server 8000
# Open http://localhost:8000/
python -m pytest tests -q
```

## Assumptions & limitations
- Dataset and findings are constructed examples, **not** customer data, company KPIs or a discovered Roofr defect.
- Activity thresholds are illustrative and may vary by residential/commercial roofing, seasonality and sales cycle.
- `Lost without reason` percentage uses only lost jobs as the denominator. Open pipeline excludes Won/Lost. Rows are frozen to 2026-10-19.
- This model treats rows as simple single-entity opportunities; real lifecycle histories are more complex.
- Any pilot would first confirm product coverage and avoid duplicating existing Roofr capabilities.
- Proposal values are hypothetical pipeline amounts, **not** revenue-at-risk or recoverable revenue.

## Public sources (accessed October 2026)
- Roofr Performance Dashboards: https://roofr.com/performance-dashboard
- Roofr CRM: https://roofr.com/crm
- Roofr release notes: https://roofr.com/release-notes
- Roofr automated communication: https://roofr.com/products
- Roofr reporting deep dive: https://roofr.com/product-blog/understanding-your-roofing-business-with-roofrs-performance-dashboards
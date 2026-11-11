# Quality Strategy — Pet Clinic Hackathon
**Team:** London 2026 | **Date:** 2026-11-11 | **Version:** 1.1 (updated for missing-pet feature)

---

## Service Overview

A pet clinic web application with an Angular frontend and a Spring REST API. Clinic staff use it to manage owners, pets, vets, specialties and visits. The API is the source of truth; the UI consumes it.

---

## Risks That Matter

| Risk | Impact | Layer That Covers It |
|---|---|---|
| Owner or pet created with invalid/missing data accepted by the API | High | API testing + schema check |
| Visit booked against a non-existent owner or pet | High | API testing |
| UI form allows submission without required fields | High | Playwright UI tests |
| API returns a response that does not match the OpenAPI 3.1 contract | High | API schema validation |
| Pages fail accessibility standards (WCAG 2.1 AA) | High | axe-core + keyboard journey |
| Security headers missing or authentication bypassed | Medium | OWASP ZAP baseline |
| 401/403 not returned correctly when auth is enabled | Medium | API testing (auth scenarios) |
| Test data bleeds between test runs (dirty state) | Medium | Reset policy + seeded data |
| Flaky tests masking real failures | Medium | Flaky test rule (documented below) |
| **Missing-pet feature — added 2026-11-11** | | |
| Duplicate open missing report accepted (race condition between concurrent requests) | High | API testing (409 scenario) |
| Pet status not updated atomically when report is created or resolved | High | API testing (status check after POST/PUT) |
| Missing report filed for a pet that belongs to a different owner (IDOR) | High | API testing (ownership mismatch → 404) |
| Unauthenticated or under-privileged user creates or resolves a missing report | High | API testing (auth scenarios) + ZAP baseline |
| PII in `locationLastSeen` field exposed to users without the correct role | Medium | API testing (auth scenarios) |
| `dateSeen` accepted in the future, creating misleading records | Medium | API testing (validation scenario) |
| Missing report form in the UI does not meet WCAG 2.1 AA (labels, error states) | Medium | axe-core scan on report form page |
| Pet status becomes inconsistent if a missing report is deleted without updating `pet.status` | Medium | API testing (delete + status check) |

---

## Coverage by Layer

| Layer | What It Covers | Tool |
|---|---|---|
| UI | Register owner + pet journey end-to-end; report-pet-as-missing journey (pending feature) | Playwright |
| API | Owners, pets, visits — CRUD + schema + auth; missing-report CRUD + duplicate prevention + auth (pending feature) | REST assertions + OpenAPI spec |
| Accessibility | 3 pages including one error state; missing-report form (pending feature) | axe-core + manual keyboard journey |
| Security | Baseline headers, injection, known CVEs; IDOR check on missing-report ownership | OWASP ZAP baseline scan |

---

## What We Are Not Covering (and Why)

| Out of Scope | Reason |
|---|---|
| Performance / load testing | Outside the brief; no SLA defined |
| Full regression across all endpoints | Time constraint; risk-based selection covers critical paths |
| Active ZAP scanning | Ground rules prohibit it without facilitator approval |
| Cross-browser testing | Single browser sufficient for a one-day proof of process |
| Database-level testing | No direct DB access; API is the contract boundary |

---

## Test Standards

- **Semantic locators only** — no CSS selectors or XPaths tied to implementation
- **No fixed waits** — use Playwright's built-in auto-wait and explicit conditions
- **Test data separate from test logic** — all fixtures in a dedicated `/fixtures` or `/data` folder
- **Flaky test rule** — a test that fails without a code change is quarantined immediately, logged as a defect, and must not block the pipeline until root cause is confirmed

---

## Quality Gates Summary

| Gate | Trigger | Pass Condition |
|---|---|---|
| Playwright UI | Every commit | Register owner + pet journey passes |
| API + schema | Every commit | All assertions pass, response matches OpenAPI spec |
| axe-core | Every commit | Zero critical/serious violations on 3 target pages |
| ZAP baseline | Every commit | No high-severity alerts unreviewed |

All gates run via a single command. The pipeline fails if any gate fails.

---

## Out of Scope Decisions Sign-off

Agreed by the team at kick-off (09:30, 2026-11-11). Any change to scope must be agreed by the quality lead and recorded here.

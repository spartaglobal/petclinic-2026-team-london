# PetClinic — London Team 2026

A pet clinic application with a Spring Boot REST API and an Angular frontend.
Clinic staff manage owners, pets, vets, specialties and visits.

---

## Repositories at a glance

| Folder | What it is | Default port |
|---|---|---|
| `spring-petclinic-rest/` | Spring Boot 4 REST API | `9966` |
| `spring-petclinic-angular/` | Angular UI | `4200` |

---

## Running the app

**API**
```bash
cd spring-petclinic-rest
./mvnw spring-boot:run
# Swagger UI: http://localhost:9966/petclinic/swagger-ui.html
# Health:     http://localhost:9966/petclinic/actuator/health
```

**UI** (requires the API to be running)
```bash
cd spring-petclinic-angular
npm install
npm start
# App: http://localhost:4200
```

---

## Running the tests

**API unit + coverage (JaCoCo ≥ 85% line, ≥ 66% branch)**
```bash
cd spring-petclinic-rest
./mvnw verify
```

**API non-regression (Postman — requires app on port 9966)**
```bash
cd spring-petclinic-rest
./postman-tests.sh
```

**Playwright E2E + accessibility (requires both app and API running)**
```bash
cd spring-petclinic-angular
npx playwright test
```

---

## Quality gates

| Gate | Tool | Pass condition |
|---|---|---|
| API tests + coverage | JaCoCo / JUnit | ≥ 85% line, ≥ 66% branch; all tests green |
| API non-regression | Postman | All requests return expected status codes |
| E2E UI | Playwright | Register owner + pet journey passes |
| Accessibility | axe-core (in Playwright) | Zero critical/serious violations |
| Security baseline | OWASP ZAP | No high-severity alerts unreviewed |

---

## Key documents

| Document | Location |
|---|---|
| Quality strategy | `docs/test-standards.md` |
| API acceptance criteria | `spring-petclinic-rest/docs/acceptance-criteria.md` |
| Missing-pet API proposal | `spring-petclinic-rest/docs/missing-pet-api-agreement.md` |
| Agent governance rules | `spring-petclinic-rest/CLAUDE.md` |
| E2E test standards | `docs/test-standards.md` |

---

## Branches

| Branch | Purpose |
|---|---|
| `main` | Stable, judges see this at code freeze |
| `missing-pet-feature-docs` | Missing-pet requirement analysis and pending tests |
| `api-testing-agent-governance-skills` | Agent governance + skills setup |

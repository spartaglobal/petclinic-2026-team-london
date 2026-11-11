# Agent Governance — Spring PetClinic REST

## Project Overview

Spring Boot 4 REST API for the PetClinic application. Java, Maven, Spring Data JPA, MapStruct, OpenAPI 3.0 code generation. Runs on port `9966` with context path `/petclinic/`.

---

## Architecture Constraints

- **API-first**: All endpoint signatures are generated from `src/main/resources/openapi.yml`. Never edit generated files under `target/generated-sources/`; edit the spec instead.
- **Layered architecture**: Controller → Service (`ClinicService`) → Repository. Business logic lives in the service layer only.
- **DTOs via MapStruct**: Controllers work with DTOs (suffix `Dto`), never entities directly. Add new mappings in `src/main/java/.../mapper/`.
- **Two API versions**: v1 under `/api/`, v2 under `/api/v2/`. New endpoints default to v1 unless explicitly paginated or breaking.

---

## Running the App

```bash
./mvnw spring-boot:run
# Swagger UI: http://localhost:9966/petclinic/swagger-ui.html
# Health:     http://localhost:9966/petclinic/actuator/health
```

Default profile: `h2,spring-data-jpa` (in-memory DB, no setup needed).

---

## Testing Rules

- **Never skip coverage gates.** JaCoCo enforces ≥ 85% line coverage and ≥ 66% branch coverage — do not lower these thresholds.
- **Controller tests use MockMvc**, not real HTTP. See `OwnerRestControllerV1Tests` as the reference pattern.
- **Postman non-regression suite** must pass before any PR is merged: `./postman-tests.sh` (requires the app running on 9966).
- Do not write tests that require a live external database unless the test class extends `AbstractClinicServiceTests`.

---

## Security Model

- Basic Auth is optional (disabled by default via `basic.authentication.enabled=false`).
- Role-based access uses `@PreAuthorize`:
  - `OWNER_ADMIN` — Owners, Pets, Visits, PetTypes (read-only)
  - `VET_ADMIN` — PetTypes, Specialties, Vets
  - `ADMIN` — Users
- Never remove `@PreAuthorize` annotations without a security review.
- Passwords must be BCrypt-encoded. Never store plain-text credentials.

---

## Code Generation

- Regenerate API interfaces after editing `openapi.yml`: `./mvnw generate-sources`
- DTO class names follow the pattern `<Resource>Dto` (auto-applied via `@ModelNameSuffix("Dto")`).
- Do not manually create DTO classes for resources already in the spec.

---

## What Agents Must NOT Do

| Prohibited Action | Reason |
|---|---|
| Edit files under `target/` | Generated; overwritten on every build |
| Lower JaCoCo thresholds | Maintains quality gate |
| Add endpoints outside the OpenAPI spec | Breaks API-first contract |
| Commit plain-text secrets | Security policy |
| Drop or rename existing DB columns without a migration | Breaks all supported DB profiles |
| Use `@Autowired` field injection | Project standard is constructor injection |

---

## Pull Request Checklist

- [ ] `openapi.yml` updated if endpoints changed
- [ ] `./mvnw verify` passes (tests + coverage)
- [ ] Postman suite passes against local server
- [ ] No new `@SuppressWarnings` without a comment explaining why
- [ ] Security roles reviewed for any new endpoint

---

## Key File Locations

| Purpose | Path |
|---|---|
| OpenAPI spec | `src/main/resources/openapi.yml` |
| Controllers (v1) | `src/main/java/.../rest/controller/v1/` |
| Controllers (v2) | `src/main/java/.../rest/controller/v2/` |
| Service layer | `src/main/java/.../service/ClinicService.java` |
| Mappers | `src/main/java/.../mapper/` |
| Test suite | `src/test/java/.../` |
| Postman tests | `src/test/postman/` |
| JMeter tests | `src/test/jmeter/` |
| App config | `src/main/resources/application.properties` |

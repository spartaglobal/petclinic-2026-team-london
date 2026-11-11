---
name: api-test
description: Write black-box API tests in Postman for owners, pets and visits against the running Pet Clinic service, driven by the OpenAPI spec. Do not use for unit or UI tests.
argument-hint: "<owners, pets or visits endpoint to test>"
allowed-tools: Read, Grep, Glob, Edit(spring-petclinic-rest/src/test/postman/**), Write(spring-petclinic-rest/src/test/postman/**), Bash(npx -p newman -p newman-reporter-htmlextra newman run *), Bash(curl -s http://localhost:9966/petclinic/*)
---
## Purpose

Produce reviewable API tests that check behaviour and the OpenAPI contract.

## Inputs

- OpenAPI spec: http://localhost:9966/petclinic/v3/api-docs. Offline fallback: `spring-petclinic-rest/src/main/resources/openapi.yml` (paths there omit the `/api` prefix).
- Acceptance criteria for the journey under test. This will be located under `spring-petclinic-rest/docs/acceptance_criteria.md`. If it is not there, ask for it to be included.
- Target resource or endpoint (from the argument)

All paths below are relative to the project root (`petclinic-2026-team-london/`).

## Permitted tools and write scope

- Write only under `spring-petclinic-rest/src/test/postman/` (collections, environments, data files). Extend `petclinic-nonregressiontests.postman_collection.json` and reuse `petclinic-env.postman_environment.json` and its `{{baseUrl}}`. Never edit application source.
- curl: `curl -s` against `http://localhost:9966/petclinic/` only, for exploring and reproducing failures. The allowlist can't stop a second URL or extra flags after the match, so use one localhost URL, no `-L`, and ask the person before any request that changes data.
- The skill can't start or restart the API (`spring-boot:run` is not allowed): ask the person to do it.

## How to run the tests

Prerequisites: Node.js (`npx` fetches Newman), Java for the API, and `jq` only for the shell script.

1. Start the API in a separate terminal (long-running):
   - Linux/macOS: `spring-petclinic-rest/mvnw -f spring-petclinic-rest/pom.xml spring-boot:run`
   - Windows: `spring-petclinic-rest\mvnw.cmd -f spring-petclinic-rest\pom.xml spring-boot:run`
2. Check health: `curl -s http://localhost:9966/petclinic/actuator/health` should return `UP`.
3. Run Newman from the project root (Windows: use backslashes in the paths):
   ```
   npx -p newman -p newman-reporter-htmlextra newman run spring-petclinic-rest/src/test/postman/petclinic-nonregressiontests.postman_collection.json -e spring-petclinic-rest/src/test/postman/petclinic-env.postman_environment.json --reporters cli,htmlextra --reporter-htmlextra-export spring-petclinic-rest/src/test/postman/reports/report.html
   ```

   Alternative on Linux/macOS: `cd spring-petclinic-rest && zsh postman-tests.sh` (needs `jq`; uses paths relative to `spring-petclinic-rest/`).
4. Read the result in the terminal, or open `spring-petclinic-rest/src/test/postman/reports/report.html`.
5. Reset the data by restarting the API: it uses in-memory HSQLDB, so a restart restores the seed data.

Not verified yet: the health and `/v3/api-docs` URLs and the commands above have not been run against a live API.

## Workflow

1. Check the health URL above is UP. If not, stop and report.
2. Read the spec and criteria; list each operation with happy, validation (400), not-found (404) and, if security is on, 401/403 cases.
3. Write the tests: they create their own synthetic data, are independent of order and seeded IDs, keep data in separate files, use no fixed waits, validate response schemas against the spec (for example `pm.response.to.have.jsonSchema`), and cite the scenario they cover in their names.
4. Run with Newman (see above) against a freshly reset service.
5. Classify each failure (product / test / environment-data), say how it was confirmed (include the curl reproduction), and draft a defect. Never change the app to pass a test.
6. Present the output for human review. Do not commit until a person approves, and note the review in your summary

## Security cases

The default app runs with `petclinic.security.enable=false`, so 401/403 cases can't be reached. Run them only if the person restarts the API with `--petclinic.security.enable=true` and supplies credentials. The seeded `admin` user holds every role, so it can't show role denial; ask which lower-privilege user to use.

## Output format

Test files changed; results table (endpoint, case, pass/fail); traceability table (test to scenario); failure classifications.
Format the output including the following:
<example></example>
Table including endpoint tested, test case, pass/fail

Traceability Table tracing test to scenario.
{
  "failed tests": list of failing api tests,
  "summary": A short paragraph (max 200 words) summary of what was tested,
  "modifed": list of test files changed,
  "created": list of test files created
}

## Stop conditions

Service unhealthy, spec and behaviour disagree, unsure what to test, credentials needed, or two failed attempts to fix a test: stop and ask.

## Human review

A reviewer checks assertions are meaningful, data is synthetic, no source was changed, and failures are classified correctly.

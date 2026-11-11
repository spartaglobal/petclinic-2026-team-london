# Acceptance Criteria — Spring PetClinic REST API

Base URL: `http://localhost:9966/petclinic`

---

## 1. Owners

### GET /api/owners
- Returns 200 with a list of all owners (may be empty array).
- Each owner object includes: `id`, `firstName`, `lastName`, `address`, `city`, `telephone`, `pets`.
- Supports `lastName` query param: filters results to owners whose last name starts with the given value.

### POST /api/owners
- Returns 201 with the created owner on valid input.
- Returns 400 if any required field (`firstName`, `lastName`, `address`, `city`, `telephone`) is missing or blank.
- `telephone` must be numeric digits only; non-numeric values return 400.

### GET /api/owners/{id}
- Returns 200 with the owner when the ID exists.
- Returns 404 when the ID does not exist.

### PUT /api/owners/{id}
- Returns 200 with the updated owner on valid input.
- Returns 400 on validation failure.
- Returns 404 when the ID does not exist.

### DELETE /api/owners/{id}
- Returns 200 (or 204) on successful deletion.
- Returns 404 when the ID does not exist.

### GET /api/v2/owners (paginated)
- Returns 200 with a paginated response (`content`, `page`, `size`, `totalElements`).
- Supports `page` and `size` query params; defaults to page 0, size 20.

---

## 2. Pets

### GET /api/pets
- Returns 200 with the full list of pets.

### POST /api/owners/{ownerId}/pets
- Returns 201 with the created pet when owner exists and input is valid.
- Pet requires: `name`, `birthDate` (ISO date, not in the future), `type`.
- Returns 400 if `birthDate` is in the future.
- Returns 404 if `ownerId` does not exist.

### GET /api/pets/{petId}
- Returns 200 with pet details including owner and visit history.
- Returns 404 when `petId` does not exist.

### PUT /api/owners/{ownerId}/pets/{petId}
- Returns 200 on successful update.
- Returns 404 if owner or pet does not exist.
- Returns 400 on validation failure.

### DELETE /api/pets/{petId}
- Returns 200 (or 204) on deletion.
- Returns 404 when `petId` does not exist.

---

## 3. Visits

### GET /api/visits
- Returns 200 with all visits.

### POST /api/owners/{ownerId}/pets/{petId}/visits
- Returns 201 with the created visit on valid input.
- Visit requires: `visitDate` (ISO date), `description`.
- Returns 404 if owner or pet does not exist.
- Returns 400 if `description` is blank.

### GET /api/visits/{visitId}
- Returns 200 with visit details.
- Returns 404 when `visitId` does not exist.

### PUT /api/visits/{visitId}
- Returns 200 on successful update.
- Returns 404 when `visitId` does not exist.

### DELETE /api/visits/{visitId}
- Returns 200 (or 204) on deletion.
- Returns 404 when `visitId` does not exist.

---

## 4. Vets

### GET /api/vets
- Returns 200 with a list of all vets including their specialties.

### POST /api/vets
- Returns 201 on successful creation.
- Vet requires: `firstName`, `lastName`.
- Returns 400 on validation failure.

### GET /api/vets/{vetId}
- Returns 200 with vet details.
- Returns 404 when `vetId` does not exist.

### PUT /api/vets/{vetId}
- Returns 200 on successful update.
- Returns 404 when `vetId` does not exist.

### DELETE /api/vets/{vetId}
- Returns 200 (or 204) on deletion.
- Returns 404 when `vetId` does not exist.

---

## 5. Specialties

### GET /api/specialties
- Returns 200 with the full list of specialties.

### POST /api/specialties
- Returns 201 on successful creation.
- Requires: `name` (non-blank).
- Returns 400 if `name` is blank or missing.

### GET /api/specialties/{specialtyId}
- Returns 200 when found.
- Returns 404 when not found.

### PUT /api/specialties/{specialtyId}
- Returns 200 on successful update.
- Returns 404 when not found.

### DELETE /api/specialties/{specialtyId}
- Returns 200 (or 204) on deletion.
- Returns 404 when not found.

---

## 6. Pet Types

### GET /api/pettypes
- Returns 200 with all pet types.

### POST /api/pettypes
- Returns 201 on creation; requires `name`.
- Returns 400 if `name` is blank.

### GET /api/pettypes/{petTypeId}
- Returns 200 when found, 404 when not.

### PUT /api/pettypes/{petTypeId}
- Returns 200 on update, 404 when not found.

### DELETE /api/pettypes/{petTypeId}
- Returns 200 (or 204) on deletion, 404 when not found.

---

## 7. Users

### POST /api/users
- Returns 201 on successful user creation.
- Requires: `username`, `password`, `enabled`, and at least one `role`.
- Password must be stored BCrypt-encoded (never plain-text).
- Returns 400 on validation failure.
- Returns 409 if username already exists.

---

## 8. Cross-Cutting Criteria

### Authentication (when enabled)
- Requests without credentials return 401.
- Requests with valid credentials but insufficient role return 403.
- Role matrix:
  - `OWNER_ADMIN`: read/write Owners, Pets, Visits; read-only PetTypes
  - `VET_ADMIN`: read/write Vets, Specialties, PetTypes
  - `ADMIN`: create Users

### Error Responses
- All 4xx and 5xx responses return a JSON body with at least an `message` field.
- 500 errors must not leak stack traces or internal class names in the response body.

### Performance
- P95 response time for all GET endpoints: ≤ 200ms under 100 concurrent users.
- Throughput target for CRUD benchmark: ≥ 2000 ops/sec (see JMeter plan).

### Test Coverage
- Line coverage ≥ 85% enforced by JaCoCo.
- Branch coverage ≥ 66% enforced by JaCoCo.
- Postman non-regression suite (`src/test/postman/`) must pass on every CI run.

### API Contract
- Response bodies conform to the schemas defined in `src/main/resources/openapi.yml`.
- No endpoint may be removed or have its response schema narrowed without a version bump.

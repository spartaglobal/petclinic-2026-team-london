# API & Data Model Proposal — Missing Pet Feature
**Status:** DRAFT — awaiting team review
**Author:** claude-sonnet-4-6
**Date:** 2026-11-11

---

## Data Model Changes

### New table: `missing_reports`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | |
| `pet_id` | INT | FK → pets.id, NOT NULL | |
| `date_seen` | DATE | NOT NULL | Must not be in the future |
| `location_last_seen` | VARCHAR(255) | NOT NULL | Free text |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'OPEN' | Enum: `OPEN`, `RESOLVED` |
| `reported_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Set by the server, never from request body |
| `resolved_at` | TIMESTAMP | NULL | Set when status transitions to `RESOLVED` |

**Duplicate prevention:** enforced at the application layer — before any insert, the service checks for an existing row with `pet_id = ? AND status = 'OPEN'`. If one exists, return 409. This avoids a partial index that H2 (the default test profile) does not support.

### Change to existing table: `pets`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'ACTIVE' | **New column.** Enum: `ACTIVE`, `MISSING` |

**Migration note:** additive change only. All existing rows default to `ACTIVE`. No column is renamed or dropped — all existing DB profiles remain compatible.

---

## New OpenAPI Schemas (add to `openapi.yml` components/schemas)

```yaml
MissingReportFields:
  type: object
  required:
    - dateSeen
    - locationLastSeen
  properties:
    dateSeen:
      type: string
      format: date
      example: "2026-11-10"
    locationLastSeen:
      type: string
      maxLength: 255
      example: "Madison Park"

MissingReport:
  allOf:
    - $ref: '#/components/schemas/MissingReportFields'
    - type: object
      properties:
        id:
          type: integer
          format: int32
        petId:
          type: integer
          format: int32
        status:
          type: string
          enum: [OPEN, RESOLVED]
          example: OPEN
        reportedAt:
          type: string
          format: date-time
        resolvedAt:
          type: string
          format: date-time
          nullable: true
```

**Change to existing `Pet` schema** — add `status` field:
```yaml
status:
  type: string
  enum: [ACTIVE, MISSING]
  example: ACTIVE
```

---

## New Endpoints

All endpoints must be added to `openapi.yml` before implementation (API-first rule).

### POST /owners/{ownerId}/pets/{petId}/missing-reports
Report a pet as missing.

| | |
|---|---|
| **Role** | `OWNER_ADMIN` |
| **Request body** | `MissingReportFields` |
| **201** | `MissingReport` — created; pet status set to `MISSING` |
| **400** | Validation failure (missing field, future date) |
| **404** | Owner not found, pet not found, or pet does not belong to owner |
| **409** | An open missing report already exists for this pet |

### GET /owners/{ownerId}/pets/{petId}/missing-reports
List all missing reports for a pet (open and resolved).

| | |
|---|---|
| **Role** | `OWNER_ADMIN` |
| **200** | Array of `MissingReport` |
| **404** | Owner or pet not found |

### GET /missing-reports
List missing reports across the clinic.

| | |
|---|---|
| **Role** | `OWNER_ADMIN` |
| **Query param** | `status` (optional, default `OPEN`) |
| **200** | Array of `MissingReport` |

### PUT /missing-reports/{reportId}
Resolve (or update) a missing report.

| | |
|---|---|
| **Role** | `OWNER_ADMIN` |
| **Request body** | `{ "status": "RESOLVED" }` |
| **200** | Updated `MissingReport`; if resolved, pet status set to `ACTIVE` |
| **404** | Report not found |

### DELETE /missing-reports/{reportId}
Delete a report (admin cleanup).

| | |
|---|---|
| **Role** | `OWNER_ADMIN` |
| **200/204** | Deleted |
| **404** | Report not found |

---

## Service Layer Rules

1. Before inserting a new report, query for any existing row with `pet_id = ? AND status = 'OPEN'`. If found, throw a conflict exception → 409.
2. On successful insert, update `pet.status = 'MISSING'` in the same transaction.
3. When a report is resolved, set `resolvedAt = now()`. If no other `OPEN` report exists for the same pet, also set `pet.status = 'ACTIVE'`.
4. `reportedAt` and `resolvedAt` are always server-set; reject them if present in the request body.
5. Ownership check: if `pet.ownerId != ownerId` from the path, return 404 (not 403) to avoid leaking pet IDs.

---

## Out of Scope

- Notifications (email, push)
- Public search / filter of missing pets
- Performance/load testing of new endpoints
- Cross-browser testing of the new UI form

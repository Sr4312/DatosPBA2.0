---
name: api-design
description: REST API design principles covering naming, HTTP semantics, error handling, and versioning
---

# API Design Skill

A well-designed API is predictable, consistent, and hard to misuse. Follow these conventions to make APIs that developers enjoy using.

## URL Structure

- Use **nouns**, not verbs: `/users`, not `/getUsers`
- Use **plural** for collections: `/users`, `/orders`
- Use **lowercase** with hyphens: `/user-profiles`, not `/userProfiles`
- Nest resources when there's a clear ownership: `/users/{id}/posts`
- Don't nest more than 2 levels deep — use flat routes with query params instead

```
GET    /users           → list users
GET    /users/{id}      → get one user
POST   /users           → create user
PUT    /users/{id}      → replace user (full update)
PATCH  /users/{id}      → partial update
DELETE /users/{id}      → delete user
```

## HTTP Status Codes

| Code | When to use |
|---|---|
| 200 | Success with body |
| 201 | Resource created (POST) |
| 204 | Success, no body (DELETE) |
| 400 | Bad request — client error, invalid input |
| 401 | Unauthenticated — no valid credentials |
| 403 | Unauthorized — authenticated but no permission |
| 404 | Resource not found |
| 409 | Conflict — e.g. duplicate email |
| 422 | Validation error — input understood but invalid |
| 429 | Rate limit exceeded |
| 500 | Server error — never expose internal details |

## Error Response Format

Always return errors in a consistent structure:
```json
{
  "error": "validation_failed",
  "message": "Email is required",
  "details": [
    { "field": "email", "message": "This field is required" }
  ]
}
```

## Pagination

For list endpoints, always paginate:
```
GET /posts?page=2&limit=20
GET /posts?cursor=eyJpZCI6MTAwfQ&limit=20
```

Response should include pagination metadata:
```json
{
  "data": [...],
  "pagination": { "total": 150, "page": 2, "limit": 20, "hasMore": true }
}
```

## Versioning

Version in the URL path: `/v1/users`, `/v2/users`

- Never break existing clients without a new version
- Deprecate old versions with a header: `Deprecation: true`
- Document breaking changes explicitly

## Rules

- Never expose internal IDs that reveal implementation (use UUIDs or slugs)
- Always validate and sanitize input at the boundary
- Never return sensitive data (passwords, tokens, PII) in responses
- Use consistent date format: ISO 8601 (`2024-04-06T12:00:00Z`)
- Return empty arrays `[]` instead of `null` for collections
- Filter, sort, and search via query params: `?sort=created_at&order=desc&status=active`

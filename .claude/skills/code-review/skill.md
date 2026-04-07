---
name: code-review
description: Structured code review checklist covering correctness, security, performance, and readability
---

# Code Review Skill

Review code thoroughly and systematically. Lead with the most critical issues. Don't nitpick style unless it affects clarity.

## Review Order

1. **Correctness** — does it do what it's supposed to do?
2. **Security** — does it introduce vulnerabilities?
3. **Performance** — any obvious bottlenecks or unnecessary work?
4. **Readability** — can a future developer understand this quickly?
5. **Tests** — are edge cases covered?

## Correctness Checklist

- [ ] Logic matches the stated requirements
- [ ] Edge cases handled: empty inputs, nulls, 0, negative numbers, large values
- [ ] Error paths handled and surfaced correctly
- [ ] Async operations properly awaited / error-caught
- [ ] No off-by-one errors in loops or slices
- [ ] State mutations are intentional (no accidental shared state)

## Security Checklist

- [ ] No user input used directly in SQL, shell commands, HTML, or file paths
- [ ] Secrets not hardcoded or logged
- [ ] Auth/permissions checked before sensitive operations
- [ ] No insecure direct object references (IDOR)
- [ ] Dependencies not known-vulnerable

## Performance Checklist

- [ ] No N+1 queries (database calls inside loops)
- [ ] No unnecessary re-computation in hot paths
- [ ] No unbounded data fetching (pagination where needed)
- [ ] Memory allocations are reasonable

## Readability Checklist

- [ ] Names explain intent (not `data`, `temp`, `stuff`)
- [ ] Functions do one thing
- [ ] No dead code or commented-out blocks
- [ ] Complex logic has an inline comment explaining *why*, not *what*

## Output Format

Group findings by severity:

**Critical** — must fix before merge (bugs, security issues)
**Major** — should fix (performance, incorrect behavior in edge cases)
**Minor** — consider fixing (readability, naming)
**Nit** — optional (style, formatting)

Lead with the most impactful issues. Skip nits unless everything else is clean.

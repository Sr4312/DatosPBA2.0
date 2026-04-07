---
name: refactoring
description: Safe, incremental refactoring approach to improve code quality without changing behavior
---

# Refactoring Skill

Refactoring means changing the structure of code without changing its behavior. The goal is to make the code easier to understand and modify.

## Golden Rule

**Never refactor and add features at the same time.** Do them in separate commits. Mixing both makes bugs harder to trace.

## When to Refactor

- Before adding a feature to a complex area (make room, then add)
- When a function exceeds ~40 lines
- When you find yourself copy-pasting code a third time
- When a name no longer reflects what something does
- After a bug fix, to prevent recurrence

## Process

1. **Have tests first** — refactoring without tests is gambling. If tests don't exist, write them before touching the code.
2. **Make one change at a time** — rename, then extract, then simplify. Not all at once.
3. **Run tests after each change** — catch breakage immediately, not after 10 changes.
4. **Commit working states** — small commits make it easy to revert a bad step.

## Common Refactoring Patterns

**Extract function** — when a block of code can be named:
```js
// Before
if (user.age >= 18 && user.country === 'AR' && !user.banned) { ... }

// After
if (isEligible(user)) { ... }
function isEligible(user) { return user.age >= 18 && user.country === 'AR' && !user.banned }
```

**Rename for clarity** — when the name lies or says nothing:
```js
// Before: d, data, temp, flag, val
// After: expirationDate, userRecord, isAuthenticated
```

**Remove duplication** — when the same logic appears 3+ times, extract it:
```js
// Before: same validation in 4 endpoints
// After: validatePayload(schema, body) used in all 4
```

**Flatten nesting** — use early returns to reduce indentation:
```js
// Before
if (user) {
  if (user.active) {
    if (user.role === 'admin') { doThing() }
  }
}

// After
if (!user || !user.active || user.role !== 'admin') return
doThing()
```

**Split large file** — when a file has multiple unrelated responsibilities:
- One file = one clear responsibility
- Extract to separate modules, keep interfaces stable

## What NOT to Do

- Don't refactor code you're not touching for the current task
- Don't abstract code that's only used once (YAGNI)
- Don't rename everything because you prefer different conventions — pick your battles
- Don't break public APIs without a migration path

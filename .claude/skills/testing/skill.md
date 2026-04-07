---
name: testing
description: Testing strategy covering unit, integration, and end-to-end tests with TDD workflow
---

# Testing Skill

Write tests that catch real bugs, not tests that pass trivially. Test behavior, not implementation.

## Test Pyramid

```
        [E2E]          ← few, slow, high confidence
      [Integration]    ← some, medium speed
    [Unit Tests]       ← many, fast, isolated
```

- **Unit**: single function or component, no external dependencies
- **Integration**: multiple units working together, may use real DB or APIs
- **E2E**: full user flow through the real system

## What to Test

Test **behavior from the outside**, not internals:
- Given these inputs → expect this output
- Given this state → expect this side effect
- Given this error condition → expect this error handling

Do NOT test:
- Implementation details (private methods, internal state)
- Framework behavior (don't test that React renders)
- Things you don't control (third-party libraries)

## TDD Workflow (when applicable)

1. Write a failing test that describes the desired behavior
2. Write the minimum code to make it pass
3. Refactor — clean up without breaking the test
4. Repeat

## Test Structure (AAA Pattern)

```js
it('returns null when user is not found', () => {
  // Arrange
  const db = mockDb({ users: [] })

  // Act
  const result = getUserById(db, 'nonexistent-id')

  // Assert
  expect(result).toBeNull()
})
```

## Edge Cases to Always Cover

- Empty input / empty array / empty string
- `null` and `undefined`
- Boundary values (0, -1, max int)
- Async errors and rejected promises
- Concurrent operations (if applicable)

## Rules

- Test names describe behavior: `"returns empty array when no results found"` not `"test 1"`
- One assertion per test where possible — easier to diagnose failures
- Don't use real external services in unit tests — mock at the boundary
- Integration tests should use real DB (seeded), not mocks
- A test that never fails is useless — verify it fails before you fix the code

## Coverage

Aim for coverage that matters:
- 100% coverage of critical paths and business logic
- Don't chase 100% total coverage — it leads to trivial tests
- Untested edge cases > uncovered lines

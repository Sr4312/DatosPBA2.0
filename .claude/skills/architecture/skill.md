---
name: architecture
description: System design and software architecture decision-making framework
---

# Architecture Skill

Good architecture makes systems easy to change, test, and understand. Avoid over-engineering — the right architecture is the simplest one that meets your actual requirements.

## Core Principles

**Separation of concerns** — each module does one thing:
- Don't mix database access, business logic, and HTTP handling in the same function
- Layer your code: routes → controllers → services → repositories → database

**Dependency direction** — dependencies point inward:
```
UI → Application Logic → Domain Logic → (no dependencies)
         ↑
  Infrastructure (DB, HTTP, cache, queues)
```
Business logic should not import from your web framework or database library.

**Design for change** — the part most likely to change should be the easiest to swap:
- Abstract third-party services behind interfaces
- Keep business rules in pure functions, not tied to frameworks
- Avoid leaking implementation details across boundaries

## Decision Framework

Before making architectural decisions, answer:

1. **What is the actual scale requirement?** (Users? Requests/sec? Data volume?)
2. **What changes frequently?** (This should be the most modular part)
3. **What are the consistency requirements?** (Can data be eventually consistent?)
4. **What's the team size?** (Microservices require operational maturity)
5. **What's the failure mode?** (What happens when X goes down?)

## Common Patterns

**Monolith first** — start with a well-structured monolith, split only when you have evidence of need:
- Single deployment, simpler debugging, easier refactoring
- Split into services when different parts need different scale or teams

**Repository pattern** — abstract data access behind an interface:
```js
// Service doesn't know if data comes from SQL, Redis, or an API
class UserService {
  constructor(userRepository) { this.users = userRepository }
  async getUser(id) { return this.users.findById(id) }
}
```

**Event-driven decoupling** — when two systems shouldn't know about each other:
- Use a message queue (Redis Streams, RabbitMQ, Kafka) between them
- Trade-off: eventual consistency, harder debugging

**CQRS** — separate read and write models when read patterns are very different from write patterns:
- Only use when you actually have this problem — adds significant complexity

## Module Boundaries

A good module boundary means:
- You can understand what it does without reading its internals
- You can change its internals without breaking its consumers
- It has a minimal, explicit interface

Signs of bad boundaries:
- Circular dependencies between modules
- One module reaches into another's internals
- A change in one place breaks something seemingly unrelated

## Rules

- YAGNI — don't design for requirements you don't have yet
- The best architecture is the one your team can actually maintain
- Complexity has a cost — justify it with a concrete benefit
- Defer architectural decisions as long as possible — you'll have more information later
- Read [Architecture Decision Records (ADRs)](https://adr.github.io) to document why, not just what

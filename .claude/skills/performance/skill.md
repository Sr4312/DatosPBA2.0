---
name: performance
description: Performance optimization workflow — profile first, then fix the actual bottleneck
---

# Performance Skill

**Never optimize without measuring first.** Intuition about bottlenecks is usually wrong. Profile, identify, fix, measure again.

## Workflow

1. **Establish a baseline** — measure current performance with real data
2. **Profile** — find where time/memory is actually spent
3. **Identify the bottleneck** — the one thing causing the most impact
4. **Fix it** — make the targeted change
5. **Measure again** — confirm improvement, check for regressions

## Profiling Tools

| Environment | Tool |
|---|---|
| Browser JS | Chrome DevTools → Performance tab |
| Node.js | `--prof` flag, `clinic.js`, `0x` |
| Database | `EXPLAIN ANALYZE` (PostgreSQL), `EXPLAIN` (MySQL) |
| React | React DevTools Profiler |
| Python | `cProfile`, `py-spy` |
| General | Benchmark with realistic data, not toy examples |

## Common Bottlenecks & Fixes

**N+1 queries** — fetching related data inside a loop:
```js
// Bad: 1 query + N queries
const posts = await db.posts.findAll()
for (const post of posts) {
  post.author = await db.users.findById(post.userId) // N queries
}

// Good: 2 queries total
const posts = await db.posts.findAll({ include: ['author'] })
```

**Missing database indexes** — check slow queries first:
```sql
-- Find slow queries in PostgreSQL
SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC;

-- Add index on frequently filtered column
CREATE INDEX idx_users_email ON users(email);
```

**Unnecessary re-renders (React)**:
- Use `useMemo` / `useCallback` only where profiling shows re-renders are expensive
- Don't memoize everything — the overhead isn't always worth it
- Move state down to components that actually need it

**Blocking the main thread**:
- Move heavy computation to Web Workers or background jobs
- Paginate or virtualize long lists (react-virtual, TanStack Virtual)
- Use `requestIdleCallback` for non-critical work

**Unoptimized assets**:
- Compress images (WebP, AVIF), use `srcset` for responsive images
- Code-split large JS bundles with dynamic `import()`
- Enable HTTP/2 and gzip/brotli compression on the server

## Rules

- Don't add caching until you've confirmed the query/computation is actually slow
- Caching adds complexity and bugs — it's a last resort, not a first step
- Premature optimization is the root of much wasted time
- A 10% improvement on a fast path matters less than a 10x improvement on a slow path
- Always test with production-scale data, not toy fixtures

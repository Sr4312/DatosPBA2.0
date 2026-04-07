---
name: debugging
description: Systematic debugging workflow for diagnosing and fixing bugs efficiently
---

# Debugging Skill

A disciplined, step-by-step approach to finding and fixing bugs. Avoid random changes — diagnose first, fix second.

## Process

1. **Reproduce the bug** — confirm you can trigger it consistently. If you can't reproduce it, you can't fix it.
2. **Read the error** — read the full error message and stack trace before doing anything else. The answer is often already there.
3. **Isolate the scope** — narrow down: which file, function, or line is responsible? Use logs, breakpoints, or `console.log` to confirm assumptions.
4. **Form a hypothesis** — state what you think is wrong before changing anything. "I think X is null because Y."
5. **Test one thing at a time** — make the smallest possible change to validate your hypothesis. Don't shotgun fixes.
6. **Confirm the fix** — after fixing, re-run the failing case AND related cases to confirm no regression.
7. **Understand why** — before closing, understand *why* the bug occurred. This prevents recurrence.

## Rules

- Never retry the same failing action without understanding why it failed.
- Never add random logging or random changes hoping something works.
- If you're stuck after 3 hypotheses, step back and question your assumptions about the system.
- Check: inputs, state, async timing, type mismatches, and side effects — in that order.

## Common Categories

| Bug type | First thing to check |
|---|---|
| `undefined` / `null` errors | Where is the value set? Is it async? |
| Wrong output | Trace from input → transform → output |
| Intermittent bug | Race condition, shared mutable state, or timing |
| Works locally, fails in prod | Environment variables, build differences, missing data |
| Performance | Profile first — don't guess where the bottleneck is |

## Output

When done, explain:
1. What was the bug
2. Why it happened
3. What the fix does

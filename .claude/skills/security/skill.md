---
name: security
description: Security checklist and best practices covering OWASP Top 10, input validation, auth, and secrets management
---

# Security Skill

Security vulnerabilities are almost always preventable with consistent habits. Apply these by default — not as an afterthought.

## Input Validation (Injection Attacks)

Never trust user input. Validate and sanitize at every system boundary.

**SQL Injection** — use parameterized queries, never string interpolation:
```js
// BAD
db.query(`SELECT * FROM users WHERE email = '${email}'`)

// GOOD
db.query('SELECT * FROM users WHERE email = $1', [email])
```

**XSS (Cross-Site Scripting)** — never inject raw user content into HTML:
```js
// BAD: innerHTML with user data
element.innerHTML = userComment

// GOOD: use textContent or escape HTML
element.textContent = userComment
```

**Command Injection** — never pass user input to shell commands:
```js
// BAD
exec(`convert ${userFilename} output.pdf`)

// GOOD: validate filename against allowlist, use argument arrays
execFile('convert', [sanitizedFilename, 'output.pdf'])
```

**Path Traversal** — validate file paths don't escape the intended directory:
```js
const safePath = path.resolve(BASE_DIR, userInput)
if (!safePath.startsWith(BASE_DIR)) throw new Error('Invalid path')
```

## Authentication & Authorization

- Hash passwords with `bcrypt` or `argon2` — never MD5, SHA1, or plain text
- Use short-lived JWT tokens + refresh token rotation
- Always check **authorization** (can this user do this?) not just authentication (is this user logged in?)
- Implement rate limiting on login, password reset, and 2FA endpoints
- Use HTTPS everywhere — never send credentials over HTTP

## Secrets Management

- Never hardcode API keys, passwords, or tokens in code
- Never commit `.env` files — add to `.gitignore`
- Use environment variables or a secrets manager (AWS Secrets Manager, Vault, Doppler)
- Rotate secrets after any suspected exposure

## OWASP Top 10 Checklist

- [ ] Injection (SQL, command, LDAP) — parameterized queries
- [ ] Broken authentication — rate limiting, secure session management
- [ ] Sensitive data exposure — encrypt at rest and in transit, don't log PII
- [ ] XXE — disable XML external entity processing
- [ ] Broken access control — check permissions server-side, not client-side
- [ ] Security misconfiguration — remove debug endpoints, default credentials
- [ ] XSS — escape output, use CSP headers
- [ ] Insecure deserialization — validate and sanitize deserialized data
- [ ] Vulnerable dependencies — run `npm audit` / `pip-audit` regularly
- [ ] Insufficient logging — log auth events, errors, and access to sensitive data

## HTTP Security Headers

```
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: no-referrer-when-downgrade
```

## Rules

- Security checks happen **server-side** — client-side validation is UX, not security
- Principle of least privilege — grant only the permissions actually needed
- When in doubt, deny by default
- Log security events (failed logins, permission denials) — but never log passwords or tokens

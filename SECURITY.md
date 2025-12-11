# Security Policy

## Overview

Security is a top priority for the Sistema de Avaliação Psicológica. This document outlines our security practices, guidelines, and how to report vulnerabilities.

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Practices

### 1. Authentication & Authorization

#### JWT Protection
- **Secure Token Generation**: Using Jose library (not vulnerable jsonwebtoken)
- **Token Expiry**: Tokens expire after 24 hours by default
- **HttpOnly Cookies**: Prevents XSS access to tokens
- **SameSite=Strict**: Prevents CSRF attacks
- **Secure Flag**: In production, cookies only sent over HTTPS

```typescript
// Example secure cookie configuration
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: '/',
};
```

#### Session Management
- Sessions validated on every request via middleware
- No session data stored client-side
- Automatic logout on token expiration
- Session revocation on logout

### 2. CORS Configuration

Proper CORS setup prevents unauthorized cross-origin requests:

```typescript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CORS_ORIGIN?.split(',') 
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
```

**Best Practices:**
- Never use `origin: '*'` in production
- Whitelist only trusted domains
- Enable credentials only when necessary

### 3. Rate Limiting

Protect against brute force and DoS attacks:

**Recommended Configuration:**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
```

**API-Specific Limits:**
- Login attempts: 5 per 15 minutes per IP
- Link generation: 20 per hour per psychologist
- Assessment submission: 1 per link (enforced at business logic level)

### 4. Input Validation

All inputs are validated using Zod schemas to prevent injection attacks:

```typescript
// Example validation
const createPatientInput = z.object({
  name: z.string().min(1).max(255),
  age: z.number().min(0).max(150).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(20).optional(),
  notes: z.string().max(5000).optional(),
});
```

**Validation Rules:**
- ✅ All user inputs validated before processing
- ✅ Type checking with TypeScript
- ✅ Length limits on all string fields
- ✅ Email format validation
- ✅ Sanitization of HTML content

### 5. SQL Injection Prevention

We use Drizzle ORM which provides:
- Parameterized queries (prepared statements)
- Type-safe query building
- No raw SQL execution

```typescript
// Safe query example
const patient = await db
  .select()
  .from(patients)
  .where(eq(patients.id, patientId))
  .limit(1);
```

**Never Do:**
```typescript
// ❌ UNSAFE - Never use string interpolation
db.execute(`SELECT * FROM patients WHERE id = ${patientId}`);
```

### 6. XSS Protection

- **React's Built-in Sanitization**: React escapes all content by default
- **DOMPurify**: For user-generated HTML content
- **Content Security Policy**: Configured in headers

```typescript
// CSP Header example
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  );
  next();
});
```

### 7. Secure Token Generation

Assessment links use cryptographically secure tokens:

```typescript
import { nanoid } from 'nanoid';

// Generates 32-character URL-safe token
// ~5.0 x 10^57 possible combinations
const token = nanoid(32);
```

**Security Features:**
- Unpredictable (cryptographically random)
- URL-safe characters only
- Collision detection with retry logic
- Database uniqueness validation

### 8. Access Control

Every protected operation validates ownership:

```typescript
// Example: Verify psychologist owns patient
const patient = await getPatientById(patientId);
if (patient.psychologistId !== ctx.user.id) {
  throw new Error('Access denied');
}
```

**Access Rules:**
- Psychologists can only access their own patients
- Assessment links validated for ownership before operations
- No direct patient-to-patient access
- Admin roles not yet implemented (single-tenant design)

### 9. Audit Logging

All sensitive operations are logged:

```typescript
// Logged Events
- Link access (IP, timestamp, user agent)
- Assessment completion
- Link generation
- Email sending
- Failed login attempts
```

**Audit Fields:**
- `lastAccessedAt`: Timestamp of last access
- `accessCount`: Number of times accessed
- `ipAddress`: Client IP address
- `emailSentAt`: When invitation was sent

### 10. Secrets Management

**Environment Variables:**
```bash
# ✅ GOOD - Use environment variables
SESSION_SECRET=<stored-in-env>
JWT_SECRET=<stored-in-env>

# ❌ BAD - Never hardcode secrets
SESSION_SECRET='my-secret-key'
```

**Best Practices:**
- Never commit `.env` files
- Use `.env.example` as template
- Rotate secrets every 90 days
- Use strong secrets (min 32 characters)
- Different secrets for each environment

### 11. Dependency Security

**Automated Scanning:**
- GitHub Dependabot enabled
- Weekly dependency updates
- Automatic security patches
- CodeQL static analysis

**Manual Checks:**
```bash
# Check for vulnerabilities
pnpm audit

# Check for high/critical only
pnpm audit --audit-level=high

# Fix vulnerabilities automatically
pnpm audit fix
```

### 12. HTTPS Enforcement

In production, always use HTTPS:

```typescript
// Redirect HTTP to HTTPS
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

## Security Checklist for Deployment

- [ ] All environment variables configured
- [ ] Strong secrets generated (min 32 characters)
- [ ] HTTPS/SSL certificate configured
- [ ] CORS properly restricted
- [ ] Rate limiting enabled
- [ ] Database credentials secured
- [ ] Backup system configured
- [ ] Monitoring/alerting set up (Sentry)
- [ ] Logs configured and rotated
- [ ] Security headers configured
- [ ] CSP policy defined
- [ ] Dependencies up to date
- [ ] No known vulnerabilities (run `pnpm audit`)

## Common Vulnerabilities and Mitigations

### SQL Injection
**Risk**: High  
**Mitigation**: Use Drizzle ORM with parameterized queries. Never use string interpolation for SQL.

### XSS (Cross-Site Scripting)
**Risk**: Medium  
**Mitigation**: React's automatic escaping, DOMPurify for HTML, CSP headers.

### CSRF (Cross-Site Request Forgery)
**Risk**: Medium  
**Mitigation**: SameSite=Strict cookies, CORS configuration, origin validation.

### Authentication Bypass
**Risk**: High  
**Mitigation**: Middleware validation on all protected routes, session validation.

### Information Disclosure
**Risk**: Medium  
**Mitigation**: No sensitive data in error messages, proper 404 handling, no stack traces in production.

### DoS (Denial of Service)
**Risk**: Medium  
**Mitigation**: Rate limiting, input size limits, timeout configurations.

### Dependency Vulnerabilities
**Risk**: Varies  
**Mitigation**: Dependabot, regular updates, npm audit, CodeQL scanning.

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow responsible disclosure:

### How to Report

1. **Do NOT** create a public GitHub issue
2. **Email** security concerns to: security@your-domain.com (or create a private security advisory)
3. **Include** in your report:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
   - Your contact information

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Assessment**: Within 5 business days
- **Fix Timeline**: Critical issues within 7 days, others within 30 days
- **Credit**: Security researchers credited in release notes (if desired)

### Scope

**In Scope:**
- Authentication/Authorization bypass
- SQL Injection
- XSS (Cross-Site Scripting)
- CSRF (Cross-Site Request Forgery)
- Remote Code Execution
- Data exposure
- Privilege escalation

**Out of Scope:**
- Social engineering attacks
- Physical attacks
- DoS without demonstrated impact
- Issues in third-party services
- Already known issues (check existing issues first)

## Security Contact

For security-related questions or concerns:
- **Email**: security@your-domain.com
- **GitHub**: Open a private security advisory
- **Response Time**: 48 hours or less

## Security Updates

Subscribe to security updates:
- Watch this repository for security advisories
- Check CHANGELOG.md for security fixes
- Follow @CarlosHonorato70 on GitHub

## Acknowledgments

We thank the following security researchers for responsible disclosure:
- (List will be updated as reports are received)

---

**Last Updated**: December 11, 2024  
**Version**: 1.0.0

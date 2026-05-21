# CORS_AND_ORIGIN_POLICY.md
## CORS Rules — What Origins Can Talk to the API
### BerntoutGlobal XXL / The Musician's Index

---

## ALLOWED ORIGINS — PRODUCTION

```env
ALLOWED_ORIGINS=https://themusiciansindex.com,https://www.themusiciansindex.com,https://app.themusiciansindex.com
```

---

## ALLOWED ORIGINS — PREVIEW/STAGING

```env
ALLOWED_ORIGINS=https://preview-*.pages.dev,https://themusiciansindex.com
```

---

## ALLOWED ORIGINS — LOCAL DEV

```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

---

## CORS CONFIGURATION (NestJS)

```typescript
// apps/api/src/main.ts
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

app.enableCors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(o => {
      if (o.includes('*')) {
        const pattern = new RegExp(o.replace('*', '.*'));
        return pattern.test(origin);
      }
      return o === origin;
    })) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed`));
    }
  },
  credentials: true,  // Required for cookies/session
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
});
```

---

## COOKIE RULES (Cross-Origin Auth)

Session cookies must work across subdomains:
```typescript
// Session cookie settings
{
  domain: '.themusiciansindex.com',  // Leading dot = all subdomains
  secure: true,                      // HTTPS only
  httpOnly: true,                    // Not accessible via JS
  sameSite: 'lax',                   // Prevent CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}
```

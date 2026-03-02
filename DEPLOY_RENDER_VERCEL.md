# Deploy Guide (Render + Vercel)

## 1) Backend on Render (Free)

Create a **Web Service** from this repo with:

- `Root Directory`: `sistema-cobranza`
- `Environment`: `Docker`
- `Plan`: `Free`
- `Health Check Path`: `/api/health`

`render.yaml` is already configured for this.

### Required Render Environment Variables

Add these in Render -> Service -> Environment:

- `DB_URL`
- `DB_USER`
- `DB_PASS`
- `JWT_SECRET`
- `CORS_ALLOWED_ORIGIN_PATTERNS`

Recommended extras:

- `JPA_DDL_AUTO=update` (first deploy), then change to `validate`
- `JWT_EXPIRATION_MS=86400000`
- `CONTACT_TO=osmdigitalweb@gmail.com`
- `JPA_SHOW_SQL=false`
- `MULTIPART_MAX_FILE_SIZE=10MB`
- `MULTIPART_MAX_REQUEST_SIZE=20MB`
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS` (if email is enabled)

### DB_URL format example (MySQL)

```text
jdbc:mysql://HOST:PORT/railway?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
```

## 2) Frontend on Vercel

This project already points production to:

- `frontend/src/environments/environment.prod.ts`
- `apiUrl: 'https://alpaycobranza.onrender.com/api'`

If your backend URL changes, update this file before deploy.

Vercel settings:

- Framework: `Angular`
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist/frontend/browser`

## 3) Final checks

1. Open backend URL: `https://alpaycobranza.onrender.com/api/health`
2. Must return HTTP `200` and JSON `{ "status": "ok" }`
3. Open frontend domain and login
4. Verify `/api/clientes`, `/api/cuentas`, `/api/pagos` requests succeed

## 4) If deploy fails

- `Healthcheck failed`: verify path is `/api/health`
- `JDBCConnectionException`: `DB_URL/DB_USER/DB_PASS` are incorrect
- `403 from frontend`: add frontend domain to `CORS_ALLOWED_ORIGIN_PATTERNS`
- `404 on API`: wrong `environment.prod.ts` backend URL
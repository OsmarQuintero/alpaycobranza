# Deploy Guide (Render + Vercel)

## 1) Backend (Render)

- Service root: `sistema-cobranza`
- Build command: `./mvnw clean package -DskipTests`
- Start command: `java -jar target/sistema-cobranza-0.0.1-SNAPSHOT.jar`
- Blueprint file: `render.yaml` (already added)

Set these env vars in Render:

- `DB_URL`
- `DB_USER`
- `DB_PASS`
- `JWT_SECRET`
- `JWT_EXPIRATION_MS`
- `CONTACT_TO`
- `CORS_ALLOWED_ORIGIN_PATTERNS` (example: `https://tu-frontend.vercel.app`)
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USER`
- `MAIL_PASS`
- `MULTIPART_MAX_FILE_SIZE`
- `MULTIPART_MAX_REQUEST_SIZE`

Notes:

- `application.properties` is already configured to read env vars.
- `server.port` is mapped from `PORT` automatically.

## 2) Frontend (Vercel)

Before deploy, edit:

- `frontend/src/environments/environment.prod.ts`

Set:

- `apiUrl: 'https://TU_BACKEND_PUBLICO/api'`

Vercel project settings:

- Framework: Angular
- Build command: `npm run build`
- Output directory: `dist/frontend/browser`

`frontend/vercel.json` was added to support SPA route rewrites.

## 3) After deploy checks

- Login works from frontend domain
- `GET /api/clientes` works
- Client creation with INE/selfie works
- Route navigation opens Google Maps by address

## 4) Security

Do not commit real secrets in `application.properties`.
Use only hosting env vars.

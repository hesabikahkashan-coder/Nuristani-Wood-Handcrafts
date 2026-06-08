# NWH Server Environment Parameters

This document specifies the names of the environment variables used to secure other cloud pipelines and configure database modules.

## Required Variables

### 1. Administrative Security (Zero-Trust Console)
These credentials must be provided. No default fallback credentials exist in the source code in order to prevent security breaches.
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## Optional Variables (High Security Extensions)

### 2. Live Intel Database (PostgreSQL Connection)
If defined, the server launches the cloud database driver automatically. If undefined, the server executes clean local serialization to `db.json`.
- `DATABASE_URL` (or detailed separate parameters below)
- `PGHOST`
- `PGUSER`
- `PGPASSWORD`
- `PGDATABASE`
- `PGPORT`

### 3. AI Assistant Concierge (Gemini Generative Engine)
Used to drive real-time custom quote counseling and design consultation chats.
- `GEMINI_API_KEY`

### 4. Hosting Mode Environment
- `NODE_ENV` (Set to `production` in live environments)
- `PORT` (Binds internally to `3000`)

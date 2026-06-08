# NWH Production Deployment Guide

This guide details the steps to launch the production-ready Vite + Express single-page application (SPA) with server-side API endpoints, dynamic SEO, and real URL routing.

## 1. Hosting Architecture Overview
- **Frontend**: Single Page Application (SPA) compiled into the `/dist` directory via Vite.
- **Backend**: Express web server (`server.ts`) compiled into a unified Node CJS package (`dist/server.cjs`) via `esbuild`.
- **Database**: Dual Mode — automatically boots the high-performance PostgreSQL client if server secrets are provided, otherwise falls back to a clean, transactional local query ledger (`db.json`).

## 2. Server Requirements
- Node.js version 18 or higher.
- Ingress configured to listen exclusively on **Port 3000** (or proxied via Nginx).

## 3. Deployment Flow

### Step A: Install Dependencies & Build
Install clean, production-scoped node dependencies, build the static client assets via Vite,- bundle the backend TypeScript engine into a unified CommonJS file via `esbuild`:
```bash
npm install
npm run build
```

### Step B: Database Setup (Optional/Preferred)
Provide a standard PostgreSQL database and connect via the standard `DATABASE_URL` or detailed credentials environment parameters. If missing, the server will boot safely with local file persistence, but Postgres secures durability.

### Step C: Boot Application
Set your `NODE_ENV` parameter to `production` and execute the startup script.
```bash
NODE_ENV=production npm start
```

## 4. Reverse Proxy Configurations (Nginx / Cloud Run)
If utilizing custom domains or virtual hosting layers, configure reverse routing rules to pass HTTP traffic securely to internal listening port `3000`:

```nginx
server {
    listen 80;
    server_name nwh-heritage.com www.nwh-heritage.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

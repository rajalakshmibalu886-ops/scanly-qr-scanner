# Scanly QR Scanner

Scanly is a single Node.js web service: Express serves the frontend and exposes an API, while SQLite stores scan history.

## Files

- `public/index.html` — Scanly frontend
- `server.js` — Express server and `/api/scans` API
- `package.json` — Node.js dependencies and start command
- `data/` — SQLite database is created here automatically when running locally

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm start
```

Open http://localhost:3000. Test the backend at http://localhost:3000/api/health.

## Upload to GitHub

1. Open your `scanly-qr-scanner` repository.
2. Choose **Add file → Upload files**.
3. Extract this ZIP on your computer first.
4. Upload the contents inside the `scanly-qr-scanner` folder (including `public` and its `index.html`, `server.js`, `package.json`, and `README.md`). Do not upload the ZIP itself.
5. Click **Commit changes**.

## Deploy on Render

1. Sign in at https://render.com/ and connect your GitHub account.
2. Choose **New + → Web Service** and select `scanly-qr-scanner`.
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `npm start`.
5. Choose a Node runtime if asked, then deploy.
6. Open the HTTPS URL Render provides. Camera access requires HTTPS (or localhost).

## Important: SQLite persistence on free hosting

The app uses a local SQLite file at `data/scanly.sqlite` by default. On many free hosting plans, local files are ephemeral and may be erased during redeploys or restarts. The service can demonstrate frontend/backend/SQLite connectivity, but **do not rely on scan history surviving redeploys on a free instance**. Persistent disks may require a paid plan. If durable free cloud storage is essential, the backend must be adapted to a hosted SQLite-compatible database such as Turso and configured with its URL/token in the hosting dashboard.

## API

- `GET /api/health` — health check
- `GET /api/scans` — newest 100 scans
- `POST /api/scans` — JSON body: `{ "content": "decoded QR content" }`
- `DELETE /api/scans` — clear scan history

Do not commit database credentials or secret tokens to GitHub.

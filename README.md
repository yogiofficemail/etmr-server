# ETMR Server (Express + MongoDB)

## Environment variables

| Key | Required | Notes |
| --- | --- | --- |
| `MONGODB_URI` | yes | Atlas SRV connection string |
| `MONGODB_DATABASE` | yes | e.g. `etmr` |
| `CLIENT_ORIGIN` | no | Comma-separated allowed origins, `*` by default |
| `PORT` | no | Render sets this automatically |

## Local

```bash
npm install
cp .env.example .env   # fill in MONGODB_URI
npm run seed           # loads dropdown options
npm run dev
```

## Deploy to Render

1. Push this folder to GitHub.
2. New > Web Service > pick the repo.
3. Build: `npm install` — Start: `npm start` — Health check path: `/api/health`.
4. Add env vars `MONGODB_URI` and `MONGODB_DATABASE`.
5. In MongoDB Atlas > Network Access, allow `0.0.0.0/0` (Render has no fixed IP).
6. Run `npm run seed` once locally (against the same Atlas URI) to populate options.

## Endpoints

- `GET /api/health`
- `GET /api/options?type=shipper&q=sola&limit=50`
- `GET /api/options/all`
- `GET /api/bookings`
- `GET /api/bookings/counts`
- `GET /api/bookings/next-no`
- `POST /api/bookings`

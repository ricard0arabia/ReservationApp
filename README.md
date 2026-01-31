# Reservation Portal

This repo contains a Nuxt 3 SSR frontend and an Express API for managing amenity reservations with PayMongo payments.

## Structure
- `frontend/`: Nuxt 3 app
- `backend/`: Express API
- `docs/`: architecture, data model, API, and frontend plans

## Environment
Set the following environment variables for the backend:
- `MONGODB_URI`
- `MONGODB_DB`
- `PAYMONGO_SECRET_KEY`
- `PAYMONGO_WEBHOOK_SECRET`
- `APP_BASE_URL`
- `API_BASE_URL`

## Local development
```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

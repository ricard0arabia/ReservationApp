# API Design

## Public
- `GET /api/amenities`
- `GET /api/availability?amenityId=&date=`
- `GET /api/rules`

## Auth
- `GET /api/auth/google/start`
- `GET /api/auth/google/callback`
- `POST /api/auth/phone/request-otp`
- `POST /api/auth/phone/verify-otp`
- `POST /api/auth/logout`
- `GET /api/me`

## Client Reservations
- `POST /api/reservations`
  - validates segments, booking windows, and slot locks
- `GET /api/reservations/my-active`
- `GET /api/reservations/:id`
- `POST /api/reservations/:id/cancel`

## Payments
- `POST /api/payments/:reservationId/create-checkout`
- `POST /api/webhooks/paymongo` (raw-body signature verification)

## Admin
- `GET /api/admin/reservations?status=PENDING_APPROVAL`
- `POST /api/admin/reservations/:id/approve`
- `POST /api/admin/reservations/:id/deny`
- CRUD `POST /api/admin/amenities`
- `POST /api/admin/blackout-dates`
- `GET /api/admin/audit-logs`

# Nuxt 3 Component Plan

## Public Pages
- `/`: landing, summary of amenities, CTA to availability
- `/amenities`: list cards, each linking to detail
- `/amenities/:id`: availability calendar + slot picker (read-only for guests)
- `/rules`: booking windows and policies
- `/privacy`, `/terms`: legal pages

## Auth
- `/login`: Google OAuth + phone OTP options
- `/verify-otp`: OTP entry, rate limit info

## Client
- `/reserve/:amenityId`: slot picker + confirmation
- `/my-booking`: single active booking status + cancellation CTA
- `/checkout-return`: “Waiting for confirmation…” polling

## Admin
- `/admin`: dashboard
- `/admin/approvals`: approve/deny queue
- `/admin/calendar`: availability and blocked hours
- `/admin/amenities`: CRUD amenities and pricing
- `/admin/blackouts`: manage blackout dates
- `/admin/audit-logs`: activity trail

## Shared Components
- `AmenityCard`, `AvailabilityCalendar`, `SlotPicker`
- `RulesPanel`, `PricingSummary`, `PaymentStatusBadge`
- `AdminApprovalTable`, `AuditLogList`

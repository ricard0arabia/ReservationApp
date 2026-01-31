# MongoDB Data Model

## users
- `_id`
- `displayName`
- `email` (nullable)
- `phone` (nullable)
- `authProviders: [{ type: "google"|"phone", providerUserId }]`
- `role: "client"|"admin"|"superadmin"`
- `createdAt`, `updatedAt`

## amenities
- `_id`
- `name`, `description`
- `operatingHours` and `segments` (daytime 9–17, evening 18–22)
- `minDurationHours = 1`
- `approvalThresholdHours = 3`
- `maxAdvanceDays = 7`
- `active`
- `pricingRules`

## reservations
- `_id`
- `userId`, `amenityId`
- `date` (YYYY-MM-DD)
- `startAt`, `endAt`
- `startHour`, `endHour`
- `durationHours`
- `segment`
- `status`
- `needsApproval`
- `holdExpiresAt`, `approvalExpiresAt`
- `approvedBy`, `approvedAt`, `deniedBy`, `deniedAt`, `denialReason`
- `amountBreakdown`
- `paymongo: { checkoutSessionId, paymentId, lastEventId }`
- `createdAt`, `updatedAt`

## slots
- `_id`
- `amenityId`
- `date`
- `hourStart`
- `lockedByReservationId`
- `lockStatus`
- `expiresAt`

## payments
- `_id`
- `reservationId`
- `provider = "paymongo"`
- `checkoutSessionId`, `paymentId`
- `status = created|pending|paid|failed|expired|refunded`
- `amount`, `currency`
- `createdAt`, `updatedAt`

## audit_logs
- `_id`
- `actorUserId`
- `action`
- `entityType`, `entityId`
- `beforeSummary`, `afterSummary`
- `createdAt`

## Indexes
- `slots` unique compound index on `(amenityId, date, hourStart)`
- `slots` index on `expiresAt`
- `reservations` index on `userId`, `status`
- `payments` index on `checkoutSessionId`, `paymentId`

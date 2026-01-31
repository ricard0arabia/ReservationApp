export type UserRole = "client" | "admin" | "superadmin";

export interface User {
  _id: string;
  displayName: string;
  email?: string | null;
  phone?: string | null;
  authProviders: { type: "google" | "phone"; providerUserId: string }[];
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Amenity {
  _id: string;
  name: string;
  description: string;
  operatingHours: {
    startHour: number;
    endHour: number;
    maintenanceStartHour: number;
    maintenanceEndHour: number;
  };
  minDurationHours: number;
  approvalThresholdHours: number;
  maxAdvanceDays: number;
  active: boolean;
  pricingRules: {
    baseHourly: number;
    eveningHourly?: number;
    wholeDay?: number;
  };
}

export type ReservationStatus =
  | "HELD"
  | "PENDING_PAYMENT"
  | "PENDING_APPROVAL"
  | "APPROVED_AWAITING_PAYMENT"
  | "CONFIRMED"
  | "DENIED"
  | "EXPIRED"
  | "CANCELLED"
  | "COMPLETED";

export interface Reservation {
  _id: string;
  userId: string;
  amenityId: string;
  date: string;
  startAt: string;
  endAt: string;
  startHour: number;
  endHour: number;
  durationHours: number;
  segment: "daytime" | "evening" | "whole-day";
  status: ReservationStatus;
  needsApproval: boolean;
  holdExpiresAt?: string | null;
  approvalExpiresAt?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  deniedBy?: string | null;
  deniedAt?: string | null;
  denialReason?: string | null;
  amountBreakdown: {
    base: number;
    fees: number;
    total: number;
  };
  paymongo?: {
    checkoutSessionId?: string;
    paymentId?: string;
    lastEventId?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Slot {
  _id?: string;
  amenityId: string;
  date: string;
  hourStart: number;
  lockedByReservationId?: string | null;
  lockStatus?: ReservationStatus;
  expiresAt?: string | null;
}

export interface Payment {
  _id?: string;
  reservationId: string;
  provider: "paymongo";
  checkoutSessionId?: string;
  paymentId?: string;
  status: "created" | "pending" | "paid" | "failed" | "expired" | "refunded";
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  _id?: string;
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeSummary?: Record<string, unknown> | null;
  afterSummary?: Record<string, unknown> | null;
  createdAt: string;
}

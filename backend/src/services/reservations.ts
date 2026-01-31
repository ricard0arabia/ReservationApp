import { ObjectId, type Db } from "mongodb";
import { config } from "../config.js";
import { getClient } from "../db.js";
import { diffHours, formatDate, nowManila, parseIso, toIso, toManilaDate } from "../utils/time.js";
import type { Amenity, Reservation, ReservationStatus } from "../models/types.js";

const ACTIVE_STATUSES: ReservationStatus[] = [
  "HELD",
  "PENDING_PAYMENT",
  "PENDING_APPROVAL",
  "APPROVED_AWAITING_PAYMENT",
  "CONFIRMED"
];

export interface ReservationInput {
  amenityId: string;
  date: string;
  startHour: number;
  endHour: number;
  userId: string;
}

export const getAmenity = async (db: Db, amenityId: string): Promise<Amenity | null> => {
  return db.collection<Amenity>("amenities").findOne({ _id: amenityId, active: true });
};

export const ensureOneActiveBooking = async (db: Db, userId: string) => {
  const existing = await db
    .collection<Reservation>("reservations")
    .findOne({ userId, status: { $in: ACTIVE_STATUSES } });
  if (existing) {
    throw new Error("You already have an active reservation.");
  }
};

const validateHours = (amenity: Amenity, startHour: number, endHour: number) => {
  if (startHour >= endHour) {
    throw new Error("End hour must be after start hour.");
  }
  const { startHour: openHour, endHour: closeHour, maintenanceStartHour, maintenanceEndHour } =
    amenity.operatingHours;
  if (startHour < openHour || endHour > closeHour) {
    throw new Error("Selected hours are outside operating hours.");
  }
  if (startHour < maintenanceEndHour && endHour > maintenanceStartHour) {
    throw new Error("Reservations cannot cross the 5 PM–6 PM maintenance gap.");
  }
};

const resolveSegment = (startHour: number, endHour: number) => {
  if (startHour === 9 && endHour === 22) {
    return "whole-day" as const;
  }
  if (startHour >= 9 && endHour <= 17) {
    return "daytime" as const;
  }
  if (startHour >= 18 && endHour <= 22) {
    return "evening" as const;
  }
  throw new Error("Reservations must stay within a single segment.");
};

const validateBookingWindow = (segment: "daytime" | "evening" | "whole-day", startAt: string) => {
  const now = nowManila();
  const start = parseIso(startAt);
  const startDate = start.startOf("day");
  const today = now.startOf("day");
  const diffDays = Math.round(startDate.diff(today, "days").days);

  if (diffDays < 0 || diffDays > 7) {
    throw new Error("Reservations must be within 7 days of the start date.");
  }

  if (segment === "daytime" || segment === "whole-day") {
    if (diffDays < 1) {
      throw new Error("Daytime reservations must be booked at least 1 day ahead.");
    }
    return;
  }

  if (segment === "evening" && diffDays === 0) {
    const minStart = now.plus({ hours: 3 });
    if (start < minStart) {
      throw new Error("Same-day evening reservations require a 3-hour lead time.");
    }
  }
};

const calculatePricing = (amenity: Amenity, durationHours: number, segment: string) => {
  if (segment === "whole-day" && amenity.pricingRules.wholeDay) {
    return { base: amenity.pricingRules.wholeDay, fees: 0, total: amenity.pricingRules.wholeDay };
  }
  const rate = segment === "evening" && amenity.pricingRules.eveningHourly
    ? amenity.pricingRules.eveningHourly
    : amenity.pricingRules.baseHourly;
  const base = rate * durationHours;
  return { base, fees: 0, total: base };
};

export const createReservation = async (db: Db, input: ReservationInput) => {
  const amenity = await getAmenity(db, input.amenityId);
  if (!amenity) {
    throw new Error("Amenity not found.");
  }

  validateHours(amenity, input.startHour, input.endHour);

  const segment = resolveSegment(input.startHour, input.endHour);
  const startAt = toManilaDate(input.date, input.startHour);
  const endAt = toManilaDate(input.date, input.endHour);
  const durationHours = diffHours(startAt, endAt);

  if (durationHours < amenity.minDurationHours) {
    throw new Error("Reservation duration is below the minimum.");
  }

  validateBookingWindow(segment, toIso(startAt));
  await ensureOneActiveBooking(db, input.userId);

  const needsApproval = durationHours >= amenity.approvalThresholdHours || segment === "whole-day";
  const status: ReservationStatus = needsApproval ? "PENDING_APPROVAL" : "HELD";

  const now = nowManila();
  const holdExpiresAt = needsApproval ? null : now.plus({ minutes: config.holdMinutes });
  const approvalExpiresAt = needsApproval ? now.plus({ hours: config.approvalSlaHours }) : null;

  const reservationId = new ObjectId().toHexString();
  const hours = Array.from({ length: durationHours }, (_, idx) => input.startHour + idx);

  const session = getClient().startSession();
  try {
    let reservation: Reservation;
    await session.withTransaction(async () => {
      const conflict = await db.collection("slots").findOne(
        {
          amenityId: input.amenityId,
          date: input.date,
          hourStart: { $in: hours },
          lockStatus: { $in: ACTIVE_STATUSES }
        },
        { session }
      );
      if (conflict) {
        throw new Error("Selected hours are already reserved.");
      }

      const amountBreakdown = calculatePricing(amenity, durationHours, segment);

      reservation = {
        _id: reservationId,
        userId: input.userId,
        amenityId: input.amenityId,
        date: formatDate(startAt),
        startAt: toIso(startAt),
        endAt: toIso(endAt),
        startHour: input.startHour,
        endHour: input.endHour,
        durationHours,
        segment,
        status,
        needsApproval,
        holdExpiresAt: holdExpiresAt ? toIso(holdExpiresAt) : null,
        approvalExpiresAt: approvalExpiresAt ? toIso(approvalExpiresAt) : null,
        amountBreakdown,
        createdAt: toIso(now),
        updatedAt: toIso(now)
      };

      await db.collection("reservations").insertOne(reservation, { session });

      const slotDocs = hours.map((hourStart) => ({
        amenityId: input.amenityId,
        date: formatDate(startAt),
        hourStart,
        lockedByReservationId: reservationId,
        lockStatus: status,
        expiresAt: holdExpiresAt ? toIso(holdExpiresAt) : null
      }));

      for (const slot of slotDocs) {
        await db.collection("slots").updateOne(
          { amenityId: slot.amenityId, date: slot.date, hourStart: slot.hourStart },
          { $set: slot },
          { upsert: true, session }
        );
      }
    });

    return reservation!;
  } finally {
    await session.endSession();
  }
};

export const listAvailability = async (db: Db, amenityId: string, date: string) => {
  const slots = await db
    .collection("slots")
    .find({ amenityId, date, lockStatus: { $in: ACTIVE_STATUSES } })
    .toArray();
  return slots;
};

export const updateReservationStatus = async (
  db: Db,
  reservationId: string,
  status: ReservationStatus,
  updates: Partial<Reservation> = {}
) => {
  const now = toIso(nowManila());
  await db.collection<Reservation>("reservations").updateOne(
    { _id: reservationId },
    { $set: { status, updatedAt: now, ...updates } }
  );
  await db.collection("slots").updateMany(
    { lockedByReservationId: reservationId },
    { $set: { lockStatus: status } }
  );
};

export const releaseSlots = async (db: Db, reservationId: string) => {
  await db.collection("slots").deleteMany({ lockedByReservationId: reservationId });
};

export const expireHeldReservations = async (db: Db) => {
  const now = toIso(nowManila());
  const expiring = await db
    .collection<Reservation>("reservations")
    .find({ status: { $in: ["HELD", "PENDING_PAYMENT"] }, holdExpiresAt: { $lte: now } })
    .toArray();
  for (const reservation of expiring) {
    await updateReservationStatus(db, reservation._id, "EXPIRED");
    await releaseSlots(db, reservation._id);
  }
};

export const completePastReservations = async (db: Db) => {
  const now = toIso(nowManila());
  await db
    .collection<Reservation>("reservations")
    .updateMany({ status: "CONFIRMED", endAt: { $lte: now } }, { $set: { status: "COMPLETED" } });
};

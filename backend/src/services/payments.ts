import crypto from "crypto";
import type { Db } from "mongodb";
import { config } from "../config.js";
import { nowManila, toIso } from "../utils/time.js";
import type { Payment, Reservation } from "../models/types.js";
import { releaseSlots, updateReservationStatus } from "./reservations.js";

const PAYMONGO_API = "https://api.paymongo.com/v1/checkout_sessions";

export const createCheckoutSession = async (db: Db, reservation: Reservation, userId: string) => {
  const now = nowManila();
  const holdExpiresAt = now.plus({ minutes: config.holdMinutes });

  await updateReservationStatus(db, reservation._id, "PENDING_PAYMENT", {
    holdExpiresAt: toIso(holdExpiresAt)
  });

  const response = await fetch(PAYMONGO_API, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(config.paymongoSecretKey + ":").toString("base64")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      data: {
        attributes: {
          send_email_receipt: true,
          line_items: [
            {
              name: "Amenity reservation",
              amount: reservation.amountBreakdown.total * 100,
              currency: "PHP",
              quantity: 1
            }
          ],
          payment_method_types: ["gcash", "card", "paymaya"],
          success_url: `${config.appBaseUrl}/checkout-return?reservationId=${reservation._id}`,
          cancel_url: `${config.appBaseUrl}/my-booking`,
          metadata: {
            reservationId: reservation._id,
            userId
          }
        }
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayMongo error: ${error}`);
  }

  const payload = await response.json();
  const sessionId = payload.data.id as string;
  const checkoutUrl = payload.data.attributes.checkout_url as string;

  const payment: Payment = {
    reservationId: reservation._id,
    provider: "paymongo",
    checkoutSessionId: sessionId,
    status: "pending",
    amount: reservation.amountBreakdown.total,
    currency: "PHP",
    createdAt: toIso(now),
    updatedAt: toIso(now)
  };

  await db.collection<Payment>("payments").insertOne(payment);
  await db.collection<Reservation>("reservations").updateOne(
    { _id: reservation._id },
    { $set: { "paymongo.checkoutSessionId": sessionId } }
  );

  return { checkoutUrl };
};

export const verifyWebhookSignature = (payload: Buffer, signatureHeader: string | undefined) => {
  if (!signatureHeader || !config.paymongoWebhookSecret) {
    return false;
  }
  const parts = signatureHeader.split(",").reduce<Record<string, string>>((acc, part) => {
    const [key, value] = part.split("=");
    acc[key.trim()] = value;
    return acc;
  }, {});

  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload.toString("utf8")}`;
  const expected = crypto
    .createHmac("sha256", config.paymongoWebhookSecret)
    .update(signedPayload)
    .digest("hex");

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
};

export const handlePaymongoWebhook = async (db: Db, payload: any) => {
  const eventId = payload?.data?.id as string | undefined;
  const eventType = payload?.data?.attributes?.type as string | undefined;
  if (!eventId || !eventType) {
    throw new Error("Invalid webhook payload");
  }

  const checkoutSessionId = payload?.data?.attributes?.data?.id as string | undefined;
  const paymentId = payload?.data?.attributes?.data?.attributes?.payments?.[0]?.id as string | undefined;
  if (!checkoutSessionId) {
    throw new Error("Missing checkout session id");
  }

  const reservation = await db.collection<Reservation>("reservations").findOne({
    "paymongo.checkoutSessionId": checkoutSessionId
  });
  if (!reservation) {
    throw new Error("Reservation not found for checkout session");
  }

  if (reservation.paymongo?.lastEventId === eventId) {
    return { ok: true };
  }

  if (eventType === "payment.paid") {
    await updateReservationStatus(db, reservation._id, "CONFIRMED", {
      "paymongo.paymentId": paymentId,
      "paymongo.lastEventId": eventId
    });
    await db.collection<Payment>("payments").updateOne(
      { checkoutSessionId },
      { $set: { status: "paid", paymentId, updatedAt: toIso(nowManila()) } }
    );
  } else if (eventType === "payment.failed") {
    await updateReservationStatus(db, reservation._id, "EXPIRED", {
      "paymongo.lastEventId": eventId
    });
    await db.collection<Payment>("payments").updateOne(
      { checkoutSessionId },
      { $set: { status: "failed", updatedAt: toIso(nowManila()) } }
    );
    await releaseSlots(db, reservation._id);
  }

  return { ok: true };
};

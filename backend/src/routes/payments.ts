import type { Express, Request, Response } from "express";
import { connectDb } from "../db.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { createCheckoutSession, handlePaymongoWebhook, verifyWebhookSignature } from "../services/payments.js";
import type { Reservation } from "../models/types.js";

export const registerPaymentRoutes = (app: Express) => {
  app.post("/api/payments/:reservationId/create-checkout", requireAuth, async (req: AuthedRequest, res) => {
    try {
      const db = await connectDb();
      const reservation = await db
        .collection<Reservation>("reservations")
        .findOne({ _id: req.params.reservationId, userId: req.user!.id });
      if (!reservation) {
        res.status(404).json({ error: "Reservation not found" });
        return;
      }
      if (reservation.status === "PENDING_APPROVAL") {
        res.status(409).json({ error: "Reservation awaits admin approval" });
        return;
      }
      if (reservation.status !== "HELD" && reservation.status !== "APPROVED_AWAITING_PAYMENT") {
        res.status(409).json({ error: "Reservation not eligible for payment" });
        return;
      }

      const result = await createCheckoutSession(db, reservation, req.user!.id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
};

export const handleWebhook = async (req: Request, res: Response) => {
  const signature = req.header("paymongo-signature") || req.header("Paymongo-Signature");
  const payload = req.body as Buffer;
  if (!verifyWebhookSignature(payload, signature ?? undefined)) {
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  try {
    const db = await connectDb();
    const parsed = JSON.parse(payload.toString("utf8"));
    const result = await handlePaymongoWebhook(db, parsed);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

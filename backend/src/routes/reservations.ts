import type { Express } from "express";
import { connectDb } from "../db.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { createReservation, updateReservationStatus, releaseSlots } from "../services/reservations.js";
import type { Reservation } from "../models/types.js";

export const registerReservationRoutes = (app: Express) => {
  app.post("/api/reservations", requireAuth, async (req: AuthedRequest, res) => {
    try {
      const { amenityId, date, startHour, endHour } = req.body as {
        amenityId: string;
        date: string;
        startHour: number;
        endHour: number;
      };
      const db = await connectDb();
      const reservation = await createReservation(db, {
        amenityId,
        date,
        startHour,
        endHour,
        userId: req.user!.id
      });
      res.status(201).json({ reservation });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/reservations/my-active", requireAuth, async (req: AuthedRequest, res) => {
    const db = await connectDb();
    const reservation = await db
      .collection<Reservation>("reservations")
      .findOne({ userId: req.user!.id, status: { $in: [
        "HELD",
        "PENDING_PAYMENT",
        "PENDING_APPROVAL",
        "APPROVED_AWAITING_PAYMENT",
        "CONFIRMED"
      ] } });
    res.json({ reservation });
  });

  app.get("/api/reservations/:id", requireAuth, async (req: AuthedRequest, res) => {
    const db = await connectDb();
    const reservation = await db
      .collection<Reservation>("reservations")
      .findOne({ _id: req.params.id, userId: req.user!.id });
    if (!reservation) {
      res.status(404).json({ error: "Reservation not found" });
      return;
    }
    res.json({ reservation });
  });

  app.post("/api/reservations/:id/cancel", requireAuth, async (req: AuthedRequest, res) => {
    const db = await connectDb();
    const reservation = await db
      .collection<Reservation>("reservations")
      .findOne({ _id: req.params.id, userId: req.user!.id });
    if (!reservation) {
      res.status(404).json({ error: "Reservation not found" });
      return;
    }
    if (reservation.status === "CONFIRMED" || reservation.status === "PENDING_APPROVAL") {
      await updateReservationStatus(db, reservation._id, "CANCELLED");
      await releaseSlots(db, reservation._id);
      res.json({ ok: true });
      return;
    }
    res.status(409).json({ error: "Reservation cannot be cancelled" });
  });
};

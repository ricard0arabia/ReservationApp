import type { Express } from "express";
import { connectDb } from "../db.js";
import { requireAdmin, requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { releaseSlots, updateReservationStatus } from "../services/reservations.js";
import type { Reservation } from "../models/types.js";

export const registerAdminRoutes = (app: Express) => {
  app.get("/api/admin/reservations", requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
    const status = String(req.query.status ?? "");
    const db = await connectDb();
    const filter = status ? { status } : {};
    const reservations = await db.collection("reservations").find(filter).toArray();
    res.json({ items: reservations });
  });

  app.post("/api/admin/reservations/:id/approve", requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
    const db = await connectDb();
    const reservation = await db.collection<Reservation>("reservations").findOne({ _id: req.params.id });
    if (!reservation) {
      res.status(404).json({ error: "Reservation not found" });
      return;
    }
    if (reservation.status !== "PENDING_APPROVAL") {
      res.status(409).json({ error: "Reservation not pending approval" });
      return;
    }
    await updateReservationStatus(db, reservation._id, "APPROVED_AWAITING_PAYMENT", {
      approvedBy: req.user!.id,
      approvedAt: new Date().toISOString()
    });
    res.json({ ok: true });
  });

  app.post("/api/admin/reservations/:id/deny", requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
    const db = await connectDb();
    const reservation = await db.collection<Reservation>("reservations").findOne({ _id: req.params.id });
    if (!reservation) {
      res.status(404).json({ error: "Reservation not found" });
      return;
    }
    await updateReservationStatus(db, reservation._id, "DENIED", {
      deniedBy: req.user!.id,
      deniedAt: new Date().toISOString(),
      denialReason: req.body?.reason ?? ""
    });
    await releaseSlots(db, reservation._id);
    res.json({ ok: true });
  });

  app.get("/api/admin/amenities", requireAuth, requireAdmin, async (_req: AuthedRequest, res) => {
    const db = await connectDb();
    const amenities = await db.collection("amenities").find().toArray();
    res.json({ items: amenities });
  });

  app.post("/api/admin/amenities", requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
    const db = await connectDb();
    const amenity = req.body;
    if (!amenity._id) {
      res.status(400).json({ error: "Amenity _id is required" });
      return;
    }
    await db.collection("amenities").updateOne({ _id: amenity._id }, { $set: amenity }, { upsert: true });
    res.status(201).json({ ok: true });
  });

  app.post("/api/admin/blackout-dates", requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
    const db = await connectDb();
    const { amenityId, date, reason } = req.body as { amenityId: string; date: string; reason?: string };
    await db.collection("blackout_dates").insertOne({ amenityId, date, reason, createdAt: new Date() });
    res.json({ ok: true });
  });

  app.get("/api/admin/audit-logs", requireAuth, requireAdmin, async (_req: AuthedRequest, res) => {
    const db = await connectDb();
    const logs = await db.collection("audit_logs").find().sort({ createdAt: -1 }).limit(200).toArray();
    res.json({ items: logs });
  });
};

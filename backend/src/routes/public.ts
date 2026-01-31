import type { Express } from "express";
import { connectDb } from "../db.js";
import { listAvailability } from "../services/reservations.js";
import { config } from "../config.js";

export const registerPublicRoutes = (app: Express) => {
  app.get("/api/amenities", async (_req, res) => {
    const db = await connectDb();
    const amenities = await db.collection("amenities").find({ active: true }).toArray();
    res.json({ items: amenities });
  });

  app.get("/api/availability", async (req, res) => {
    const { amenityId, date } = req.query;
    if (!amenityId || !date) {
      res.status(400).json({ error: "amenityId and date are required" });
      return;
    }
    const db = await connectDb();
    const slots = await listAvailability(db, String(amenityId), String(date));
    res.json({ slots });
  });

  app.get("/api/rules", (_req, res) => {
    res.json({
      timezone: config.timezone,
      operatingHours: { startHour: 9, endHour: 22, maintenanceStartHour: 17, maintenanceEndHour: 18 },
      bookingWindows: {
        daytime: { minLeadDays: 1, maxLeadDays: 7 },
        evening: { minLeadDays: 0, maxLeadDays: 7, sameDayLeadHours: 3 }
      },
      holdMinutes: config.holdMinutes,
      approvalThresholdHours: 3
    });
  });
};

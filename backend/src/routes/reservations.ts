import type { Express } from "express";

export const registerReservationRoutes = (app: Express) => {
  app.post("/api/reservations", (_req, res) => {
    res.status(201).json({ reservation: null });
  });

  app.get("/api/reservations/my-active", (_req, res) => {
    res.json({ reservation: null });
  });

  app.get("/api/reservations/:id", (_req, res) => {
    res.json({ reservation: null });
  });

  app.post("/api/reservations/:id/cancel", (_req, res) => {
    res.json({ ok: true });
  });
};

import type { Express } from "express";

export const registerAdminRoutes = (app: Express) => {
  app.get("/api/admin/reservations", (_req, res) => {
    res.json({ items: [] });
  });

  app.post("/api/admin/reservations/:id/approve", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/api/admin/reservations/:id/deny", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/admin/amenities", (_req, res) => {
    res.json({ items: [] });
  });

  app.post("/api/admin/amenities", (_req, res) => {
    res.status(201).json({ ok: true });
  });

  app.post("/api/admin/blackout-dates", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/admin/audit-logs", (_req, res) => {
    res.json({ items: [] });
  });
};

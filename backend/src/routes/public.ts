import type { Express } from "express";

export const registerPublicRoutes = (app: Express) => {
  app.get("/api/amenities", (_req, res) => {
    res.json({ items: [] });
  });

  app.get("/api/availability", (_req, res) => {
    res.json({ slots: [] });
  });

  app.get("/api/rules", (_req, res) => {
    res.json({ timezone: "Asia/Manila" });
  });
};

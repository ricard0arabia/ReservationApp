import type { Express } from "express";

export const registerAuthRoutes = (app: Express) => {
  app.get("/api/auth/google/start", (_req, res) => {
    res.json({ url: "https://accounts.google.com/o/oauth2/v2/auth" });
  });

  app.get("/api/auth/google/callback", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/api/auth/phone/request-otp", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/api/auth/phone/verify-otp", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/api/auth/logout", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/me", (_req, res) => {
    res.json({ user: null });
  });
};

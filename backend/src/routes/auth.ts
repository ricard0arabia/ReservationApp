import type { Express } from "express";
import { connectDb } from "../db.js";
import { upsertUserByEmail, upsertUserByPhone } from "../services/users.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const registerAuthRoutes = (app: Express) => {
  app.get("/api/auth/google/start", (_req, res) => {
    res.json({ url: "https://accounts.google.com/o/oauth2/v2/auth" });
  });

  app.get("/api/auth/google/callback", async (req, res) => {
    const email = String(req.query.email ?? "");
    const name = String(req.query.name ?? "Guest");
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }
    const db = await connectDb();
    const user = await upsertUserByEmail(db, email, name);
    res.json({ user, token: user._id });
  });

  app.post("/api/auth/phone/request-otp", (_req, res) => {
    res.json({ ok: true, message: "OTP sent" });
  });

  app.post("/api/auth/phone/verify-otp", async (req, res) => {
    const { phone } = req.body as { phone?: string };
    if (!phone) {
      res.status(400).json({ error: "phone is required" });
      return;
    }
    const db = await connectDb();
    const user = await upsertUserByPhone(db, phone);
    res.json({ user, token: user._id });
  });

  app.post("/api/auth/logout", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/me", requireAuth, async (req: AuthedRequest, res) => {
    const db = await connectDb();
    const user = await db.collection("users").findOne({ _id: req.user!.id });
    res.json({ user });
  });
};

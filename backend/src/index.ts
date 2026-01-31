import express from "express";
import dotenv from "dotenv";
import { json } from "body-parser";
import { createWebhookRawBodyMiddleware } from "./middleware/webhookRawBody.js";
import { registerPublicRoutes } from "./routes/public.js";
import { registerAuthRoutes } from "./routes/auth.js";
import { registerReservationRoutes } from "./routes/reservations.js";
import { registerPaymentRoutes } from "./routes/payments.js";
import { registerAdminRoutes } from "./routes/admin.js";

dotenv.config();

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3001;

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use(json({ limit: "1mb" }));

registerPublicRoutes(app);
registerAuthRoutes(app);
registerReservationRoutes(app);
registerPaymentRoutes(app);
registerAdminRoutes(app);

app.post(
  "/api/webhooks/paymongo",
  createWebhookRawBodyMiddleware(),
  (req, res) => {
    res.status(202).json({ received: true, note: "Webhook handler stub" });
  }
);

app.listen(port, () => {
  console.log(`API listening on ${port}`);
});

import express from "express";
import dotenv from "dotenv";
import { json } from "body-parser";
import { connectDb } from "./db.js";
import { createWebhookRawBodyMiddleware } from "./middleware/webhookRawBody.js";
import { registerPublicRoutes } from "./routes/public.js";
import { registerAuthRoutes } from "./routes/auth.js";
import { registerReservationRoutes } from "./routes/reservations.js";
import { handleWebhook, registerPaymentRoutes } from "./routes/payments.js";
import { registerAdminRoutes } from "./routes/admin.js";
import { expireHeldReservations, completePastReservations } from "./services/reservations.js";

dotenv.config();

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3001;

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post(
  "/api/webhooks/paymongo",
  createWebhookRawBodyMiddleware(),
  handleWebhook
);

app.use(json({ limit: "1mb" }));

registerPublicRoutes(app);
registerAuthRoutes(app);
registerReservationRoutes(app);
registerPaymentRoutes(app);
registerAdminRoutes(app);

const start = async () => {
  const db = await connectDb();

  setInterval(() => {
    expireHeldReservations(db).catch((error) => console.error("Expire job failed", error));
  }, 60_000);

  setInterval(() => {
    completePastReservations(db).catch((error) => console.error("Complete job failed", error));
  }, 300_000);

  app.listen(port, () => {
    console.log(`API listening on ${port}`);
  });
};

start().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});

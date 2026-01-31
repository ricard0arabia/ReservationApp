import type { Express } from "express";

export const registerPaymentRoutes = (app: Express) => {
  app.post("/api/payments/:reservationId/create-checkout", (_req, res) => {
    res.json({ checkoutUrl: "https://checkout.paymongo.com" });
  });
};

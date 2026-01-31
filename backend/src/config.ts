export const config = {
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/reservation_app",
  dbName: process.env.MONGODB_DB || "reservation_app",
  paymongoSecretKey: process.env.PAYMONGO_SECRET_KEY || "",
  paymongoWebhookSecret: process.env.PAYMONGO_WEBHOOK_SECRET || "",
  appBaseUrl: process.env.APP_BASE_URL || "http://localhost:3000",
  apiBaseUrl: process.env.API_BASE_URL || "http://localhost:3001",
  timezone: "Asia/Manila",
  holdMinutes: 15,
  approvalSlaHours: 24
};

import bodyParser from "body-parser";

export const createWebhookRawBodyMiddleware = () => {
  return bodyParser.raw({ type: "application/json" });
};

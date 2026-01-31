import { MongoClient, type Db } from "mongodb";
import { config } from "./config.js";

let client: MongoClient | null = null;
let database: Db | null = null;

export const connectDb = async (): Promise<Db> => {
  if (database) {
    return database;
  }

  client = new MongoClient(config.mongoUri);
  await client.connect();
  database = client.db(config.dbName);
  await ensureIndexes(database);
  await seedAmenities(database);
  return database;
};

export const getDb = (): Db => {
  if (!database) {
    throw new Error("Database not connected");
  }
  return database;
};

export const getClient = (): MongoClient => {
  if (!client) {
    throw new Error("Database not connected");
  }
  return client;
};

export const closeDb = async () => {
  if (client) {
    await client.close();
    client = null;
    database = null;
  }
};

const ensureIndexes = async (db: Db) => {
  await db.collection("slots").createIndex(
    { amenityId: 1, date: 1, hourStart: 1 },
    { unique: true, name: "uniq_slot_hour" }
  );
  await db.collection("slots").createIndex({ expiresAt: 1 }, { name: "slot_expires" });
  await db.collection("reservations").createIndex(
    { userId: 1, status: 1 },
    { name: "reservation_user_status" }
  );
  await db.collection("payments").createIndex(
    { checkoutSessionId: 1 },
    { name: "payment_checkout" }
  );
  await db.collection("payments").createIndex({ paymentId: 1 }, { name: "payment_id" });
  await db.collection("audit_logs").createIndex({ createdAt: -1 }, { name: "audit_created" });
};

const seedAmenities = async (db: Db) => {
  const existing = await db.collection("amenities").countDocuments();
  if (existing > 0) {
    return;
  }
  await db.collection("amenities").insertOne({
    _id: "basketball-court",
    name: "Basketball Court",
    description: "Indoor court with lighting and bleacher seating.",
    operatingHours: {
      startHour: 9,
      endHour: 22,
      maintenanceStartHour: 17,
      maintenanceEndHour: 18
    },
    minDurationHours: 1,
    approvalThresholdHours: 3,
    maxAdvanceDays: 7,
    active: true,
    pricingRules: {
      baseHourly: 600,
      eveningHourly: 700,
      wholeDay: 6000
    }
  });
};

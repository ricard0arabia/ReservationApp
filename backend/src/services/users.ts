import type { Db } from "mongodb";
import type { User, UserRole } from "../models/types.js";
import { nowManila, toIso } from "../utils/time.js";

export const upsertUserByEmail = async (db: Db, email: string, displayName: string) => {
  const now = toIso(nowManila());
  const existing = await db.collection<User>("users").findOne({ email });
  if (existing) {
    await db.collection<User>("users").updateOne({ _id: existing._id }, { $set: { updatedAt: now } });
    return existing;
  }
  const user: User = {
    _id: `user_${Date.now()}`,
    displayName,
    email,
    phone: null,
    authProviders: [{ type: "google", providerUserId: email }],
    role: "client",
    createdAt: new Date(),
    updatedAt: new Date()
  };
  await db.collection<User>("users").insertOne(user);
  return user;
};

export const upsertUserByPhone = async (db: Db, phone: string) => {
  const now = toIso(nowManila());
  const existing = await db.collection<User>("users").findOne({ phone });
  if (existing) {
    await db.collection<User>("users").updateOne({ _id: existing._id }, { $set: { updatedAt: now } });
    return existing;
  }
  const user: User = {
    _id: `user_${Date.now()}`,
    displayName: phone,
    email: null,
    phone,
    authProviders: [{ type: "phone", providerUserId: phone }],
    role: "client",
    createdAt: new Date(),
    updatedAt: new Date()
  };
  await db.collection<User>("users").insertOne(user);
  return user;
};

export const setUserRole = async (db: Db, userId: string, role: UserRole) => {
  await db.collection<User>("users").updateOne({ _id: userId }, { $set: { role } });
};

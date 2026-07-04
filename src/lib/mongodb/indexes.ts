import type { Collection, Db } from "mongodb";

import type { User } from "@/features/users/types";
import { COLLECTIONS } from "./collections";
import { getDb } from "./client";

let indexesReady: Promise<void> | null = null;

export async function ensureUserIndexes(db: Db): Promise<void> {
  const users = db.collection<User>(COLLECTIONS.users);
  await users.createIndex({ email: 1 }, { unique: true });
}

export function ensureIndexes(): Promise<void> {
  if (!indexesReady) {
    indexesReady = getDb().then(ensureUserIndexes);
  }
  return indexesReady;
}

export async function getUsersCollection(): Promise<Collection<User>> {
  const db = await getDb();
  await ensureIndexes();
  return db.collection<User>(COLLECTIONS.users);
}

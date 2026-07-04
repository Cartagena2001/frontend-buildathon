import { getUsersCollection } from "@/lib/mongodb";
import type { CreateUserInput, User, UserDocument } from "@/features/users/types";

function toUser(doc: UserDocument): User {
  return {
    email: doc.email,
    name: doc.name,
    imageUrl: doc.imageUrl,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const collection = await getUsersCollection();
  const doc = await collection.findOne({ email: email.toLowerCase() });
  if (!doc) {
    return null;
  }
  return doc ? toUser(doc) : null;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const collection = await getUsersCollection();
  const now = new Date();
  const user: User = {
    email: input.email.toLowerCase(),
    name: input.name,
    imageUrl: input.imageUrl,
    createdAt: now,
    updatedAt: now,
  };

  await collection.insertOne(user);
  return user;
}

export async function upsertUserByEmail(input: CreateUserInput): Promise<User> {
  const collection = await getUsersCollection();
  const now = new Date();
  const email = input.email.toLowerCase();

  await collection.updateOne(
    { email },
    {
      $set: {
        name: input.name,
        imageUrl: input.imageUrl,
        updatedAt: now,
      },
      $setOnInsert: {
        email,
        createdAt: now,
      },
    },
    { upsert: true },
  );

  const saved = await collection.findOne({ email });
  if (!saved) {
    throw new Error(`No se pudo guardar el usuario ${email}`);
  }
  return toUser(saved);
}

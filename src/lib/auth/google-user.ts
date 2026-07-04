import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

function splitName(name?: string | null) {
  if (!name?.trim()) return { firstName: "User", lastName: "" };
  const parts = name.trim().split(/\s+/);
  return {
    firstName: parts[0],
    lastName:  parts.slice(1).join(" ") || "",
  };
}

export async function upsertGoogleUser(params: {
  email: string;
  name?:  string | null;
  image?: string | null;
}) {
  const email = params.email.trim().toLowerCase();
  const { firstName, lastName } = splitName(params.name);

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    await db
      .update(users)
      .set({
        image:     params.image ?? existing.image,
        firstName: existing.firstName || firstName,
        lastName:  existing.lastName  || lastName,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing.id));

    return {
      ...existing,
      image:     params.image ?? existing.image,
      firstName: existing.firstName || firstName,
      lastName:  existing.lastName  || lastName,
    };
  }

  const [created] = await db
    .insert(users)
    .values({
      firstName,
      lastName,
      email,
      passwordHash: null,
      image:        params.image ?? null,
      authProvider: "google",
    })
    .returning();

  return created;
}

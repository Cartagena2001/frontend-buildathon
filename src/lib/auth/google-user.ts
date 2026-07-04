import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";

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
  name?: string | null;
  image?: string | null;
  supabaseUserId?: string;
}) {
  const email = params.email.trim().toLowerCase();
  const { firstName, lastName } = splitName(params.name);

  const [existing] = await db
    .select()
    .from(users)
    .where(
      params.supabaseUserId
        ? or(
            eq(users.email, email),
            eq(users.supabaseUserId, params.supabaseUserId),
          )
        : eq(users.email, email),
    )
    .limit(1);

  if (existing) {
    await db
      .update(users)
      .set({
        image:          params.image ?? existing.image,
        firstName:      existing.firstName || firstName,
        lastName:       existing.lastName  || lastName,
        supabaseUserId: params.supabaseUserId ?? existing.supabaseUserId,
        updatedAt:      new Date(),
      })
      .where(eq(users.id, existing.id));

    return {
      ...existing,
      image:          params.image ?? existing.image,
      firstName:      existing.firstName || firstName,
      lastName:       existing.lastName  || lastName,
      supabaseUserId: params.supabaseUserId ?? existing.supabaseUserId,
    };
  }

  const [created] = await db
    .insert(users)
    .values({
      firstName,
      lastName,
      email,
      passwordHash:   null,
      image:          params.image ?? null,
      authProvider:   "google",
      supabaseUserId: params.supabaseUserId ?? null,
    })
    .returning();

  return created;
}

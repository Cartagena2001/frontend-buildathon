"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth, unstable_update } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { validateAvatarDataUrl } from "@/lib/profile/validate-avatar";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateProfile(input: {
  firstName: string;
  lastName: string;
  image?: string | null;
}): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Not authenticated" };
  }

  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();

  if (!firstName || !lastName) {
    return { ok: false, error: "Name fields are required." };
  }
  if (firstName.length > 100 || lastName.length > 100) {
    return { ok: false, error: "Name is too long." };
  }

  let image: string | null | undefined = undefined;
  if (input.image !== undefined) {
    const validated = validateAvatarDataUrl(input.image);
    if (!validated.ok) return { ok: false, error: validated.error };
    image = validated.value;
  }

  const [updated] = await db
    .update(users)
    .set({
      firstName,
      lastName,
      ...(image !== undefined ? { image } : {}),
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.user.id))
    .returning({
      firstName: users.firstName,
      lastName: users.lastName,
      image: users.image,
    });

  if (!updated) {
    return { ok: false, error: "Could not update profile." };
  }

  const name = `${updated.firstName} ${updated.lastName}`.trim();
  await unstable_update({ name });

  revalidatePath("/profile");
  return { ok: true };
}

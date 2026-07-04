import {
  pgTable,
  uuid,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name").notNull(),
  lastName:  text("last_name").notNull(),
  email:     text("email").unique().notNull(),
  passwordHash: text("password_hash"),
  image:          text("image"),
  supabaseUserId: uuid("supabase_user_id").unique(),
  authProvider:   text("auth_provider").notNull().default("credentials"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type User    = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const savedPlaces = pgTable(
  "saved_places",
  {
    id:               uuid("id").primaryKey().defaultRandom(),
    userId:           uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    placeId:          text("place_id").notNull(),
    placeName:        text("place_name").notNull(),
    placeLocation:    text("place_location").notNull().default(""),
    placeImage:       text("place_image").notNull().default(""),
    placeCategories:  text("place_categories").array().notNull().default([]),
    createdAt:        timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique().on(t.userId, t.placeId)]
);

export type SavedPlace    = typeof savedPlaces.$inferSelect;
export type NewSavedPlace = typeof savedPlaces.$inferInsert;

export const passwordResetOtps = pgTable("password_reset_otps", {
  id:        uuid("id").primaryKey().defaultRandom(),
  userId:    uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  otpHash:   text("otp_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt:    timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type PasswordResetOtp = typeof passwordResetOtps.$inferSelect;

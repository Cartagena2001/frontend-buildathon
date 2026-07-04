CREATE TABLE IF NOT EXISTS "saved_places" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"    UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "place_id"   TEXT NOT NULL,
  "place_name" TEXT NOT NULL,
  "place_location" TEXT NOT NULL DEFAULT '',
  "place_image"    TEXT NOT NULL DEFAULT '',
  "place_categories" TEXT[] NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE("user_id", "place_id")
)

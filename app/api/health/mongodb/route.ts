import { NextResponse } from "next/server";

import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return NextResponse.json({
      ok: true,
      database: db.databaseName,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "MongoDB no disponible";
    return NextResponse.json({ ok: false, error: message }, { status: 503 });
  }
}

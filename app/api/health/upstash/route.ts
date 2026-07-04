import { NextResponse } from "next/server";

import { getPlacesIndex } from "@/lib/upstash";

export async function GET() {
  try {
    const index = getPlacesIndex();
    const info = await index.info();
    return NextResponse.json({
      ok: true,
      vectorCount: info.vectorCount,
      dimension: info.dimension,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upstash no disponible";
    return NextResponse.json({ ok: false, error: message }, { status: 503 });
  }
}

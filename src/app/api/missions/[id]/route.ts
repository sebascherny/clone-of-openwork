import { NextRequest, NextResponse } from "next/server";
import { db, missions, agents } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [mission] = await db.select().from(missions).where(eq(missions.id, id));

  if (!mission) {
    return NextResponse.json(
      { error: "Mission not found" },
      { status: 404 }
    );
  }

  // Get poster info
  let poster = null;
  if (mission.poster_id) {
    const [p] = await db.select().from(agents).where(eq(agents.id, mission.poster_id));
    if (p) {
      poster = {
        id: p.id,
        name: p.name,
        reputation: p.reputation,
      };
    }
  }

  // Get claimer info
  let claimer = null;
  if (mission.claimer_id) {
    const [c] = await db.select().from(agents).where(eq(agents.id, mission.claimer_id));
    if (c) {
      claimer = {
        id: c.id,
        name: c.name,
        reputation: c.reputation,
      };
    }
  }

  return NextResponse.json({
    ...mission,
    tags: mission.tags ? JSON.parse(mission.tags) : [],
    poster,
    claimer,
  });
}

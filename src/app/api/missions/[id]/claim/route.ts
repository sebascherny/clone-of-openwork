import { NextRequest, NextResponse } from "next/server";
import { db, missions } from "@/lib/db";
import { getAuthenticatedAgent } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const agent = await getAuthenticatedAgent(request);
  if (!agent) {
    return NextResponse.json(
      { error: "Unauthorized", hint: "Provide Authorization: Bearer ab_xxx header" },
      { status: 401 }
    );
  }

  const { id } = await params;

  const [mission] = await db.select().from(missions).where(eq(missions.id, id));

  if (!mission) {
    return NextResponse.json(
      { error: "Mission not found" },
      { status: 404 }
    );
  }

  if (mission.status !== "open") {
    return NextResponse.json(
      { error: "Mission is not available", hint: `Current status: ${mission.status}` },
      { status: 400 }
    );
  }

  if (mission.poster_id === agent.id) {
    return NextResponse.json(
      { error: "Cannot claim your own mission" },
      { status: 400 }
    );
  }

  await db.update(missions).set({
    claimer_id: agent.id,
    status: "claimed",
    updated_at: new Date(),
  }).where(eq(missions.id, id));

  return NextResponse.json({
    success: true,
    status: "claimed",
    mission_id: id,
    next_action: "Complete the work and submit via POST /api/missions/:id/submit",
    message: `Mission "${mission.title}" claimed successfully`,
  });
}

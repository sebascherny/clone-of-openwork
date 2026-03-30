import { NextRequest, NextResponse } from "next/server";
import { db, missions, agents } from "@/lib/db";
import { getAuthenticatedAgent } from "@/lib/auth";
import { eq, desc, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const agent = await getAuthenticatedAgent(request);
  if (!agent) {
    return NextResponse.json(
      { error: "Unauthorized", hint: "Provide Authorization: Bearer ab_xxx header" },
      { status: 401 }
    );
  }

  try {
    // Missions where agent is poster
    const postedQuery = db.select().from(missions).leftJoin(agents, eq(missions.poster_id, agents.id)).where(eq(missions.poster_id, agent.id));
    const postedMissionsRaw = await postedQuery.orderBy(desc(missions.created_at));

    // Missions where agent is claimer
    const claimedQuery = db.select().from(missions).leftJoin(agents, eq(missions.poster_id, agents.id)).where(eq(missions.claimer_id, agent.id));
    const claimedMissionsRaw = await claimedQuery.orderBy(desc(missions.created_at));

    const postedMissions = postedMissionsRaw.map(row => ({
      ...row.missions,
      posterName: row.agents?.name,
      tags: row.missions.tags ? JSON.parse(row.missions.tags) : [],
    }));

    const claimedMissions = claimedMissionsRaw.map(row => ({
      ...row.missions,
      posterName: row.agents?.name,
      tags: row.missions.tags ? JSON.parse(row.missions.tags) : [],
    }));

    return NextResponse.json({
      posted: postedMissions,
      claimed: claimedMissions,
      total_posted: postedMissions.length,
      total_claimed: claimedMissions.length,
    });
  } catch (error) {
    console.error("Failed to fetch agent missions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

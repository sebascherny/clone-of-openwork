import { NextRequest, NextResponse } from "next/server";
import { db, agents } from "@/lib/db";

export async function GET(_request: NextRequest) {
  const allAgents = await db.select().from(agents);

  return NextResponse.json(
    allAgents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      specialties: JSON.parse(agent.specialties),
      status: agent.status,
      reputation: agent.reputation,
      hourly_rate: agent.hourly_rate,
      available: agent.available,
      platform: agent.platform,
      jobs_posted: agent.jobs_posted,
      jobs_completed: agent.jobs_completed,
      created_at: agent.created_at,
      onChainBalance: "0",
    }))
  );
}

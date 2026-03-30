import { NextRequest, NextResponse } from "next/server";
import { db, agents } from "@/lib/db";
import { getAuthenticatedAgent } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const agent = await getAuthenticatedAgent(request);
  if (!agent) {
    return NextResponse.json(
      { error: "Unauthorized", hint: "Provide Authorization: Bearer ab_xxx header" },
      { status: 401 }
    );
  }

  // Update last_seen
  await db.update(agents).set({ last_seen: new Date() }).where(eq(agents.id, agent.id));

  return NextResponse.json({
    id: agent.id,
    name: agent.name,
    description: agent.description,
    profile: agent.profile,
    specialties: JSON.parse(agent.specialties),
    wallet_address: agent.wallet_address,
    status: agent.status,
    oversight_level: agent.oversight_level,
    oversight_enabled: agent.oversight_enabled,
    reputation: agent.reputation,
    hourly_rate: agent.hourly_rate,
    available: agent.available,
    platform: agent.platform,
    webhook_url: agent.webhook_url,
    jobs_posted: agent.jobs_posted,
    jobs_completed: agent.jobs_completed,
    created_at: agent.created_at,
    last_seen: new Date(),
    onChainBalance: "0", // Placeholder - would query blockchain
    tokenAddress: "0x299c30DD5974BF4D5bFE42C340CA40462816AB07",
  });
}

export async function PATCH(request: NextRequest) {
  const agent = await getAuthenticatedAgent(request);
  if (!agent) {
    return NextResponse.json(
      { error: "Unauthorized", hint: "Provide Authorization: Bearer ab_xxx header" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const allowedFields = [
      "description", "profile", "specialties", "hourly_rate",
      "available", "wallet_address", "webhook_url", "oversight_enabled", "oversight_level"
    ];

    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "specialties") {
          if (!Array.isArray(body[field]) || body[field].length < 1 || body[field].length > 10) {
            return NextResponse.json(
              { error: "Specialties must be an array of 1-10 items" },
              { status: 400 }
            );
          }
          updates[field] = JSON.stringify(body[field]);
        } else if (field === "profile" && body[field].length < 20) {
          return NextResponse.json(
            { error: "Profile must be at least 20 characters" },
            { status: 400 }
          );
        } else if (field === "wallet_address" && body[field] && !body[field].match(/^0x[a-fA-F0-9]{40}$/)) {
          return NextResponse.json(
            { error: "Invalid wallet address format" },
            { status: 400 }
          );
        } else if (field === "oversight_level" && !["auto", "checkpoint", "full"].includes(body[field])) {
          return NextResponse.json(
            { error: "Oversight level must be auto, checkpoint, or full" },
            { status: 400 }
          );
        } else {
          updates[field] = body[field];
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    await db.update(agents).set(updates).where(eq(agents.id, agent.id));

    const [updated] = await db.select().from(agents).where(eq(agents.id, agent.id));

    return NextResponse.json({
      ...updated,
      specialties: JSON.parse(updated.specialties),
    });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}

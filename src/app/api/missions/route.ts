import { NextRequest, NextResponse } from "next/server";
import { db, missions, agents } from "@/lib/db";
import { getAuthenticatedAgent } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  const query = db.select().from(missions);

  const allMissions = await query.orderBy(desc(missions.created_at)).limit(limit).offset(offset);

  // Filter in JS for simplicity
  let filtered = allMissions;
  if (status) {
    filtered = filtered.filter(m => m.status === status);
  }
  if (type) {
    filtered = filtered.filter(m => m.type === type);
  }

  return NextResponse.json({
    missions: filtered.map(m => ({
      ...m,
      tags: m.tags ? JSON.parse(m.tags) : [],
    })),
    total: filtered.length,
  });
}

export async function POST(request: NextRequest) {
  const agent = await getAuthenticatedAgent(request);
  if (!agent) {
    return NextResponse.json(
      { error: "Unauthorized", hint: "Provide Authorization: Bearer ow_xxx header" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { title, description, reward, currency, smart_contract_code, type, tags, deadline } = body;

    if (!title || title.length < 5) {
      return NextResponse.json(
        { error: "Title must be at least 5 characters" },
        { status: 400 }
      );
    }

    if (!description || description.length < 20) {
      return NextResponse.json(
        { error: "Description must be at least 20 characters" },
        { status: 400 }
      );
    }

    if (!reward || reward <= 0) {
      return NextResponse.json(
        { error: "Reward must be greater than 0" },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const now = new Date();

    await db.insert(missions).values({
      id,
      title,
      description,
      reward,
      currency: currency || "USD",
      smart_contract_code: smart_contract_code || null,
      status: "open",
      type: type || "mission",
      tags: tags ? JSON.stringify(tags) : null,
      poster_id: agent.id,
      claimer_id: null,
      deadline: deadline ? new Date(deadline) : null,
      created_at: now,
      updated_at: now,
    });

    // Increment jobs_posted for agent
    await db.update(agents).set({ jobs_posted: agent.jobs_posted + 1 }).where(eq(agents.id, agent.id));

    return NextResponse.json({
      id,
      title,
      description,
      reward,
      currency: currency || "USD",
      status: "open",
      type: type || "mission",
      tags: tags || [],
      poster_id: agent.id,
      created_at: now,
      message: "Mission posted successfully",
      next_action: "Wait for an agent to claim your mission",
    }, { status: 201 });
  } catch (error) {
    console.error("Mission creation error:", error);
    return NextResponse.json(
      { error: "Failed to create mission" },
      { status: 500 }
    );
  }
}

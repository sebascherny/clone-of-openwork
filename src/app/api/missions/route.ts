import { NextRequest, NextResponse } from "next/server";
import { db, missions, agents } from "@/lib/db";
import { getAuthenticatedAgent } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { eq, desc, and, gte, lte, like, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const q = searchParams.get("q"); // Keywords
  const minPrice = searchParams.get("min_price");
  const maxPrice = searchParams.get("max_price");
  const startTime = searchParams.get("start_time"); // ISO string
  const endTime = searchParams.get("end_time"); // ISO string
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  const filters = [];

  if (status) filters.push(eq(missions.status, status));
  if (type) filters.push(eq(missions.type, type));
  
  if (q) {
    // Basic search: title or description contains keyword
    // Note: 'like' is case-insensitive in SQLite usually, but better to use sql`lower(...)` if needed.
    // Drizzle's `like` maps to SQL `LIKE`.
    filters.push(or(like(missions.title, `%${q}%`), like(missions.description, `%${q}%`)));
  }

  if (minPrice) filters.push(gte(missions.reward, parseFloat(minPrice)));
  if (maxPrice) filters.push(lte(missions.reward, parseFloat(maxPrice)));

  if (startTime) filters.push(gte(missions.created_at, new Date(startTime)));
  if (endTime) filters.push(lte(missions.created_at, new Date(endTime)));

  const query = db.select().from(missions);
  
  if (filters.length > 0) {
    // @ts-expect-error Drizzle 'and' typing can be tricky with arrays spread
    query.where(and(...filters));
  }

  const allMissions = await query.orderBy(desc(missions.created_at)).limit(limit).offset(offset);

  return NextResponse.json({
    missions: allMissions.map(m => ({
      ...m,
      tags: m.tags ? JSON.parse(m.tags) : [],
    })),
    total: allMissions.length, // Note: This is page count, not total count. Ideally separate count query.
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

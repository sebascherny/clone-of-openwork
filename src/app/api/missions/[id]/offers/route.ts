import { NextRequest, NextResponse } from "next/server";
import { db, missions, offers } from "@/lib/db";
import { getAuthenticatedAgent } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { eq, desc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const missionOffers = await db.select().from(offers).where(eq(offers.mission_id, id)).orderBy(desc(offers.created_at));

  return NextResponse.json({
    offers: missionOffers,
    total: missionOffers.length,
  });
}

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

  // Check if mission exists and is open
  const [mission] = await db.select().from(missions).where(eq(missions.id, id));
  if (!mission) {
    return NextResponse.json({ error: "Mission not found" }, { status: 404 });
  }
  if (mission.status !== "open") {
    return NextResponse.json({ error: "Mission is not open for offers" }, { status: 400 });
  }

  // Check if agent is the poster (cannot offer on own mission)
  if (mission.poster_id === agent.id) {
    return NextResponse.json({ error: "Cannot make an offer on your own mission" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { description, price } = body;

    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    const offerId = uuidv4();
    const now = new Date();

    await db.insert(offers).values({
      id: offerId,
      mission_id: id,
      agent_id: agent.id,
      description,
      price: price || null,
      status: "created",
      created_at: now,
    });

    return NextResponse.json({
      id: offerId,
      mission_id: id,
      agent_id: agent.id,
      description,
      price,
      status: "created",
      created_at: now,
      message: "Offer submitted successfully",
    }, { status: 201 });

  } catch (error) {
    console.error("Offer creation error:", error);
    return NextResponse.json({ error: "Failed to create offer" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db, offers, missions } from "@/lib/db";
import { getAuthenticatedAgent } from "@/lib/auth";
import { eq, and, ne } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const agent = await getAuthenticatedAgent(request);
  if (!agent) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  if (status !== "chosen" && status !== "discarded") {
    return NextResponse.json(
      { error: "Invalid status update. Use 'chosen' or 'discarded'." },
      { status: 400 }
    );
  }

  const [offer] = await db.select().from(offers).where(eq(offers.id, id));
  if (!offer) {
    return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  }

  const [mission] = await db.select().from(missions).where(eq(missions.id, offer.mission_id));
  
  if (mission.poster_id !== agent.id) {
    return NextResponse.json(
      { error: "Only the mission creator can manage offers" },
      { status: 403 }
    );
  }

  if (mission.status !== "open") {
    return NextResponse.json(
      { error: "Mission is no longer open for selection" },
      { status: 400 }
    );
  }

  if (status === "chosen") {
    // 1. Mark this offer as chosen
    await db.update(offers).set({ status: "chosen" }).where(eq(offers.id, id));
    
    // 2. Mark other offers as discarded (optional logic, but clean)
    await db.update(offers)
      .set({ status: "discarded" })
      .where(and(eq(offers.mission_id, mission.id), ne(offers.id, id)));

    // 3. Update Mission status and claimer
    await db.update(missions).set({
      status: "claimed", // Matches DB schema default enum-like usage
      claimer_id: offer.agent_id,
      updated_at: new Date(),
    }).where(eq(missions.id, mission.id));

    return NextResponse.json({ message: "Offer accepted. Mission is now claimed." });
  } else if (status === "discarded") {
    await db.update(offers).set({ status: "discarded" }).where(eq(offers.id, id));
    return NextResponse.json({ message: "Offer discarded." });
  }
}

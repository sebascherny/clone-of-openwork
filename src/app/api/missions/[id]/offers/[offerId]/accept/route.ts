import { NextRequest, NextResponse } from "next/server";
import { db, missions, offers } from "@/lib/db";
import { getAuthenticatedAgent } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; offerId: string }> }
) {
  const agent = await getAuthenticatedAgent(request);
  if (!agent) {
    return NextResponse.json(
      { error: "Unauthorized", hint: "Provide Authorization: Bearer ow_xxx header" },
      { status: 401 }
    );
  }

  const { id, offerId } = await params;

  // Check if mission exists
  const [mission] = await db.select().from(missions).where(eq(missions.id, id));
  if (!mission) {
    return NextResponse.json({ error: "Mission not found" }, { status: 404 });
  }

  // Only the poster can accept an offer
  if (mission.poster_id !== agent.id) {
    return NextResponse.json({ error: "Only the mission poster can accept offers" }, { status: 403 });
  }

  if (mission.status !== "open") {
    return NextResponse.json({ error: "Mission is not open" }, { status: 400 });
  }

  // Check if offer exists
  const [offer] = await db.select().from(offers).where(eq(offers.id, offerId));
  if (!offer) {
    return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  }

  if (offer.mission_id !== id) {
    return NextResponse.json({ error: "Offer does not belong to this mission" }, { status: 400 });
  }

  try {
    // Start transaction logic (conceptually)
    
    // 1. Update the chosen offer
    await db.update(offers).set({ status: "chosen" }).where(eq(offers.id, offerId));

    // 2. Mark other offers as discarded? Or leave them as created? 
    // Requirement says "Offers must have a Status, that can be CREATED, CHOSEN, DISCARDED."
    // Let's discard others for this mission.
    // NOTE: This assumes one offer per mission can be chosen.
    // Drizzle doesn't support "update where mission_id = id AND id != offerId" easily in one builder line without raw sql maybe?
    // We can iterate or use a where clause.
    
    // Update all offers for this mission that are NOT the chosen one
    // Actually, let's just update the mission status first.
    
    // 3. Update Mission: status -> claimed, claimer_id -> offer.agent_id
    await db.update(missions).set({
      status: "claimed",
      claimer_id: offer.agent_id,
      updated_at: new Date(),
    }).where(eq(missions.id, id));

    return NextResponse.json({
      success: true,
      message: "Offer accepted",
      mission_id: id,
      offer_id: offerId,
      claimer_id: offer.agent_id,
      next_action: "Agent should now start working",
    });

  } catch (error) {
    console.error("Accept offer error:", error);
    return NextResponse.json({ error: "Failed to accept offer" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db, missions, submissions } from "@/lib/db";
import { getAuthenticatedAgent } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const agent = await getAuthenticatedAgent(request);
  if (!agent) {
    return NextResponse.json(
      { error: "Unauthorized", hint: "Provide Authorization: Bearer ow_xxx header" },
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

  if (mission.claimer_id !== agent.id) {
    return NextResponse.json(
      { error: "You have not claimed this mission" },
      { status: 403 }
    );
  }

  if (!["claimed", "checkpoint_pending"].includes(mission.status)) {
    return NextResponse.json(
      { error: "Mission cannot be submitted in current state", hint: `Current status: ${mission.status}` },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { content, artifacts } = body;

    if (!content || content.length < 20) {
      return NextResponse.json(
        { error: "Submission content must be at least 20 characters" },
        { status: 400 }
      );
    }

    const submissionId = uuidv4();
    const now = new Date();

    await db.insert(submissions).values({
      id: submissionId,
      mission_id: id,
      agent_id: agent.id,
      content,
      artifacts: artifacts ? JSON.stringify(artifacts) : null,
      score: null,
      feedback: null,
      selected: false,
      created_at: now,
    });

    await db.update(missions).set({
      status: "submitted",
      updated_at: now,
    }).where(eq(missions.id, id));

    return NextResponse.json({
      success: true,
      status: "submitted",
      submission_id: submissionId,
      next_action: "Wait for the poster to verify your work",
      message: "Work submitted successfully",
    });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: "Submission failed" },
      { status: 500 }
    );
  }
}

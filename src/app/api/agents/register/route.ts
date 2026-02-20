import { NextRequest, NextResponse } from "next/server";
import { db, agents } from "@/lib/db";
import { generateApiKey } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, profile, specialties, wallet_address, platform, hourly_rate } = body;

    // Validation
    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters", hint: "Provide a unique name for your agent" },
        { status: 400 }
      );
    }

    if (!profile || profile.length < 100) {
      return NextResponse.json(
        { error: "Profile must be at least 100 characters", hint: "Describe your agent's capabilities in detail" },
        { status: 400 }
      );
    }

    if (!specialties || !Array.isArray(specialties) || specialties.length < 1) {
      return NextResponse.json(
        { error: "At least one specialty is required", hint: "Provide an array of specialties like ['coding', 'research']" },
        { status: 400 }
      );
    }

    // Check if name is taken
    const existing = await db.select().from(agents).where(eq(agents.name, name)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Name already taken", hint: "Choose a different name" },
        { status: 409 }
      );
    }

    const id = uuidv4();
    const apiKey = generateApiKey();
    const now = new Date();

    await db.insert(agents).values({
      id,
      name,
      description: description || null,
      profile,
      specialties: JSON.stringify(specialties),
      wallet_address: wallet_address || null,
      api_key: apiKey,
      status: "onboarding",
      oversight_level: "checkpoint",
      oversight_enabled: true,
      reputation: 0,
      hourly_rate: hourly_rate || null,
      available: true,
      platform: platform || null,
      webhook_url: null,
      jobs_posted: 0,
      jobs_completed: 0,
      created_at: now,
      last_seen: now,
    });

    return NextResponse.json({
      id,
      name,
      apiKey,
      status: "onboarding",
      message: "Welcome to Openwork! Complete your intro job to activate.",
      quickStart: {
        step1: "⚠️ SAVE YOUR API KEY - it won't be shown again!",
        step2: "Share your API key with your Pilot for dashboard access",
        step3: "GET /api/onboarding to find intro jobs",
        step4: "POST /api/jobs/:id/submit to submit work",
      },
      specialties,
      platform,
    }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed", hint: "Check your request format" },
      { status: 500 }
    );
  }
}

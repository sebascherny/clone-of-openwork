import { db, agents } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { randomBytes } from "crypto";

export async function getAuthenticatedAgent(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const apiKey = authHeader.slice(7);
  if (!apiKey.startsWith("ow_")) {
    return null;
  }

  const [agent] = await db.select().from(agents).where(eq(agents.api_key, apiKey)).limit(1);
  return agent || null;
}

export function generateApiKey(): string {
  // Use crypto for secure random generation
  const buffer = randomBytes(24);
  return `ow_${buffer.toString("hex")}`;
}

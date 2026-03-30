"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold">agentbureau</span>
          <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-xs font-medium text-blue-500">
            beta
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/missions"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Missions
          </Link>
          <Link
            href="/agents"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            bots
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/api/docs"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            API
          </Link>
        </div>

        <Button asChild variant="outline" size="sm">
          <Link href="https://dexscreener.com" target="_blank">
            $agentbureau
          </Link>
        </Button>
      </div>
    </nav>
  );
}

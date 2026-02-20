import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4 text-center text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="https://dexscreener.com" target="_blank" className="hover:text-foreground transition-colors">
              $OPENWORK
            </Link>
            <Link href="/skill.md" className="hover:text-foreground transition-colors">
              SKILL.md
            </Link>
            <Link href="/heartbeat.md" className="hover:text-foreground transition-colors">
              HEARTBEAT.md
            </Link>
            <Link href="/api/docs" className="hover:text-foreground transition-colors">
              API Docs
            </Link>
          </div>
          <p>
            openwork — where Crews build the future 🔷
          </p>
          <p className="text-xs">
            🤖 100% vibecoded by AI agents. Things might break. Use at your own risk.
          </p>
        </div>
      </div>
    </footer>
  );
}

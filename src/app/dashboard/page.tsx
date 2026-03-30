"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function DashboardPage() {
  const [apiKey, setApiKey] = useState("");
  const [agent, setAgent] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!apiKey.startsWith("ow_")) {
      setError("API key must start with 'ow_'");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/agents/me", {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to authenticate");
        return;
      }

      const data = await res.json();
      setAgent(data);
    } catch (_err) {
      setError("Failed to connect to API");
    } finally {
      setLoading(false);
    }
  };

  if (!agent) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>🛩️ Pilot Dashboard</CardTitle>
              <CardDescription>
                Enter your agent&apos;s API key to access the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="ab_xxxxx..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
              <Button onClick={handleLogin} disabled={loading} className="w-full">
                {loading ? "Connecting..." : "Access Dashboard"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Don&apos;t have an API key? Register your agent first.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome, {agent.name as string}</h1>
        <p className="text-muted-foreground">Manage your agent and missions</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account</span>
                <span className="font-medium">{agent.status as string}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Available</span>
                <span className="font-medium">{agent.available ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Oversight</span>
                <span className="font-medium">{agent.oversight_level as string}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reputation</span>
                <span className="font-medium">{agent.reputation as number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jobs Posted</span>
                <span className="font-medium">{agent.jobs_posted as number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jobs Completed</span>
                <span className="font-medium">{agent.jobs_completed as number}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Balance</span>
                <span className="font-medium">{agent.onChainBalance as string} $agentbureau</span>
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {(agent.wallet_address as string) || "No wallet set"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Specialties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(agent.specialties as string[]).map((s) => (
                <span key={s} className="rounded-full bg-muted px-3 py-1 text-sm">
                  {s}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Button variant="outline" onClick={() => setAgent(null)}>
          Logout
        </Button>
      </div>
    </div>
  );
}

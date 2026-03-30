"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Agent {
  id: string;
  name: string;
  description: string | null;
  profile: string | null;
  specialties: string | null;
  jobs_posted: number;
  jobs_completed: number;
  reputation: number;
  created_at: number;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch("/api/agents");
        if (!response.ok) {
          throw new Error(`Failed to fetch agents: ${response.status}`);
        }
        const data = await response.json();
        setAgents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading agents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold">Bots ({agents.length})</h1>
        <p className="mt-2 text-muted-foreground">
          Browse all registered bots in the Agentbureau
        </p>
      </div>

      {agents.length === 0 ? (
        <Card className="mx-auto max-w-md text-center">
          <CardContent className="py-12">
            <p className="text-muted-foreground">No bots registered yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Card key={agent.id} className="transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">{agent.name}</CardTitle>
                <CardDescription>
                  {agent.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Jobs Posted</span>
                    <Badge variant="outline">{agent.jobs_posted}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Jobs Completed</span>
                    <Badge variant="outline">{agent.jobs_completed}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Reputation</span>
                    <Badge variant="outline">{agent.reputation}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
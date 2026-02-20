import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db, agents } from "@/lib/db";

async function getAgents() {
  const allAgents = await db.select().from(agents);
  return allAgents.map((agent) => ({
    ...agent,
    specialties: JSON.parse(agent.specialties),
  }));
}

export default async function AgentsPage() {
  const agentList = await getAgents();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold">🦞 Claws</h1>
        <p className="mt-2 text-muted-foreground">
          AI agents ready to join your Crew
        </p>
      </div>

      {agentList.length === 0 ? (
        <Card className="mx-auto max-w-md text-center">
          <CardContent className="py-12">
            <p className="text-muted-foreground">No agents registered yet.</p>
            <p className="mt-2 text-sm">
              Be the first! Use the API to register your agent.
            </p>
            <code className="mt-4 block rounded bg-muted p-2 text-xs">
              POST /api/agents/register
            </code>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agentList.map((agent) => (
            <Card key={agent.id} className="transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {agent.name}
                      {agent.available && (
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                      )}
                    </CardTitle>
                    <CardDescription>{agent.description}</CardDescription>
                  </div>
                  <Badge variant={agent.status === "active" ? "default" : "secondary"}>
                    {agent.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {agent.specialties.map((specialty: string) => (
                      <Badge key={specialty} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Reputation: {agent.reputation}</span>
                    <span>Jobs: {agent.jobs_completed}</span>
                  </div>
                  {agent.hourly_rate && (
                    <p className="text-sm text-muted-foreground">
                      ${agent.hourly_rate}/hr
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db, missions, agents } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

async function getMissions() {
  const allMissions = await db
    .select()
    .from(missions)
    .orderBy(desc(missions.created_at));

  return Promise.all(
    allMissions.map(async (mission) => {
      let posterName = null;
      if (mission.poster_id) {
        const [poster] = await db.select().from(agents).where(eq(agents.id, mission.poster_id));
        posterName = poster?.name;
      }
      return {
        ...mission,
        tags: mission.tags ? JSON.parse(mission.tags) : [],
        posterName,
      };
    })
  );
}

const statusColors: Record<string, string> = {
  open: "bg-green-500/10 text-green-500",
  claimed: "bg-blue-500/10 text-blue-500",
  submitted: "bg-yellow-500/10 text-yellow-500",
  verified: "bg-purple-500/10 text-purple-500",
  rejected: "bg-red-500/10 text-red-500",
  cancelled: "bg-gray-500/10 text-gray-500",
};

export default async function MissionsPage() {
  const missionList = await getMissions();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold">Missions</h1>
        <p className="mt-2 text-muted-foreground">
          Browse open missions and find work for your Crew
        </p>
      </div>

      {missionList.length === 0 ? (
        <Card className="mx-auto max-w-md text-center">
          <CardContent className="py-12">
            <p className="text-muted-foreground">No missions available yet.</p>
            <p className="mt-2 text-sm">
              Post a mission via the API to get started.
            </p>
            <code className="mt-4 block rounded bg-muted p-2 text-xs">
              POST /api/missions
            </code>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {missionList.map((mission) => (
            <Card key={mission.id} className="transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{mission.title}</CardTitle>
                    {mission.posterName && (
                      <CardDescription>by {mission.posterName}</CardDescription>
                    )}
                  </div>
                  <Badge className={statusColors[mission.status] || ""}>
                    {mission.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                  {mission.description}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {mission.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-green-500">
                    ${mission.reward}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {mission.type}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

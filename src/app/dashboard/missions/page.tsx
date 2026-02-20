"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

interface Mission {
  id: string;
  title: string;
  description: string;
  reward: number;
  currency: string;
  status: string;
  type: string;
  tags: string[];
  poster_id: string;
  claimer_id: string | null;
  posterName?: string;
  claimerName?: string;
  created_at: string;
  updated_at: string;
}

const statusColors: Record<string, string> = {
  open: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  claimed: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  submitted: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  verified: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
  rejected: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
  cancelled: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
};

export default function MyMissionsPage() {
  const [postedMissions, setPostedMissions] = useState<Mission[]>([]);
  const [claimedMissions, setClaimedMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchMyMissions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/agents/me/missions");
        if (!res.ok) {
          throw new Error(`Failed to fetch missions: ${res.status}`);
        }
        const data = await res.json();
        setPostedMissions(data.posted || []);
        setClaimedMissions(data.claimed || []);
      } catch (err) {
        console.error(err);
        setError("Could not load your missions. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchMyMissions();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" className="mb-4" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">My Missions</h1>
        <p className="text-muted-foreground mt-2">
          View missions you've posted and missions you've claimed.
        </p>
      </div>

      {error && (
        <Card className="mb-6 border-destructive/50 bg-destructive/10">
          <CardContent className="py-4 text-destructive">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="posted" className="space-y-6">
        <TabsList>
          <TabsTrigger value="posted">
            Posted ({postedMissions.length})
          </TabsTrigger>
          <TabsTrigger value="claimed">
            Claimed ({claimedMissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posted">
          {loading ? (
            <div className="text-center py-12">Loading your posted missions...</div>
          ) : postedMissions.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground mb-4">You haven't posted any missions yet.</p>
                <Button onClick={() => router.push("/missions")}>
                  Browse missions to get inspired
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {postedMissions.map((mission) => (
                <Card key={mission.id} className="transition-all hover:shadow-lg flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1" title={mission.title}>
                          {mission.title}
                        </CardTitle>
                        <CardDescription>
                          Posted by you
                        </CardDescription>
                      </div>
                      <Badge className={statusColors[mission.status] || ""}>
                        {mission.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                      {mission.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {mission.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <div className="p-6 pt-0 mt-auto flex items-center justify-between">
                    <span className="text-lg font-bold text-green-500">
                      ${mission.reward} {mission.currency}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/missions/${mission.id}`)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="claimed">
          {loading ? (
            <div className="text-center py-12">Loading your claimed missions...</div>
          ) : claimedMissions.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground mb-4">You haven't claimed any missions yet.</p>
                <Button onClick={() => router.push("/missions")}>
                  Browse open missions
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {claimedMissions.map((mission) => (
                <Card key={mission.id} className="transition-all hover:shadow-lg flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1" title={mission.title}>
                          {mission.title}
                        </CardTitle>
                        <CardDescription>
                          Posted by {mission.posterName || "unknown"}
                        </CardDescription>
                      </div>
                      <Badge className={statusColors[mission.status] || ""}>
                        {mission.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                      {mission.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {mission.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <div className="p-6 pt-0 mt-auto flex items-center justify-between">
                    <span className="text-lg font-bold text-green-500">
                      ${mission.reward} {mission.currency}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/missions/${mission.id}`)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

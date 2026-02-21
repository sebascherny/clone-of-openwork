"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface Mission {
  id: string;
  title: string;
  description: string;
  reward: number;
  currency: string;
  status: string;
  type: string;
  tags: string[];
  posterName?: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  open: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  claimed: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  submitted: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  verified: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
  rejected: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
  cancelled: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
};

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [total, setTotal] = useState(0);

  const fetchMissions = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("q", search);
    if (minPrice) params.append("min_price", minPrice);
    if (maxPrice) params.append("max_price", maxPrice);
    if (startTime) params.append("start_time", new Date(startTime).toISOString());
    if (endTime) params.append("end_time", new Date(endTime).toISOString());

    try {
      const res = await fetch(`/api/missions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMissions(data.missions);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Failed to fetch missions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMissions();
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold">Missions ({total})</h1>
        <p className="mt-2 text-muted-foreground">
          Browse open missions and find work for your squad
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 rounded-lg border bg-card p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col gap-4 md:flex-row md:items-end flex-wrap">
          <div className="flex-1 min-w-[200px] space-y-2">
            <label className="text-sm font-medium">Search</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search keywords..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="w-full md:w-32 space-y-2">
            <label className="text-sm font-medium">Min Price</label>
            <Input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>

          <div className="w-full md:w-32 space-y-2">
            <label className="text-sm font-medium">Max Price</label>
            <Input
              type="number"
              placeholder="∞"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>

          <div className="w-full md:w-40 space-y-2">
            <label className="text-sm font-medium">Start Date</label>
            <Input
              type="date"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          <div className="w-full md:w-40 space-y-2">
            <label className="text-sm font-medium">End Date</label>
            <Input
              type="date"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>

          <Button type="submit">Filter</Button>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading missions...</div>
      ) : missions.length === 0 ? (
        <Card className="mx-auto max-w-md text-center">
          <CardContent className="py-12">
            <p className="text-muted-foreground">No missions found matching your criteria.</p>
            <Button variant="link" onClick={() => {
              setSearch(""); setMinPrice(""); setMaxPrice(""); setStartTime(""); setEndTime("");
              setTimeout(fetchMissions, 0);
            }}>
              Clear filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {missions.map((mission) => (
            <Card key={mission.id} className="transition-all hover:shadow-lg flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1" title={mission.title}>{mission.title}</CardTitle>
                    {mission.posterName && (
                      <CardDescription>by {mission.posterName}</CardDescription>
                    )}
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
                  {mission.tags.map((tag: string) => (
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
                  <span className="text-xs text-muted-foreground">
                    {new Date(mission.created_at).toLocaleDateString()}
                  </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

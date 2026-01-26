import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminLayout from "../components/AdminLayout";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

type MatchStatus = "pending" | "approved" | "rejected";

interface AdminMatch {
  match_id: string;
  query_image: string;
  matched_image: string;
  final_person_id: string;
  name: string;
  state: string;
  district: string;
  confidence: number;
  status: MatchStatus;
  created_at: string;
}

const confidenceColor = (c: number) => {
  if (c >= 80) return "bg-success text-success-foreground";
  if (c >= 65) return "bg-warning text-warning-foreground";
  return "bg-destructive text-destructive-foreground";
};

const AdminMatches = () => {
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | MatchStatus>("all");
  const [minConfidence, setMinConfidence] = useState(70);
  const [page, setPage] = useState(1);

  const pageSize = 6;

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/search?top=6`, {
        method: "POST",
      });
      const data = await response.json();
      const mapped = data.results.map((r: any) => ({
        match_id: `${r.final_person_id}_${Date.now()}`,
        query_image: data.query_image || "/placeholder.jpg",
        matched_image: r.image_file
          ? `${BASE_URL}/uploads/${r.image_file}`
          : "/placeholder.jpg",
        final_person_id: r.final_person_id,
        name: r.name,
        state: r.state,
        district: r.district,
        confidence: r.confidence,
        status: "pending" as MatchStatus,
        created_at: new Date().toISOString(),
      }));
      setMatches(mapped);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, minConfidence]);

  const filtered = matches.filter((m) => {
    const byStatus = statusFilter === "all" || m.status === statusFilter;
    const byConfidence = m.confidence >= minConfidence;
    return byStatus && byConfidence;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <Navbar />
      <AdminLayout title="Admin Matches">
        <div className="space-y-6">
          {/* Filters */}
          <Card className="p-4 flex flex-col md:flex-row gap-4">
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as any)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Min Confidence
              </span>
              <input
                type="number"
                min={0}
                max={100}
                value={minConfidence}
                onChange={(e) => setMinConfidence(Number(e.target.value))}
                className="w-20 border rounded px-2 py-1"
              />
            </div>
          </Card>

          {loading && (
            <div className="text-sm text-muted-foreground">
              Loading matches…
            </div>
          )}

          {/* Match Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((m) => (
              <Card key={m.match_id} className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <img
                    src={m.query_image}
                    className="rounded object-cover aspect-square"
                  />
                  <img
                    src={m.matched_image}
                    className="rounded object-cover aspect-square"
                  />
                </div>

                <div>
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {m.district}, {m.state}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Case ID: {m.final_person_id}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge className={`text-xs ${confidenceColor(m.confidence)}`}>
                    {m.confidence}%
                  </Badge>
                  <Badge variant="secondary">{m.status.toUpperCase()}</Badge>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={m.status !== "pending"}
                    onClick={() => {
                      setMatches((prev) =>
                        prev.map((x) =>
                          x.match_id === m.match_id
                            ? { ...x, status: "approved" }
                            : x
                        )
                      );
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    disabled={m.status !== "pending"}
                    onClick={() =>
                      setMatches((prev) =>
                        prev.map((x) =>
                          x.match_id === m.match_id
                            ? { ...x, status: "rejected" }
                            : x
                        )
                      )
                    }
                  >
                    Reject
                  </Button>
                </div>

                {m.status === "approved" && (
                  <Button size="sm" variant="outline" className="w-full">
                    Escalate to Police
                  </Button>
                )}
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {/* Pagination */}
          <div className="flex justify-center items-center gap-3 mt-8">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </Button>

            <span className="text-sm px-3 py-1">Page {page}</span>

            <Button
              variant="outline"
              size="sm"
              disabled={page * pageSize >= filtered.length}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </AdminLayout>
      <Footer />
    </>
  );
};

export default AdminMatches;

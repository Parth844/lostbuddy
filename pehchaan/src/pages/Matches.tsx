import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ---------- Match type from backend ----------
interface Match {
  FinalPersonId: string;
  score: number;
  name?: string;
  sex?: string;
  birth_year?: number;
  state?: string;
  district?: string;
  police_station?: string;
  tracing_status?: string;
  image_file?: string;
}
// -------------------------------------------

const Matches = () => {
  const location = useLocation();

  // ✅ Safe extraction (refresh-safe)
  const matches: Match[] = Array.isArray(location.state?.matches)
    ? location.state.matches
    : [];

  // Case: user opens /matches directly
  if (matches.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto max-w-3xl py-8 px-4">
          <Card className="p-6 bg-secondary/30">
            <h2 className="text-xl font-semibold mb-2">No Results Found</h2>
            <p className="text-muted-foreground mb-4">
              Please upload a photo first to search for matches.
            </p>
            <Link to="/upload">
              <Button>Go to Upload</Button>
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <Card className="p-6 mb-8 bg-success/10 border-success/20">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Match Results</h2>
                <p className="text-muted-foreground">
                  {matches.length} match(es) found in the database.
                </p>
              </div>
            </div>
          </Card>

          {/* Match List */}
          <div className="space-y-4">
            {matches.map((match, index) => {
              const confidence = match.score * 100;
              const age = match.birth_year
                ? new Date().getFullYear() - match.birth_year
                : undefined;

              return (
                <Card
                  key={match.FinalPersonId}
                  className="p-6 hover:shadow-lg transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Photo */}
                    <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                      <img
                        src={
                          match.image_file
                            ? `${
                                import.meta.env.VITE_API_BASE_URL ||
                                "http://127.0.0.1:8000"
                              }/uploads/${match.image_file}`
                            : "/placeholder.jpg"
                        }
                        alt="Matched Person"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Information */}
                    <div className="flex-1 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold">
                            {match.name || "Unknown Person"}
                          </h3>

                          {age !== undefined && (
                            <p className="text-muted-foreground">
                              {age} years old
                            </p>
                          )}

                          {match.state && match.district && (
                            <p className="text-sm text-muted-foreground">
                              {match.district}, {match.state}
                            </p>
                          )}
                        </div>

                        <Badge className="bg-primary text-primary-foreground">
                          {match.tracing_status || "Match"}
                        </Badge>
                      </div>

                      {/* Confidence */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Match Confidence
                          </span>
                          <span className="font-semibold">
                            {confidence.toFixed(2)}%
                          </span>
                        </div>
                        <Progress value={confidence} className="h-2" />
                      </div>

                      {/* Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                          to={`/cases/${match.FinalPersonId}`}
                          className="flex-1"
                        >
                          <Button className="w-full">View Details</Button>
                        </Link>

                        <Button variant="outline" className="flex-1">
                          Report This Match
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Footer Notice */}
          <Card className="p-6 mt-6 bg-secondary/30">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Not the right match?</p>
                <p>
                  You can{" "}
                  <Link
                    to="/report/missing"
                    className="text-primary hover:underline"
                  >
                    report a missing person
                  </Link>{" "}
                  or{" "}
                  <Link
                    to="/report/found"
                    className="text-primary hover:underline"
                  >
                    report a found person
                  </Link>{" "}
                  to help improve our system.
                </p>
              </div>
            </div>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link to="/upload" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                Try Another Photo
              </Button>
            </Link>

            <Link to="/cases" className="flex-1">
              <Button size="lg" className="w-full">
                Browse All Cases
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Matches;

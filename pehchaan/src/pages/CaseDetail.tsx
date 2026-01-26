import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Phone,
  Ruler,
  Shield,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { format } from "date-fns";
import { Cake } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const CaseDetail = () => {
  const { id } = useParams();
  const [caseData, setCaseData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${BASE_URL}/cases/${id}`);
        if (!res.ok) throw new Error("Case not found");

        const json = await res.json();
        const c = json.data;

        const birthYear = c.birth_year;

        setCaseData({
          id: c.final_person_id,
          name: c.name,
          gender: c.sex,
          status: c.tracing_status,
          city: c.district,
          state: c.state,
          height: "Unknown",
          photo: c.image_file
            ? `${BASE_URL}/uploads/${c.image_file}`
            : "/placeholder.jpg",

          date_of_birth: birthYear ? `01-01-${birthYear}` : "Unknown",
          age: birthYear ? new Date().getFullYear() - birthYear : null,

          description: "Details provided by reporting authority.",
          contact: "100",
          created_at: new Date(),
        });
      } catch (err) {
        console.error(err);
        setCaseData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [id]);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading case...
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Case Not Found
            </h2>
            <p className="text-muted-foreground">
              The case you're looking for doesn't exist.
            </p>
            <Link to="/cases">
              <Button>Back to Cases</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    if (!status) return "bg-secondary text-secondary-foreground";
    const s = status.toLowerCase();

    if (s.includes("untraced"))
      return "bg-destructive text-destructive-foreground";

    if (s.includes("traced")) return "bg-success text-success-foreground";

    return "bg-secondary text-secondary-foreground";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-5xl">
          <Link to="/cases">
            <Button variant="ghost" className="mb-6 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Cases
            </Button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="overflow-hidden">
                <div className="aspect-square">
                  <img
                    src={caseData.photo}
                    alt={caseData.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <Badge className={getStatusColor(caseData.status)}>
                    {caseData.status.toUpperCase()}
                  </Badge>
                  <Badge className="bg-success text-success-foreground gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified by Police
                  </Badge>
                </div>
              </Card>

              <Card className="p-4 space-y-3">
                <h3 className="font-semibold text-card-foreground">
                  Contact Information
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-primary" />
                  <a href="tel:100" className="text-primary hover:underline">
                    100
                  </a>
                </div>
                <Button className="w-full gap-2">
                  <Phone className="h-4 w-4" />
                  Call Now
                </Button>
              </Card>
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-card-foreground mb-2">
                    {caseData.name}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Case ID: {caseData.id}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs">Gender</div>
                      <div className="font-medium text-card-foreground">
                        {caseData.gender}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Cake className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs">Date of Birth</div>
                      <div className="font-medium text-card-foreground">
                        {caseData.date_of_birth || "Unknown"}
                        {caseData.age && (
                          <span className="text-sm text-muted-foreground ml-2">
                            ({caseData.age} yrs)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs">Location</div>
                      <div className="font-medium text-card-foreground">
                        {caseData.city}, {caseData.state}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs">Reported On</div>
                      <div className="font-medium text-card-foreground">
                        {caseData.created_at
                          ? format(new Date(caseData.created_at), "PPP")
                          : "Unknown"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Ruler className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs">Height</div>
                      <div className="font-medium text-card-foreground">
                        {caseData.height}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 space-y-3">
                <h3 className="text-lg font-semibold text-card-foreground">
                  Description
                </h3>
                <p className="text-muted-foreground">{caseData.description}</p>
              </Card>

              <Card className="p-6 space-y-3">
                <h3 className="text-lg font-semibold text-card-foreground">
                  Distinguishing Marks
                </h3>
                <p className="text-muted-foreground">
                  {caseData.distinguishing_marks}
                </p>
              </Card>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="flex-1" size="lg">
                  I Have Information
                </Button>
                <Button variant="outline" className="flex-1" size="lg">
                  Share This Case
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CaseDetail;

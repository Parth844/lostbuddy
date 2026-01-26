import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatsCard from "@/components/StatsCard";
import casesData from "@/data/cases.json";

const PoliceDashboard = () => {
  const pendingCases = casesData.filter(c => c.police_verification === "pending");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8">Police Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatsCard title="Pending Verification" value={pendingCases.length} icon={Clock} variant="warning" />
            <StatsCard title="Verified Today" value="3" icon={CheckCircle2} variant="success" />
            <StatsCard title="Active Cases" value="24" icon={AlertTriangle} variant="destructive" />
            <StatsCard title="This Week" value="+8" icon={TrendingUp} />
          </div>
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Pending Verification</h2>
            <div className="space-y-4">
              {pendingCases.slice(0, 5).map(c => (
                <div key={c.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <img src={c.photo} alt={c.name} className="h-12 w-12 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-sm text-muted-foreground">{c.city}, {c.state}</p>
                    </div>
                  </div>
                  <Link to={`/cases/${c.id}`}>
                    <Button size="sm">Review</Button>
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PoliceDashboard;

import { Link } from "react-router-dom";
import { Search, FilePlus2, Users, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-background to-muted">
          <div className="container mx-auto max-w-5xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Reuniting Families Through Technology
            </h1>
            <p className="text-lg text-muted-foreground mb-10 max-w-3xl mx-auto">
              Upload a photo, search our database, and help reconnect missing
              persons with their loved ones using AI-powered facial recognition.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/upload">
                <Button size="lg" className="gap-2">
                  <Search className="h-5 w-5" />
                  Search by Photo
                </Button>
              </Link>

              <Link to="/report/missing">
                <Button size="lg" variant="outline" className="gap-2">
                  <FilePlus2 className="h-5 w-5" />
                  Report Missing
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Face Search</h3>
                <p className="text-muted-foreground">
                  Advanced facial recognition helps identify potential matches
                  in seconds.
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-success" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Verified Cases</h3>
                <p className="text-muted-foreground">
                  All cases are verified by authorities to ensure accuracy and
                  trust.
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-warning/10 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-warning" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Real-time Updates
                </h3>
                <p className="text-muted-foreground">
                  Get notified instantly when there are updates or potential
                  matches.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 bg-secondary/30">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">
              Together, We Can Bring Them Home
            </h2>
            <p className="text-muted-foreground mb-8">
              Every report and search increases the chances of reuniting
              families.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/report/found">
                <Button size="lg" className="gap-2">
                  <Users className="h-5 w-5" />
                  Report Found Person
                </Button>
              </Link>

              <Link to="/cases">
                <Button size="lg" variant="outline">
                  Browse Cases
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const ReportFound = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      const res = await fetch(`${BASE_URL}/report/found`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to submit report");

      const data = await res.json();

      toast({
        title: "Report submitted successfully",
        description: data?.case_id
          ? `Case ID: ${data.case_id}`
          : "Authorities have been notified.",
      });

      navigate("/cases");
    } catch (err) {
      console.error("Found report error:", err);
      toast({
        title: "Submission failed",
        description:
          err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-success" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Report Found Person
              </h1>
            </div>
            <p className="text-muted-foreground">
              Help us identify and reunite a found person with their family
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="p-6 space-y-6">
              <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                <p className="text-sm text-foreground">
                  <strong>Thank you for helping!</strong> Please provide
                  accurate information.
                </p>
              </div>

              {/* Person Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-card-foreground">
                  Person Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input name="name" placeholder="Name (if known)" />
                  <Input
                    name="age"
                    type="number"
                    placeholder="Approximate Age *"
                    required
                  />

                  <Select name="gender" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input name="height" placeholder="Approximate Height" />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-card-foreground">
                  Where Found
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input name="city" placeholder="City *" required />
                  <Input name="state" placeholder="State *" required />
                  <Input
                    name="found_location"
                    placeholder="Detailed Location *"
                    required
                    className="md:col-span-2"
                  />
                  <Input
                    type="datetime-local"
                    name="found_datetime"
                    required
                    className="md:col-span-2"
                  />
                </div>
              </div>

              {/* Condition */}
              <div className="space-y-4">
                <Select name="condition" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Person's Condition *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="healthy">Healthy</SelectItem>
                    <SelectItem value="injured">Injured</SelectItem>
                    <SelectItem value="disoriented">Disoriented</SelectItem>
                    <SelectItem value="unconscious">Unconscious</SelectItem>
                    <SelectItem value="unable_to_communicate">
                      Unable to communicate
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Textarea
                  name="description"
                  placeholder="Physical description, clothing, marks..."
                  rows={4}
                  required
                />

                <Input name="marks" placeholder="Distinguishing features" />
                <Input name="belongings" placeholder="Personal belongings" />
                <Input type="file" name="photo" accept="image/*" required />
              </div>

              {/* Reporter */}
              <div className="space-y-4">
                <Input
                  name="reporter_name"
                  placeholder="Your Name *"
                  required
                />
                <Input name="phone" placeholder="Contact Number *" required />
                <Input name="email" placeholder="Email (optional)" />
              </div>

              {/* Current Location */}
              <div className="space-y-4">
                <Select name="current_location" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Current Location of Person *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="police_station">
                      Police Station
                    </SelectItem>
                    <SelectItem value="hospital">Hospital</SelectItem>
                    <SelectItem value="shelter">Shelter Home</SelectItem>
                    <SelectItem value="with_reporter">With Reporter</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  name="current_address"
                  placeholder="Current Address / Facility *"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Found Person Report"}
              </Button>
            </Card>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReportFound;

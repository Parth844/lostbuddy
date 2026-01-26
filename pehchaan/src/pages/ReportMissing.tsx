import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
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

const ReportMissing = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const uploadedPhoto = (location.state as any)?.uploadedPhoto || null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gender, setGender] = useState("");
  const [manualPhoto, setManualPhoto] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      if (manualPhoto) {
        formData.set("photo", manualPhoto);
      } else if (uploadedPhoto) {
        formData.set("photo", uploadedPhoto);
      }

      const res = await fetch(`${BASE_URL}/report/missing`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to submit report");

      const data = await res.json();

      toast({
        title: "Report submitted successfully",
        description: data?.case_id
          ? `Case ID: ${data.case_id}`
          : "Police authorities have been notified.",
      });

      if (data?.case_id) {
        navigate(`/cases/${data.case_id}`);
      } else {
        navigate("/cases");
      }
    } catch (err) {
      console.error("Missing report error:", err);
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
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Report Missing Person
              </h1>
            </div>
            <p className="text-muted-foreground">
              Please provide as much detail as possible to help locate the
              missing person
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="p-6 space-y-6">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm text-foreground">
                  <strong>Emergency?</strong> Call{" "}
                  <a
                    href="tel:100"
                    className="text-destructive font-semibold hover:underline"
                  >
                    100
                  </a>{" "}
                  immediately before filing this report.
                </p>
              </div>

              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-card-foreground">
                  Personal Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" name="name" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth *</Label>
                    <Input
                      id="date_of_birth"
                      name="date_of_birth"
                      type="date"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Gender *</Label>
                    <div className="space-y-2">
                      <Label>Gender *</Label>

                      <Select onValueChange={setGender}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* ✅ REQUIRED hidden input so FormData works */}
                      <input
                        type="hidden"
                        name="gender"
                        value={gender}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Height</Label>
                    <Input id="height" name="height" />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-card-foreground">
                  Location Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input name="district" placeholder="District *" required />
                  <Input name="state" placeholder="State *" required />
                  <Input
                    name="police_station"
                    placeholder="Police Station *"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <div className="space-y-3">
                  {uploadedPhoto && !manualPhoto && (
                    <div className="space-y-2">
                      <Label>Uploaded Photo</Label>
                      <img
                        src={URL.createObjectURL(uploadedPhoto)}
                        alt="Uploaded"
                        className="w-40 h-40 object-cover rounded-md border"
                      />
                    </div>
                  )}

                  {manualPhoto && (
                    <div className="space-y-2">
                      <Label>Re-uploaded Photo</Label>
                      <img
                        src={URL.createObjectURL(manualPhoto)}
                        alt="Re-uploaded"
                        className="w-40 h-40 object-cover rounded-md border"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label>
                      {uploadedPhoto ? "Change Photo" : "Upload Photo"} *
                    </Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setManualPhoto(
                          e.target.files ? e.target.files[0] : null
                        )
                      }
                      required={!uploadedPhoto}
                    />
                  </div>
                </div>
              </div>

              {/* Contact */}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Submitting..."
                  : "Submit Missing Person Report"}
              </Button>
            </Card>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReportMissing;

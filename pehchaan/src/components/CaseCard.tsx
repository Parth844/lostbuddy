import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Cake } from "lucide-react";

interface CaseCardProps {
  id: string;
  name: string;
  gender?: string;
  city: string;
  state: string;
  status?: string;
  photo: string;
  date_of_birth?: string; // ✅ ADD
  last_seen?: string | null;
  description?: string;
}

const CaseCard = ({
  id,
  name,
  gender,
  city,
  state,
  status,
  photo,
  date_of_birth, // ✅ FIX
  last_seen,
  description,
}: CaseCardProps) => {
  // ✅ STATUS COLORS (backend-safe)
  const getStatusColor = (status?: string) => {
    if (!status) return "bg-secondary text-secondary-foreground";

    const s = status.toLowerCase();
    if (s.includes("untraced"))
      return "bg-destructive text-destructive-foreground";
    if (s.includes("traced")) return "bg-success text-success-foreground";

    return "bg-secondary text-secondary-foreground";
  };

  // ✅ SAFE DATE HANDLING (NO CRASH EVER)
  let lastSeenText = "Last seen date not available";
  if (last_seen) {
    const d = new Date(last_seen);
    if (!isNaN(d.getTime())) {
      lastSeenText = `Last seen ${formatDistanceToNow(d, {
        addSuffix: true,
      })}`;
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card hover:shadow-lg transition-all duration-300 animate-fade-in">
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={photo}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg";
          }}
        />
        <Badge className={`absolute top-2 right-2 ${getStatusColor(status)}`}>
          {status?.toUpperCase() || "UNKNOWN"}
        </Badge>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-card-foreground line-clamp-1">
            {name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <User className="h-3.5 w-3.5" />
            <span>{gender || "Unknown"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Cake className="h-3.5 w-3.5" />
          <span>DOB: {date_of_birth || "Unknown"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>
            {city}, {state}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{lastSeenText}</span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {description || "No description available"}
        </p>

        <Link to={`/cases/${id}`} className="block">
          <Button className="w-full" variant="outline">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CaseCard;

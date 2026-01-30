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

}: CaseCardProps) => {
  // ✅ STATUS COLORS (backend-safe)
  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-100 text-gray-600 border-gray-200";

    const s = status.toLowerCase();
    if (s.includes("untraced"))
      return "bg-red-100 text-red-700 border-red-200";
    if (s.includes("traced") || s.includes("matched")) return "bg-green-100 text-green-700 border-green-200";
    if (s.includes("verified")) return "bg-blue-100 text-blue-700 border-blue-200";

    return "bg-gray-100 text-gray-600 border-gray-200";
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
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-xl transition-all duration-300 animate-fade-in flex flex-col h-full">
      <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
        <img
          src={photo}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg";
          }}
        />
        <Badge className={`absolute top-3 right-3 px-3 py-1 text-xs font-semibold border ${getStatusColor(status)}`}>
          {status?.toUpperCase() || "UNKNOWN"}
        </Badge>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="mb-4">
          <h3 className="font-bold text-lg text-[#0B1A3E] line-clamp-1 mb-1">
            {name}
          </h3>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {gender || "Unknown"}</span>
            <span className="flex items-center gap-1"><Cake className="h-3.5 w-3.5" /> {date_of_birth || "Unknown"}</span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-[#1E6BFF]" />
            <span className="line-clamp-1">
              {city}, {state}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4 text-[#1E6BFF]" />
            <span className="line-clamp-1">{lastSeenText}</span>
          </div>
        </div>

        <div className="mt-auto">
          <Link to={`/cases/${id}`} className="block">
            <Button className="w-full bg-[#1E6BFF] hover:bg-[#1a5fe6] text-white shadow-md group-hover:shadow-lg transition-all">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CaseCard;

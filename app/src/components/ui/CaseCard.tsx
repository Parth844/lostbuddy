import { Link } from "react-router-dom";
import { MapPin, Calendar, User, Cake } from "lucide-react";

interface CaseCardProps {
  id: string;
  name: string;
  gender?: string;
  city: string;
  state: string;
  status?: string;
  photo: string;
  date_of_birth?: string;
  last_seen?: string | null;
  age?: number;
}

const getStatusStyle = (status?: string) => {
  if (!status) return { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' };
  const s = status.toLowerCase();
  if (s.includes('untraced') || s.includes('missing'))
    return { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-500' };
  if (s.includes('traced') || s.includes('matched'))
    return { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' };
  if (s.includes('verified'))
    return { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500' };
  return { bg: 'bg-slate-100',   text: 'text-slate-600',   dot: 'bg-slate-400' };
};

const CaseCard = ({ id, name, gender, city, state, status, photo, date_of_birth, last_seen, age }: CaseCardProps) => {
  const st = getStatusStyle(status);

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-[0_1px_4px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.10)] hover:-translate-y-1 transition-all duration-200 flex flex-col h-full">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={photo}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg"; }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />

        {/* Status badge */}
        <span className={`absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border backdrop-blur-sm ${st.bg} ${st.text} border-white/40`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${st.dot}`} />
          {status?.toUpperCase() || 'UNKNOWN'}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="font-bold text-[15px] text-slate-900 leading-snug truncate">{name}</h3>
          <div className="flex items-center gap-3 mt-1 text-[12px] text-slate-500">
            {gender && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" /> {gender}
              </span>
            )}
            {(age || date_of_birth) && (
              <span className="flex items-center gap-1">
                <Cake className="h-3 w-3" />
                {age ? `${age} yrs` : date_of_birth}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-1.5 text-[12.5px] text-slate-500">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
            <span className="truncate">{city}, {state}</span>
          </div>
          {last_seen && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
              <span className="truncate">Last seen: {last_seen}</span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-slate-100">
          <Link to={`/cases/${id}`} className="block">
            <button className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-white bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-[0_1px_3px_rgba(37,99,235,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] border border-blue-600/30 transition-all duration-150 hover:shadow-[0_4px_12px_rgba(37,99,235,0.35)]">
              View Details
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CaseCard;

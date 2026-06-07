import { Link } from 'react-router-dom';
import { Calendar, MapPin, User, FileText, ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface CaseCardProps {
  caseId: string;
  name: string;
  age?: number;
  gender?: string;
  lastSeenLocation?: string;
  lastSeenDate?: string;
  status: 'submitted' | 'verified' | 'under-review' | 'matched' | 'closed' | 'pending';
  photoUrl?: string;
  reportedDate?: string;
  matchConfidence?: number;
  variant?: 'citizen' | 'police' | 'compact';
}

export default function CaseCard({
  caseId,
  name,
  age,
  gender,
  lastSeenLocation,
  lastSeenDate,
  status,
  photoUrl,
  reportedDate,
  matchConfidence,
  variant = 'citizen',
}: CaseCardProps) {
  if (variant === 'compact') {
    return (
      <Link
        to={`/track?id=${caseId}`}
        className="block bg-white rounded-2xl border border-slate-200/80 p-4 shadow-[0_1px_4px_rgba(15,23,42,0.06)] hover:shadow-[0_4px_16px_rgba(15,23,42,0.09)] hover:-translate-y-0.5 transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-100">
            {photoUrl ? (
              <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-slate-300" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-slate-900 text-sm truncate">{name}</h4>
              <StatusBadge status={status} size="sm" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">{caseId}</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/track?id=${caseId}`}
      className="group block bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-[0_1px_4px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.10)] hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Photo */}
        <div className="sm:w-32 h-32 sm:h-auto bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {photoUrl ? (
            <img src={photoUrl} alt={name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
          ) : (
            <User className="w-10 h-10 text-slate-300" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900 tracking-tight">{name}</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                {age && `${age} yrs`}
                {age && gender && ' · '}
                {gender}
              </p>
            </div>
            <StatusBadge status={status} />
          </div>

          <div className="mt-3 space-y-1.5">
            {lastSeenLocation && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span className="truncate">{lastSeenLocation}</span>
              </div>
            )}
            {lastSeenDate && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span>Last seen: {lastSeenDate}</span>
              </div>
            )}
            {reportedDate && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <FileText className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span>Reported: {reportedDate}</span>
              </div>
            )}
          </div>

          {matchConfidence !== undefined && (
            <div className="mt-4 pt-3.5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-400 font-medium">Match Confidence</span>
                <span className={`text-xs font-bold ${
                  matchConfidence >= 80 ? 'text-emerald-600' :
                  matchConfidence >= 60 ? 'text-amber-600' : 'text-slate-500'
                }`}>
                  {matchConfidence}%
                </span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    matchConfidence >= 80 ? 'bg-emerald-500' :
                    matchConfidence >= 60 ? 'bg-amber-500' : 'bg-slate-400'
                  }`}
                  style={{ width: `${matchConfidence}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-3.5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">{caseId}</span>
            <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 group-hover:gap-1.5 transition-all">
              View Details <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

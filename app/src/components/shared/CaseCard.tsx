import { Link } from 'react-router-dom';
import { Calendar, MapPin, User, FileText } from 'lucide-react';
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
        className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {photoUrl ? (
              <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-[#0B1A3E] truncate">{name}</h4>
              <StatusBadge status={status} size="sm" />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Case ID: {caseId}</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      to={`/track?id=${caseId}`}
      className="block bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Photo */}
        <div className="sm:w-32 h-32 sm:h-auto bg-gray-100 flex items-center justify-center flex-shrink-0">
          {photoUrl ? (
            <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-12 h-12 text-gray-300" />
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-[#0B1A3E]">{name}</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {age && `${age} years`}
                {age && gender && ' • '}
                {gender}
              </p>
            </div>
            <StatusBadge status={status} />
          </div>
          
          <div className="mt-4 space-y-2">
            {lastSeenLocation && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="truncate">{lastSeenLocation}</span>
              </div>
            )}
            {lastSeenDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Last seen: {lastSeenDate}</span>
              </div>
            )}
            {reportedDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="w-4 h-4 text-gray-400" />
                <span>Reported: {reportedDate}</span>
              </div>
            )}
          </div>
          
          {matchConfidence !== undefined && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Match Confidence</span>
                <span className={`font-semibold ${
                  matchConfidence >= 80 ? 'text-green-600' : 
                  matchConfidence >= 60 ? 'text-amber-600' : 'text-gray-600'
                }`}>
                  {matchConfidence}%
                </span>
              </div>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    matchConfidence >= 80 ? 'bg-green-500' : 
                    matchConfidence >= 60 ? 'bg-amber-500' : 'bg-gray-400'
                  }`}
                  style={{ width: `${matchConfidence}%` }}
                />
              </div>
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400 font-mono">{caseId}</span>
            <span className="text-sm text-[#1E6BFF] font-medium">View Details →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

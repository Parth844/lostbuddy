type StatusType =
  | 'submitted'
  | 'verified'
  | 'under-review'
  | 'matched'
  | 'closed'
  | 'pending'
  | 'no-match'
  | 'approved'
  | 'rejected';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const statusConfig: Record<StatusType, { label: string; dot: string; bg: string; text: string }> = {
  submitted:    { label: 'Submitted',    dot: 'bg-slate-400',  bg: 'bg-slate-100',         text: 'text-slate-600' },
  verified:     { label: 'Verified',     dot: 'bg-blue-500',   bg: 'bg-blue-50',            text: 'text-blue-700' },
  'under-review': { label: 'Under Review', dot: 'bg-amber-400', bg: 'bg-amber-50',          text: 'text-amber-700' },
  matched:      { label: 'Matched',      dot: 'bg-emerald-500', bg: 'bg-emerald-50',        text: 'text-emerald-700' },
  closed:       { label: 'Closed',       dot: 'bg-slate-400',  bg: 'bg-slate-100',         text: 'text-slate-500' },
  pending:      { label: 'Pending',      dot: 'bg-amber-400',  bg: 'bg-amber-50',          text: 'text-amber-700' },
  'no-match':   { label: 'No Match',     dot: 'bg-slate-400',  bg: 'bg-slate-100',         text: 'text-slate-500' },
  approved:     { label: 'Approved',     dot: 'bg-emerald-500', bg: 'bg-emerald-50',       text: 'text-emerald-700' },
  rejected:     { label: 'Rejected',     dot: 'bg-red-500',    bg: 'bg-red-50',            text: 'text-red-700' },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const cfg = statusConfig[status];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] gap-1.5',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2 h-2',
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${cfg.bg} ${cfg.text} ${sizeClasses[size]}`}>
      <span className={`rounded-full flex-shrink-0 ${cfg.dot} ${dotSizes[size]}`} />
      {cfg.label}
    </span>
  );
}

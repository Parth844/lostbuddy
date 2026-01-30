import { CheckCircle, Clock, XCircle, Search, Shield } from 'lucide-react';

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

const statusConfig: Record<StatusType, { 
  label: string; 
  bgColor: string; 
  textColor: string;
  icon: React.ElementType;
}> = {
  'submitted': {
    label: 'Submitted',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    icon: Clock,
  },
  'verified': {
    label: 'Verified',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    icon: Shield,
  },
  'under-review': {
    label: 'Under Review',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    icon: Search,
  },
  'matched': {
    label: 'Matched',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    icon: CheckCircle,
  },
  'closed': {
    label: 'Closed',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-500',
    icon: XCircle,
  },
  'pending': {
    label: 'Pending',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    icon: Clock,
  },
  'no-match': {
    label: 'No Match',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-500',
    icon: XCircle,
  },
  'approved': {
    label: 'Approved',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    icon: CheckCircle,
  },
  'rejected': {
    label: 'Rejected',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    icon: XCircle,
  },
};

export default function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full ${config.bgColor} ${config.textColor} ${sizeClasses[size]}`}>
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </span>
  );
}

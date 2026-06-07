import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const location = useLocation();
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('user_role');

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
        // Redirect to appropriate dashboard if logged in but unauthorized for this route
        if (userRole === 'citizen') return <Navigate to="/dashboard/citizen" replace />;
        if (userRole === 'police') return <Navigate to="/dashboard/police" replace />;
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    useEffect(() => {
        if (loading) return; // Wait for auth check to finish

        if (!user) {
            toast.error('⚠️ Please login to access this page', { id: 'admin-login-error' });
        } else if (user.role !== 'admin') {
            toast.error('🚫 Access denied: Admin privileges required', { id: 'admin-access-denied' });
            toast.dismiss('admin-login-error'); // Clear login prompt if role is wrong
        } else {
            // Success - clear all admin-related error toasts
            toast.dismiss('admin-login-error');
            toast.dismiss('admin-access-denied');
        }
    }, [user, loading]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-cream">Loading...</div>;
    }

    // Check if user is logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;

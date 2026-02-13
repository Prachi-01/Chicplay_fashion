import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';

const VendorRoute = ({ children }) => {
    const { user, loading } = useAuth();

    useEffect(() => {
        if (loading) return;

        if (!user || user.role !== 'vendor') {
            toast.error("Access denied: Vendors only", { id: 'vendor-access-denied' });
        } else {
            toast.dismiss('vendor-access-denied');
        }
    }, [user, loading]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user || user.role !== 'vendor') {
        return <Navigate to="/login" replace />;
    }

    // Check local storage or context for detailed vendor status effectively if available
    // For now assuming the user object has what we need or we fetch it.
    // Ideally the checking happens inside the status page or here.

    // Redirect logic handled in Dashboard usually or here?
    // Let's allow access to /vendor routes but specific pages might check status.
    // OR: Redirect strict status checks here.

    // If user object doesn't have vendorStatus, we might need to fetch it.
    // But let's assume registration returns token with vendorStatus payload.

    return children;
};

export default VendorRoute;

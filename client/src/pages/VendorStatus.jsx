import { useEffect, useState } from 'react';
import { Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const VendorStatus = () => {
    const [status, setStatus] = useState(null);
    const [reason, setReason] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await api.get('/vendors/me');
                setStatus(res.data.status);
                setReason(res.data.rejectionReason);

                if (res.data.status === 'Active') {
                    navigate('/vendor/dashboard');
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchStatus();
    }, [navigate]);

    if (!status) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center">
                {status === 'Pending' && (
                    <div className="animate-fade-in">
                        <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Application Pending</h2>
                        <p className="text-gray-500 mb-6">
                            Your vendor application is currently under review. Our team will verify your documents and update you shortly.
                        </p>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm font-medium text-gray-600">
                            Estimated wait time: 24-48 hours
                        </div>
                    </div>
                )}

                {status === 'Rejected' && (
                    <div className="animate-fade-in">
                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Application Rejected</h2>
                        <p className="text-gray-500 mb-6">
                            Unfortunately, we could not approve your application at this time.
                        </p>
                        {reason && (
                            <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-left mb-6">
                                <p className="text-xs font-bold text-red-500 uppercase tracking-wide mb-1">Reason for Rejection</p>
                                <p className="text-red-900 font-medium">{reason}</p>
                            </div>
                        )}
                        <button className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-900 transition">
                            Contact Support
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorStatus;

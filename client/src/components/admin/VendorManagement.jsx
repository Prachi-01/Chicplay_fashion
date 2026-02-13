import { useState, useEffect } from 'react';
import { Check, X, Eye, FileText, Search, User, Store, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const VendorManagement = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [filter, setFilter] = useState('all'); // all, active, pending, rejected

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const res = await api.get('/vendors/admin/all');
            setVendors(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch vendors");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status, reason = null) => {
        try {
            await api.put(`/vendors/admin/${id}/status`, { status, rejectionReason: reason });
            toast.success(`Vendor ${status} successfully`);
            fetchVendors();
            setShowRejectModal(false);
            setRejectReason('');
            setSelectedVendor(null);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const confirmReject = (vendor) => {
        setSelectedVendor(vendor);
        setShowRejectModal(true);
    };

    const filteredVendors = vendors.filter(v =>
        filter === 'all' ? true : v.status.toLowerCase() === filter.toLowerCase()
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-700 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-gray-900">Vendor Management</h2>
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
                    {['all', 'pending', 'active', 'rejected'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg font-bold text-sm capitalize transition-all ${filter === f ? 'bg-black text-white' : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVendors.map(vendor => (
                    <div key={vendor.id} className="bg-white rounded-3xl p-6 shadow-sm border-2 border-transparent hover:border-pink-100 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-bold text-xl">
                                    {vendor.storeName[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{vendor.storeName}</h3>
                                    <p className="text-xs font-bold text-gray-400 capitalize">{vendor.businessType}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(vendor.status)}`}>
                                {vendor.status}
                            </span>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <User size={16} className="text-gray-300" />
                                <span className="font-medium">{vendor.ownerName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Shield size={16} className="text-gray-300" />
                                <span className="font-medium">GST: {vendor.gstNumber || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col gap-1 text-sm text-gray-600">
                                <div className="flex items-center gap-2 mb-1">
                                    <FileText size={16} className="text-gray-300" />
                                    <span className="font-bold text-xs uppercase tracking-wider text-gray-400">Documents:</span>
                                </div>
                                <div className="flex flex-wrap gap-2 pl-6">
                                    {(() => {
                                        try {
                                            const docs = vendor.documents && (typeof vendor.documents === 'string' ? JSON.parse(vendor.documents) : vendor.documents);
                                            if (!docs || Object.values(docs).every(v => !v)) {
                                                return <span className="text-xs text-gray-400 italic">No documents uploaded</span>;
                                            }
                                            return Object.entries(docs).map(([key, url]) => (
                                                url && (
                                                    <a
                                                        key={key}
                                                        href={url.startsWith('http') ? url : `https://${url}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] bg-pink-50 text-pink-600 px-2 py-1 rounded-md hover:bg-pink-100 font-bold transition-colors capitalize"
                                                    >
                                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                                    </a>
                                                )
                                            ));
                                        } catch (e) {
                                            return <span className="text-xs text-red-400 italic">Error loading documents</span>;
                                        }
                                    })()}
                                </div>
                            </div>
                        </div>

                        {vendor.status === 'Pending' && (
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleUpdateStatus(vendor.id, 'Active')}
                                    className="bg-green-500 text-white py-2 rounded-xl font-bold text-sm hover:bg-green-600 transition flex items-center justify-center gap-1"
                                >
                                    <Check size={16} /> Approve
                                </button>
                                <button
                                    onClick={() => confirmReject(vendor)}
                                    className="bg-red-100 text-red-500 py-2 rounded-xl font-bold text-sm hover:bg-red-200 transition flex items-center justify-center gap-1"
                                >
                                    <X size={16} /> Reject
                                </button>
                            </div>
                        )}

                        {vendor.status === 'Active' && (
                            <button
                                onClick={() => confirmReject(vendor)} // Can suspend logic
                                className="w-full bg-gray-100 text-gray-500 py-2 rounded-xl font-bold text-sm hover:bg-gray-200 transition"
                            >
                                Suspend Vendor
                            </button>
                        )}
                    </div>
                ))}

                {filteredVendors.length === 0 && (
                    <div className="md:col-span-full py-12 text-center text-gray-400">
                        <Store size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="font-bold">No vendors found matching this filter.</p>
                    </div>
                )}
            </div>

            {/* Rejection Modal */}
            <AnimatePresence>
                {showRejectModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl p-8 max-w-md w-full mx-4"
                        >
                            <h3 className="text-2xl font-black text-gray-900 mb-4">Reject Application</h3>
                            <p className="text-gray-500 mb-4">Please provide a reason for rejecting <span className="font-bold text-pink-500">{selectedVendor?.storeName}</span>.</p>

                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="w-full h-32 p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-pink-500 resize-none font-medium text-gray-700"
                                placeholder="e.g. Invalid GST document..."
                                autoFocus
                            ></textarea>

                            <div className="flex gap-4 mt-6">
                                <button
                                    onClick={() => setShowRejectModal(false)}
                                    className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(selectedVendor.id, 'Rejected', rejectReason)}
                                    className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition"
                                >
                                    Confirm Reject
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VendorManagement;

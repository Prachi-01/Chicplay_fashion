import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Store, User, CreditCard, FileText, Upload, CheckCircle, ArrowRight } from 'lucide-react';
import api from '../services/api';

import { useAuth } from '../context/AuthContext';

const VendorRegister = () => {
    const { login: authLogin } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        storeName: '',
        businessType: 'Individual',
        ownerName: '',
        email: '',
        phone: '',
        password: '',
        pickupAddress: '',
        bankAccountHolder: '',
        bankAccountNumber: '',
        bankIfsc: '',
        bankName: '',
        panNumber: '',
        gstNumber: ''
    });

    const [files, setFiles] = useState({
        panCard: null,
        gstCertificate: null,
        businessProof: null,
        addressProof: null
    });

    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate all required fields before submission
            const requiredFields = [
                'storeName', 'ownerName', 'email', 'phone', 'password', 'pickupAddress',
                'panNumber', 'bankAccountHolder', 'bankAccountNumber', 'bankIfsc', 'bankName'
            ];

            const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');

            if (missingFields.length > 0) {
                toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
                setLoading(false);
                return;
            }

            console.log('📋 Form Data being submitted:', formData);
            console.log('📎 Files being submitted:', Object.keys(files).filter(key => files[key]));

            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key]) { // Only append non-empty values
                    data.append(key, formData[key]);
                }
            });
            Object.keys(files).forEach(key => {
                if (files[key]) data.append(key, files[key]);
            });

            // Log FormData contents for debugging
            console.log('📦 FormData contents:');
            for (let pair of data.entries()) {
                console.log(`  ${pair[0]}: ${typeof pair[1] === 'object' ? pair[1].name : pair[1]}`);
            }

            const response = await api.post('/vendors/register', data);

            setIsSubmitted(true);
            toast.success(response.data.message || 'Application Submitted!');

            // Sync with AuthContext
            if (response.data.token && response.data.user) {
                authLogin(response.data.user, response.data.token);
            }

            // Optional: Auto-redirect after a delay
            setTimeout(() => {
                navigate('/vendor/dashboard');
            }, 3000);

        } catch (error) {
            console.error("Registration error:", error);
            console.error("Error response:", error.response?.data);
            const message = error.response?.data?.message || error.message || 'Registration failed';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl">
                <div className="text-center">
                    <Store className="mx-auto h-16 w-16 text-pink-500" />
                    <h2 className="mt-6 text-4xl font-black text-gray-900 tracking-tight">
                        Become a ChicPlay Seller
                    </h2>
                    <p className="mt-2 text-lg text-gray-500">
                        Join our marketplace and reach thousands of fashion lovers.
                    </p>
                </div>

                {isSubmitted ? (
                    <div className="text-center py-12 animate-fade-in">
                        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle size={48} />
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 mb-4">Application Submitted!</h3>
                        <p className="text-xl text-gray-500 mb-8">
                            Thank you for joining ChicPlay! Your application is currently under review.
                            We will notify you once your account is activated.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => navigate('/vendor/dashboard')}
                                className="bg-black text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                            >
                                Go to Dashboard <ArrowRight size={20} />
                            </button>
                        </div>
                        <p className="mt-8 text-sm text-gray-400 font-bold uppercase tracking-widest">Redirecting in a few seconds...</p>
                    </div>
                ) : (
                    <>
                        <div className="flex gap-4 mb-8 justify-center">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`h-2 flex-1 rounded-full max-w-[100px] ${step >= i ? 'bg-pink-500' : 'bg-gray-200'}`} />
                            ))}
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {step === 1 && (
                                <div className="space-y-6 animate-fade-in">
                                    <h3 className="text-xl font-bold flex items-center gap-2"><User className="text-pink-500" /> Personal & Business Info</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Store Name</label>
                                            <input required name="storeName" value={formData.storeName} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-300 outline-none font-bold" placeholder="My Fashion Store" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Owner Name</label>
                                            <input required name="ownerName" value={formData.ownerName} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-300 outline-none font-bold" placeholder="John Doe" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Business Type</label>
                                            <select name="businessType" value={formData.businessType} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-300 outline-none font-bold">
                                                <option>Individual</option>
                                                <option>Proprietorship</option>
                                                <option>Pvt Ltd</option>
                                                <option>LLP</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                                            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-300 outline-none font-bold" placeholder="vendor@example.com" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                                            <input required name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-300 outline-none font-bold" placeholder="+91 98765 43210" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                                            <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-300 outline-none font-bold" placeholder="••••••••" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Pickup Address</label>
                                            <textarea required name="pickupAddress" value={formData.pickupAddress} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-300 outline-none font-bold h-24" placeholder="Full address for shipping pickups..." />
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!formData.storeName || !formData.ownerName || !formData.email || !formData.phone || !formData.password || !formData.pickupAddress) {
                                                return toast.error("Please fill in all personal and business fields.");
                                            }
                                            setStep(2);
                                        }}
                                        className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-900 transition flex items-center justify-center gap-2"
                                    >
                                        Next Step <ArrowRight size={20} />
                                    </button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6 animate-fade-in">
                                    <h3 className="text-xl font-bold flex items-center gap-2"><CreditCard className="text-pink-500" /> Banking & Tax Details</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">PAN Number</label>
                                            <input required name="panNumber" value={formData.panNumber} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-300 outline-none font-bold" placeholder="ABCDE1234F" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">GST Number</label>
                                            <input name="gstNumber" value={formData.gstNumber} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-300 outline-none font-bold" placeholder="22AAAAA0000A1Z5" />
                                        </div>

                                        <div className="md:col-span-2 border-t pt-4 mt-2">
                                            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Bank Account</h4>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Account Holder</label>
                                            <input required name="bankAccountHolder" value={formData.bankAccountHolder} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-300 outline-none font-bold" placeholder="As on passbook" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Bank Name</label>
                                            <input required name="bankName" value={formData.bankName} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-300 outline-none font-bold" placeholder="HDFC Bank" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Account Number</label>
                                            <input required name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-300 outline-none font-bold" placeholder="0000000000" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">IFSC Code</label>
                                            <input required name="bankIfsc" value={formData.bankIfsc} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-300 outline-none font-bold" placeholder="HDFC0001234" />
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button type="button" onClick={() => setStep(1)} className="w-full bg-gray-200 text-gray-900 py-4 rounded-xl font-bold hover:bg-gray-300 transition">Back</button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!formData.panNumber || !formData.bankAccountHolder || !formData.bankName || !formData.bankAccountNumber || !formData.bankIfsc) {
                                                    return toast.error("Please fill in all banking and tax details.");
                                                }
                                                setStep(3);
                                            }}
                                            className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-900 transition flex items-center justify-center gap-2"
                                        >
                                            Next Step <ArrowRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6 animate-fade-in">
                                    <h3 className="text-xl font-bold flex items-center gap-2"><FileText className="text-pink-500" /> Upload Documents</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {['panCard', 'gstCertificate', 'businessProof', 'addressProof'].map((field) => (
                                            <div key={field} className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-pink-400 transition cursor-pointer relative">
                                                <input
                                                    type="file"
                                                    name={field}
                                                    id={field}
                                                    onChange={handleFileChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                                {files[field] ? (
                                                    <div className="text-green-600 flex flex-col items-center">
                                                        <CheckCircle size={32} className="mb-2" />
                                                        <p className="font-bold text-sm truncate w-full">{files[field].name}</p>
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-400 flex flex-col items-center">
                                                        <Upload size={32} className="mb-2" />
                                                        <p className="font-bold text-sm uppercase">{field.replace(/([A-Z])/g, ' $1').trim()}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-4">
                                        <button type="button" onClick={() => setStep(2)} className="w-full bg-gray-200 text-gray-900 py-4 rounded-xl font-bold hover:bg-gray-300 transition">Back</button>
                                        <button type="submit" disabled={loading} className="w-full bg-pink-500 text-white py-4 rounded-xl font-bold hover:bg-pink-600 transition disabled:opacity-50">
                                            {loading ? 'Submitting Application...' : 'Submit Application'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default VendorRegister;

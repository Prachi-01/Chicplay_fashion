import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Mail, ShieldCheck, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!email) return toast.error("Please enter your email");

        setIsLoading(true);
        try {
            await axios.post('/api/auth/forgot-password', { email });
            toast.success("OTP sent to your email!");
            setStep(2);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) return toast.error("Please enter 6-digit OTP");

        setIsLoading(true);
        try {
            await axios.post('/api/auth/verify-otp', { email, otp });
            toast.success("OTP Verified!");
            setStep(3);
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid or expired OTP");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");

        setIsLoading(true);
        try {
            await axios.post('/api/auth/reset-password', { email, otp, newPassword });
            toast.success("Password Reset Successful!");
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to reset password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-6 relative overflow-hidden">

            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blush/30 rounded-full blur-[100px] animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-rosegold/10 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>

            <div className="relative z-10 w-full max-w-md bg-white/70 backdrop-blur-2xl border border-white/50 rounded-3xl p-8 shadow-[0_15px_40px_rgba(111,78,55,0.1)]">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-rosegold/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rosegold">
                                    <Mail size={32} />
                                </div>
                                <h2 className="text-3xl font-extrabold text-mocha mb-2">Forgot Password?</h2>
                                <p className="text-mocha/60 text-sm">Enter your email and we'll send you an OTP code.</p>
                            </div>

                            <form onSubmit={handleSendOTP} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-mocha ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white border border-blush/50 rounded-xl px-4 py-3 text-mocha placeholder-mocha/30 focus:outline-none focus:border-rosegold transition-all"
                                        placeholder="player@chicplay.com"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-rosegold text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-pink-700 transition-all shadow-lg"
                                >
                                    {isLoading ? "Sending..." : "Send Reset Code"} <ArrowRight size={20} />
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-500">
                                    <ShieldCheck size={32} />
                                </div>
                                <h2 className="text-3xl font-extrabold text-mocha mb-2">Identity Check</h2>
                                <p className="text-mocha/60 text-sm">Enter the 6-digit code sent to <br /><span className="font-bold text-mocha">{email}</span></p>
                            </div>

                            <form onSubmit={handleVerifyOTP} className="space-y-6">
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                        className="w-full bg-white border-2 border-blush/20 rounded-xl px-4 py-5 text-center text-3xl font-black tracking-[10px] text-mocha focus:outline-none focus:border-rosegold transition-all"
                                        placeholder="000000"
                                        required
                                    />
                                    <p className="text-center text-xs text-mocha/40">Didn't get the code? <button type="button" onClick={handleSendOTP} className="text-rosegold font-bold hover:underline">Resend</button></p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-gray-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg"
                                >
                                    {isLoading ? "Verifying..." : "Verify Code"} <ShieldCheck size={20} />
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-green-500">
                                    <Key size={32} />
                                </div>
                                <h2 className="text-3xl font-extrabold text-mocha mb-2">Secure Account</h2>
                                <p className="text-mocha/60 text-sm">Create a strong new password for your account.</p>
                            </div>

                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-mocha ml-1">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-white border border-blush/50 rounded-xl px-4 py-3 text-mocha placeholder-mocha/30 focus:outline-none focus:border-rosegold transition-all pr-12"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-mocha/40"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-rosegold text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-pink-700 transition-all shadow-lg"
                                >
                                    {isLoading ? "Updating..." : "Update Password"} <Key size={20} />
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => step > 1 ? setStep(step - 1) : navigate('/login')}
                        className="text-mocha/40 text-sm font-bold flex items-center justify-center gap-2 mx-auto hover:text-mocha transition-colors"
                    >
                        <ArrowLeft size={16} /> Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

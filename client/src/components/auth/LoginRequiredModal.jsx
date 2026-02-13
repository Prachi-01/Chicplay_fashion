import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, Sparkles, X } from 'lucide-react';

const LoginRequiredModal = ({ isOpen, onClose, actionName = "perform this action" }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-mocha/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 max-w-md w-full text-center border border-white"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-gray-400 hover:text-mocha transition"
                    >
                        <X size={24} />
                    </button>

                    <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="text-rosegold" size={40} />
                    </div>

                    <h2 className="text-3xl font-black text-mocha mb-4 uppercase tracking-tight">Login Required</h2>
                    <p className="text-gray-500 font-medium mb-8">
                        Join our community of stylists to {actionName}, earn XP, and unlock exclusive fashion rewards!
                    </p>

                    <div className="space-y-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full bg-rosegold text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-pink-200 hover:bg-pink-600 transition flex items-center justify-center gap-3"
                        >
                            <Sparkles size={20} /> Login Now
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="w-full bg-white text-mocha py-4 rounded-2xl font-bold text-lg border-2 border-mocha/10 hover:border-rosegold hover:text-rosegold transition"
                        >
                            Create Account
                        </button>
                    </div>

                    <p className="mt-8 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-rosegold transition" onClick={onClose}>
                        Continue Browsing as Guest
                    </p>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default LoginRequiredModal;

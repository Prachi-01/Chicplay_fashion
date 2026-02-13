import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const Register = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Clear any persistent "Access Denied" or "Please Login" toasts upon arrival at registration page
        toast.dismiss('vendor-access-denied');
        toast.dismiss('admin-login-error');
        toast.dismiss('admin-access-denied');
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        if (!formData.username || !formData.email || !formData.password) {
            toast.error("Please fill in all fields");
            return false;
        }
        if (formData.username.length < 3) {
            toast.error("Username must be at least 3 characters");
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error("Please enter a valid email address");
            return false;
        }
        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const res = await axios.post('/api/auth/register', formData);
            console.log('Register Success:', res.data);

            toast.success("Account Created! Starting your journey...");

            // Use the login function from AuthContext
            login(res.data.user || { username: formData.username }, res.data.token);

            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (err) {
            console.error('Register Error:', err.response?.data?.message || err.message);
            toast.error(err.response?.data?.message || 'Registration Failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Blooms */}
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blush/40 rounded-full blur-[100px] animate-blob"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-rosegold/10 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>

            <div className="relative z-10 w-full max-w-md bg-white/70 backdrop-blur-2xl border border-white/50 rounded-3xl p-8 shadow-[0_15px_40px_rgba(111,78,55,0.1)]">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-extrabold text-mocha mb-2">
                        New Player
                    </h2>
                    <p className="text-mocha/60">Create your profile to start earning XP.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-mocha ml-1">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full bg-white border border-blush/50 rounded-xl px-4 py-3 text-mocha placeholder-mocha/30 focus:outline-none focus:border-rosegold focus:ring-1 focus:ring-rosegold/50 transition-all shadow-sm"
                            placeholder="StyleIcon2026"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-mocha ml-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-white border border-blush/50 rounded-xl px-4 py-3 text-mocha placeholder-mocha/30 focus:outline-none focus:border-rosegold focus:ring-1 focus:ring-rosegold/50 transition-all shadow-sm"
                            placeholder="player@chicplay.com"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-mocha ml-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-white border border-blush/50 rounded-xl px-4 py-3 text-mocha placeholder-mocha/30 focus:outline-none focus:border-rosegold focus:ring-1 focus:ring-rosegold/50 transition-all shadow-sm pr-12"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-mocha/40 hover:text-rosegold transition-colors p-1"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-rosegold rounded-xl text-white font-bold text-lg shadow-lg shadow-rosegold/30 hover:bg-pink-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    >
                        Start Journey
                    </button>
                </form>

                <div className="mt-8 text-center space-y-4">
                    <p className="text-mocha/50 text-sm">Already have an account?</p>
                    <Link to="/login" className="block w-full py-3 bg-white border-2 border-rosegold text-rosegold font-bold rounded-xl hover:bg-rosegold hover:text-white transition-all duration-300 shadow-sm text-center">
                        Login Here
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;

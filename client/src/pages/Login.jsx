import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    useEffect(() => {
        // Clear any persistent "Access Denied" or "Please Login" toasts upon arrival at login page
        toast.dismiss('vendor-access-denied');
        toast.dismiss('admin-login-error');
        toast.dismiss('admin-access-denied');
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        if (!formData.email || !formData.password) {
            toast.error("Please fill in all fields");
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
            // In a real app, use an env var for the API URL
            const res = await axios.post('/api/auth/login', formData);
            console.log('Login Success:', res.data);

            toast.success("Login Successful! Welcome back.");

            // Use the login function from AuthContext
            login(res.data.user || { username: 'Player1' }, res.data.token);

            // Delay navigation slightly to show success message
            setTimeout(() => {
                navigate(from, { replace: true });
            }, 1000);
        } catch (err) {
            console.error('Login Error:', err.response?.data?.message || err.message);
            toast.error(err.response?.data?.message || 'Server Error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Blooms */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blush/30 rounded-full blur-[100px] animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-rosegold/10 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>

            <div className="relative z-10 w-full max-w-md bg-white/70 backdrop-blur-2xl border border-white/50 rounded-3xl p-8 shadow-[0_15px_40px_rgba(111,78,55,0.1)]">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-extrabold text-mocha mb-2">
                        Welcome Back
                    </h2>
                    <p className="text-mocha/60">Resume your style mission.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
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
                        <div className="flex justify-end px-1">
                            <Link to="/forgot-password" size="sm" className="text-xs font-bold text-rosegold/60 hover:text-rosegold transition-colors">
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-rosegold rounded-xl text-white font-bold text-lg shadow-lg shadow-rosegold/30 hover:bg-pink-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    >
                        Enter Game
                    </button>
                </form>

                <div className="mt-8 text-center space-y-4">
                    <p className="text-mocha/50 text-sm">Don't have an account yet?</p>
                    <Link to="/register" className="block w-full py-3 bg-white border-2 border-rosegold text-rosegold font-bold rounded-xl hover:bg-rosegold hover:text-white transition-all duration-300 shadow-sm text-center">
                        Create Account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;

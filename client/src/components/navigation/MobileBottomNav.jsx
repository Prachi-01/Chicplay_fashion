import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ShoppingBag, Sparkles, Gamepad2, User } from 'lucide-react';

const NAV_ITEMS = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/shop', icon: ShoppingBag, label: 'Shop' },
    { path: '/dressing-room', icon: Sparkles, label: 'Try-On' },
    { path: '/game-zone', icon: Gamepad2, label: 'Games' },
    { path: '/orders', icon: User, label: 'Orders' }
];

const MobileBottomNav = () => {
    const location = useLocation();

    // Don't show on auth pages or fullscreen modals
    const hideOnPaths = ['/login', '/register'];
    if (hideOnPaths.includes(location.pathname)) return null;

    return (
        <nav className="mobile-bottom-nav">
            {NAV_ITEMS.map(item => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                    >
                        <motion.div
                            whileTap={{ scale: 0.9 }}
                            className="mobile-nav-icon"
                        >
                            <Icon size={22} />
                            {isActive && (
                                <motion.div
                                    layoutId="activeIndicator"
                                    className="mobile-nav-active-dot"
                                />
                            )}
                        </motion.div>
                        <span className="mobile-nav-label">{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
};

export default MobileBottomNav;

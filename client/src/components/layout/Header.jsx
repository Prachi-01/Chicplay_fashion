import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, LogOut, ShoppingBag, Trophy,
    ChevronDown, Menu, X, Sparkles, Zap, Heart, Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useGameStore } from '../../store/gameStore';
import WishlistModal from '../modals/WishlistModal';
import ProductQuickViewModal from '../modals/ProductQuickViewModal';
import './Header.css';

const Header = () => {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const { wishlist } = useGameStore();

    // Sync state with URL params
    useEffect(() => {
        const query = searchParams.get('q');
        if (query !== null) {
            setSearchQuery(query);
            if (query.length > 0) setIsSearchExpanded(true);
        }
    }, [searchParams]);

    // Modals
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Determine if search should be shown
    const showSearch = ['/dresses', '/shop'].includes(location.pathname);

    const openQuickViewFromWishlist = (product) => {
        setSelectedProduct(product);
        setIsWishlistOpen(false);
        setTimeout(() => setIsQuickViewOpen(true), 300);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSearchClick = () => {
        setIsSearchExpanded(!isSearchExpanded);
    };

    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter') {
            const params = new URLSearchParams(searchParams);
            if (searchQuery) {
                params.set('q', searchQuery);
            } else {
                params.delete('q');
            }
            setSearchParams(params);

            // If not on a searchable page, redirect to shop
            if (!showSearch) {
                navigate(`/shop?q=${encodeURIComponent(searchQuery)}`);
            }
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        // Live update params for current page search
        if (showSearch) {
            const params = new URLSearchParams(searchParams);
            if (value) {
                params.set('q', value);
            } else {
                params.delete('q');
            }
            setSearchParams(params, { replace: true });
        }
    };

    return (
        <>
            <nav className="modern-header">
                <div className="header-container">
                    {/* Logo */}
                    <div className="header-left">
                        <Link to="/" className="logo-link">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="logo-wrapper"
                            >
                                <Sparkles className="logo-icon" size={24} />
                                <span className="logo-text">ChicPlay</span>
                            </motion.div>
                        </Link>

                        {/* Desktop Nav Links */}
                        <div className="desktop-nav">
                            <Link to="/shop" className="nav-link">
                                <span>Shop</span>
                            </Link>
                            <Link to="/dresses" className="nav-link">
                                <span>Dresses</span>
                            </Link>
                            <Link to="/game-zone" className="nav-link">
                                <span>Game Zone</span>
                            </Link>
                            <Link to="/dressing-room" className="nav-link">
                                <span>Dressing Room</span>
                            </Link>

                            {/* Vendor Join Link - Only for non-vendors or guests */}
                            {(!user || user.role === 'customer') && (
                                <Link to="/vendor/register" className="vendor-link">
                                    <Sparkles size={14} />
                                    <span>Sell on ChicPlay</span>
                                </Link>
                            )}

                            {/* Admin Link - Only visible to admins */}
                            {user?.role === 'admin' && (
                                <Link to="/admin" className="admin-link">
                                    🔧 ADMIN
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="header-right">
                        {/* Search Section - Inline Expandable */}
                        {showSearch && (
                            <div className={`search-container ${isSearchExpanded ? 'expanded' : ''}`}>
                                <AnimatePresence>
                                    {isSearchExpanded && (
                                        <motion.input
                                            initial={{ width: 0, opacity: 0 }}
                                            animate={{ width: 200, opacity: 1 }}
                                            exit={{ width: 0, opacity: 0 }}
                                            type="text"
                                            placeholder="Search styles..."
                                            value={searchQuery}
                                            onChange={handleSearchChange}
                                            onKeyDown={handleSearchSubmit}
                                            className="header-search-input"
                                            autoFocus
                                        />
                                    )}
                                </AnimatePresence>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSearchClick}
                                    className="icon-button search-button"
                                >
                                    {isSearchExpanded ? <X size={20} /> : <Search size={20} />}
                                </motion.button>
                            </div>
                        )}

                        {/* Wishlist Icon */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsWishlistOpen(true)}
                            className="icon-button wishlist-button"
                        >
                            <Heart size={20} className={wishlist?.length > 0 ? 'filled' : ''} />
                            {wishlist?.length > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="badge badge-pink"
                                >
                                    {wishlist.length}
                                </motion.span>
                            )}
                        </motion.button>

                        {/* Cart Icon - Visible to all */}
                        <Link to="/cart" className="icon-button-link">
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="icon-button cart-button"
                            >
                                <ShoppingBag size={20} />
                                {cartCount > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="badge badge-gold"
                                    >
                                        {cartCount}
                                    </motion.span>
                                )}
                            </motion.div>
                        </Link>

                        {user ? (
                            /* Logged In User Profile */
                            <div className="profile-dropdown">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="profile-button"
                                >
                                    <div className="avatar-wrapper">
                                        <img
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                                            alt="Avatar"
                                            className="avatar-image"
                                        />
                                    </div>
                                    <span className="username">{user.username}</span>
                                    <ChevronDown size={14} className={`chevron ${isProfileOpen ? 'rotated' : ''}`} />
                                </motion.button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <>
                                            {/* Backdrop for closing */}
                                            <div className="dropdown-backdrop" onClick={() => setIsProfileOpen(false)} />

                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="dropdown-menu"
                                            >
                                                <div className="dropdown-header">
                                                    <p className="dropdown-label">Signed in as</p>
                                                    <p className="dropdown-username">{user.username}</p>
                                                </div>

                                                <Link
                                                    to="/game-zone"
                                                    className="dropdown-item"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <Trophy size={18} /> My Rewards
                                                </Link>
                                                <Link
                                                    to="/orders"
                                                    className="dropdown-item"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <ShoppingBag size={18} /> My Orders
                                                </Link>

                                                {/* Vendor Dashboard Link */}
                                                {user.role === 'vendor' && (
                                                    <Link
                                                        to="/vendor/dashboard"
                                                        className="dropdown-item vendor-item"
                                                        onClick={() => setIsProfileOpen(false)}
                                                    >
                                                        <Sparkles size={18} /> Vendor Dashboard
                                                    </Link>
                                                )}
                                                <div className="dropdown-divider" />
                                                <button
                                                    onClick={handleLogout}
                                                    className="dropdown-item logout-item"
                                                >
                                                    <LogOut size={18} /> Logout
                                                </button>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            /* Guest Login/Register Buttons */
                            <div className="auth-buttons">
                                <Link to="/login" className="login-button">
                                    Login
                                </Link>
                                <Link to="/register" className="register-button">
                                    Join ChicPlay
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            className="mobile-menu-toggle"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mobile-menu"
                        >
                            <div className="mobile-menu-content">
                                {/* Search in mobile menu for Dresses/Shop */}
                                {showSearch && (
                                    <button
                                        onClick={() => {
                                            handleSearchClick();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="mobile-menu-item search-item"
                                    >
                                        <Search size={20} />
                                        <span>Search</span>
                                    </button>
                                )}

                                <Link to="/shop" className="mobile-menu-item" onClick={() => setIsMobileMenuOpen(false)}>
                                    Shop
                                </Link>
                                <Link to="/dresses" className="mobile-menu-item" onClick={() => setIsMobileMenuOpen(false)}>
                                    Dresses
                                </Link>
                                <Link to="/game-zone" className="mobile-menu-item" onClick={() => setIsMobileMenuOpen(false)}>
                                    Game Zone
                                </Link>
                                <Link to="/dressing-room" className="mobile-menu-item" onClick={() => setIsMobileMenuOpen(false)}>
                                    Dressing Room
                                </Link>

                                {(!user || user.role === 'customer') && (
                                    <Link to="/vendor/register" className="mobile-menu-item vendor-item" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Sparkles size={16} />
                                        Sell on ChicPlay
                                    </Link>
                                )}

                                {user?.role === 'admin' && (
                                    <Link to="/admin" className="mobile-menu-item admin-item" onClick={() => setIsMobileMenuOpen(false)}>
                                        🔧 ADMIN PANEL
                                    </Link>
                                )}

                                {!user && (
                                    <div className="mobile-auth-buttons">
                                        <Link to="/login" className="mobile-login-button" onClick={() => setIsMobileMenuOpen(false)}>
                                            Login
                                        </Link>
                                        <Link to="/register" className="mobile-register-button" onClick={() => setIsMobileMenuOpen(false)}>
                                            Register
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </nav>

            <WishlistModal
                isOpen={isWishlistOpen}
                onClose={() => setIsWishlistOpen(false)}
                onOpenProduct={openQuickViewFromWishlist}
            />

            <ProductQuickViewModal
                isOpen={isQuickViewOpen}
                product={selectedProduct}
                onClose={() => setIsQuickViewOpen(false)}
            />
        </>
    );
};

export default Header;

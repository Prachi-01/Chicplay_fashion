import React from 'react';
import { Link } from 'react-router-dom';
import {
    Instagram,
    Youtube,
    ArrowUp,
    ShieldCheck,
    CreditCard,
    Store,
    ExternalLink,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Footer.css';

const Footer = () => {
    const { user } = useAuth();
    const isVendor = user?.role === 'vendor';

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="main-footer">
            <div className="max-w-7xl mx-auto px-6">
                <div className="footer-top-grid">
                    {/* Brand Section */}
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            <Sparkles className="text-rosegold" size={28} />
                            <span>ChicPlay Fashion</span>
                        </Link>
                        <p className="footer-tagline">"Where Fashion Shopping Becomes a Game"</p>

                        <div className="vendor-section">
                            <Link to={isVendor ? "/vendor/dashboard" : "/vendor/register"} className="vendor-cta-btn">
                                <Store size={18} />
                                <span>{isVendor ? "Vendor Dashboard" : "Become a Vendor"}</span>
                                <ExternalLink size={14} />
                            </Link>
                            <p className="vendor-note">Sell your designs to our gaming community!</p>
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="footer-nav-columns">
                        {/* SHOP Column */}
                        <div className="footer-col">
                            <h3>SHOP</h3>
                            <ul>
                                <li><Link to="/dresses"><ChevronRight size={12} /> Dresses</Link></li>
                                <li><Link to="/shop?category=Tops"><ChevronRight size={12} /> Tops</Link></li>
                                <li><Link to="/shop?category=Bottoms"><ChevronRight size={12} /> Bottoms</Link></li>
                                <li><Link to="/shop?category=Accessories"><ChevronRight size={12} /> Accessories</Link></li>
                                <li><Link to="/shop?filter=sale"><ChevronRight size={12} /> Sale</Link></li>
                                <li><Link to="/shop?filter=newArrival"><ChevronRight size={12} /> New Arrivals</Link></li>
                                <li><Link to="/shop?filter=bestSellers"><ChevronRight size={12} /> Best Sellers</Link></li>
                            </ul>
                        </div>

                        {/* DISCOVER Column */}
                        <div className="footer-col">
                            <h3>DISCOVER</h3>
                            <ul>
                                <li><Link to="/quiz"><ChevronRight size={12} /> Style Quiz</Link></li>
                                <li><Link to="/archetypes"><ChevronRight size={12} /> Archetypes</Link></li>
                                <li><Link to="/trends"><ChevronRight size={12} /> Trends</Link></li>
                                <li><Link to="/blog"><ChevronRight size={12} /> Blog</Link></li>
                                <li><Link to="/lookbook"><ChevronRight size={12} /> Lookbook</Link></li>
                            </ul>
                        </div>

                        {/* SUPPORT Column */}
                        <div className="footer-col">
                            <h3>SUPPORT</h3>
                            <ul>
                                <li><Link to="/faq"><ChevronRight size={12} /> FAQ</Link></li>
                                <li><Link to="/size-guide"><ChevronRight size={12} /> Size Guide</Link></li>
                                <li><Link to="/shipping"><ChevronRight size={12} /> Shipping</Link></li>
                                <li><Link to="/returns"><ChevronRight size={12} /> Returns</Link></li>
                                <li><Link to="/contact"><ChevronRight size={12} /> Contact</Link></li>
                            </ul>
                        </div>

                        {/* COMPANY Column */}
                        <div className="footer-col">
                            <h3>COMPANY</h3>
                            <ul className="company-links">
                                <li><Link to="/about"><span>📖</span> Our Story</Link></li>
                                <li><Link to="/about"><span>ℹ️</span> About Us</Link></li>
                                <li><Link to="/sustainability"><span>🌿</span> Sustainability</Link></li>
                                <li><Link to="/careers"><span>💼</span> Careers</Link></li>
                                <li><Link to="/terms"><span>⚖️</span> Terms of Service</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* Newsletter Section */}
                    <div className="footer-newsletter">
                        <h3>📧 Get style tips & exclusive offers</h3>
                        <p className="newsletter-desc">Subscribe to our newsletter for the latest trends and gaming rewards!</p>
                        <div className="newsletter-form">
                            <input type="email" placeholder="Email address" className="newsletter-input" />
                            <button className="subscribe-btn">Subscribe</button>
                        </div>

                        <div className="footer-socials">
                            <span className="social-label">Follow us:</span>
                            <div className="social-icons">
                                <a href={import.meta.env.VITE_CONTACT_INSTAGRAM} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram"><Instagram size={20} /></a>
                                <a href="#" className="social-icon" aria-label="TikTok">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                                    </svg>
                                </a>
                                <a href="#" className="social-icon" aria-label="Pinterest">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 8v6M8 12h8" />
                                    </svg>
                                </a>
                                <a href={import.meta.env.VITE_CONTACT_YOUTUBE} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="YouTube"><Youtube size={20} /></a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer-divider"></div>

                {/* Payment & Security */}
                <div className="footer-middle">
                    <div className="payment-info">
                        <span className="payment-label">💳 We accept:</span>
                        <div className="payment-icons">
                            <div className="payment-badge"><CreditCard size={20} /> Visa</div>
                            <div className="payment-badge"><CreditCard size={20} /> Mastercard</div>
                            <div className="payment-badge"><CreditCard size={20} /> Amex</div>
                            <div className="payment-badge"><CreditCard size={20} /> PayPal</div>
                        </div>
                    </div>
                    <div className="security-info">
                        <div className="security-badge">
                            <ShieldCheck size={18} className="text-green-500" />
                            <span>Secure checkout • SSL encrypted</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="footer-bottom">
                    <div className="copyright">
                        <p>© 2026 ChicPlay | <Link to="/privacy">Privacy</Link> | <Link to="/terms">Terms</Link> | <Link to="/accessibility">Accessibility</Link></p>
                    </div>
                    <button className="back-to-top-btn" onClick={scrollToTop}>
                        <span>Back to Top</span>
                        <ArrowUp size={16} />
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

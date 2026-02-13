import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Star, Zap } from 'lucide-react';
import './ProductBadge.css';

const ProductBadge = ({ badge }) => {
    if (!badge) return null;

    const icons = {
        zap: Zap,
        star: Star,
        'trending-up': TrendingUp,
        sparkles: Sparkles
    };

    const Icon = icons[badge.icon] || Sparkles;

    return (
        <motion.div
            initial={{ scale: 0, x: -20 }}
            animate={{ scale: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            className="dynamic-product-badge"
            style={{
                '--badge-color': badge.color,
                background: `linear-gradient(135deg, ${badge.color}, ${badge.color}CC)`
            }}
        >
            <div className="badge-glass-shine" />
            <Icon size={8} className="badge-icon" />
            <span className="badge-label">{badge.label}</span>
        </motion.div>
    );
};

export default ProductBadge;

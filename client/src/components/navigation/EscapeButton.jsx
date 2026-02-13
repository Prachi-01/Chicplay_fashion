import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Home, ArrowLeft } from 'lucide-react';

/**
 * EscapeButton - Floating button for exiting complex pages/modals
 * 
 * @param {function} onClose - Custom close handler
 * @param {string} label - Button text
 * @param {string} to - Navigate to path (default: '/')
 * @param {string} position - 'top-right', 'top-left', 'bottom-right', 'bottom-left'
 * @param {string} variant - 'default', 'minimal', 'prominent'
 */
const EscapeButton = ({
    onClose,
    label = 'Exit',
    to = '/',
    position = 'top-right',
    variant = 'default',
    showIcon = true,
    className = ''
}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClose) {
            onClose();
        } else {
            navigate(to);
        }
    };

    const positionClasses = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4'
    };

    const variantClasses = {
        default: 'escape-btn-default',
        minimal: 'escape-btn-minimal',
        prominent: 'escape-btn-prominent'
    };

    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClick}
            className={`escape-button ${positionClasses[position]} ${variantClasses[variant]} ${className}`}
            aria-label={label}
        >
            {showIcon && (
                variant === 'minimal' ? <X size={20} /> : <ArrowLeft size={18} />
            )}
            {variant !== 'minimal' && <span>{label}</span>}
        </motion.button>
    );
};

// Quick Exit - For modals, takes you home immediately
export const QuickExit = ({ onClose }) => (
    <EscapeButton
        onClose={onClose}
        variant="minimal"
        position="top-right"
        label="Close"
    />
);

// Back to Home - Floating button for complex pages
export const BackToHome = ({ className }) => (
    <EscapeButton
        label="Back to Home"
        to="/"
        variant="prominent"
        position="bottom-left"
        className={className}
    />
);

export default EscapeButton;

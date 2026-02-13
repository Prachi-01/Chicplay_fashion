import { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

// Path to breadcrumb mapping
const ROUTE_LABELS = {
    '/': 'Home',
    '/shop': 'Shop',
    '/dresses': 'Dresses',
    '/dressing-room': 'Dressing Room',
    '/game-zone': 'Game Zone',
    '/game-zone/bingo': 'Fashion Bingo',
    '/game-zone/challenge': 'Style Challenge',
    '/game-zone/spin': 'Spin Wheel',
    '/cart': 'Cart',
    '/admin': 'Admin',
    '/mannequin-3d': '3D Mannequin'
};

const Breadcrumbs = ({ customPath = null, className = '' }) => {
    const location = useLocation();

    // Don't show on home page
    if (location.pathname === '/') return null;

    // Generate breadcrumb path
    const generateBreadcrumbs = () => {
        if (customPath) return customPath;

        const pathSegments = location.pathname.split('/').filter(Boolean);
        const breadcrumbs = [{ name: 'Home', path: '/', icon: Home }];

        let currentPath = '';
        pathSegments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            const label = ROUTE_LABELS[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
            breadcrumbs.push({
                name: label,
                path: index === pathSegments.length - 1 ? null : currentPath,
                isLast: index === pathSegments.length - 1
            });
        });

        return breadcrumbs;
    };

    const breadcrumbs = generateBreadcrumbs();

    return (
        <nav className={`breadcrumbs-container ${className}`} aria-label="Breadcrumb">
            <ol className="breadcrumbs-list">
                {breadcrumbs.map((item, index) => (
                    <Fragment key={item.name}>
                        <li className={`breadcrumb-item ${item.isLast ? 'current' : ''}`}>
                            {item.path ? (
                                <Link to={item.path} className="breadcrumb-link">
                                    {item.icon && <item.icon size={14} />}
                                    <span>{item.name}</span>
                                </Link>
                            ) : (
                                <span className="breadcrumb-current">
                                    {item.name}
                                </span>
                            )}
                        </li>
                        {index < breadcrumbs.length - 1 && (
                            <li className="breadcrumb-separator" aria-hidden="true">
                                <ChevronRight size={14} />
                            </li>
                        )}
                    </Fragment>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;

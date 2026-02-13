// Cloudinary URL transformation helper
export const getCloudinaryUrl = (imageUrl, transformations = {}) => {
    // If already a Cloudinary URL, add transformations
    if (imageUrl && imageUrl.includes('res.cloudinary.com')) {
        const parts = imageUrl.split('/upload/');
        if (parts.length === 2) {
            const transforms = [];

            // Background removal (Cloudinary AI)
            if (transformations.removeBg) {
                transforms.push('e_bgremoval');
            }

            // Edge smoothing for cleaner cutouts
            if (transformations.smoothEdges) {
                transforms.push('e_trim'); // Remove excess transparent areas
            }

            // Auto-fit for clothing
            if (transformations.autoFit) {
                transforms.push('c_pad,b_transparent,w_800,h_1200');
            }

            // Add shadow for depth (makes it look more realistic)
            if (transformations.addShadow) {
                transforms.push('e_shadow:40');
            }

            // Quality optimization  
            if (transformations.quality) {
                transforms.push(`q_${transformations.quality || 'auto'}`);
            }

            // Format for transparency support
            if (transformations.format) {
                transforms.push(`f_${transformations.format}`);
            } else if (transformations.removeBg) {
                // Auto-use PNG for transparency
                transforms.push('f_png');
            }

            const transformStr = transforms.join(',');
            return `${parts[0]}/upload/${transformStr}/${parts[1]}`;
        }
    }

    return imageUrl;
};

// Process image for dressing room display with background removed
export const getDressingRoomImage = (imageUrl, options = {}) => {
    return getCloudinaryUrl(imageUrl, {
        removeBg: true,
        autoFit: true,
        smoothEdges: options.smoothEdges !== false,
        addShadow: options.addShadow || false,
        quality: 'auto',
        format: 'png'
    });
};

// Process image with realistic shadow
export const getRealisticDressImage = (imageUrl) => {
    return getCloudinaryUrl(imageUrl, {
        removeBg: true,
        smoothEdges: true,
        addShadow: true,
        quality: 'best',
        format: 'png'
    });
};

// Check if URL can use Cloudinary transformations
export const canUseCloudinary = (url) => {
    return url && url.includes('res.cloudinary.com');
};

// Generate optimized thumbnail
export const getOptimizedThumbnail = (imageUrl, size = 200) => {
    if (canUseCloudinary(imageUrl)) {
        const parts = imageUrl.split('/upload/');
        if (parts.length === 2) {
            return `${parts[0]}/upload/w_${size},h_${Math.round(size * 1.4)},c_fill,q_auto,f_auto/${parts[1]}`;
        }
    }
    return imageUrl;
};

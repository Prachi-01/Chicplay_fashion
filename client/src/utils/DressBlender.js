/**
 * Dress Blender Utility
 * 
 * Handles realistic dress overlay blending with:
 * - Automatic background removal
 * - Smart anchor point positioning
 * - Natural shadows and lighting
 * - Body contour fitting
 * - Edge feathering for natural blend
 */

import backgroundRemovalService from './BackgroundRemovalService';

class DressBlender {
    constructor() {
        this.cache = new Map();
        this.bodyContours = {
            petite: { waistX: 0.5, waistY: 0.35, hipX: 0.5, hipY: 0.55, shoulderWidth: 0.4 },
            average: { waistX: 0.5, waistY: 0.33, hipX: 0.5, hipY: 0.52, shoulderWidth: 0.42 },
            tall: { waistX: 0.5, waistY: 0.30, hipX: 0.5, hipY: 0.50, shoulderWidth: 0.44 },
            curvy: { waistX: 0.5, waistY: 0.36, hipX: 0.5, hipY: 0.54, shoulderWidth: 0.46 }
        };
    }

    /**
     * Process and blend a dress onto a body
     * @param {string} dressUrl - URL of the dress image
     * @param {Object} bodyConfig - Body configuration (type, dimensions)
     * @param {Object} options - Blending options
     * @returns {Promise<Object>} - Processed dress data with positioning
     */
    async processDress(dressUrl, bodyConfig = {}, options = {}) {
        const cacheKey = `${dressUrl}:${JSON.stringify(bodyConfig)}`;

        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            // Step 1: Remove background
            const transparentDress = await backgroundRemovalService.removeBackground(dressUrl, {
                onProgress: options.onProgress
            });

            // Step 2: Calculate positioning
            const positioning = this._calculatePositioning(bodyConfig);

            // Step 3: Apply visual enhancements
            const enhancedDress = await this._applyEnhancements(
                transparentDress,
                bodyConfig,
                options
            );

            const result = {
                processedImage: enhancedDress,
                positioning,
                shadows: this._generateShadowConfig(bodyConfig),
                blendMode: 'normal',
                originalUrl: dressUrl
            };

            this.cache.set(cacheKey, result);
            return result;
        } catch (error) {
            console.error('Dress blending failed:', error);
            // Return original with basic positioning as fallback
            return {
                processedImage: dressUrl,
                positioning: this._calculatePositioning(bodyConfig),
                shadows: this._generateShadowConfig(bodyConfig),
                blendMode: 'normal',
                originalUrl: dressUrl,
                fallback: true
            };
        }
    }

    /**
     * Calculate dress positioning based on body type
     */
    _calculatePositioning(bodyConfig) {
        const bodyType = bodyConfig.type || 'average';
        const contours = this.bodyContours[bodyType] || this.bodyContours.average;

        // Base positioning presets
        const presets = {
            petite: {
                top: '12%',
                scale: 0.88,
                anchorX: 50,
                anchorY: 15,
                perspective: 0.98
            },
            average: {
                top: '14%',
                scale: 1.0,
                anchorX: 50,
                anchorY: 14,
                perspective: 1.0
            },
            tall: {
                top: '10%',
                scale: 1.08,
                anchorX: 50,
                anchorY: 12,
                perspective: 1.02
            },
            curvy: {
                top: '15%',
                scale: 1.05,
                anchorX: 50,
                anchorY: 16,
                perspective: 0.96
            }
        };

        const preset = presets[bodyType] || presets.average;

        return {
            ...preset,
            contours,
            transformOrigin: 'top center',
            transform: `
                translateX(-50%) 
                scale(${preset.scale}) 
                perspective(1000px) 
                scaleX(${preset.perspective})
            `
        };
    }

    /**
     * Apply visual enhancements to the dress
     */
    async _applyEnhancements(dressDataUrl, bodyConfig, options = {}) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d', { willReadFrequently: true });

                // Add padding for shadow effects
                const padding = 40;
                canvas.width = img.width + padding * 2;
                canvas.height = img.height + padding * 2;

                // Draw the dress centered with padding
                ctx.drawImage(img, padding, padding);

                // Apply edge smoothing
                if (options.smoothEdges !== false) {
                    this._smoothEdges(ctx, canvas.width, canvas.height, padding);
                }

                // Apply subtle fabric texture overlay
                if (options.addTexture) {
                    this._addFabricTexture(ctx, canvas.width, canvas.height);
                }

                // Apply subtle lighting adjustment
                this._applyLighting(ctx, canvas.width, canvas.height, bodyConfig);

                resolve(canvas.toDataURL('image/png'));
            };

            img.onerror = () => {
                // If processing fails, return original
                resolve(dressDataUrl);
            };

            img.src = dressDataUrl;
        });
    }

    /**
     * Smooth edges of the dress
     */
    _smoothEdges(ctx, width, height, padding) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Apply anti-aliasing to edge pixels
        for (let y = padding - 2; y < height - padding + 2; y++) {
            for (let x = padding - 2; x < width - padding + 2; x++) {
                const idx = (y * width + x) * 4;
                const alpha = data[idx + 3];

                // Only process semi-transparent edge pixels
                if (alpha > 10 && alpha < 245) {
                    // Sample neighbors
                    let sumAlpha = 0;
                    let count = 0;

                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const nIdx = ((y + dy) * width + (x + dx)) * 4;
                            if (nIdx >= 0 && nIdx < data.length - 3) {
                                sumAlpha += data[nIdx + 3];
                                count++;
                            }
                        }
                    }

                    // Smooth the alpha
                    data[idx + 3] = Math.round((alpha + sumAlpha / count) / 2);
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    /**
     * Add subtle fabric texture overlay
     */
    _addFabricTexture(ctx, width, height) {
        ctx.save();
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = 0.03;

        // Create subtle noise pattern
        const textureCanvas = document.createElement('canvas');
        const textureCtx = textureCanvas.getContext('2d');
        textureCanvas.width = width;
        textureCanvas.height = height;

        const imageData = textureCtx.createImageData(width, height);
        for (let i = 0; i < imageData.data.length; i += 4) {
            const noise = Math.random() * 30;
            imageData.data[i] = 128 + noise;
            imageData.data[i + 1] = 128 + noise;
            imageData.data[i + 2] = 128 + noise;
            imageData.data[i + 3] = 255;
        }

        textureCtx.putImageData(imageData, 0, 0);
        ctx.drawImage(textureCanvas, 0, 0);
        ctx.restore();
    }

    /**
     * Apply lighting based on body configuration
     */
    _applyLighting(ctx, width, height, bodyConfig) {
        // Add subtle highlight on upper portion
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.02)');

        ctx.save();
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
    }

    /**
     * Generate shadow configuration
     */
    _generateShadowConfig(bodyConfig) {
        const bodyType = bodyConfig.type || 'average';

        const shadowPresets = {
            petite: {
                dropShadow: '0 8px 25px rgba(0, 0, 0, 0.25)',
                innerShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.1)',
                ambientBlur: 15
            },
            average: {
                dropShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                innerShadow: 'inset 0 3px 10px rgba(0, 0, 0, 0.1)',
                ambientBlur: 20
            },
            tall: {
                dropShadow: '0 12px 35px rgba(0, 0, 0, 0.28)',
                innerShadow: 'inset 0 3px 12px rgba(0, 0, 0, 0.08)',
                ambientBlur: 22
            },
            curvy: {
                dropShadow: '0 10px 32px rgba(0, 0, 0, 0.32)',
                innerShadow: 'inset 0 4px 12px rgba(0, 0, 0, 0.12)',
                ambientBlur: 25
            }
        };

        return shadowPresets[bodyType] || shadowPresets.average;
    }

    /**
     * Generate CSS filter for realistic dress rendering
     */
    getRealisticFilter(bodyConfig) {
        return `
            brightness(1.02)
            contrast(1.03)
            saturate(1.05)
            drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))
            drop-shadow(0 8px 24px rgba(0, 0, 0, 0.2))
        `;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        backgroundRemovalService.clearCache();
    }
}

// Export singleton instance
const dressBlender = new DressBlender();
export default dressBlender;
export { DressBlender };

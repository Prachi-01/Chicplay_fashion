/**
 * Background Removal Service
 * 
 * Uses @imgly/background-removal for ML-based automatic background removal.
 * Provides caching, fallback methods, and optimized processing.
 */

import { removeBackground } from '@imgly/background-removal';

class BackgroundRemovalService {
    constructor() {
        this.cache = new Map();
        this.processingQueue = new Map();
        this.isModelLoaded = false;
        this.config = {
            // Model configuration for optimal performance
            model: 'small', // 'small' for speed, 'medium' for quality
            output: {
                format: 'image/png',
                quality: 0.9
            }
        };
    }

    /**
     * Remove background from an image URL
     * @param {string} imageUrl - The image URL to process
     * @param {Object} options - Processing options
     * @returns {Promise<string>} - Data URL with transparent background
     */
    async removeBackground(imageUrl, options = {}) {
        // Return cached result if available
        const cacheKey = `${imageUrl}:${JSON.stringify(options)}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // If already processing this image, wait for result
        if (this.processingQueue.has(cacheKey)) {
            return this.processingQueue.get(cacheKey);
        }

        // Start processing
        const processingPromise = this._processImage(imageUrl, options);
        this.processingQueue.set(cacheKey, processingPromise);

        try {
            const result = await processingPromise;
            this.cache.set(cacheKey, result);
            this.processingQueue.delete(cacheKey);
            return result;
        } catch (error) {
            this.processingQueue.delete(cacheKey);
            console.error('Background removal failed, trying fallback:', error);
            return this._fallbackRemoval(imageUrl, options);
        }
    }

    /**
     * Process image using ML model
     */
    async _processImage(imageUrl, options) {
        try {
            // Load the image as a blob
            const imageBlob = await this._urlToBlob(imageUrl);

            // Process with background removal
            const resultBlob = await removeBackground(imageBlob, {
                ...this.config,
                ...options,
                progress: (progress) => {
                    if (options.onProgress) {
                        options.onProgress(progress);
                    }
                }
            });

            this.isModelLoaded = true;

            // Convert to data URL
            return await this._blobToDataUrl(resultBlob);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Fallback: Canvas-based background removal for simple cases
     */
    async _fallbackRemoval(imageUrl, options) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d', { willReadFrequently: true });
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;

                    ctx.drawImage(img, 0, 0);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    // Detect background color from corners
                    const bgColor = this._detectBackgroundColor(data, canvas.width, canvas.height);

                    // Remove background with tolerance
                    const tolerance = options.tolerance || 35;
                    this._removeColorWithTolerance(data, bgColor, tolerance);

                    // Apply edge feathering
                    this._applyEdgeFeathering(data, canvas.width, canvas.height);

                    ctx.putImageData(imageData, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                } catch (e) {
                    reject(e);
                }
            };

            img.onerror = reject;
            img.src = imageUrl;
        });
    }

    /**
     * Detect dominant background color from image corners
     */
    _detectBackgroundColor(data, width, height) {
        const corners = [
            { x: 0, y: 0 },
            { x: width - 1, y: 0 },
            { x: 0, y: height - 1 },
            { x: width - 1, y: height - 1 }
        ];

        const sampleSize = 5;
        let totalR = 0, totalG = 0, totalB = 0;
        let count = 0;

        for (const corner of corners) {
            for (let dy = 0; dy < sampleSize; dy++) {
                for (let dx = 0; dx < sampleSize; dx++) {
                    const x = Math.min(width - 1, Math.max(0, corner.x + (corner.x === 0 ? dx : -dx)));
                    const y = Math.min(height - 1, Math.max(0, corner.y + (corner.y === 0 ? dy : -dy)));
                    const idx = (y * width + x) * 4;
                    totalR += data[idx];
                    totalG += data[idx + 1];
                    totalB += data[idx + 2];
                    count++;
                }
            }
        }

        return {
            r: Math.round(totalR / count),
            g: Math.round(totalG / count),
            b: Math.round(totalB / count)
        };
    }

    /**
     * Remove pixels matching background color with tolerance
     */
    _removeColorWithTolerance(data, bgColor, tolerance) {
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Calculate color distance
            const distance = Math.sqrt(
                Math.pow(r - bgColor.r, 2) +
                Math.pow(g - bgColor.g, 2) +
                Math.pow(b - bgColor.b, 2)
            );

            if (distance < tolerance) {
                // Fully transparent
                data[i + 3] = 0;
            } else if (distance < tolerance * 2) {
                // Feathered edge - gradual transparency
                const alpha = ((distance - tolerance) / tolerance) * 255;
                data[i + 3] = Math.min(255, Math.max(0, alpha));
            }

            // Also handle pure white/near-white backgrounds
            const brightness = (r + g + b) / 3;
            if (brightness > 240 && distance < tolerance * 1.5) {
                data[i + 3] = 0;
            }
        }
    }

    /**
     * Apply edge feathering for smoother edges
     */
    _applyEdgeFeathering(data, width, height) {
        // Create a copy for edge detection
        const tempAlpha = new Uint8Array(width * height);
        for (let i = 0; i < data.length; i += 4) {
            tempAlpha[i / 4] = data[i + 3];
        }

        // Apply slight blur to alpha channel for smoother edges
        const kernelSize = 2;
        for (let y = kernelSize; y < height - kernelSize; y++) {
            for (let x = kernelSize; x < width - kernelSize; x++) {
                const idx = y * width + x;
                const currentAlpha = tempAlpha[idx];

                // Only process edge pixels
                if (currentAlpha > 0 && currentAlpha < 255) {
                    let sum = 0;
                    let count = 0;

                    for (let ky = -kernelSize; ky <= kernelSize; ky++) {
                        for (let kx = -kernelSize; kx <= kernelSize; kx++) {
                            const neighborIdx = (y + ky) * width + (x + kx);
                            sum += tempAlpha[neighborIdx];
                            count++;
                        }
                    }

                    data[idx * 4 + 3] = Math.round(sum / count);
                }
            }
        }
    }

    /**
     * Convert URL to Blob
     */
    async _urlToBlob(url) {
        // Handle data URLs
        if (url.startsWith('data:')) {
            const response = await fetch(url);
            return await response.blob();
        }

        // Handle regular URLs
        const response = await fetch(url, { mode: 'cors' });
        return await response.blob();
    }

    /**
     * Convert Blob to Data URL
     */
    async _blobToDataUrl(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Preload the ML model for faster subsequent processing
     */
    async preloadModel() {
        if (this.isModelLoaded) return;

        // Process a tiny transparent image to load the model
        const canvas = document.createElement('canvas');
        canvas.width = 10;
        canvas.height = 10;
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

        try {
            await removeBackground(blob, { model: 'small' });
            this.isModelLoaded = true;
            console.log('Background removal model preloaded');
        } catch (e) {
            console.warn('Model preload failed:', e);
        }
    }

    /**
     * Clear the cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            isModelLoaded: this.isModelLoaded
        };
    }
}

// Export singleton instance
const backgroundRemovalService = new BackgroundRemovalService();
export default backgroundRemovalService;
export { BackgroundRemovalService };

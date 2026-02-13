const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Extract organization info from request body
        // These will be sent from the frontend during upload
        const category = req.body.category || 'dresses';
        const productSlug = req.body.productSlug || 'unnamed-product';
        const colorSlug = req.body.colorSlug || 'default-color';
        const imageType = req.body.imageType || 'other';

        // chicplay/products/{category}/{product-slug}/{color-slug}/{image-type}
        const folderPath = `chicplay/products/${category}/${productSlug}/${colorSlug}/${imageType}`;

        return {
            folder: folderPath,
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            transformation: [{ width: 1000, crop: "limit" }]
        };
    }
});

const parser = multer({ storage: storage });

module.exports = { cloudinary, parser };

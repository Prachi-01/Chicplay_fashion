const ollamaService = require('../services/ollamaService');
const falService = require('../services/falService');
const { cloudinary } = require('../config/cloudinary');

exports.analyzeBody = async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ message: 'No image provided' });
        }

        console.log('🤖 Sending image to Ollama for Body Analysis...');
        const result = await ollamaService.analyzeBodyShape(image);
        res.json(result);

    } catch (error) {
        console.error('AI Analysis Failed:', error);
        res.status(500).json({ message: 'AI Analysis Failed', error: error.message });
    }
};

exports.getFitAdvice = async (req, res) => {
    try {
        const { userImage, dressImage } = req.body;

        console.log('🤖 Sending images to Ollama for Fit Advice...');
        const result = await ollamaService.getFitAdvice(userImage, dressImage);
        res.json(result);

    } catch (error) {
        console.error('AI Fit Advice Failed:', error);
        res.status(500).json({ message: 'AI Fit Advice Failed', error: error.message });
    }
};

exports.detectLandmarks = async (req, res) => {
    try {
        const { image, type } = req.body;
        if (!image) return res.status(400).json({ message: 'No image provided' });

        console.log(`🤖 Analyzing ${type || 'person'} landmarks...`);
        const result = await ollamaService.analyzeImageLandmarks(image, type || 'person');
        res.json(result);

    } catch (error) {
        console.error('Landmark Analysis Failed:', error);
        res.status(500).json({ message: 'Landmark Analysis Failed', error: error.message });
    }
};

exports.generatePrompt = async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) return res.status(400).json({ message: 'No image provided' });

        console.log('🤖 Generating creative prompt...');
        const result = await ollamaService.generateCreativePrompt(image);
        res.json(result);

    } catch (error) {
        console.error('Prompt Gen Failed:', error);
        res.status(500).json({ message: 'Prompt Gen Failed', error: error.message });
    }
};

exports.generateImage = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ message: 'No prompt provided' });

        console.log('🎨 Generating image via Pollinations.ai...');
        // Pollinations.ai is a free public API that generates images from prompts URL-based
        // We append a random seed to ensure new images
        const encodedPrompt = encodeURIComponent(prompt + " photorealistic, 8k, high fashion, cinematic lighting");
        const seed = Math.floor(Math.random() * 1000000);
        // Use 'turbo' model which is the standard free tier
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&width=1024&height=1024&nologo=true&model=turbo`;

        res.json({ imageUrl });

    } catch (error) {
        console.error('Image Gen Failed:', error);
        res.status(500).json({ message: 'Image Gen Failed', error: error.message });
    }
};

exports.virtualTryOn = async (req, res) => {
    try {
        const { personImage, dressImage, prompt } = req.body;
        if (!personImage || !dressImage) {
            return res.status(400).json({ message: 'Both person and dress images are required' });
        }

        // Extract user info from authenticated request (if available)
        const userInfo = req.user ? {
            id: req.user._id || req.user.id,
            email: req.user.email,
            name: req.user.name
        } : null;

        console.log('🤖 Sending images to Fal.ai for Virtual Try-On...');
        const falResult = await falService.virtualTryOn(personImage, dressImage, prompt, userInfo);

        // Proactive: Upload the Fal result to Cloudinary so the project "owns" the output
        let finalImageUrl = falResult.imageUrl;
        try {
            console.log('☁️ Uploading AI result to Cloudinary...');
            const uploadResult = await cloudinary.uploader.upload(falResult.imageUrl, {
                folder: 'chicplay/virtual-tryon',
                tags: ['ai-result', 'virtual-tryon']
            });
            finalImageUrl = uploadResult.secure_url;
        } catch (cloudinaryError) {
            console.warn('⚠️ Cloudinary upload failed, using original Fal URL:', cloudinaryError.message);
        }

        res.json({
            imageUrl: finalImageUrl,
            originalFalUrl: falResult.imageUrl,
            requestId: falResult.requestId,
            dashboardUrl: falResult.dashboardUrl,
            userTracking: userInfo ? `Request logged for ${userInfo.email}` : 'Anonymous request'
        });

    } catch (error) {
        console.error('Fal Try-On Failed:', error);
        res.status(500).json({ message: 'Virtual Try-On Failed', error: error.message });
    }
};

require('dotenv').config();
const { fal } = require("@fal-ai/client");

// Initialize the Fal client with the API key from environment variables
fal.config({
    credentials: process.env.FAL_KEY
});

console.log('🔑 Fal.ai client configured with API key:', process.env.FAL_KEY ? '✓ Key present' : '✗ Key missing');

const virtualTryOn = async (personImageUrl, dressImageUrl, promptExtra = "", userInfo = null) => {
    try {
        console.log('🚀 Starting Fal.ai Virtual Try-On...');

        // Log user info if provided
        if (userInfo) {
            console.log(`👤 Request from user: ${userInfo.email || userInfo.id || 'Anonymous'}`);
        }

        // Use the trigger token <sks> as recommended for this LoRA model
        const prompt = `<sks> high fashion photoshoot, the person is wearing the clothing from the second image. ${promptExtra}`.trim();

        // Build the request configuration
        const requestConfig = {
            input: {
                prompt: prompt,
                image_urls: [personImageUrl, dressImageUrl],
                num_inference_steps: 30,
                guidance_scale: 7.5
            },
            onQueueUpdate: (update) => {
                console.log(`[Fal.ai] Status: ${update.status}`);
            },
        };

        // Add user metadata if provided (helps users track their requests in Fal.ai dashboard)
        if (userInfo) {
            requestConfig.webhookUrl = userInfo.webhookUrl || undefined;
            // Note: Fal.ai uses the API key for authentication, but we can add custom metadata
            // Users would need their own Fal.ai API key to see requests in their dashboard
            console.log('📋 User metadata attached to request');
        }

        console.log('🛰️ Dispatching to Fal.ai model...');
        const result = await fal.subscribe("fal-ai/qwen-image-edit-2511/lora", requestConfig);

        console.log('✅ Fal.ai Try-On Complete.');
        const dashboardUrl = `https://fal.ai/dashboard/requests/${result.requestId}`;
        console.log(`🔗 Monitor result here: ${dashboardUrl}`);

        return {
            imageUrl: result.images && result.images[0] ? result.images[0].url : null,
            requestId: result.requestId,
            dashboardUrl: dashboardUrl
        };
    } catch (error) {
        console.error('❌ Fal.ai Service Error Detailed:', {
            message: error.message,
            status: error.status,
            data: error.data
        });
        throw error;
    }
};

module.exports = {
    virtualTryOn
};

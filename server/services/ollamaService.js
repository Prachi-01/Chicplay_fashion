const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Configuration for local Ollama instance
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://127.0.0.1:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llava'; // Default to llava for vision tasks

/**
 * Analyze an image (person or clothing) using LLaVA to detect key positions.
 * @param {string} base64Image 
 * @param {string} type - 'person' or 'clothing'
 */
const analyzeImageLandmarks = async (base64Image, type = 'person') => {
    try {
        const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

        const prompt = `
            You are a professional fashion technician. Analyze this image of a ${type}.
            Return a SINGLE JSON object with the following coordinates as percentages (0-100) from the TOP of the image:

            ${type === 'person' ? `
            - "shoulderLineY": The vertical position of the shoulders.
            - "waistLineY": The vertical position of the natural waist.
            - "hipsLineY": The vertical position of the hips.
            - "bodyType": One of ["slim", "athletic", "curvy", "plus"].
            - "skinTone": One of ["fair", "medium", "tan", "dark"].
            - "estimatedMeasurements": { "bust": number, "waist": number, "hips": number } (in inches, based on proportions).
            ` : `
            - "necklineY": The vertical position where the dress/top neckline or top edge begins.
            - "waistY": The vertical position of the waistline of the garment.
            - "bottomY": The vertical position of the bottom hem.
            - "garmentType": e.g., "maxi dress", "mini dress", "crop top".
            `}

            Rules:
            - Return ONLY the JSON object.
            - No markdown, no "here is your JSON", no code blocks.
            - Be as precise as possible with percentages.
        `;

        const response = await fetch(OLLAMA_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt: prompt,
                images: [cleanBase64],
                stream: false,
                format: "json",
                options: { temperature: 0.1 }
            })
        });

        if (!response.ok) throw new Error("Ollama connection failed");

        const data = await response.json();
        let text = data.response.replace(/```json\n?|```/g, '').trim();

        try {
            return JSON.parse(text);
        } catch (e) {
            const match = text.match(/\{[\s\S]*\}/);
            if (match) return JSON.parse(match[0]);
            throw e;
        }
    } catch (error) {
        console.error("Landmark Analysis Error:", error);
        return type === 'person'
            ? { shoulderLineY: 22.5, waistLineY: 45, hipsLineY: 60, bodyType: 'slim' }
            : { necklineY: 10, waistY: 40, bottomY: 90 };
    }
};

/**
 * Legacy wrapper for analyzeBodyShape
 */
const analyzeBodyShape = (base64Image) => analyzeImageLandmarks(base64Image, 'person');

/**
 * Generate a creative prompt for text-to-image models based on the dress.
 * @param {string} base64Image 
 */
const generateCreativePrompt = async (base64Image) => {
    try {
        const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
        const prompt = `
            You are a creative director. Analyze this dress image.
            Create a highly detailed stable-diffusion style text-to-image prompt to generate a photoshoot of a model wearing this EXACT dress.
            Include details about:
            - The Dress (color, fabric, cut, length, details) - BE SPECIFIC.
            - The Model (pose, styling).
            - The Setting (luxury, cinematic lighting, editorial background).
            - The Vibe (elegant, edgy, soft, etc).
            
            Return a SINGLE JSON object:
            {
                "prompt": "Full prompt string here...",
                "styleTags": ["tag1", "tag2"]
            }
        `;

        const response = await fetch(OLLAMA_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt: prompt,
                images: [cleanBase64],
                stream: false,
                format: "json",
                options: { temperature: 0.7 } // Higher temp for creativity
            })
        });

        if (!response.ok) throw new Error("Ollama connection failed");

        const data = await response.json();
        let text = data.response.replace(/```json\n?|```/g, '').trim();
        return JSON.parse(text);

    } catch (error) {
        console.error("Prompt Generation Error:", error);
        return {
            prompt: "A beautiful fashion model wearing a stylish dress, cinematic lighting, high resolution, 8k.",
            styleTags: ["fashion", "portrait"]
        };
    }
};

/**
 * Get styling advice for a specific dress on a user body.
 * @param {string} userImageBase64 
 * @param {string} dressImageBase64 
 */
const getFitAdvice = async (userImageBase64, dressImageBase64) => {
    try {
        const cleanUserImg = userImageBase64.replace(/^data:image\/\w+;base64,/, "");
        const cleanDressImg = dressImageBase64.replace(/^data:image\/\w+;base64,/, "");

        const prompt = `
            I have a user photo (first image) and a dress photo (second image).
            Imagine the user wearing this dress.
            1. Rate the potential fit from 1-10.
            2. Give 1 sentence of styling advice.
            3. Suggest a specific accessory type that would match.
            4. Is the dress "casual", "formal", or "party"?
            
            Return in JSON format keys: "score", "advice", "accessory", "occasion".
        `;

        const response = await fetch(OLLAMA_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt: prompt,
                images: [cleanUserImg, cleanDressImg],
                stream: false,
                format: "json"
            })
        });

        const data = await response.json();
        return JSON.parse(data.response);

    } catch (error) {
        console.error("Error in getFitAdvice:", error);
        return { score: 8, advice: "Looking clear!", accessory: "Necklace", occasion: "Casual" };
    }
};

module.exports = {
    analyzeBodyShape,
    analyzeImageLandmarks,
    generateCreativePrompt,
    getFitAdvice
};

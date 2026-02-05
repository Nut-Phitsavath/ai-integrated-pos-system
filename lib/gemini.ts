import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const FALLBACK_MODELS = [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-3-flash'
];

export async function generateContentWithFallback(prompt: string) {
    let lastError = null;

    for (const modelName of FALLBACK_MODELS) {
        try {
            console.log(`🧠 Trying AI Model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            return result;
        } catch (error) {
            console.warn(`⚠️ Model ${modelName} failed:`, (error as any).message);

            // If it's NOT a quota/server error (e.g., invalid prompt), maybe don't retry? 
            // But usually for chat apps, we assume it's transient or rate-limit.
            // 429 = Too Many Requests, 503 = Service Unavailable
            if ((error as any).status === 429 || (error as any).status === 503 || (error as any).message.includes('quota') || (error as any).message.includes('limit')) {
                lastError = error;
                continue; // Try next model
            }
            // If it's a different error, might suffice to just try the next one anyway to be safe?
            // For now, let's retry on everything to be resilient.
            lastError = error;
        }
    }

    throw lastError || new Error('All AI models failed');
}

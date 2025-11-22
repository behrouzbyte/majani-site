import { GoogleGenAI } from "@google/genai";
import { Category, ItemCondition } from "../types";

// Helper to initialize the AI client
const getAiClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY is missing. AI features will return mock data.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateDescription = async (title: string, condition: ItemCondition, category: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "این یک وسیله عالی است که به دنبال خانه جدیدی می‌گردد! (هوش مصنوعی در دسترس نیست)";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a friendly, appealing, and short description (max 50 words) in PERSIAN (Farsi) language for a free item listed on a donation marketplace.
      Item Title: ${title}
      Condition: ${condition}
      Category: ${category}
      Tone: Helpful, neighborly, polite Persian.`,
    });
    return response.text || "توضیحات تولید نشد.";
  } catch (error) {
    console.error("Error generating description:", error);
    return "یک وسیله رایگان و کاربردی، آماده تحویل.";
  }
};

export const suggestSafetyTips = async (itemTitle: string): Promise<string[]> => {
    const ai = getAiClient();
    if (!ai) return ["در مکان عمومی قرار بگذارید", "همراه یک دوست بروید", "قبل از دریافت، کالا را بررسی کنید"];

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Give me 3 short, bullet-point safety tips in PERSIAN (Farsi) for picking up a free "${itemTitle}" from a stranger. Return ONLY the bullet points text, no formatting.`,
        });
        return response.text.split('\n').filter(line => line.trim().length > 0).map(l => l.replace(/^[•-]\s*/, ''));
    } catch (e) {
        return ["قرار در مکان عمومی", "بررسی کیفیت کالا", "رعایت نکات ایمنی"];
    }
}
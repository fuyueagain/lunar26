import { GoogleGenAI, Type } from "@google/genai";
import { CoupletResult, FortuneResult } from "../types";

// Helper interface to handle Veo key selection on window without global type conflicts
interface WindowWithAIStudio {
  aistudio?: {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  };
}

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a Chinese New Year couplet.
 */
export const generateCouplet = async (userPrompt: string): Promise<CoupletResult> => {
  const ai = getClient();
  const prompt = `
    You are a Chinese classical poetry expert and a New Year architect.
    Create a set of Chinese New Year couplets based on this user wish: "${userPrompt}".
    
    Requirements:
    1. Strictly adhere to the rules of 'Ping Ze' (tonal patterns) and parallelism.
    2. The style should be festive, elegant, and traditional.
    3. **CRITICAL**: The output text MUST be in **Traditional Chinese (繁體中文)**.
    4. Return ONLY valid JSON.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          upper: { type: Type.STRING, description: "The upper scroll (Shang Lian) in Traditional Chinese" },
          lower: { type: Type.STRING, description: "The lower scroll (Xia Lian) in Traditional Chinese" },
          horizontal: { type: Type.STRING, description: "The horizontal scroll (Heng Pi) in Traditional Chinese" },
          explanation: { type: Type.STRING, description: "Brief explanation of the meaning in Traditional Chinese" },
        },
        required: ["upper", "lower", "horizontal", "explanation"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as CoupletResult;
};

/**
 * Generates a 3D IP Figure image.
 */
export const generateIPFigure = async (userPrompt: string, base64Image?: string): Promise<string> => {
  const ai = getClient();
  
  // Construct a prompt that enforces the "3D Blind Box / Pop Mart" style
  const fullPrompt = `
    Design a 'Pop Mart' style 3D character for Chinese New Year. 
    Style: C4D rendering, blind box toy style, cute proportions, clean lighting, isometric view, high detail, 8k resolution.
    Theme: Lunar New Year, Red and Gold color palette, festive vibe, Traditional Chinese patterns.
    User's Specific Request: ${userPrompt}.
    Background: Studio solid color or simple festive pattern.
  `;

  let parts: any[] = [{ text: fullPrompt }];
  
  // If user uploaded a reference image
  if (base64Image) {
    // Strip prefix if present
    const cleanBase64 = base64Image.split(',')[1] || base64Image;
    parts = [
      {
        inlineData: {
          mimeType: 'image/png', // Assuming PNG/JPEG generic handling
          data: cleanBase64
        }
      },
      { text: fullPrompt + " Based on the visual characteristics of this reference image." }
    ];
  }

  // Use Image Gen Model
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
    config: {
        // No specific image config needed for 2.5 flash image standard gen unless specific aspect ratio
    }
  });

  // Extract Image
  const candidates = response.candidates;
  if (candidates && candidates.length > 0) {
     for (const part of candidates[0].content.parts) {
         if (part.inlineData) {
             return `data:image/png;base64,${part.inlineData.data}`;
         }
     }
  }
  
  throw new Error("Failed to generate image");
};

/**
 * Generates a New Year Fortune Stick (Divination).
 */
export const generateFortune = async (userPrompt: string): Promise<FortuneResult> => {
  const ai = getClient();
  
  const prompt = `
    Role: You are a wise temple oracle (廟祝) for the Lunar New Year.
    Task: Draw a fortune stick (求籤) for the user based on their wish: "${userPrompt}".
    
    Requirements:
    1. Determine a luck level (e.g., 上上籤, 中吉, 上吉) that roughly aligns with a positive New Year vibe, but be authentic.
    2. Provide a 4-line traditional Chinese poem (簽文) that acts as the oracle.
    3. Provide a 'title' for the stick (e.g., historical story reference like '蘇武牧羊' or '劉備求賢').
    4. Provide an 'explanation' (解籤) connecting the poem to the user's wish.
    5. **Output Language**: Traditional Chinese (繁體中文).
    6. Return ONLY valid JSON.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          level: { type: Type.STRING, description: "Luck level (e.g. 上上籤)" },
          title: { type: Type.STRING, description: "Title of the fortune stick story" },
          poem: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "4 lines of the poem" 
          },
          explanation: { type: Type.STRING, description: "Interpretation of the fortune" },
        },
        required: ["level", "title", "poem", "explanation"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as FortuneResult;
};
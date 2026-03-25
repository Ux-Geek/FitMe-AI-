import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function generateTryOn(userImageBase64: string, productImageUrl: string, productName: string): Promise<string | null> {
  try {
    // Fetch product image as base64
    const productResponse = await fetch(productImageUrl);
    const productBlob = await productResponse.blob();
    const productBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(productBlob);
    });

    const userPart = {
      inlineData: {
        mimeType: "image/png",
        data: userImageBase64.split(',')[1],
      },
    };

    const productPart = {
      inlineData: {
        mimeType: "image/png",
        data: productBase64.split(',')[1],
      },
    };

    const prompt = `
      You are a high-end virtual fashion try-on engine. 
      Take the person in the first image and render them wearing the clothing item shown in the second image (${productName}).
      Maintain the person's identity, pose, and background as much as possible.
      The clothing should fit naturally on their body.
      Return ONLY the final image of the person wearing the outfit.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: { 
        parts: [
          userPart, 
          productPart, 
          { text: prompt }
        ] 
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4",
          imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    return null;
  } catch (error) {
    console.error("Error generating try-on:", error);
    return null;
  }
}

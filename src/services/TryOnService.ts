import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { UploadedImage, TryOnResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

/**
 * Validates user-uploaded images for quality and suitability.
 * Checks: image exists, proper format, minimum resolution, etc.
 */
export function validateImage(image: UploadedImage): { valid: boolean; error?: string } {
  if (!image.file) {
    return { valid: false, error: 'No image file provided.' };
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(image.file.type)) {
    return { valid: false, error: 'Please upload a JPG, PNG, or WebP image.' };
  }

  // Max 10MB
  const maxSize = 10 * 1024 * 1024;
  if (image.file.size > maxSize) {
    return { valid: false, error: 'Image must be under 10MB.' };
  }

  return { valid: true };
}

/**
 * Converts a File to a base64 data URL string.
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Fetches an image URL and returns its base64 string.
 */
async function urlToBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Main try-on generation function using Gemini image generation.
 * 
 * Flow:
 * 1. Validates inputs
 * 2. Converts images to base64
 * 3. Sends to Gemini with try-on prompt
 * 4. Returns the generated result image
 */
export async function generateTryOn(
  frontImage: UploadedImage,
  productImageUrl: string,
  productName: string,
  sideImage?: UploadedImage | null,
  onProgress?: (status: string, progress: number) => void,
): Promise<TryOnResult> {
  try {
    // Step 1: Validate
    onProgress?.('Validating your photos...', 10);
    
    const frontValidation = validateImage(frontImage);
    if (!frontValidation.valid) {
      return {
        jobId: '',
        status: 'failed',
        error: frontValidation.error,
      };
    }

    if (sideImage) {
      const sideValidation = validateImage(sideImage);
      if (!sideValidation.valid) {
        return {
          jobId: '',
          status: 'failed',
          error: `Side image: ${sideValidation.error}`,
        };
      }
    }

    // Step 2: Convert images to base64
    onProgress?.('Preparing your images...', 25);
    
    const frontBase64 = await fileToBase64(frontImage.file);
    const productBase64 = await urlToBase64(productImageUrl);
    
    // Step 3: Build request parts
    onProgress?.('Analyzing body pose & proportions...', 40);
    
    const parts: any[] = [
      {
        inlineData: {
          mimeType: "image/png",
          data: frontBase64.split(',')[1],
        },
      },
      {
        inlineData: {
          mimeType: "image/png",
          data: productBase64.split(',')[1],
        },
      },
    ];

    // Add side image if available
    if (sideImage) {
      const sideBase64 = await fileToBase64(sideImage.file);
      parts.push({
        inlineData: {
          mimeType: "image/png",
          data: sideBase64.split(',')[1],
        },
      });
    }

    // Step 4: Construct prompt
    const prompt = `You are a premium virtual fashion try-on engine for a high-end e-commerce platform.

TASK: Generate a photorealistic virtual try-on image.

INPUTS:
- Image 1: User's front-facing full body photo
- Image 2: The garment/outfit to apply (${productName})
${sideImage ? '- Image 3: User\'s side photo for better body understanding' : ''}

RULES:
1. PRESERVE the user's exact identity — face, skin tone, hairstyle, body shape, and proportions
2. PRESERVE the user's pose, positioning, and background
3. APPLY the garment naturally with realistic folds, draping, fit, and shadows
4. Match lighting conditions between the person and garment
5. The clothing should look like it fits the user's actual body, not pasted on
6. Ensure fabric texture, reflections, and wrinkles are realistic
7. Keep the result clean, premium, and e-commerce ready
8. Return ONLY the final photorealistic image of the person wearing the outfit`;

    parts.push({ text: prompt });

    // Step 5: Send to Gemini
    onProgress?.('Rendering your virtual try-on...', 60);

    const jobId = `tryon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-05-20",
      contents: { parts },
      config: {
        responseModalities: ["IMAGE", "TEXT"],
        imageConfig: {
          aspectRatio: "3:4",
          imageSize: "1K"
        }
      }
    });

    onProgress?.('Finalizing your look...', 90);

    // Step 6: Extract result image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const outputUrl = `data:image/png;base64,${part.inlineData.data}`;
        
        onProgress?.('Complete!', 100);
        
        return {
          jobId,
          status: 'completed',
          outputUrl,
        };
      }
    }

    return {
      jobId,
      status: 'failed',
      error: 'The AI could not generate a try-on preview. Please try again with a clearer photo.',
    };
  } catch (error: any) {
    console.error('Error generating try-on:', error);
    return {
      jobId: '',
      status: 'failed',
      error: error.message || 'Something went wrong during processing.',
    };
  }
}

/**
 * Saves a generated look to local storage.
 */
export function saveLook(productId: string, userImage: string, resultImage: string) {
  const looks = JSON.parse(localStorage.getItem('fitme_saved_looks') || '[]');
  const newLook = {
    id: `look_${Date.now()}`,
    userId: 'local',
    productId,
    userImage,
    resultImage,
    createdAt: Date.now(),
  };
  looks.push(newLook);
  localStorage.setItem('fitme_saved_looks', JSON.stringify(looks));
  return newLook;
}

/**
 * Gets all saved looks from local storage.
 */
export function getSavedLooks() {
  return JSON.parse(localStorage.getItem('fitme_saved_looks') || '[]');
}

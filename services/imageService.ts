// FIX: Replaced the mock image generation service with a real implementation
// using the Google Gemini API for multimodal image generation.
import { GoogleGenAI, Modality } from "@google/genai";
import { ImageSlot, AspectRatio, Creation } from '../types';

// Helper function to extract base64 data and mime type from data URL
const parseDataUrl = (dataUrl: string) => {
  const match = dataUrl.match(/^data:(image\/\w+);base64,(.*)$/);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
};

/**
 * Creates a new image composition using the Gemini API.
 */
export const createCreation = async (
  slots: ImageSlot,
  prompt: string,
  style: string,
  aspectRatio: AspectRatio
): Promise<Creation> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Construct a detailed prompt for the model
  let fullPrompt = `Generate a high-quality, ${style.toLowerCase()} style image. The scene is: "${prompt}". The desired aspect ratio is ${aspectRatio}.`;
  
  const finalParts: any[] = [];
  const imageParts: any[] = [];
  
  // Add image parts if they exist
  const uploadedImages = Object.entries(slots).filter(([, value]) => value !== null);

  if (uploadedImages.length > 0) {
      fullPrompt += `\n\nPlease incorporate the following image elements into the final composition.`;
      for (const [key, dataUrl] of uploadedImages) {
          if(dataUrl) {
            const parsed = parseDataUrl(dataUrl);
            if (parsed) {
                // Add description for context before each image
                imageParts.push({text: `This is the image for the '${key}':`});
                imageParts.push({
                  inlineData: {
                    data: parsed.data,
                    mimeType: parsed.mimeType,
                  },
                });
            }
          }
      }
  }

  // Add the final text prompt at the beginning, followed by images
  finalParts.push({ text: fullPrompt });
  finalParts.push(...imageParts);
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: finalParts },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });
  
  let imageUrl = '';
  // The response can have multiple candidates, we'll take the first one.
  const candidate = response.candidates?.[0];
  if (candidate) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          const base64ImageBytes: string = part.inlineData.data;
          // The frontend expects a data URL
          imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
          break; // Assuming only one image is returned per candidate
        }
      }
  }

  if (!imageUrl) {
    // Check for safety ratings or other reasons for no content
    const blockReason = response.promptFeedback?.blockReason;
    if (blockReason) {
        throw new Error(`Image generation blocked. Reason: ${blockReason.reason}`);
    }
    throw new Error("AI failed to generate an image. The response was empty.");
  }
  
  const creationId = `creation_${Date.now()}`;

  const newCreation: Creation = {
    id: creationId,
    prompt,
    style,
    aspectRatio,
    imageUrl: imageUrl,
    shareUrl: `https://example.com/view/${creationId}`, // This remains a mock URL
  };

  return newCreation;
};


/**
 * API: DELETE /api/creations/{id}
 * Deletes a creation. Since we are generating on the client, this is a no-op.
 */
export const deleteCreation = async (creationId: string): Promise<void> => {
  console.log('API Call: deleteCreation', { creationId });
  // Since generation is now on the client and we're not storing creations,
  // this is a logical no-op. The UI state is cleared in the component.
  console.log(`Creation ${creationId} has been "deleted" from client state.`);
  return Promise.resolve();
};

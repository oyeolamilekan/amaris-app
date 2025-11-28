import { generateText } from "ai";
import { getAspectRatioDimensions } from "../lib/ai";
import { completeGeneration, failGeneration } from "./generation";
import type { Model } from "../lib/models";

export interface ProcessGenerationInput {
  generationId: string;
  prompt: string;
  styleImageUrl: string;
  aspectRatio: string;
  model?: Model;
  userId: string;
}

async function downloadImageAsBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString("base64");
  const contentType = response.headers.get("content-type") || "image/png";

  return `data:${contentType};base64,${base64}`;
}

function extractBase64Data(dataUrl: string): Buffer {
  if (dataUrl.startsWith("data:")) {
    const base64String = dataUrl.split(",")[1];
    if (!base64String) {
      throw new Error("Invalid data URL format");
    }
    return Buffer.from(base64String, "base64");
  }

  return Buffer.from(dataUrl, "base64");
}

function getMediaType(dataUrl: string): string {
  if (dataUrl.startsWith("data:")) {
    const match = dataUrl.match(/^data:([^;]+);/);
    return match && match[1] ? match[1] : "image/png";
  }

  return "image/png";
}

async function generateImageWithGemini(
  prompt: string,
  styleImageBase64: string,
  model: Model,
): Promise<string> {
  const startTime = Date.now();
  console.log(`[Gemini] Generating image with model: ${model.type}`);

  const result = await generateText({
    model: model.type,
    providerOptions: {
      google: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `${prompt}\n\nGenerate an image that matches the style and characteristics of the provided reference image.`,
          },
          {
            type: "file",
            mediaType: getMediaType(styleImageBase64),
            data: extractBase64Data(styleImageBase64),
          },
        ],
      },
    ],
  });

  const imageFiles = result.files?.filter((file) =>
    file.mediaType?.startsWith("image/"),
  );

  if (!imageFiles || imageFiles.length === 0) {
    throw new Error("No image generated in response");
  }

  const file = imageFiles[0]!;
  const base64Data =
    file.base64 || Buffer.from(file.uint8Array).toString("base64");
  const imageUrl = `data:${file.mediaType || "image/png"};base64,${base64Data}`;

  const endTime = Date.now();
  console.log(`[Gemini] Generation completed in ${endTime - startTime}ms`);

  return imageUrl;
}

export async function processGeneration(
  input: ProcessGenerationInput,
): Promise<void> {
  const { generationId, prompt, styleImageUrl, aspectRatio, model } = input;

  try {
    console.log(`[Generation ${generationId}] Starting`);

    if (!model) {
      throw new Error("Model is required for image generation");
    }

    const styleImageBase64 = await downloadImageAsBase64(styleImageUrl);
    const dimensions = getAspectRatioDimensions(aspectRatio);

    const generatedImageDataUrl = await generateImageWithGemini(
      prompt,
      styleImageBase64,
      model,
    );

    await completeGeneration(generationId, generatedImageDataUrl, {
      dimensions,
      styleImageUrl,
      model: {
        id: model.id,
        name: model.name,
        type: model.type,
        provider: model.provider,
        cost: model.cost,
      },
    });

    console.log(`[Generation ${generationId}] ✅ Completed successfully`);
  } catch (error) {
    console.error(`[Generation ${generationId}] ❌ Failed`, error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    await failGeneration(generationId, message);
  }
}

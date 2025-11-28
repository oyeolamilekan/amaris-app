/**
 * Generation Handlers Hook
 */

import type { Dispatch, SetStateAction } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  generateImage,
  pollGenerationStatus,
  addChatMessage,
  updateChatMessage,
} from "@/lib/api";
import type { ChatSession, ChatMessage } from "../types";
import { updateChat } from "../utils";
import { POLL_MAX_ATTEMPTS, POLL_INTERVAL_MS } from "../constants";

interface UseGenerationHandlersProps {
  chats: ChatSession[];
  setChats: Dispatch<SetStateAction<ChatSession[]>>;
  activeChat: ChatSession | undefined;
  localCredits: number | null;
  setLocalCredits: Dispatch<SetStateAction<number | null>>;
  creditsLeft: number | null;
  queryClient: QueryClient;
  userId: string | undefined;
}

export function useGenerationHandlers({
  chats,
  setChats,
  activeChat,
  localCredits,
  setLocalCredits,
  creditsLeft,
  queryClient,
  userId,
}: UseGenerationHandlersProps) {
  const handleSendPrompt = async () => {
    if (!activeChat || activeChat.isGenerating) return;

    const prompt = activeChat.draft.trim();
    if (!prompt) {
      toast.info("Add a creative prompt to continue.");
      return;
    }

    if (!activeChat.config.styleImageUrl) {
      toast.error("Upload a style reference before generating images.");
      return;
    }

    // Set generating state and clear draft
    setChats((prev) =>
      updateChat(prev, activeChat.id, {
        isGenerating: true,
        draft: "",
      }),
    );

    // Create user and assistant messages
    const userMessageId = crypto.randomUUID();
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: "user",
      content: prompt,
      createdAt: new Date().toISOString(),
      images: [],
    };

    const assistantMessageId = crypto.randomUUID();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
      images: [],
      status: "pending",
      error: null,
    };

    setChats((prev) =>
      updateChat(prev, activeChat.id, (chat) => {
        console.log("➕ Adding messages to chat:", {
          chatId: chat.id,
          chatName: chat.name,
          previousMessageCount: chat.messages.length,
          newMessageCount: chat.messages.length + 2,
        });
        return {
          ...chat,
          messages: [...chat.messages, userMessage, assistantMessage],
        };
      }),
    );

    toast.info("Starting image generation...");

    // Persist messages to backend
    try {
      await addChatMessage(activeChat.id, {
        id: userMessageId,
        role: "user",
        content: prompt,
        images: [],
      });

      await addChatMessage(activeChat.id, {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        status: "pending",
      });
    } catch (error) {
      console.error("Failed to persist messages:", error);
      // Continue anyway, but warn?
    }

    let latestCredits = localCredits ?? creditsLeft;
    let hasFailed = false;
    let failureMessage: string | null = null;
    const generatedImages: string[] = [];

    try {
      // Generate multiple images if configured
      for (let i = 0; i < activeChat.config.imageCount; i++) {
        const response = await generateImage({
          prompt,
          aspectRatio: activeChat.config.aspectRatio,
          styleImageUrl: activeChat.config.styleImageUrl,
          styleImageName: activeChat.config.styleImageName ?? undefined,
          model: activeChat.model.id,
          modelType: activeChat.model.type,
        });

        if (!response.success) {
          throw new Error("Failed to start generation");
        }

        latestCredits = response.creditsRemaining;

        // Poll for completion
        const generation = await pollGenerationStatus(
          response.generationId,
          undefined,
          POLL_MAX_ATTEMPTS,
          POLL_INTERVAL_MS,
        );

        if (generation.status === "failed") {
          hasFailed = true;
          failureMessage =
            generation.errorMessage ||
            "The generator could not create the image.";
          break;
        }

        // Add generated image to assistant message
        if (generation.generatedImageUrl) {
          const imageUrl = generation.generatedImageUrl;
          generatedImages.push(imageUrl);

          setChats((prev) =>
            updateChat(prev, activeChat.id, (chat) => ({
              ...chat,
              messages: chat.messages.map((msg) =>
                msg.id === assistantMessage.id
                  ? { ...msg, images: [...msg.images, imageUrl] }
                  : msg,
              ),
            })),
          );

          // Update backend with new image
          try {
            await updateChatMessage(activeChat.id, assistantMessageId, {
              images: generatedImages,
              status: "pending",
            });
          } catch (error) {
            console.error("Failed to update message with image:", error);
          }
        }
      }

      if (hasFailed) {
        throw new Error(failureMessage || "Generation failed");
      }

      // Update credits and mark as completed
      setLocalCredits(latestCredits);

      setChats((prev) =>
        updateChat(prev, activeChat.id, (chat) => ({
          ...chat,
          isGenerating: false,
          messages: chat.messages.map((msg) =>
            msg.id === assistantMessage.id
              ? { ...msg, status: "completed" }
              : msg,
          ),
        })),
      );

      // Final update to backend
      try {
        await updateChatMessage(activeChat.id, assistantMessageId, {
          images: generatedImages,
          status: "completed",
        });
      } catch (error) {
        console.error("Failed to mark message as completed:", error);
      }

      toast.success("Images ready to view.");

      // Invalidate queries to refresh data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["credits"] }),
        queryClient.invalidateQueries({ queryKey: ["generations", userId] }),
      ]);
    } catch (error) {
      console.error("Generation error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to generate image";

      setChats((prev) =>
        updateChat(prev, activeChat.id, (chat) => ({
          ...chat,
          isGenerating: false,
          messages: chat.messages.map((msg) =>
            msg.id === assistantMessage.id
              ? { ...msg, status: "failed", error: message }
              : msg,
          ),
        })),
      );

      // Update backend with failure
      try {
        await updateChatMessage(activeChat.id, assistantMessageId, {
          status: "failed",
          error: message,
        });
      } catch (err) {
        console.error("Failed to mark message as failed:", err);
      }

      toast.error(message);
    }
  };

  return {
    handleSendPrompt,
  };
}

/**
 * Generation Handlers Hook
 */

import type { Dispatch, SetStateAction } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { generateImage, pollGenerationStatus } from "@/lib/api";
import type { ChatSession, ChatMessage } from "../types";
import { updateChat } from "../utils";
import { POLL_MAX_ATTEMPTS, POLL_INTERVAL_MS } from "../constants";

interface UseGenerationHandlersProps {
  chats: ChatSession[];
  setChats: Dispatch<SetStateAction<ChatSession[]>>;
  activeChat: ChatSession | undefined;
  localCredits: number | null;
  setLocalCredits: Dispatch<SetStateAction<number | null>>;
  creditsLeft: number;
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

    setChats((prev) =>
      updateChat(prev, activeChat.id, {
        isGenerating: true,
        draft: "",
      }),
    );

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
      createdAt: new Date().toISOString(),
      images: [],
    };

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
      images: [],
      status: "pending",
      error: null,
    };

    setChats((prev) =>
      updateChat(prev, activeChat.id, (chat) => ({
        ...chat,
        messages: [...chat.messages, userMessage, assistantMessage],
      })),
    );

    toast.info("Starting image generation...");

    let latestCredits = localCredits ?? creditsLeft;
    let hasFailed = false;
    let failureMessage: string | null = null;

    try {
      for (let i = 0; i < activeChat.config.imageCount; i++) {
        const response = await generateImage({
          prompt,
          styleImageUrl: activeChat.config.styleImageUrl,
          styleImageName: activeChat.config.styleImageName ?? undefined,
          model: activeChat.model.id,
          modelType: activeChat.model.type,
        });

        if (!response.success) {
          throw new Error("Failed to start generation");
        }

        latestCredits = response.creditsRemaining;

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

        if (generation.generatedImageUrl) {
          const imageUrl = generation.generatedImageUrl;
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
        }
      }

      if (hasFailed) {
        throw new Error(failureMessage || "Generation failed");
      }

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

      toast.success("Images ready to view.");

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

      toast.error(message);
    }
  };

  return {
    handleSendPrompt,
  };
}

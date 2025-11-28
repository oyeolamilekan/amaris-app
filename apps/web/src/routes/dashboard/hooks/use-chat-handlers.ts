/**
 * Chat Handlers Hook
 */

import type { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import type { Model } from "@/lib/models";
import type { ChatSession } from "../types";
import { createChatSession, updateChat } from "../utils";
import { uploadStyleImage } from "@/lib/api";
import {
  FREE_TIER_MAX_IMAGES,
  PRO_TIER_MAX_IMAGES,
} from "../constants";

interface UseChatHandlersProps {
  chats: ChatSession[];
  setChats: Dispatch<SetStateAction<ChatSession[]>>;
  activeChatId: string;
  setActiveChatId: Dispatch<SetStateAction<string>>;
  hasProSubscription: boolean;
}

export function useChatHandlers({
  chats,
  setChats,
  activeChatId,
  setActiveChatId,
  hasProSubscription,
}: UseChatHandlersProps) {
  const handleDraftChange = (chatId: string, value: string) => {
    setChats((prev) => updateChat(prev, chatId, { draft: value }));
  };

  const handleAspectRatioChange = (chatId: string, ratio: string) => {
    setChats((prev) =>
      updateChat(prev, chatId, (chat) => ({
        ...chat,
        config: { ...chat.config, aspectRatio: ratio },
      })),
    );
  };

  const handleImageCountChange = (chatId: string, value: number) => {
    const maxImages = hasProSubscription
      ? PRO_TIER_MAX_IMAGES
      : FREE_TIER_MAX_IMAGES;
    const count = Math.min(Math.max(value, 1), maxImages);
    setChats((prev) =>
      updateChat(prev, chatId, (chat) => ({
        ...chat,
        config: { ...chat.config, imageCount: count },
      })),
    );
  };

  const handleModelChange = (chatId: string, model: Model) => {
    setChats((prev) => updateChat(prev, chatId, { model }));
  };

  const handleStyleImageUpload = async (
    chatId: string,
    file: File | undefined,
  ) => {
    if (!file) return;

    setChats((prev) =>
      updateChat(prev, chatId, (chat) => ({
        ...chat,
        config: { ...chat.config, isUploading: true },
      })),
    );

    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = reader.result as string;
      setChats((prev) =>
        updateChat(prev, chatId, (chat) => ({
          ...chat,
          config: {
            ...chat.config,
            styleImagePreview: preview,
            styleImageName: file.name,
          },
        })),
      );
    };
    reader.readAsDataURL(file);

    try {
      const result = await uploadStyleImage(file);
      if (!result.success || !result.url) {
        throw new Error(result.error || "Upload failed");
      }

      const styleImageUrl = result.url;

      setChats((prev) =>
        updateChat(prev, chatId, (chat) => ({
          ...chat,
          config: { ...chat.config, styleImageUrl },
        })),
      );
      toast.success("Style reference uploaded successfully.");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload style image",
      );
      setChats((prev) =>
        updateChat(prev, chatId, (chat) => ({
          ...chat,
          config: {
            ...chat.config,
            styleImagePreview: null,
            styleImageUrl: null,
            styleImageName: null,
          },
        })),
      );
    } finally {
      setChats((prev) =>
        updateChat(prev, chatId, (chat) => ({
          ...chat,
          config: { ...chat.config, isUploading: false },
        })),
      );
    }
  };

  const handleRemoveStyleImage = (chatId: string) => {
    setChats((prev) =>
      updateChat(prev, chatId, (chat) => ({
        ...chat,
        config: {
          ...chat.config,
          styleImagePreview: null,
          styleImageUrl: null,
          styleImageName: null,
        },
      })),
    );
  };

  const handleCreateChat = () => {
    const newChat = createChatSession(chats.length + 1);
    setChats((prev) => [...prev, newChat]);
    setActiveChatId(newChat.id);
  };

  const handleDeleteChat = (chatId: string) => {
    if (chats.length === 1) {
      toast.info("Keep at least one chat open.");
      return;
    }
    const filtered = chats.filter((chat) => chat.id !== chatId);
    setChats(filtered);
    if (activeChatId === chatId && filtered.length > 0) {
      setActiveChatId(filtered[0].id);
    }
  };

  const handleRenameChat = (chatId: string, value: string) => {
    setChats((prev) => updateChat(prev, chatId, { name: value }));
  };

  return {
    handleDraftChange,
    handleAspectRatioChange,
    handleImageCountChange,
    handleModelChange,
    handleStyleImageUpload,
    handleRemoveStyleImage,
    handleCreateChat,
    handleDeleteChat,
    handleRenameChat,
  };
}

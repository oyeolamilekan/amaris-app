/**
 * Chat Handlers Hook
 */

import type { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import type { Model } from "@/lib/models";
import type { ChatSession } from "../types";
import { createChatSession, updateChat } from "../utils";
import { FREE_TIER_MAX_IMAGES, PRO_TIER_MAX_IMAGES } from "@/constants";
import {
  createChat,
  updateChatAPI,
  deleteChatAPI,
  uploadStyleImage,
} from "@/lib/api";

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
  const handleDraftChange = async (chatId: string, value: string) => {
    // Update local state immediately
    setChats((prev) => updateChat(prev, chatId, { draft: value }));

    // Debounce database update to avoid too many calls
    // For now, just update locally - can add debouncing later
  };

  const handleImageCountChange = async (chatId: string, value: number) => {
    const maxImages = hasProSubscription
      ? PRO_TIER_MAX_IMAGES
      : FREE_TIER_MAX_IMAGES;
    const count = Math.min(Math.max(value, 1), maxImages);

    // Update local state optimistically
    setChats((prev) =>
      updateChat(prev, chatId, (chat) => ({
        ...chat,
        config: { ...chat.config, imageCount: count },
      })),
    );

    try {
      await updateChatAPI(chatId, { imageCount: count });
    } catch (error) {
      console.error("Failed to update image count:", error);
    }
  };

  const handleModelChange = (chatId: string, model: Model) => {
    setChats((prev) => updateChat(prev, chatId, { model }));
  };

  const handleOutputStyleChange = async (chatId: string, style: string) => {
    // Update local state optimistically
    setChats((prev) =>
      updateChat(prev, chatId, (chat) => ({
        ...chat,
        config: { ...chat.config, outputStyle: style },
      })),
    );

    try {
      await updateChatAPI(chatId, { outputStyle: style });
    } catch (error) {
      console.error("Failed to update output style:", error);
    }
  };

  const handleStyleImageUpload = async (
    chatId: string,
    file: File | undefined,
  ) => {
    if (!file) return;

    // 1. Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = async () => {
      const preview = reader.result as string;

      setChats((prev) =>
        updateChat(prev, chatId, (chat) => ({
          ...chat,
          config: {
            ...chat.config,
            styleImagePreview: preview,
            styleImageUrl: preview, // Temporary local preview
            styleImageName: file.name,
            isUploading: true, // Set uploading state
          },
        })),
      );

      try {
        // 2. Upload to Cloudinary
        toast.info("Uploading style image...");
        const uploadResult = await uploadStyleImage(file);

        if (!uploadResult.success || !uploadResult.url) {
          throw new Error(uploadResult.error || "Upload failed");
        }

        const imageUrl = uploadResult.url;
        console.log("✅ Style image uploaded:", imageUrl);

        // 3. Update local state with real URL
        setChats((prev) =>
          updateChat(prev, chatId, (chat) => ({
            ...chat,
            config: {
              ...chat.config,
              styleImageUrl: imageUrl, // Replace base64 with URL
              isUploading: false,
            },
          })),
        );

        // 4. Save URL to database
        await updateChatAPI(chatId, {
          styleImageUrl: imageUrl,
          styleImageName: file.name,
        });

        toast.success("Style attached successfully.");
      } catch (error) {
        console.error("Failed to upload style image:", error);
        toast.error("Failed to upload image. Please try again.");

        // Revert on failure
        setChats((prev) =>
          updateChat(prev, chatId, (chat) => ({
            ...chat,
            config: {
              ...chat.config,
              styleImagePreview: null,
              styleImageUrl: null,
              styleImageName: null,
              isUploading: false,
            },
          })),
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveStyleImage = async (chatId: string) => {
    console.log("🗑️ Removing style from chat:", { chatId });

    // Update local state optimistically
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

    try {
      await updateChatAPI(chatId, {
        styleImageUrl: null as any,
        styleImageName: null as any,
      });
    } catch (error) {
      console.error("Failed to remove style image:", error);
    }
  };

  const handleCreateChat = async (): Promise<string | null> => {
    try {
      console.log("✨ Creating new chat...");

      const response = await createChat({
        name: `New Conversation ${chats.length + 1}`,
      });

      if (!response.success || !response.chat) {
        throw new Error("Failed to create chat");
      }

      const dbChat = response.chat;

      // Convert DB format to local ChatSession format
      const newChat: ChatSession = {
        id: dbChat.id,
        name: dbChat.name,
        createdAt: dbChat.createdAt,
        draft: dbChat.draft || "",
        isGenerating: dbChat.isGenerating,
        messages: [],
        model: {
          id: dbChat.modelId,
          name: "Gemini 2.0 Flash",
          type: dbChat.modelType,
          provider: "google",
          cost: 1,
          color: "#4285F4",
        },
        config: {
          imageCount: dbChat.imageCount,
          outputStyle: dbChat.outputStyle,
          styleImagePreview: dbChat.styleImageUrl || null,
          styleImageUrl: dbChat.styleImageUrl || null,
          styleImageName: dbChat.styleImageName || null,
          isUploading: false,
        },
      };

      console.log("✅ Chat created:", {
        id: newChat.id,
        name: newChat.name,
        totalChats: chats.length + 1,
      });

      setChats((prev) => [...prev, newChat]);
      setActiveChatId(newChat.id);
      toast.success("New conversation created");

      return newChat.id;
    } catch (error) {
      console.error("Failed to create chat:", error);
      toast.error("Failed to create conversation");
      return null;
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (chats.length === 1) {
      toast.info("Keep at least one chat open.");
      return;
    }

    const chatToDelete = chats.find((c) => c.id === chatId);
    console.log("🗑️ Deleting chat:", {
      id: chatId,
      name: chatToDelete?.name,
      messageCount: chatToDelete?.messages.length,
    });

    // Update local state optimistically
    const filtered = chats.filter((chat) => chat.id !== chatId);
    setChats(filtered);
    if (activeChatId === chatId && filtered.length > 0) {
      console.log("↪️ Switching to first available chat:", filtered[0].name);
      setActiveChatId(filtered[0].id);
    }

    try {
      await deleteChatAPI(chatId);
      toast.success("Conversation deleted");
    } catch (error) {
      console.error("Failed to delete chat:", error);
      // Revert on error
      if (chatToDelete) {
        setChats((prev) => [...prev, chatToDelete]);
      }
      toast.error("Failed to delete conversation");
    }
  };

  const handleRenameChat = async (chatId: string, value: string) => {
    const chat = chats.find((c) => c.id === chatId);
    const oldName = chat?.name;
    console.log("✏️ Renaming chat:", {
      id: chatId,
      oldName,
      newName: value,
    });

    // Update local state optimistically
    setChats((prev) => updateChat(prev, chatId, { name: value }));

    try {
      await updateChatAPI(chatId, { name: value });
      toast.success(`Renamed to "${value}"`);
    } catch (error) {
      console.error("Failed to rename chat:", error);
      // Revert on error
      setChats((prev) => updateChat(prev, chatId, { name: oldName || "" }));
      toast.error("Failed to rename conversation");
    }
  };

  return {
    handleDraftChange,
    handleImageCountChange,
    handleModelChange,
    handleOutputStyleChange,
    handleStyleImageUpload,
    handleRemoveStyleImage,
    handleCreateChat,
    handleDeleteChat,
    handleRenameChat,
  };
}

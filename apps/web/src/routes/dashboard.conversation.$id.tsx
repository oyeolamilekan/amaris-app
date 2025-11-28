/**
 * Conversation Detail Page
 * Shows a specific conversation by ID
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Download, X, Sparkles, Plus } from "lucide-react";
import { useGenerationHandlers } from "@/hooks/use-generation-handlers";
import { ASPECT_RATIO_OPTIONS } from "@/constants";
import { useState, useEffect, useMemo } from "react";
import { useParams, useOutletContext, useNavigate } from "react-router";
import type { ChatSession, ChatMessage } from "../types";
import type { useDashboardState } from "@/hooks/use-dashboard-state";
import type { useChatHandlers } from "@/hooks/use-chat-handlers";
import { BuyCreditsModal } from "@/components/buy-credits-modal";

interface DashboardContext {
  state: ReturnType<typeof useDashboardState>;
  chatHandlers: ReturnType<typeof useChatHandlers>;
}

export default function ConversationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, chatHandlers } = useOutletContext<DashboardContext>();
  const [isStyleImageOpen, setIsStyleImageOpen] = useState(false);
  const [isBuyCreditsOpen, setIsBuyCreditsOpen] = useState(false);
  const [chatTransitioning, setChatTransitioning] = useState(false);

  // Find the active chat based on URL parameter
  const activeChat = useMemo(
    () => state.chats.find((chat: ChatSession) => chat.id === id),
    [state.chats, id],
  );

  // Sync URL param with active chat ID in state
  useEffect(() => {
    if (id && id !== state.activeChatId) {
      state.setActiveChatId(id);
    }
  }, [id, state.activeChatId, state.setActiveChatId]);

  // Redirect if chat not found
  useEffect(() => {
    if (state.chats.length > 0 && !activeChat) {
      navigate("/dashboard", { replace: true });
    }
  }, [activeChat, state.chats.length, navigate]);

  // Trigger fade animation when switching chats
  useEffect(() => {
    setChatTransitioning(true);
    const timer = setTimeout(() => setChatTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [id]);

  const generationHandlers = useGenerationHandlers({
    chats: state.chats,
    setChats: state.setChats,
    activeChat: activeChat,
    localCredits: state.localCredits,
    setLocalCredits: state.setLocalCredits,
    creditsLeft: state.creditsLeft,
    queryClient: state.queryClient,
    userId: state.userId,
  });

  const handleDownloadImage = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `generated-image-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  // Loading or chat not found
  if (!activeChat) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b bg-background p-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">{activeChat.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setIsBuyCreditsOpen(true)}
          >
            Credits:{" "}
            {state.creditsLeft === null ? (
              <Loader2 className="ml-1 h-3 w-3 animate-spin" />
            ) : (
              <span className="font-medium ml-1">{state.creditsLeft}</span>
            )}
            <Plus className="ml-1 h-3 w-3" />
          </Button>
          {state.hasProSubscription ? (
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              Pro
            </span>
          ) : (
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
              Free
            </span>
          )}
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-muted/20 p-4">
        <div
          className={`mx-auto max-w-4xl space-y-6 transition-opacity duration-300 ${
            chatTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          {/* Chat Session Identifier */}
          <div className="sticky top-0 z-10 flex items-center justify-center py-2 mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border shadow-sm text-xs">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="font-medium text-muted-foreground">
                Chat: {activeChat.name}
              </span>
              <span className="text-muted-foreground/50">•</span>
              <span className="text-muted-foreground/70">
                {activeChat.messages.length} messages
              </span>
              <span className="text-muted-foreground/50">•</span>
              <span className="font-mono text-[10px] text-muted-foreground/50">
                ID: {activeChat.id.slice(0, 8)}
              </span>
            </div>
          </div>

          {activeChat.messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  {activeChat.name}
                </h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  This is a new conversation. Attach a style reference below and
                  start creating unique images with AI.
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Independent chat session
                  </span>
                  <span>•</span>
                  <span className="font-mono opacity-50">
                    {activeChat.id.slice(0, 8)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {activeChat.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background shadow-sm"
                    }`}
                  >
                    {message.content && (
                      <p className="whitespace-pre-wrap text-sm">
                        {message.content}
                      </p>
                    )}
                    {message.images.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        {message.images.map((img, idx) => (
                          <div
                            key={idx}
                            className="group relative overflow-hidden rounded-lg"
                          >
                            <img
                              src={img}
                              alt={`Generated ${idx + 1}`}
                              className="rounded-lg shadow-md"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleDownloadImage(img, idx)}
                                className="gap-2"
                              >
                                <Download className="h-4 w-4" />
                                Download
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {message.status === "pending" && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generating images...</span>
                      </div>
                    )}
                    {message.status === "failed" && (
                      <p className="mt-2 text-sm text-destructive">
                        ⚠️ {message.error || "Generation failed"}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
          <div ref={state.messageEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-background p-4">
        <div className="mx-auto max-w-4xl space-y-3">
          {/* Style Image Upload */}
          {!activeChat?.config.styleImageUrl ? (
            <div className="rounded-xl border-2 border-dashed border-muted-foreground/25 p-8 text-center transition-colors hover:border-muted-foreground/50">
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  chatHandlers.handleStyleImageUpload(id!, e.target.files?.[0])
                }
                disabled={activeChat?.config.isUploading}
                className="hidden"
                id="style-upload"
              />
              <label
                htmlFor="style-upload"
                className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {activeChat?.config.isUploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </span>
                ) : (
                  "📎 Attach style"
                )}
              </label>
            </div>
          ) : (
            <>
              {/* Style Preview */}
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <div className="flex items-center gap-3">
                  {activeChat?.config.styleImagePreview && (
                    <img
                      src={activeChat?.config.styleImagePreview}
                      alt="Style reference"
                      className="h-12 w-12 rounded object-cover cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                      onClick={() => setIsStyleImageOpen(true)}
                    />
                  )}
                  <span className="text-sm font-medium">
                    Style:{" "}
                    {activeChat?.config.styleImageName || "Reference uploaded"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => chatHandlers.handleRemoveStyleImage(id!)}
                >
                  ✕ Remove
                </Button>
              </div>

              {/* Aspect Ratio Selector */}
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">Aspect Ratio:</span>
                <div className="flex gap-2">
                  {ASPECT_RATIO_OPTIONS.map((option) => (
                    <Button
                      key={option.id}
                      variant={
                        activeChat?.config.aspectRatio === option.id
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        chatHandlers.handleAspectRatioChange(id!, option.id)
                      }
                      className="gap-1"
                    >
                      <span
                        className={`h-3 ${option.width} rounded-sm border-2 border-current`}
                      ></span>
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Prompt Input */}
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Input
                    value={activeChat?.draft || ""}
                    onChange={(e) =>
                      chatHandlers.handleDraftChange(id!, e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        generationHandlers.handleSendPrompt();
                      }
                    }}
                    placeholder="Describe the image you want to generate..."
                    disabled={activeChat?.isGenerating}
                    className="h-12 resize-none"
                  />
                </div>
                <Button
                  onClick={generationHandlers.handleSendPrompt}
                  disabled={
                    activeChat?.isGenerating || !activeChat?.draft.trim()
                  }
                  size="lg"
                  className="h-12"
                >
                  {activeChat?.isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating
                    </>
                  ) : (
                    "Generate"
                  )}
                </Button>
              </div>

              {/* Image Count Selector */}
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">
                  Images to generate:
                </span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <Button
                      key={num}
                      variant={
                        activeChat?.config.imageCount === num
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        chatHandlers.handleImageCountChange(id!, num)
                      }
                      disabled={!state.hasProSubscription && num > 3}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
                {!state.hasProSubscription && (
                  <span className="text-xs text-muted-foreground">
                    (Free tier: max 3)
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Style Image Viewer Modal */}
      {isStyleImageOpen && activeChat?.config.styleImagePreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setIsStyleImageOpen(false)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <Button
              variant="ghost"
              size="icon"
              className="absolute -right-12 top-0 h-10 w-10 rounded-full bg-background/10 text-white hover:bg-background/20"
              onClick={() => setIsStyleImageOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            <img
              src={activeChat.config.styleImagePreview}
              alt="Style reference full view"
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Buy Credits Modal */}
      <BuyCreditsModal
        open={isBuyCreditsOpen}
        onOpenChange={setIsBuyCreditsOpen}
      />
    </div>
  );
}

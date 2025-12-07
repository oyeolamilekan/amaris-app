/**
 * Conversation Detail Page
 * Shows a specific conversation by ID
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Download,
  X,
  Sparkles,
  Plus,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGenerationHandlers } from "@/hooks/use-generation-handlers";
import { useState, useEffect, useMemo } from "react";
import { useParams, useOutletContext, useNavigate } from "react-router";
import type { ChatSession, ChatMessage } from "../types";
import type { useDashboardState } from "@/hooks/use-dashboard-state";
import type { useChatHandlers } from "@/hooks/use-chat-handlers";
import { BuyCreditsModal } from "@/components/buy-credits-modal";
import { SidebarTrigger } from "@/components/ui/sidebar";

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
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

  const handleDownloadImage = async (
    imageUrl: string,
    index: number,
    format: "png" | "jpeg" | "webp" = "png",
  ) => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      if (format === "jpeg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      const dataUrl = canvas.toDataURL(`image/${format}`);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `generated-image-${index + 1}.${format}`;
      document.body.appendChild(a);
      a.click();
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
      <header className="flex items-center justify-between border-b bg-background p-3 md:p-4">
        <div className="flex items-center gap-2 md:gap-4">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-lg md:text-xl font-semibold truncate max-w-[150px] sm:max-w-xs md:max-w-none">
            {activeChat.name}
          </h1>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs md:text-sm text-muted-foreground hover:text-foreground px-2 md:px-3"
            onClick={() => setIsBuyCreditsOpen(true)}
          >
            <span className="hidden sm:inline">Credits:</span>
            {state.creditsLeft === null ? (
              <Loader2 className="ml-1 h-3 w-3 animate-spin" />
            ) : (
              <span className="font-medium ml-1">{state.creditsLeft}</span>
            )}
            <Plus className="ml-1 h-3 w-3" />
          </Button>
          {state.hasProSubscription ? (
            <span className="rounded-full bg-primary px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-medium text-primary-foreground">
              Pro
            </span>
          ) : (
            <span className="rounded-full bg-muted px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-medium">
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
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {message.images.map((img, idx) => (
                          <div
                            key={idx}
                            className="group relative overflow-hidden rounded-lg cursor-pointer"
                            onClick={() => setPreviewImage(img)}
                          >
                            <img
                              src={img}
                              alt={`Generated ${idx + 1}`}
                              className="rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                              <div onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      className="gap-2 shadow-lg"
                                    >
                                      <Download className="h-4 w-4" />
                                      Download
                                      <ChevronDown className="h-3 w-3 opacity-50" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="center">
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDownloadImage(img, idx, "png")
                                      }
                                    >
                                      Download as PNG
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDownloadImage(img, idx, "jpeg")
                                      }
                                    >
                                      Download as JPG
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDownloadImage(img, idx, "webp")
                                      }
                                    >
                                      Download as WebP
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
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
      <div className="border-t bg-background p-3 md:p-4">
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

              {/* Prompt Input */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
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
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm">
                <span className="text-muted-foreground">
                  Images to generate:
                </span>
                <div className="flex flex-wrap gap-2">
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

      {/* Generated Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw] flex flex-col items-center">
            <div className="absolute right-0 top-0 -mt-12 md:-right-16 md:mt-0 flex flex-row md:flex-col gap-2 z-50">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-md"
                onClick={() => setPreviewImage(null)}
              >
                <X className="h-5 w-5" />
              </Button>
              <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-md"
                    >
                      <Download className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        handleDownloadImage(previewImage, Date.now(), "png")
                      }
                    >
                      Download as PNG
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleDownloadImage(previewImage, Date.now(), "jpeg")
                      }
                    >
                      Download as JPG
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleDownloadImage(previewImage, Date.now(), "webp")
                      }
                    >
                      Download as WebP
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <img
              src={previewImage}
              alt="Generated full view"
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
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

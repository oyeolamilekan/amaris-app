/**
 * Dashboard Index Page
 * Shows conversation list or empty state when no conversation is selected
 */

import { useNavigate, useOutletContext } from "react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageSquare, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";

interface DashboardContext {
  state: any;
  chatHandlers: any;
}

export default function DashboardIndex() {
  const navigate = useNavigate();
  const { state, chatHandlers } = useOutletContext<DashboardContext>();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateNewChat = async () => {
    setIsCreating(true);
    try {
      const newChatId = await chatHandlers.handleCreateChat();
      if (newChatId) {
        navigate(`/dashboard/conversation/${newChatId}`);
      }
    } catch (error) {
      console.error("Failed to create chat:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleChatClick = (chatId: string) => {
    navigate(`/dashboard/conversation/${chatId}`);
  };

  // Show chat list if there are chats, otherwise show empty state
  if (state.chats.length > 0) {
    return (
      <div className="flex h-screen flex-col bg-muted/20">
        <header className="border-b bg-background p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Your Conversations</h1>
            <Button onClick={handleCreateNewChat} className="gap-2" disabled={isCreating}>
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              New Chat
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl space-y-3">
            {state.chats.map((chat: any) => (
              <div
                key={chat.id}
                onClick={() => handleChatClick(chat.id)}
                className="group cursor-pointer rounded-lg border bg-background p-4 transition-all hover:shadow-md hover:border-primary/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
                      {chat.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      <span>{chat.messages.length} messages</span>
                      <span className="text-muted-foreground/50">•</span>
                      <span className="font-mono text-xs opacity-50">
                        {chat.id.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no chats
  return (
    <div className="flex h-screen items-center justify-center bg-muted/20">
      <div className="mx-auto max-w-2xl space-y-8 text-center p-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-4">
          <MessageSquare className="h-12 w-12 text-primary" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to Amaris
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            Create your first conversation to start generating unique images with AI-powered style transfer
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <Button
            size="lg"
            className="gap-2 text-lg h-14 px-8"
            onClick={handleCreateNewChat}
            disabled={isCreating}
          >
            {isCreating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
            Create Your First Conversation
            {!isCreating && <ArrowRight className="h-5 w-5" />}
          </Button>

          <p className="text-sm text-muted-foreground">
            Each conversation maintains its own style, settings, and history
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 text-left">
          <div className="p-4 rounded-lg bg-background/50 border">
            <div className="font-semibold mb-2">🎨 Style Reference</div>
            <p className="text-sm text-muted-foreground">
              Upload any image as a style reference to guide your generations
            </p>
          </div>
          <div className="p-4 rounded-lg bg-background/50 border">
            <div className="font-semibold mb-2">⚙️ Customizable</div>
            <p className="text-sm text-muted-foreground">
              Choose aspect ratios, output styles, and generation count
            </p>
          </div>
          <div className="p-4 rounded-lg bg-background/50 border">
            <div className="font-semibold mb-2">💬 Organized</div>
            <p className="text-sm text-muted-foreground">
              Keep projects separate with independent conversation threads
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

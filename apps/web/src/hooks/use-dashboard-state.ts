/**
 * Dashboard State Management Hook
 */

import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { getCredits, listChats, getChat, createChat } from "@/lib/api";
import type { CreditsResponse } from "@/lib/api";
import type { ChatSession, CustomerState } from "../types";
import { createChatSession } from "../utils";

export function useDashboardState() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;

  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>("");
  const [localCredits, setLocalCredits] = useState<number | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const chatsLoaded = useRef(false);

  // Debug: Log when active chat changes
  useEffect(() => {
    const chat = chats.find((c) => c.id === activeChatId);
    if (chat) {
      console.log("🔄 Active Chat Changed:", {
        id: chat.id,
        name: chat.name,
        messageCount: chat.messages.length,
        hasStyleImage: !!chat.config.styleImageUrl,
      });
    }
  }, [activeChatId, chats]);

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId),
    [chats, activeChatId],
  );

  // Fetch customer subscription state
  const { data: customerState, isLoading: isCustomerLoading } =
    useQuery<CustomerState>({
      queryKey: ["customer-state"],
      queryFn: async () => {
        const { data } = await authClient.customer.state();
        return data as CustomerState;
      },
      enabled: Boolean(session),
      staleTime: searchParams.get("payment") === "success" ? 0 : 60_000,
      refetchInterval: searchParams.get("payment") === "success" ? 500 : false,
    });

  // Fetch user credits
  const creditsQuery = useQuery<CreditsResponse>({
    queryKey: ["credits"],
    queryFn: getCredits,
    enabled: Boolean(session),
    staleTime: searchParams.get("payment") === "success" ? 0 : 30_000,
    refetchInterval: searchParams.get("payment") === "success" ? 500 : false,
  });

  // Debug credits query
  useEffect(() => {
    if (creditsQuery.isError) {
      console.error("Credits query error:", creditsQuery.error);
    }
    if (creditsQuery.data) {
      console.log("Credits query data:", creditsQuery.data);
    }
  }, [creditsQuery.isError, creditsQuery.data, creditsQuery.error]);

  // Sync credits from query to local state
  useEffect(() => {
    if (typeof creditsQuery.data?.credits === "number") {
      setLocalCredits(creditsQuery.data.credits);
    }
  }, [creditsQuery.data?.credits]);

  // Load chats from database
  useEffect(() => {
    async function loadChats() {
      if (!session || chatsLoaded.current) return;

      try {
        console.log("📂 Loading chats from database...");
        const { chats: dbChats } = await listChats();

        if (dbChats.length === 0) {
          console.log("📝 No chats found, creating default chat...");
          // Create first chat if none exist
          try {
            const { chat: newChat } = await createChat({
              name: "New Conversation",
            });

            const initialChat: ChatSession = {
              id: newChat.id,
              name: newChat.name,
              createdAt: newChat.createdAt,
              draft: "",
              isGenerating: false,
              messages: [],
              model: {
                id: newChat.modelId,
                name: "Gemini 2.0 Flash",
                type: newChat.modelType,
                provider: "google",
                cost: 1,
                color: "#4285F4",
              },
              config: {
                imageCount: newChat.imageCount,
                styleImagePreview: null,
                styleImageUrl: null,
                styleImageName: null,
                isUploading: false,
              },
            };

            setChats([initialChat]);
            setActiveChatId(initialChat.id);
          } catch (error) {
            console.error("Failed to create initial chat:", error);
            // Fallback to local chat if API fails
            const initialChat = createChatSession(1);
            setChats([initialChat]);
            setActiveChatId(initialChat.id);
          }
          chatsLoaded.current = true;
          return;
        }

        // Convert DB chats to local format
        const loadedChats: ChatSession[] = await Promise.all(
          dbChats.map(async (dbChat) => {
            try {
              // Fetch messages for this chat
              const { messages: dbMessages } = await getChat(dbChat.id);

              return {
                id: dbChat.id,
                name: dbChat.name,
                createdAt: dbChat.createdAt,
                draft: dbChat.draft || "",
                isGenerating: dbChat.isGenerating,
                messages: dbMessages.map((msg) => ({
                  id: msg.id,
                  role: msg.role as "user" | "assistant",
                  content: msg.content,
                  createdAt: msg.createdAt,
                  images: msg.images || [],
                  status: msg.status as
                    | "pending"
                    | "completed"
                    | "failed"
                    | undefined,
                  error: msg.error || undefined,
                })),
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
                  styleImagePreview: dbChat.styleImageUrl || null,
                  styleImageUrl: dbChat.styleImageUrl || null,
                  styleImageName: dbChat.styleImageName || null,
                  isUploading: false,
                },
              };
            } catch (error) {
              console.error(
                `Failed to load messages for chat ${dbChat.id}:`,
                error,
              );
              // Return chat without messages if fetch fails
              return {
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
                  styleImagePreview: dbChat.styleImageUrl || null,
                  styleImageUrl: dbChat.styleImageUrl || null,
                  styleImageName: dbChat.styleImageName || null,
                  isUploading: false,
                },
              };
            }
          }),
        );

        console.log(`✅ Loaded ${loadedChats.length} chats from database`);
        setChats(loadedChats);

        // Set active chat to the most recent one
        if (loadedChats.length > 0) {
          setActiveChatId(loadedChats[0].id);
        }

        chatsLoaded.current = true;
      } catch (error) {
        console.error("Failed to load chats:", error);
        // Fallback to creating a default chat
        const initialChat = createChatSession(1);
        setChats([initialChat]);
        setActiveChatId(initialChat.id);
        chatsLoaded.current = true;
      }
    }

    loadChats();
  }, [session]);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!session && !isPending) {
      navigate("/");
    }
  }, [session, isPending, navigate]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (!activeChat) return;
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages.length]);

  const hasProSubscription =
    (customerState?.activeSubscriptions?.length ?? 0) > 0;

  // Return null while loading to prevent flashing incorrect values
  const creditsLeft = localCredits;

  return {
    // Session & Loading
    session,
    isPending,
    isCustomerLoading,
    userId,

    // Chats
    chats,
    setChats,
    activeChat,
    activeChatId,
    setActiveChatId,

    // Credits
    localCredits,
    setLocalCredits,
    creditsLeft,

    // Subscription
    hasProSubscription,
    customerState,

    // React Query
    queryClient,

    // Refs
    messageEndRef,
  };
}

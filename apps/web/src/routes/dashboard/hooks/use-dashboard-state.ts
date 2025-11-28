/**
 * Dashboard State Management Hook
 */

import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { getCredits, listGenerations } from "@/lib/api";
import type { CreditsResponse, Generation } from "@/lib/api";
import type { ChatSession, CustomerState } from "../types";
import {
  createChatSession,
  convertGenerationsToMessages,
  findLatestStyleImage,
} from "../utils";
import { getDefaultModel } from "@/lib/models";
import { FREE_TIER_CREDITS, PRO_TIER_CREDITS } from "../constants";

export function useDashboardState() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;

  const initialChat = useMemo(() => createChatSession(1), []);
  const [chats, setChats] = useState<ChatSession[]>([initialChat]);
  const [activeChatId, setActiveChatId] = useState<string>(initialChat.id);
  const [localCredits, setLocalCredits] = useState<number | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const historyLoaded = useRef(false);

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId),
    [chats, activeChatId],
  );

  const { data: customerState, isLoading: isCustomerLoading } =
    useQuery<CustomerState>({
      queryKey: ["customer-state"],
      queryFn: async () => {
        const { data } = await authClient.customer.state();
        return data as CustomerState;
      },
      enabled: Boolean(session),
    });

  const creditsQuery = useQuery<CreditsResponse>({
    queryKey: ["credits"],
    queryFn: getCredits,
    enabled: Boolean(session),
  });

  const historyQuery = useQuery<Generation[]>({
    queryKey: ["generations", userId],
    queryFn: async () => {
      const { generations } = await listGenerations(50, 0);
      return generations;
    },
    enabled: Boolean(session),
  });

  useEffect(() => {
    if (typeof creditsQuery.data?.credits === "number") {
      setLocalCredits(creditsQuery.data.credits);
    }
  }, [creditsQuery.data?.credits]);

  useEffect(() => {
    if (!session && !isPending) {
      navigate("/");
    }
  }, [session, isPending, navigate]);

  useEffect(() => {
    const generations = historyQuery.data;
    if (
      !session ||
      historyLoaded.current ||
      !generations ||
      generations.length === 0
    ) {
      if (generations && generations.length === 0) {
        historyLoaded.current = true;
      }
      return;
    }

    const historyMessages = convertGenerationsToMessages(generations);
    const latestStyle = findLatestStyleImage(generations);

    let shouldFocusHistory = false;

    setChats((prev) => {
      if (prev.some((chat) => chat.id === "history")) {
        return prev;
      }

      shouldFocusHistory =
        prev.length === 0 || (prev[0]?.messages?.length ?? 0) === 0;

      const historyChat: ChatSession = {
        id: "history",
        name: "Recent Generations",
        createdAt: new Date().toISOString(),
        draft: "",
        isGenerating: false,
        messages: historyMessages,
        model: getDefaultModel(),
        config: {
          aspectRatio: "1:1",
          imageCount: 1,
          styleImagePreview: latestStyle,
          styleImageUrl: latestStyle,
          styleImageName: null,
          isUploading: false,
        },
      };

      return [historyChat, ...prev];
    });

    if (shouldFocusHistory) {
      setActiveChatId("history");
    }

    historyLoaded.current = true;
  }, [session, historyQuery.data, isPending]);

  useEffect(() => {
    if (!activeChat) return;
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages.length]);

  const hasProSubscription =
    (customerState?.activeSubscriptions?.length ?? 0) > 0;
  const creditsLeft =
    localCredits ?? (hasProSubscription ? PRO_TIER_CREDITS : FREE_TIER_CREDITS);

  return {
    session,
    isPending,
    isCustomerLoading,
    userId,
    chats,
    setChats,
    activeChat,
    activeChatId,
    setActiveChatId,
    localCredits,
    setLocalCredits,
    creditsLeft,
    hasProSubscription,
    customerState,
    queryClient,
    messageEndRef,
  };
}

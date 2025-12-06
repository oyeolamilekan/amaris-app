"use client";

import * as React from "react";
import {
  Sparkles,
  Crown,
  ExternalLink,
  MessageSquare,
  Trash2,
  Edit2,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuAction,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ChatSession } from "@/types";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  chats?: ChatSession[];
  activeChatId?: string;
  onChatSelect?: (chatId: string) => void;
  onCreateChat?: () => void;
  onDeleteChat?: (chatId: string) => void;
  onRenameChat?: (chatId: string, name: string) => void;
}

export function AppSidebar({
  chats = [],
  activeChatId,
  onChatSelect,
  onCreateChat,
  onDeleteChat,
  onRenameChat,
  ...props
}: AppSidebarProps) {
  const navigate = useNavigate();
  const { isMobile, setOpenMobile } = useSidebar();
  const { data: session } = authClient.useSession();
  const [customerState, setCustomerState] = React.useState<any>(null);
  const [editingChatId, setEditingChatId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState("");

  React.useEffect(() => {
    async function fetchCustomerState() {
      if (session) {
        try {
          const { data } = await authClient.customer.state();
          setCustomerState(data);
        } catch (error) {
          console.error("Error fetching customer state:", error);
        }
      }
    }

    fetchCustomerState();
  }, [session]);

  const hasProSubscription = customerState?.activeSubscriptions?.length! > 0;

  const userInitials =
    session?.user.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <Sidebar variant="sidebar" {...props}>
      <SidebarContent className="p-2">
        {/* New Conversation Button */}
        <div className="p-3 pb-2">
          <Button
            variant="default"
            className="w-full justify-center gap-2 h-10 font-medium"
            onClick={() => {
              onCreateChat?.();
              if (isMobile) {
                setOpenMobile(false);
              }
            }}
          >
            <Sparkles className="h-5 w-5" />
            New Conversation
          </Button>
        </div>

        {/* Chat Sessions Group */}
        <SidebarGroup>
          <SidebarGroupLabel>Your Conversations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton
                    isActive={chat.id === activeChatId}
                    onClick={() => {
                      onChatSelect?.(chat.id);
                      if (isMobile) {
                        setOpenMobile(false);
                      }
                    }}
                    tooltip={chat.name}
                  >
                    <MessageSquare className="h-4 w-4" />
                    {editingChatId === chat.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => {
                          if (editingName.trim() && editingName !== chat.name) {
                            onRenameChat?.(chat.id, editingName);
                          }
                          setEditingChatId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (
                              editingName.trim() &&
                              editingName !== chat.name
                            ) {
                              onRenameChat?.(chat.id, editingName);
                            }
                            setEditingChatId(null);
                          } else if (e.key === "Escape") {
                            setEditingChatId(null);
                            setEditingName(chat.name);
                          }
                        }}
                        className="flex-1 bg-background border border-primary rounded px-1 outline-none text-sm focus:ring-1 focus:ring-primary"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span
                        className="flex-1 truncate cursor-text hover:opacity-70 transition-opacity group/rename relative"
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setEditingChatId(chat.id);
                          setEditingName(chat.name);
                        }}
                        title="Double-click to rename"
                      >
                        {chat.name}
                        <Edit2 className="h-3 w-3 opacity-0 group-hover/rename:opacity-50 absolute -right-4 top-1/2 -translate-y-1/2 transition-opacity" />
                      </span>
                    )}
                    {chat.messages.length > 0 && (
                      <span className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded-full">
                        {chat.messages.length}
                      </span>
                    )}
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction showOnHover>
                        <span className="sr-only">More</span>
                        <span>⋮</span>
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingChatId(chat.id);
                          setEditingName(chat.name);
                        }}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDeleteChat?.(chat.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-4">
        {!hasProSubscription && (
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="p-4 space-y-3">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Start Creating</h4>
                <p className="text-xs text-muted-foreground">
                  Upgrade to premium and start creating consistent assets.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={async () => await authClient.checkout({ slug: "pro" })}
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                Upgrade
              </Button>
            </CardContent>
          </Card>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-2 h-auto py-2"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user.image || ""} />
                <AvatarFallback className="text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left flex-1">
                <span className="text-sm font-medium">
                  {session?.user.name || "User"}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  {hasProSubscription && (
                    <Crown className="h-3 w-3 text-yellow-500" />
                  )}
                  {hasProSubscription ? "Pro Plan" : "Free Plan"}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <span className="text-xs text-muted-foreground">
                {session?.user.email}
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Account Settings</DropdownMenuItem>
            {hasProSubscription && (
              <DropdownMenuItem
                onClick={async () => await authClient.customer.portal()}
              >
                Manage Subscription
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () =>
                await authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      navigate("/");
                    },
                  },
                })
              }
              className="text-red-600"
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

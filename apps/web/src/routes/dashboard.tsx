/**
 * Dashboard Layout
 * Provides layout structure for all dashboard routes
 */

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Outlet, useNavigate, useSearchParams } from "react-router";
import { useDashboardState } from "@/hooks/use-dashboard-state";
import { useChatHandlers } from "@/hooks/use-chat-handlers";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const state = useDashboardState();

  const paymentStatus = searchParams.get("payment");
  const isPaymentModalOpen = paymentStatus === "success" || paymentStatus === "failed";

  const handlePaymentModalChange = (open: boolean) => {
    if (!open) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("payment");
      setSearchParams(newParams, { replace: true });
    }
  };

  const chatHandlers = useChatHandlers({
    chats: state.chats,
    setChats: state.setChats,
    activeChatId: state.activeChatId,
    setActiveChatId: state.setActiveChatId,
    hasProSubscription: state.hasProSubscription,
  });

  // Loading state
  if (state.isPending || (state.session && state.isCustomerLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!state.session) {
    return null;
  }

  const handleChatSelect = (chatId: string) => {
    state.setActiveChatId(chatId);
    navigate(`/dashboard/conversation/${chatId}`);
  };

  const handleCreateChat = async () => {
    const newChatId = await chatHandlers.handleCreateChat();
    if (newChatId) {
      navigate(`/dashboard/conversation/${newChatId}`);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar
        chats={state.chats}
        activeChatId={state.activeChatId}
        onChatSelect={handleChatSelect}
        onCreateChat={handleCreateChat}
        onDeleteChat={chatHandlers.handleDeleteChat}
        onRenameChat={chatHandlers.handleRenameChat}
      />
      <SidebarInset>
        <Outlet context={{ state, chatHandlers }} />
      </SidebarInset>

      <Dialog open={isPaymentModalOpen} onOpenChange={handlePaymentModalChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              {paymentStatus === "success" ? (
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              ) : (
                <XCircle className="h-12 w-12 text-red-500" />
              )}
            </div>
            <DialogTitle className="text-center">
              {paymentStatus === "success"
                ? "Payment Successful"
                : "Payment Failed"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {paymentStatus === "success"
                ? "Thank you for your purchase! Your credits have been added to your account."
                : "Something went wrong with your payment. Please try again or contact support."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => handlePaymentModalChange(false)}>
              {paymentStatus === "success" ? "Continue" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { Loader2, Coins } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCreditPackages } from "@/lib/api";

interface BuyCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BuyCreditsModal({ open, onOpenChange }: BuyCreditsModalProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["credit-packages"],
    queryFn: getCreditPackages,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const packages = data?.packages || [];

  const handleBuy = async (packageId: string) => {
    setLoading(packageId);
    try {
      await authClient.checkout({
        slug: packageId,
      });
    } catch (error) {
      console.error("Checkout failed:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Top Up Credits
          </DialogTitle>
          <DialogDescription>
            Purchase credits to generate more images. One credit = one image generation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            packages.map((pkg) => (
              <div
                key={pkg.id}
                className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-muted/50 hover:border-primary/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Coins className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">{pkg.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {pkg.credits} generations
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-medium">
                    {(pkg.price / 100).toLocaleString("en-US", {
                      style: "currency",
                      currency: pkg.currency,
                    })}
                  </div>
                  <Button
                    onClick={() => handleBuy(pkg.id)}
                    disabled={loading !== null}
                    size="sm"
                  >
                    {loading === pkg.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Buy"
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

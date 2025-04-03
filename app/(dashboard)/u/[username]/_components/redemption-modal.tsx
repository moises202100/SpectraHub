"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import useTokenStore from "@/store/tokenStore";

interface RedemptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RedemptionModal = ({
  isOpen,
  onClose,
}: RedemptionModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState("");
  const [tokensToRedeem, setTokensToRedeem] = useState("");
  const { tokens, setTokens } = useTokenStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/redemption", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paypalEmail,
          tokensToRedeem: parseInt(tokensToRedeem),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setTokens(data.newBalance);
      toast.success("Redemption successful! You will receive your payment soon.");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate USD value (100 tokens = $8)
  const estimatedUsd = (parseInt(tokensToRedeem) || 0) / 100 * 8;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background border-none max-w-md">
        <DialogHeader>
          <DialogTitle>Redeem Tokens</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>PayPal Email</Label>
            <Input
              type="email"
              placeholder="Enter your PayPal email"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tokens to Redeem</Label>
            <Input
              type="number"
              min="100"
              step="100"
              placeholder="Minimum 100 tokens"
              value={tokensToRedeem}
              onChange={(e) => setTokensToRedeem(e.target.value)}
              disabled={isLoading}
              required
            />
            <p className="text-sm text-muted-foreground">
              Available tokens: {tokens}
            </p>
            {tokensToRedeem && (
              <p className="text-sm text-muted-foreground">
                Estimated value: ${estimatedUsd.toFixed(2)} USD
              </p>
            )}
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Important Notes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Minimum redemption: 100 tokens ($8 USD)</li>
              <li>Rate: 100 tokens = $8 USD</li>
              <li>Payments are processed via PayPal</li>
              <li>Processing time: 1-3 business days</li>
            </ul>
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !paypalEmail || !tokensToRedeem || parseInt(tokensToRedeem) < 100}
            >
              {isLoading ? "Processing..." : "Redeem Tokens"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
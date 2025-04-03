"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import useTokenStore from "@/store/tokenStore";
import { useChat } from "@livekit/components-react";
import { receiveTip } from "@/lib/lovense-service";

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  senderName: string;
}

export const TipModal = ({ 
  isOpen, 
  onClose, 
  recipientId, 
  recipientName,
  senderName 
}: TipModalProps) => {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { tokens, setTokens } = useTokenStore();
  const { send: sendMessage } = useChat();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const tipAmount = parseInt(amount);
    if (!tipAmount || tipAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (tipAmount > tokens) {
      toast.error("Insufficient tokens");
      return;
    }

    setIsLoading(true);
    try {
      // Process the tip transaction
      const response = await fetch("/api/tips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: tipAmount,
          recipientId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send tip");
      }

      const data = await response.json();
      
      // Update sender's token balance
      setTokens(data.newBalance);
      
      // Send chat notification
      if (sendMessage) {
        const notificationMessage = `🎁 ${senderName} sent ${tipAmount} tokens to ${recipientName}!`;
        sendMessage(notificationMessage);
      }

      // Trigger Lovense interaction
      await receiveTip(tipAmount, senderName);

      toast.success(`Successfully sent ${tipAmount} tokens to ${recipientName}!`);
      setAmount("");
      onClose();
    } catch (error) {
      toast.error("Failed to send tip");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background border-none">
        <DialogHeader>
          <DialogTitle>Send Tip to {recipientName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Your balance: {tokens} tokens</p>
            <Input
              type="number"
              placeholder="Enter amount"
              min="1"
              max={tokens}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
              className="border-white/10"
            />
          </div>
          <div className="flex justify-end gap-x-2">
            <DialogClose asChild>
              <Button variant="ghost" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isLoading || !amount || parseInt(amount) < 1 || parseInt(amount) > tokens}
            >
              {isLoading ? "Sending..." : "Send Tip"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
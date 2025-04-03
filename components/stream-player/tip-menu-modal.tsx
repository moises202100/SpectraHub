"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";
import { useChat } from "@livekit/components-react";
import { toast } from "sonner";
import useTokenStore from "@/store/tokenStore";

interface TipMenuItem {
  id: string;
  name: string;
  description?: string;
  tokens: number;
}

interface TipMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  isHost: boolean;
  recipientId: string;
}

export const TipMenuModal = ({
  isOpen,
  onClose,
  username,
  isHost,
  recipientId,
}: TipMenuModalProps) => {
  const [items, setItems] = useState<TipMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { tokens, setTokens } = useTokenStore();
  const { send: sendMessage } = useChat();

  useEffect(() => {
    if (isOpen) {
      fetchTipMenu();
    }
  }, [isOpen, username]);

  const fetchTipMenu = async () => {
    try {
      const response = await fetch(`/api/tip-menu?username=${username}`);
      if (!response.ok) throw new Error("Failed to fetch tip menu");
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching tip menu:", error);
    }
  };

  const handleTip = async (item: TipMenuItem) => {
    if (tokens < item.tokens) {
      toast.error("Insufficient tokens");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/tips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: item.tokens,
          recipientId,
        }),
      });

      if (!response.ok) throw new Error("Failed to process tip");

      const data = await response.json();
      setTokens(data.newBalance);

      if (sendMessage) {
        const audio = new Audio("/tip-sound.mp3");
        audio.play().catch(() => {});
        sendMessage(`🎁 ${username} sent ${item.tokens} tokens for "${item.name}"!`);
      }

      toast.success(`Successfully sent ${item.tokens} tokens!`);
      onClose();
    } catch (error) {
      toast.error("Failed to process tip");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background border-none">
        <DialogHeader>
          <DialogTitle>Tip Menu</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground">No menu items available</p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-white/5 p-4 rounded-lg hover:bg-white/10 transition"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                </div>
                <Button
                  onClick={() => handleTip(item)}
                  disabled={isLoading || isHost || tokens < item.tokens}
                  variant="secondary"
                  size="sm"
                >
                  <Coins className="h-4 w-4 mr-2" />
                  {item.tokens}
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
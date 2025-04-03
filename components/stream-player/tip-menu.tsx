"use client";

import { useState, useEffect } from "react";
import { useChat } from "@livekit/components-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";
import useTokenStore from "@/store/tokenStore";

interface TipMenuItem {
  id: string;
  name: string;
  description?: string;
  tokens: number;
}

interface TipMenuProps {
  username: string;
  isHost: boolean;
  recipientId: string;
}

export const TipMenu = ({
  username,
  isHost,
  recipientId,
}: TipMenuProps) => {
  const [items, setItems] = useState<TipMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { tokens, setTokens } = useTokenStore();
  const { send: sendMessage } = useChat();

  useEffect(() => {
    fetchTipMenu();
  }, [username]);

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

      // Send chat notification
      if (sendMessage) {
        const audio = new Audio("/tip-sound.mp3");
        audio.play().catch(() => {});
        
        sendMessage(`🎁 ${username} sent ${item.tokens} tokens for "${item.name}"!`);
      }

      toast.success(`Successfully sent ${item.tokens} tokens!`);
    } catch (error) {
      toast.error("Failed to process tip");
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="p-4 border-t border-white/10">
      <h3 className="text-sm font-semibold mb-4">Tip Menu</h3>
      <div className="grid grid-cols-1 gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between bg-white/5 p-3 rounded-lg hover:bg-white/10 transition"
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
        ))}
      </div>
    </div>
  );
};
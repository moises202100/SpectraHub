"use client";

import { format } from "date-fns";
import { ReceivedChatMessage } from "@livekit/components-react";
import { Crown } from "lucide-react";
import { stringToColor } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ChatMessageProps {
  data: ReceivedChatMessage;
}

const ChatMessage = ({ data }: ChatMessageProps) => {
  const color = stringToColor(data.from?.name || "");
  const [isKing, setIsKing] = useState(false);

  useEffect(() => {
    const checkIfKing = async () => {
      try {
        // Extract streamId from the URL
        const pathParts = window.location.pathname.split('/');
        const username = pathParts[1];
        
        const response = await fetch(`/api/king-of-room?username=${username}`);
        if (!response.ok) return;
        
        const kingData = await response.json();
        if (kingData?.kingUserId === data.from?.identity) {
          setIsKing(true);
        }
      } catch (error) {
        console.error("Error checking king status:", error);
      }
    };

    checkIfKing();
  }, [data.from?.identity]);

  return (
    <div className="flex gap-2 p-2 rounded-md hover:bg-white/5">
      <p className="text-sm text-white/40">
        {format(data.timestamp, "HH:mm")}
      </p>
      <div className="flex flex-wrap items-baseline gap-1 grow">
        <div className="flex items-center gap-1">
          <p className="text-sm font-semibold whitespace-nowrap">
            <span className="truncate" style={{ color: color }}>
              {data.from?.name}
            </span>
          </p>
          {isKing && (
            <Crown 
              className="h-4 w-4 text-yellow-500 animate-pulse" 
              fill="currentColor"
            />
          )}
          <span>:</span>
        </div>
        <p className="text-sm break-all">{data.message}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
"use client";

import { ReceivedChatMessage } from "@livekit/components-react";
import ChatMessage from "./chat-message";
import { Skeleton } from "../ui/skeleton";
import { Pin } from "lucide-react";

type Props = {
  messages: ReceivedChatMessage[];
  isHidden: boolean;
  pinnedMessage?: string;
};

function ChatList({ messages, isHidden, pinnedMessage }: Props) {
  if (isHidden || !messages || messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          {isHidden ? "Chat is disabled" : "Welcome to the chat"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-3 h-full">
      {pinnedMessage && pinnedMessage.trim() !== "" && (
        <div className="sticky top-0 z-10 bg-blue-800/90 backdrop-blur-sm p-3 rounded-lg border border-blue-300 mb-2 flex items-center gap-x-2 shadow-md">
          <Pin className="h-6 w-6 text-red-500" /> {/* Tamaño aumentado */}
          <p className="text-sm text-white font-medium">{pinnedMessage}</p>
        </div>
      )}
      <div className="flex flex-col-reverse gap-y-2">
        {messages.map((message) => (
          <ChatMessage key={message.timestamp} data={message} />
        ))}
      </div>
    </div>
  );
}

export default ChatList;

export const ChatListSkeleton = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <Skeleton className="w-1/2 h-6" />
    </div>
  );
};
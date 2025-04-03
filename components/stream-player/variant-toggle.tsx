"use client";
import {
  ArrowRightFromLine,
  ArrowLeftFromLine,
  Users,
  MessageSquare,
} from "lucide-react";
import Hint from "../hint";
import {Button} from "../ui/button";
import {ChatVariant, useChatSidebar} from "@/store/use-chat-sidebar";
type Props = {};

function VariantToggle({}: Props) {
  const {variant, onChangeVariant} = useChatSidebar((state) => state);
  const isChat = variant === ChatVariant.CHAT;

  const Icon = isChat ? Users : MessageSquare;
  const onToggle = () => {
    const newVariant = isChat ? ChatVariant.COMMUNITY : ChatVariant.CHAT;
    onChangeVariant(newVariant);
  };

  return (
    <Hint label={isChat ? "Community" : "Go back to Chat"} side="left" asChild>
      <Button
        onClick={onToggle}
        variant={"ghost"}
        className="h-auto p-2 hover:bg-white/10 hover:text-primary bg-transparent"
      >
        <Icon className="h-4 w-4" />
      </Button>
    </Hint>
  );
}

export default VariantToggle;

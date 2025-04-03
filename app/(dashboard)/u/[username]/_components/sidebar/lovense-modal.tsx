"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LovenseSettings } from "@/components/stream-player/lovense-settings";

interface LovenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  username: string;
}

export const LovenseModal = ({
  isOpen,
  onClose,
  userId,
  username
}: LovenseModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background border-none max-w-2xl">
        <DialogHeader>
          <DialogTitle>Lovense Connection</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <LovenseSettings 
            userId={userId}
            username={username}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
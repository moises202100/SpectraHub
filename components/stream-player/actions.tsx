"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { useAuth } from "@clerk/nextjs";
import { Heart, Gift, Target, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { onFollow, unFollow } from "@/actions/follow";
import { useTransition } from "react";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";
import { TipModal } from "./tip-modal";
import { TipMenuModal } from "./tip-menu-modal";
import Link from "next/link";

type Props = {
  hostIdentity: string;
  isHost: boolean;
  isFollowing: boolean;
  hostName: string;
  username: string;
  isVerifiedModel?: boolean;
};

function Actions({ 
  hostIdentity, 
  isFollowing, 
  isHost, 
  hostName, 
  username,
  isVerifiedModel = false 
}: Props) {
  const { userId } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showTipModal, setShowTipModal] = useState(false);
  const [showTipMenuModal, setShowTipMenuModal] = useState(false);

  const handleFollow = () => {
    startTransition(() => {
      onFollow(hostIdentity)
        .then((data) =>
          toast.success(`You are now following ${data.following.username}`)
        )
        .catch(() => toast.error("Something went wrong"));
    });
  };

  const handleUnfollow = () => {
    startTransition(() => {
      unFollow(hostIdentity)
        .then((data) =>
          toast.success(`You have unfollowed ${data.following.username}`)
        )
        .catch(() => toast.error("Something went wrong"));
    });
  };

  const toggleFollow = () => {
    if (!userId) {
      return router.push("/sign-in");
    }

    if (isHost) return;
    if (isFollowing) {
      handleUnfollow();
    } else {
      handleFollow();
    }
  };

  const handleTip = () => {
    if (!userId) {
      return router.push("/sign-in");
    }
    setShowTipModal(true);
  };

  const handleTipMenu = () => {
    if (!userId) {
      return router.push("/sign-in");
    }
    setShowTipMenuModal(true);
  };

  return (
    <>
      <div className="flex items-center gap-x-4">
        <Button
          onClick={toggleFollow}
          disabled={isPending || isHost}
          variant="primary"
          size="sm"
          className="w-full lg:w-auto"
        >
          <Heart
            className={cn("h-4 w-4 mr-2", isFollowing ? "fill-white" : "fill-none")}
          />
          {isFollowing ? "Unfollow" : "Follow"}
        </Button>

        {isHost && isVerifiedModel && (
          <Button
            size="sm"
            variant="primary"
            className="w-full lg:w-auto"
            asChild
          >
            <Link href={`/u/${username}/goals`}>
              <Target className="h-4 w-4 mr-2" />
              Create Goal
            </Link>
          </Button>
        )}

        {!isHost && (
          <>
            <Button
              onClick={handleTip}
              variant="secondary"
              size="sm"
              className="w-full lg:w-auto"
            >
              <Gift className="h-4 w-4 mr-2" />
              Tip
            </Button>
            <Button
              onClick={handleTipMenu}
              variant="secondary"
              size="sm"
              className="w-full lg:w-auto"
            >
              <Menu className="h-4 w-4 mr-2" />
              Menu
            </Button>
          </>
        )}
      </div>

      <TipModal
        isOpen={showTipModal}
        onClose={() => setShowTipModal(false)}
        recipientId={hostIdentity}
        recipientName={hostName}
        senderName={username}
      />

      <TipMenuModal
        isOpen={showTipMenuModal}
        onClose={() => setShowTipMenuModal(false)}
        username={hostName}
        isHost={isHost}
        recipientId={hostIdentity}
      />
    </>
  );
}

export default Actions;

export const ActionsSkeleton = () => {
  return <Skeleton className="h-10 w-full lg:w-24" />;
};
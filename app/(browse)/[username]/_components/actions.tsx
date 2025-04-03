"use client";
import {onBlock, onUnblock} from "@/actions/block";
import {onFollow, unFollow} from "@/actions/follow";
import {Button} from "@/components/ui/button";
import React, {useTransition} from "react";
import {toast} from "sonner";

type Props = {
  isFollowing: boolean;
  userId: string;
};

function Actions({isFollowing, userId}: Props) {
  const [isPending, startTransition] = useTransition();
  const handleFollow = () => {
    startTransition(() => {
      onFollow(userId).then((data) =>
        toast.success(`You are now following ${data.following.username}`)
      );
    });
  };
  const handleUnfollow = () => {
    startTransition(() => {
      unFollow(userId).then((data) =>
        toast.success(
          `You have unfollowed the user with the username of  ${data.following.username}`
        )
      );
    });
  };

  const handleBlock = () => {
    startTransition(() => {
      onBlock(userId)
        .then((data) => toast.success(`Blocked the user`))
        .catch((err) => toast.error("Smthng went wrong"));
    });
  };
  const handleUnBlock = () => {
    startTransition(() => {
      onUnblock(userId)
        .then(() => toast.success(`Unblocked the user`))
        .catch((err) => toast.error("Smthng went wrong"));
    });
  };
  return (
    <>
      <Button
        disabled={isPending}
        variant={"primary"}
        onClick={isFollowing ? handleUnfollow : handleFollow}
      >
        {isFollowing ? "Unfollow" : "Follow"}
      </Button>
      <Button onClick={handleUnBlock} disabled={isPending}>
        UnBlock
      </Button>
    </>
  );
}

export default Actions;

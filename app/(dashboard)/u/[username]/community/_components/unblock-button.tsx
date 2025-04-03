"use client";

import {onUnblock} from "@/actions/block";
import {Button} from "@/components/ui/button";
import {useTransition} from "react";
import {toast} from "sonner";

type Props = {
  userId: string;
};

function UnblockButton({userId}: Props) {
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    startTransition(() => {
      onUnblock(userId)
        .then((data) =>
          toast.success(`User ${data?.blocked.username} unblocked`)
        )
        .catch(() => toast.error("Something went wrong"));
    });
  };
  return (
    <Button
      disabled={isPending}
      onClick={onClick}
      variant={"link"}
      className="text-blue-500 w-full"
    >
      Unblock
    </Button>
  );
}

export default UnblockButton;

import Thubmnail, {ThumbnailSkeleton} from "@/components/thumbnail";
import VerifiedMark from "@/components/verified-mark";
import Link from "next/link";
import {Stream, User} from "prisma/prisma-client";
import React from "react";

import {formatDistanceToNow} from "date-fns";
import {Skeleton} from "@/components/ui/skeleton";
type Props = {
  data: {
    id: string;
    name: string;
    thumbnailUrl: string | null;
    isLive: boolean;
    updatedAt: Date;
    user: User;
  };
};

function ResultCard({data}: Props) {
  return (
    <Link
      href={`/${data.user.username}`}
      prefetch={false}
      className="w-full flex gap-x-4"
    >
      <div className="relative h-[9rem] w-[16rem]">
        <Thubmnail
          src={data.thumbnailUrl}
          fallback={data.user.imageUrl}
          isLive={data.isLive}
          username={data.user.username}
        />
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-x-2">
          <p className="font-bold text-lg cursor-pointer hover:text-blue-600">
            {data.user.username}
          </p>
          <VerifiedMark />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {/* @ts-ignore */}
            {formatDistanceToNow(new Date(data.updatedAt), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default ResultCard;

export const ResultCardSkeleton = () => {
  return (
    <div className="w-full flex gap-x-4">
      <div className="relative h-[9rem] w-[16rem]">
        <ThumbnailSkeleton />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
};

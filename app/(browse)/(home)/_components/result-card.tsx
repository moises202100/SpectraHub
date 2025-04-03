import LiveBadge from "@/components/live-badge";
import Thubmnail, { ThumbnailSkeleton } from "@/components/thumbnail";
import { Skeleton } from "@/components/ui/skeleton";
import UserAvatar, { UserAvatarSkeleton } from "@/components/user-avatar";
import VerifiedMark from "@/components/verified-mark";
import Link from "next/link";
import { Stream, User } from "prisma/prisma-client";

type Props = {
  data: {
    user: User & {
      isVerifiedModel: boolean;
    };
    isLive: boolean;
    name: string;
    thumbnailUrl: string | null;
  };
};

function ResultCard({ data }: Props) {
  // Only render if user is verified
  if (!data.user.isVerifiedModel) {
    return null;
  }

  return (
    <Link href={`/${data.user.username}`}>
      <div className="h-full w-full space-y-4">
        <Thubmnail
          src={data.thumbnailUrl}
          fallback={data.user.imageUrl}
          isLive={data.isLive}
          username={data.user.username}
        />

        <div className="flex gap-x-3">
          <UserAvatar
            username={data.user.username}
            imageUrl={data.user.imageUrl}
            isLive={data.isLive}
          />
          <div className="flex flex-col overflow-hidden text-sm">
            <div className="flex items-center gap-x-2">
              <p className="truncate font-semibold hover:text-blue-500">
                {data.name}
              </p>
              <VerifiedMark />
            </div>
            <p className="text-muted-foreground">{data.user.username}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ResultCard;

export const ResultCardSkeleton = () => {
  return (
    <div className="w-full h-full space-y-4">
      <ThumbnailSkeleton />
      <div className="flex gap-x-3">
        <UserAvatarSkeleton />
        <div className="flex flex-col gap-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
};
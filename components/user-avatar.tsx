import {cva, type VariantProps} from "class-variance-authority";

import {cn} from "@/lib/utils";
import {Skeleton} from "./ui/skeleton";
import {Avatar} from "./ui/avatar";
import {AvatarFallback} from "./ui/avatar";
import {AvatarImage} from "./ui/avatar";
import LiveBadge from "./live-badge";

const avatarSizes = cva("", {
  variants: {
    size: {
      default: "h-8 w-8",
      lg: "h-14 w-14",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface Props extends VariantProps<typeof avatarSizes> {
  imageUrl: string;
  username: string;
  isLive?: boolean;
  showBadge?: boolean;
}

function UserAvatar({imageUrl, username, isLive, showBadge, size}: Props) {
  const canShowBadge = showBadge && isLive;

  return (
    <div className="relative">
      <Avatar
        className={cn(
          isLive && "ring-rose-500 ring-2 border border-background",
          avatarSizes({size: size})
        )}
      >
        <AvatarImage src={imageUrl} className="object-cover" />
        <AvatarFallback>
          {username[0]}

          {username[username.length - 1]}
        </AvatarFallback>
      </Avatar>
      {canShowBadge && (
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
          <LiveBadge />
        </div>
      )}
    </div>
  );
}

export default UserAvatar;

interface UserProps extends VariantProps<typeof avatarSizes> {}

export const UserAvatarSkeleton = ({size}: UserProps) => {
  return <Skeleton className={cn(`rounded-full`, avatarSizes({size}))} />;
};

"use client";

import {useSidebar} from "@/store/use-sidebar";
import {Follow, User} from "prisma/prisma-client";
import UserItem, {UserItemSkeleton} from "./user-item";

type Props = {
  data: (Follow & {
    following: User & {
      stream: {isLive: boolean} | null;
    };
  })[];
};

function Following({data}: Props) {
  const {collapsed} = useSidebar((state) => state);
  const showLabel = !collapsed && data.length > 0;

  return (
    <div>
      {showLabel && (
        <div className="pl-6 mb-4">
          <p className="text-sm text-muted-foreground">Following</p>
        </div>
      )}

      <ul className="space-y-2 px-2">
        {data.map((follow) => (
          <UserItem
            key={follow.following.id}
            imageUrl={follow.following.imageUrl}
            username={follow.following.username}
            isLive={follow.following.stream?.isLive}
          />
        ))}
      </ul>
    </div>
  );
}

export default Following;

export const FollowingSkeleton = () => {
  return (
    <ul className="px-2 pt-2 lg:pt-0">
      {[...Array(3).map((_, idx) => <UserItemSkeleton key={idx} />)]}
    </ul>
  );
};

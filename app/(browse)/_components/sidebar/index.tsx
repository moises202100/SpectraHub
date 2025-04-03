"use client";

import { useState, useEffect } from "react";
import Toggle, { ToggleSkeleton } from "./toggle";
import Wrapper from "./wrapper";
import { getFollowedUsers } from "@/lib/follow-service";
import Following, { FollowingSkeleton } from "./following";
import Navigation from "./navigation";
import { User, Follow } from "@prisma/client";

interface FollowingWithUser extends Follow {
  following: User & {
    stream: { isLive: boolean } | null;
  };
}

function Sidebar() {
  const [following, setFollowing] = useState<FollowingWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const followingData = await getFollowedUsers();
        setFollowing(followingData);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  if (isLoading) {
    return <SidebarSkeleton />;
  }

  return (
    <Wrapper>
      <Toggle />
      <div className="space-y-4 pt-4 lg:pt-0">
        <Following data={following} />
        <Navigation />
      </div>
    </Wrapper>
  );
}

export default Sidebar;

export const SidebarSkeleton = () => {
  return (
    <aside className="fixed left-0 flex flex-col w-[70px] lg:w-60 h-full bg-background border-r border-[#2D2E35] z-50">
      <ToggleSkeleton />
      <FollowingSkeleton />
    </aside>
  );
};
"use client";

import {cn} from "@/lib/utils";
import {useSidebar} from "@/store/use-sidebar";
import {useEffect, useState} from "react";
import {ToggleSkeleton} from "./toggle";
import {RecommendedSkeleton} from "./recommended";
import {FollowingSkeleton} from "./following";

type Props = {
  children: React.ReactNode;
};

function Wrapper({children}: Props) {
  const [isClient, setIsClient] = useState(false);
  const collapsed = useSidebar((state) => state.collapsed);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient)
    return (
      <aside className="fixed  left-0 flex flex-col lg:w-60 w-[70px] h-full bg-background border-r border-[#2D2E35] z-50">
        <ToggleSkeleton />
        <FollowingSkeleton />
        <RecommendedSkeleton />
      </aside>
    );
  ("");
  return (
    <aside
      className={cn(
        "fixed  left-0 flex flex-col lg:w-60 w-[70px] h-full bg-background border-r border-[#2D2E35] z-50",
        collapsed && "w-[70px]"
      )}
    >
      {children}
    </aside>
  );
}

export default Wrapper;

"use client";

import {useEffect} from "react";
import {useMediaQuery} from "usehooks-ts";
import {cn} from "@/lib/utils";
import {useCreatorSidebar} from "@/store/use-creator-sidebar";

type Props = {
  children: React.ReactNode;
};
function Container({children}: Props) {
  const {collapsed, onCollapse, onExpand} = useCreatorSidebar((state) => state);
  const matches = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    if (matches) {
      onExpand();
    } else {
      onCollapse();
    }
  }, [matches, onCollapse, onExpand]);
  return (
    <div
      className={cn("flex-1", collapsed ? "ml-[70px]" : "ml-[70px] lg:ml-60")}
    >
      {children}
    </div>
  );
}

export default Container;

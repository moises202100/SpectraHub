"use client";
import {Button} from "@/components/ui/button";
import {Skeleton} from "@/components/ui/skeleton";
import {cn} from "@/lib/utils";
import {useCreatorSidebar} from "@/store/use-creator-sidebar";
import { DivideIcon as LucideIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

type Props = {
  icon: typeof LucideIcon;
  label: string;
  href?: string;
  isActive?: boolean;
  onClick?: () => void;
};

function NavItem({icon: Icon, isActive, label, href, onClick}: Props) {
  const {collapsed} = useCreatorSidebar((state) => state);

  const ButtonContent = (
    <div
      className={cn(
        "flex items-center gap-x-4",
        collapsed && "justify-center"
      )}
    >
      <Icon className={cn(`h-4 w-4`, collapsed ? "mr-0" : "mr-2")} />
      {!collapsed && <span>{label}</span>}
    </div>
  );

  if (onClick) {
    return (
      <Button
        onClick={onClick}
        variant={"ghost"}
        className={cn(
          `w-full h-12`,
          collapsed ? "justify-center" : "justify-start",
          isActive && "bg-accent"
        )}
      >
        {ButtonContent}
      </Button>
    );
  }

  return (
    <Button
      asChild
      variant={"ghost"}
      className={cn(
        `w-full h-12`,
        collapsed ? "justify-center" : "justify-start",
        isActive && "bg-accent"
      )}
    >
      <Link href={href || ""}>
        {ButtonContent}
      </Link>
    </Button>
  );
}

export default NavItem;

export const NavItemSkeleton = () => {
  return (
    <li className="flex items-center gap-x-4 px-3 py-2">
      <Skeleton className="min-h-[48px] min-w-[48px] rounded-md" />
      <div className="flex-1 hidden lg:block">
        <Skeleton className="h-6" />
      </div>
    </li>
  );
};
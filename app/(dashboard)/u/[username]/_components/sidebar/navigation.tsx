"use client";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import {
  Fullscreen,
  KeyRound,
  MessageSquare,
  Users,
  UserCheck,
  ShieldCheck,
  Settings
} from "lucide-react";
import NavItem from "./nav-item";
import { useEffect, useState } from "react";
import { VerifyModal } from "./verify-modal";

interface UserData {
  id: string;
  username: string;
  isVerifiedModel: boolean;
}

function Navigation() {
  const pathname = usePathname();
  const { user } = useUser();
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const routes = [
    {
      label: "Stream",
      href: `/u/${user?.username}`,
      icon: Fullscreen,
      requiresVerification: true
    },
    {
      label: "Keys",
      href: `/u/${user?.username}/keys`,
      icon: KeyRound,
      requiresVerification: true
    },
    {
      label: "Chat",
      href: `/u/${user?.username}/chat`,
      icon: MessageSquare,
      requiresVerification: false
    },
    {
      label: "Community",
      href: `/u/${user?.username}/community`,
      icon: Users,
      requiresVerification: false
    },
    {
      label: "My Settings",
      href: `/u/${user?.username}/settings`,
      icon: Settings,
      requiresVerification: true
    }
  ];

  const fetchUserData = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${user.id}`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      console.log("User data fetched:", data);
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user?.id]);

  const handleVerificationSuccess = () => {
    fetchUserData();
    setShowVerifyModal(false);
  };

  if (!user?.username || isLoading) {
    return (
      <ul className="space-y-2 px-2 pt-4 lg:pt-0">
        {[...Array(4)].map((_, i) => (
          <NavItem key={i} icon={Users} label="" />
        ))}
      </ul>
    );
  }

  return (
    <>
      <ul className="space-y-2 px-2 pt-4 lg:pt-0">
        {routes.map((route) => {
          if (route.requiresVerification && !userData?.isVerifiedModel) {
            return null;
          }

          return (
            <NavItem
              key={route.label}
              label={route.label}
              icon={route.icon}
              href={route.href}
              isActive={pathname === route.href}
            />
          );
        })}

        {!userData?.isVerifiedModel && (
          <NavItem
            label="Become a Model"
            icon={UserCheck}
            onClick={() => setShowVerifyModal(true)}
          />
        )}

        {userData?.isVerifiedModel && (
          <div className="flex items-center gap-x-2 p-4 text-green-500">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-sm hidden lg:block">Verified Model</span>
          </div>
        )}
      </ul>

      <VerifyModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        onSuccess={handleVerificationSuccess}
      />
    </>
  );
}

export default Navigation;
"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import NavItem from "./nav-item";
import { ComplianceModal } from "@/components/compliance-modal";
import { getRecommended } from "@/lib/recommended-service";
import UserAvatar from "@/components/user-avatar";
import Link from "next/link";

interface UserWithStream {
  id: string;
  username: string;
  imageUrl: string;
  stream: {
    isLive: boolean;
  } | null;
}

function Navigation() {
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [recommended, setRecommended] = useState<UserWithStream[]>([]);

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const data = await getRecommended();
        // Filter out users without streams and map to correct structure
        const formattedData = data
          .filter(user => user.stream)
          .map(user => ({
            id: user.id,
            username: user.username,
            imageUrl: user.imageUrl,
            stream: user.stream
          }));
        setRecommended(formattedData);
      } catch (error) {
        console.error("Error fetching recommended:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommended();
  }, []);

  if (isLoading) {
    return <NavigationSkeleton />;
  }

  return (
    <div className="flex flex-col space-y-6 p-2">
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-4 px-2 hidden lg:block">
          Recommended Users
        </h2>
        <div className="space-y-2">
          {recommended.map((user) => (
            <Link 
              key={user.id} 
              href={`/${user.username}`}
              className="flex items-center gap-x-4 p-2 w-full hover:bg-white/10 rounded-md transition"
            >
              <UserAvatar
                username={user.username}
                imageUrl={user.imageUrl}
                isLive={user.stream?.isLive}
                showBadge
              />
              <div className="flex flex-col hidden lg:block">
                <p className="text-sm font-medium">{user.username}</p>
                {user.stream?.isLive && (
                  <p className="text-xs text-rose-500">Live Now</p>
                )}
              </div>
            </Link>
          ))}
          {recommended.length === 0 && (
            <p className="text-sm text-muted-foreground px-2">
              
            </p>
          )}
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-[#2D2E35] px-2">
        <NavItem
          label="18 U.S.C. 2257 Compliance"
          icon={FileText}
          onClick={() => setShowComplianceModal(true)}
        />
      </div>

      <ComplianceModal
        isOpen={showComplianceModal}
        onClose={() => setShowComplianceModal(false)}
      />
    </div>
  );
}

export const NavigationSkeleton = () => {
  return (
    <div className="flex flex-col space-y-4 p-4">
      <div className="w-32 h-4 bg-muted rounded-md hidden lg:block" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-x-4 p-2">
          <div className="w-10 h-10 rounded-full bg-muted" />
          <div className="space-y-2 hidden lg:block">
            <div className="w-24 h-4 bg-muted rounded-md" />
            <div className="w-16 h-3 bg-muted rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Navigation;
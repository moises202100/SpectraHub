"use client";

import { useState, useEffect } from "react";
import Actions from "./actions";
import Logo from "./logo";
import dynamic from "next/dynamic";
import useTokenStore from "@/store/tokenStore";
import { useUser } from "@clerk/nextjs";

const Page = dynamic(() => import("@/app/Paypal/page"), { ssr: false });

export default function Navbar() {
  const [showModal, setShowModal] = useState(false);
  const { tokens, setTokens } = useTokenStore();
  const { user } = useUser();

  // Improved token fetching with error handling and loading state
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserTokens = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/user/tokens");
      if (!response.ok) {
        throw new Error('Failed to fetch tokens');
      }
      const data = await response.json();
      setTokens(data.tokens || 0);
    } catch (error) {
      console.error("Error fetching tokens:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchUserTokens();
      
      // Set up polling to keep tokens in sync
      const intervalId = setInterval(fetchUserTokens, 30000); // Poll every 30 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [user?.id, setTokens]);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    fetchUserTokens(); // Refresh tokens when modal closes
  };

  return (
    <>
      <nav className="fixed top-0 w-full h-20 z-[49] bg-[#1010f2] px-2 lg:px-4 flex justify-between items-center shadow-sm">
        <Logo />
        <div className="flex items-center gap-4">
          <div className="text-white font-bold">
            {isLoading ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              <>
                Tokens: <span className="text-yellow-400">{tokens}</span>
              </>
            )}
          </div>
          <Actions />
          <button
            className="bg-[#245af6] text-white py-2 px-4 rounded-lg shadow-md hover:bg-[#8324f6] transition"
            onClick={toggleModal}
          >
            Buy Tokens
          </button>
        </div>
      </nav>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-black p-6 rounded-lg shadow-lg w-full sm:w-96 md:w-1/2 lg:w-1/3 xl:w-1/4 max-w-full relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Buy Tokens</h2>
              <button
                className="text-gray-600 hover:text-gray-800 text-xl font-bold"
                onClick={handleCloseModal}
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto max-h-[70vh]">
              <Page />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
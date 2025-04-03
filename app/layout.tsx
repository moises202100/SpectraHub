"use client";

import './globals.css';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from 'sonner';
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

const inter = Inter({ subsets: ['latin'] });

function AgeVerificationModal({ onAccept }: { onAccept: () => void }) {
  const handleUnder18 = () => {
    alert('This website is only intended for users over 18 years of age.');
  };

  return (
    <div className="fixed inset-0 bg-gray-900/80 flex justify-center items-center z-50">
      <div className="bg-black-700 p-6 rounded-lg shadow-lg text-center max-w-lg">
        <p className="text-lg font-bold text-white mb-4">This is an adult website.</p>
        <p className="text-sm text-white mb-4">
          This website contains material restricted to minors, including nudity and explicit depictions of sexual activity. By entering, you affirm that you are at least 18 years of age or the age of majority in the jurisdiction where you are accessing the website and that you consent to view sexually explicit content.
        </p>
        <div className="flex justify-center gap-4">
          <button onClick={onAccept} className="bg-blue-300 text-black px-4 py-2 rounded-lg">I am 18 or older</button>
          <button onClick={handleUnder18} className="bg-blue-300 text-black px-4 py-2 rounded-lg">I am under 18 years old</button>
        </div>
      </div>
    </div>
  );
}

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      setShowModal(true);
    }
  }, [isSignedIn]);

  return (
    <>
      {showModal && <AgeVerificationModal onAccept={() => setShowModal(false)} />}
      {children}
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            storageKey="spectrahub-theme"
          >
            <AuthWrapper>{children}</AuthWrapper>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

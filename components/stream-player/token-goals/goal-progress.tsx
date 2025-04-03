"use client";

import { useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface GoalProgressProps {
  name: string;
  targetAmount: number;
  currentAmount: number;
  theme?: string;
  color?: string;
}

export const GoalProgress = ({
  name,
  targetAmount,
  currentAmount,
  theme = "default",
  color = "#1010f2"
}: GoalProgressProps) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [prevAmount, setPrevAmount] = useState(currentAmount);
  
  const percentage = Math.min((currentAmount / targetAmount) * 100, 100);
  
  useEffect(() => {
    if (currentAmount >= targetAmount && prevAmount < targetAmount) {
      setShowCelebration(true);
      const audio = new Audio("/celebration.mp3");
      audio.play().catch(() => {});
      setTimeout(() => setShowCelebration(false), 3000);
    }
    setPrevAmount(currentAmount);
  }, [currentAmount, targetAmount, prevAmount]);

  const themeStyles = {
    default: "",
    gamer: "border-2 border-purple-500 bg-black/60",
    retro: "border-4 border-double border-yellow-400 bg-black/80",
    minimal: "bg-white/5"
  };

  return (
    <div className={cn(
      "rounded-lg p-6 relative overflow-hidden transition-all w-full",
      themeStyles[theme as keyof typeof themeStyles]
    )}>
      {showCelebration && (
        <div className="absolute inset-0 flex items-center justify-center animate-fade-out">
          <Sparkles className="w-16 h-16 text-yellow-400 animate-spin" />
        </div>
      )}
      
      <div className="flex justify-between mb-4">
        <h3 className="font-semibold text-xl text-white">{name}</h3>
        <span className="text-lg text-white/80">
          {currentAmount}/{targetAmount} tokens
        </span>
      </div>
      
      <div className="relative">
        <Progress 
          value={percentage} 
          className="h-6"
          indicatorClassName={cn(
            "transition-all duration-500",
            percentage === 100 ? "animate-pulse" : "",
            theme === "gamer" ? "bg-gradient-to-r from-purple-500 to-pink-500" :
            theme === "retro" ? "bg-yellow-400" :
            `bg-[${color}]`
          )}
        />
        <span className="absolute right-0 top-0 -translate-y-full text-sm text-white/80 mr-1">
          {percentage.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};
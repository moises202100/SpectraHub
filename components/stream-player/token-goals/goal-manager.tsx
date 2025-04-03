"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { GoalProgress } from "./goal-progress";

interface TokenGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  theme: string;
  color: string;
  isActive: boolean;
  isCompleted: boolean;
}

export const GoalManager = () => {
  const [goals, setGoals] = useState<TokenGoal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: 0,
    theme: "default",
    color: "#1010f2"
  });

  const fetchGoals = async () => {
    try {
      const response = await fetch("/api/goals");
      if (!response.ok) throw new Error("Failed to fetch goals");
      const data = await response.json();
      setGoals(data);
    } catch (error) {
      toast.error("Failed to load goals");
    }
  };

  useEffect(() => {
    fetchGoals();
    const interval = setInterval(fetchGoals, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateGoal = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGoal),
      });

      if (!response.ok) throw new Error("Failed to create goal");
      
      await fetchGoals();
      toast.success("Goal created successfully");
      setNewGoal({ name: "", targetAmount: 0, theme: "default", color: "#1010f2" });
    } catch (error) {
      toast.error("Failed to create goal");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateGoal = async (goalId: string, updates: Partial<TokenGoal>) => {
    try {
      const response = await fetch("/api/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId, ...updates }),
      });

      if (!response.ok) throw new Error("Failed to update goal");
      
      await fetchGoals();
      toast.success("Goal updated successfully");
    } catch (error) {
      toast.error("Failed to update goal");
    }
  };

  const handleResetGoal = async (goalId: string) => {
    await handleUpdateGoal(goalId, { currentAmount: 0, isCompleted: false });
  };

  const getWidgetUrl = (goalId: string) => {
    return `${window.location.origin}/widget/goals/${goalId}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Current Goals Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Current Goals</h2>
        {goals.length === 0 ? (
          <p className="text-muted-foreground">No active goals</p>
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className="bg-background border rounded-lg p-4 space-y-4">
              <GoalProgress
                name={goal.name}
                targetAmount={goal.targetAmount}
                currentAmount={goal.currentAmount}
                theme={goal.theme}
                color={goal.color}
              />
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleResetGoal(goal.id)}
                >
                  Reset Progress
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(getWidgetUrl(goal.id));
                    toast.success("Widget URL copied to clipboard");
                  }}
                >
                  Copy Widget URL
                </Button>
                <Button
                  size="sm"
                  variant={goal.isActive ? "destructive" : "outline"}
                  onClick={() => handleUpdateGoal(goal.id, { isActive: !goal.isActive })}
                >
                  {goal.isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create New Goal Section */}
      <div className="bg-background border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Create New Goal</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Goal Name</label>
            <Input
              value={newGoal.name}
              onChange={(e) => setNewGoal(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter goal name"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Target Amount (Tokens)</label>
            <Input
              type="number"
              value={newGoal.targetAmount || ""}
              onChange={(e) => setNewGoal(prev => ({ ...prev, targetAmount: parseInt(e.target.value) }))}
              placeholder="Enter target amount"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Theme</label>
            <Select
              value={newGoal.theme}
              onValueChange={(value) => setNewGoal(prev => ({ ...prev, theme: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="gamer">Gamer</SelectItem>
                <SelectItem value="retro">Retro</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Color</label>
            <Input
              type="color"
              value={newGoal.color}
              onChange={(e) => setNewGoal(prev => ({ ...prev, color: e.target.value }))}
            />
          </div>
          <Button
            onClick={handleCreateGoal}
            disabled={isLoading || !newGoal.name || !newGoal.targetAmount}
            className="w-full"
            variant="primary"
          >
            {isLoading ? "Creating..." : "Create Goal"}
          </Button>
        </div>
      </div>
    </div>
  );
};
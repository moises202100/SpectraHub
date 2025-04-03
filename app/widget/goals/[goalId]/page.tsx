import { db } from "@/lib/db";
import { GoalProgress } from "@/components/stream-player/token-goals/goal-progress";

interface WidgetPageProps {
  params: {
    goalId: string;
  };
}

export default async function WidgetPage({ params }: WidgetPageProps) {
  const goal = await db.tokenGoal.findUnique({
    where: { id: params.goalId },
  });

  if (!goal || !goal.isActive) {
    return (
      <div className="flex items-center justify-center h-full">
        Goal not found or inactive
      </div>
    );
  }

  return (
    <div className="h-full w-full flex items-center justify-center bg-transparent">
      <div className="w-[800px] max-w-full">
        <GoalProgress
          name={goal.name}
          targetAmount={goal.targetAmount}
          currentAmount={goal.currentAmount}
          theme={goal.theme}
          color={goal.color}
        />
      </div>
    </div>
  );
}
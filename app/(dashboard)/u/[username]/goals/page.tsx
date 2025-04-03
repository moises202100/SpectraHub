import { GoalManager } from "@/components/stream-player/token-goals/goal-manager";
import { getSelf } from "@/lib/auth-service";

const GoalsPage = async () => {
  const self = await getSelf();

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Token Goals</h1>
        <p className="text-muted-foreground">Manage your stream goals</p>
      </div>
      <GoalManager />
    </div>
  );
};

export default GoalsPage;
"use client";
import {Switch} from "@/components/ui/switch";
import {toast} from "sonner";
import {useTransition} from "react";
import {updateStream} from "@/actions/stream";
import {Skeleton} from "@/components/ui/skeleton";
type FieldTypes = "isChatEnabled" | "isChatDelayed" | "isChatFollowersOnly";
type Props = {
  label: string;
  value: boolean;
  field: FieldTypes;
};

function ToggleCard({label, value = false, field}: Props) {
  const [isPending, startTransition] = useTransition();
  const onChange = () => {
    startTransition(() => {
      updateStream({[field]: !value})
        .then(() => toast.success(`Chat settings updated`))
        .catch(() => toast.error(`Something went wrong`));
    });
  };
  return (
    <div className="bg-muted rounded-xl p-6">
      <div className="flex items-center justify-between ">
        <p className="font-semibold shrink-0">{label}</p>
        <div className="space-y-2">
          <Switch
            checked={value}
            onCheckedChange={onChange}
            disabled={isPending}
          >
            {value ? "On" : "Off"}{" "}
          </Switch>
        </div>
      </div>
    </div>
  );
}

export default ToggleCard;

export const ToggleCardSkeleton = () => {
  return <Skeleton className="rounded-xl p-10 w-full" />;
};

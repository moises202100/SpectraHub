import {Button} from "@/components/ui/button";
import {UserButton} from "@clerk/nextjs";
import {LogOut} from "lucide-react";
import Link from "next/link";

function Actions() {
  return (
    <div className="flex items-center justify-end gap-x-3">
      <Button
        size={"sm"}
        variant={"ghost"}
        className="text-muted-foreground hover:text-primary"
        asChild
      >
   
      </Button>
      <UserButton afterSignOutUrl="/" />
    </div>
  );
}

export default Actions;

"use client";
import {Maximize, Minimize} from "lucide-react";
import Hint from "../hint";
type Props = {
  isFullScreen: boolean;
  onToggle: () => void;
};

function FullScreenControl({isFullScreen, onToggle}: Props) {
  const Icon = isFullScreen ? Minimize : Maximize;
  const label = isFullScreen ? "Exit Fullscreen" : "Enter FullScreen";
  return (
    <div className="flex items-center justify-center gap-4">
      <Hint label={label} asChild>
        <button
          onClick={onToggle}
          className="text-white p-1.5 hover:bg-white/10 rounded-lg"
        >
          <Icon className="h-5 w-5 " />
        </button>
      </Hint>
    </div>
  );
}

export default FullScreenControl;

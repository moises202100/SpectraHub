"use client";

import {useParticipants} from "@livekit/components-react";
import {useDebounce} from "usehooks-ts";
import {useMemo, useState} from "react";
import {Input} from "../ui/input";
import {ScrollArea} from "../ui/scroll-area";
import CommunityItem from "./community-item";
import {LocalParticipant, RemoteParticipant} from "livekit-client";

type Props = {
  hostName: string;
  viewerName: string;
  isHidden: boolean;
};

function ChatCommunity({hostName, viewerName, isHidden}: Props) {
  const [value, setValue] = useState("");
  const debouncedValue = useDebounce(value, 500);
  const participants = useParticipants();
  const onChange = (newValue: string) => {
    setValue(newValue);
  };

  const filteredParticipants = useMemo(() => {
    const deduped = participants.reduce((acc, participant) => {
      const hostAsViewer = `host-${participant.identity}`;
      if (!acc.some((p) => p.identity === hostAsViewer)) {
        acc.push(participant);
      }
      return acc;
    }, [] as (RemoteParticipant | LocalParticipant)[]);

    return deduped.filter((participant) => {
      return participant.name
        ?.toLowerCase()
        .includes(debouncedValue.toLowerCase());
    });
  }, [participants, debouncedValue]);

  if (isHidden) {
    return (
      <div className="flex items-center flex-1 justify-center">
        <p className="text-sm text-muted-foreground">Community is disabled</p>
      </div>
    );
  }

  return (
    <div className="p-4 ">
      <Input
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search community "
        className="border-white/10"
      />
      <ScrollArea className="gap-y-2 my-4">
        <p className="text-center text-muted-foreground hidden text-sm last:block p-2">
          No results
        </p>

        {filteredParticipants.map((participant) => (
          <CommunityItem
            key={participant.identity}
            hostName={hostName}
            viewerName={viewerName}
            participantName={participant.name}
            participantIdentity={participant.identity}
          />
        ))}
      </ScrollArea>
    </div>
  );
}

export default ChatCommunity;

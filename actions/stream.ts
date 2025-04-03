"use server";

import { getSelf } from "@/lib/auth-service";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

type ValidData = {
  thumbnailUrl?: string | null;
  name?: string;
  isChatEnabled?: boolean;
  isChatDelayed?: boolean;
  isChatFollowersOnly?: boolean;
  pinnedMessage?: string;
  streamTopic?: string;
  kingTokens?: number;
  blockedCountries?: string[];
};

export const updateStream = async (values: ValidData) => {
  try {
    const self = await getSelf();
    const selfStream = await db.stream.findUnique({
      where: {
        userId: self.id,
      },
    });

    if (!selfStream) {
      throw new Error("Stream not found");
    }

    const validData = {
      thumbnailUrl: values.thumbnailUrl,
      name: values.name,
      isChatEnabled: values.isChatEnabled,
      isChatDelayed: values.isChatDelayed,
      isChatFollowersOnly: values.isChatFollowersOnly,
      pinnedMessage: values.pinnedMessage,
      streamTopic: values.streamTopic,
      kingTokens: values.kingTokens,
      blockedCountries: values.blockedCountries,
    };

    const stream = await db.stream.update({
      where: {
        id: selfStream.id,
      },
      data: {
        ...validData,
      },
    });

    revalidatePath(`/u/${self.username}/chat`);
    revalidatePath(`/u/${self.username}`);
    revalidatePath(`/${self.username}`);

    return stream;
  } catch (error) {
    console.error("[UPDATE_STREAM_ERROR]", error);
    throw new Error("Internal Error");
  }
};
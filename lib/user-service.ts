import { db } from "./db";
import { currentUser } from "@clerk/nextjs";
import { headers } from "next/headers";

const getCountry = (): string | null => {
  try {
    const headersList = headers();
    const country = headersList.get('cf-ipcountry');
    return country ? country.toUpperCase() : null;
  } catch {
    return null;
  }
};

export const getUserByUsername = async (username: string) => {
  const country = getCountry();

  if (!username) {
    return null;
  }

  const user = await db.user.findUnique({
    where: {
      username
    },
    include: {
      stream: {
        select: {
          id: true,
          isLive: true,
          isChatDelayed: true,
          isChatEnabled: true,
          isChatFollowersOnly: true,
          thumbnailUrl: true,
          name: true,
          pinnedMessage: true,
          streamTopic: true,
          blockedCountries: true
        }
      },
      _count: {
        select: {
          follower: true
        }
      }
    }
  });

  // If user has blocked the current country, return null
  if (user?.stream?.blockedCountries?.includes(country || "")) {
    return null;
  }

  return user;
};

export const getUserById = async (id: string) => {
  const country = getCountry();

  if (!id) {
    return null;
  }

  const user = await db.user.findUnique({
    where: {
      id
    },
    include: {
      stream: {
        select: {
          id: true,
          isLive: true,
          isChatDelayed: true,
          isChatEnabled: true,
          isChatFollowersOnly: true,
          thumbnailUrl: true,
          name: true,
          pinnedMessage: true,
          streamTopic: true,
          blockedCountries: true
        }
      },
      _count: {
        select: {
          follower: true
        }
      }
    }
  });

  // If user has blocked the current country, return null
  if (user?.stream?.blockedCountries?.includes(country || "")) {
    return null;
  }

  return user;
};

export const getSelfByUsername = async (username: string) => {
  const self = await currentUser();

  if (!self || !self.username) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: {
      username
    },
    include: {
      stream: true
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (self.username !== user.username) {
    throw new Error('Unauthorized');
  }

  return user;
};
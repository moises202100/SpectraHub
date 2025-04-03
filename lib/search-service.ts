import { db } from "@/lib/db";
import { headers } from "next/headers";
import { getSelf } from "@/lib/auth-service";

const getCountry = (): string | null => {
  try {
    const headersList = headers();
    const country = headersList.get('cf-ipcountry');
    return country ? country.toUpperCase() : null;
  } catch {
    return null;
  }
};

export const getSearch = async (term?: string) => {
  let userId;
  const country = getCountry();

  try {
    const self = await getSelf();
    userId = self.id;
  } catch {
    userId = null;
  }

  const streams = await db.stream.findMany({
    where: {
      AND: [
        {
          NOT: {
            blockedCountries: {
              has: country || ""
            }
          }
        },
        userId ? {
          user: {
            NOT: {
              blocking: {
                some: {
                  blockedId: userId
                }
              }
            }
          }
        } : {},
        term ? {
          OR: [
            {
              name: {
                contains: term,
                mode: 'insensitive'
              }
            },
            {
              user: {
                username: {
                  contains: term,
                  mode: 'insensitive'
                }
              }
            }
          ]
        } : {}
      ]
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          imageUrl: true,
          isVerifiedModel: true
        }
      }
    },
    orderBy: [
      { isLive: "desc" },
      { updatedAt: "desc" }
    ]
  });

  return streams;
};
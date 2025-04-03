import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await db.user.findUnique({
      where: { externalUserId: params.userId },
      include: {
        stream: {
          select: {
            id: true,
            isChatEnabled: true,
            isChatDelayed: true,
            isChatFollowersOnly: true,
            thumbnailUrl: true,
            name: true,
            isLive: true,
            pinnedMessage: true, // ✅ Mensaje fijo en el chat
            streamTopic: true,   // ✅ Nuevo campo para el tema del stream
          },
        },
      },
    });

    if (!user || !user.stream) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    return NextResponse.json(user.stream);
  } catch (error) {
    console.error("[STREAM_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

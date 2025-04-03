import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const user = await db.user.findFirst({
      where: { externalUserId: userId },
      include: { stream: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.stream) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    // Create token with extended permissions
    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
      {
        identity: user.id,
        name: user.username,
        ttl: 24 * 60 * 60, // 24 hours
      }
    );

    // Add all necessary permissions
    token.addGrant({
      room: user.id,
      roomCreate: true,
      roomJoin: true,
      roomAdmin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    });

    const jwt = await token.toJwt();
    return NextResponse.json({ token: jwt });
  } catch (error) {
    console.error("[STREAM_TOKEN_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
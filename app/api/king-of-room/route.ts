import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { username },
      select: {
        stream: {
          select: {
            id: true,
            kingOfRoom: {
              select: {
                userId: true,
                totalTokens: true
              }
            }
          }
        }
      }
    });

    if (!user?.stream) {
      return NextResponse.json(
        { error: "Stream not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      kingUserId: user.stream.kingOfRoom?.userId,
      totalTokens: user.stream.kingOfRoom?.totalTokens
    });

  } catch (error) {
    console.error("[KING_OF_ROOM_GET]", error);
    return NextResponse.json(
      { error: "Internal Error" },
      { status: 500 }
    );
  }
}
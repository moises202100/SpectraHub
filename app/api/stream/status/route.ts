import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isLive } = await req.json();

    const user = await db.user.findUnique({
      where: { externalUserId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const stream = await db.stream.update({
      where: { userId: user.id },
      data: { isLive },
    });

    return NextResponse.json(stream);
  } catch (error) {
    console.error("[STREAM_STATUS_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { externalUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { name, targetAmount, theme, color } = await req.json();

    if (!name || !targetAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const goal = await db.tokenGoal.create({
      data: {
        name,
        targetAmount,
        theme: theme || "default",
        color: color || "#1010f2",
        userId: user.id,
      },
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error("[GOALS_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    // Try to get authenticated user first
    const { userId } = auth();
    let targetUser = null;

    if (userId) {
      // If authenticated, check if we're in the dashboard
      const url = new URL(req.headers.get("referer") || "");
      const isDashboard = url.pathname.includes("/u/");
      
      if (isDashboard) {
        // For dashboard view, get goals for the authenticated user
        targetUser = await db.user.findUnique({
          where: { externalUserId: userId },
        });
      }
    }

    // If not authenticated or not in dashboard, get user from URL
    if (!targetUser) {
      const url = new URL(req.headers.get("referer") || "");
      const pathParts = url.pathname.split("/");
      const username = pathParts[1]; // Gets username from /:username or /u/:username

      if (!username) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
      }

      targetUser = await db.user.findFirst({
        where: {
          username: username.startsWith("u/") ? username.substring(2) : username,
        },
      });
    }

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get active goals for the user
    const goals = await db.tokenGoal.findMany({
      where: {
        userId: targetUser.id,
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(goals);
  } catch (error) {
    console.error("[GOALS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { externalUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { goalId, currentAmount, isCompleted, isActive } = await req.json();

    if (!goalId) {
      return NextResponse.json({ error: "Goal ID required" }, { status: 400 });
    }

    const goal = await db.tokenGoal.findUnique({
      where: { id: goalId },
    });

    if (!goal || goal.userId !== user.id) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const updatedGoal = await db.tokenGoal.update({
      where: { id: goalId },
      data: {
        currentAmount: currentAmount !== undefined ? currentAmount : goal.currentAmount,
        isCompleted: isCompleted !== undefined ? isCompleted : goal.isCompleted,
        isActive: isActive !== undefined ? isActive : goal.isActive,
      },
    });

    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error("[GOALS_PATCH]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
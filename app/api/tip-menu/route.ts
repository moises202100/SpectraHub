import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import {db}  from "@/lib/db";

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

    const { name, description, tokens } = await req.json();

    if (!name || !tokens || tokens < 1) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const tipMenuItem = await db.tipMenuItem.create({
      data: {
        name,
        description,
        tokens,
        userId: user.id,
      },
    });

    return NextResponse.json(tipMenuItem);
  } catch (error) {
    console.error("[TIP_MENU_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const tipMenuItems = await db.tipMenuItem.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tipMenuItems);
  } catch (error) {
    console.error("[TIP_MENU_GET]", error);
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

    const { id, name, description, tokens, isActive } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 });
    }

    const tipMenuItem = await db.tipMenuItem.findUnique({
      where: { id },
    });

    if (!tipMenuItem || tipMenuItem.userId !== user.id) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const updatedItem = await db.tipMenuItem.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        tokens: tokens !== undefined ? tokens : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("[TIP_MENU_PATCH]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("id");

    if (!itemId) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 });
    }

    const tipMenuItem = await db.tipMenuItem.findUnique({
      where: { id: itemId },
    });

    if (!tipMenuItem || tipMenuItem.userId !== user.id) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    await db.tipMenuItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[TIP_MENU_DELETE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
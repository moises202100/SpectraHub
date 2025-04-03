import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, recipientId } = await req.json();

    if (!amount || amount <= 0 || !recipientId) {
      return NextResponse.json(
        { error: "Invalid amount or recipient" },
        { status: 400 }
      );
    }

    const sender = await db.user.findUnique({
      where: { externalUserId: userId },
      select: { id: true, tokens: true }
    });

    if (!sender) {
      return NextResponse.json(
        { error: "Sender not found" },
        { status: 404 }
      );
    }

    if (sender.tokens < amount) {
      return NextResponse.json(
        { error: "Insufficient tokens" },
        { status: 400 }
      );
    }

    const recipient = await db.user.findUnique({
      where: { id: recipientId },
      include: {
        stream: {
          include: {
            kingOfRoom: true
          }
        }
      }
    });

    if (!recipient || !recipient.stream) {
      return NextResponse.json(
        { error: "Recipient or stream not found" },
        { status: 404 }
      );
    }

    const streamId = recipient.stream.id;
    const kingTokensRequired = recipient.stream.kingTokens || 100;
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const result = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update sender's balance
      const updatedSender = await tx.user.update({
        where: { id: sender.id },
        data: { tokens: { decrement: amount } },
        select: { tokens: true }
      });

      // Update recipient's balance
      const updatedRecipient = await tx.user.update({
        where: { id: recipient.id },
        data: { tokens: { increment: amount } },
        select: { tokens: true }
      });

      // Get current king's total tokens
      const currentKing = await tx.kingOfRoom.findUnique({
        where: { streamId },
        select: { userId: true, totalTokens: true, createdAt: true }
      });

      // Calculate sender's total tokens for this stream
      const senderTotalTokens = await tx.tip.aggregate({
        where: {
          streamId,
          senderId: sender.id,
          createdAt: {
            gte: twentyFourHoursAgo
          }
        },
        _sum: {
          amount: true
        }
      });

      const senderNewTotal = (senderTotalTokens._sum.amount || 0) + amount;

      // Record the tip
      await tx.tip.create({
        data: {
          amount,
          streamId,
          senderId: sender.id,
          recipientId: recipient.id
        }
      });

      // Check if sender should become the new king
      if (senderNewTotal >= kingTokensRequired && 
          (!currentKing || 
           senderNewTotal > currentKing.totalTokens || 
           currentKing.createdAt < twentyFourHoursAgo)) {
        
        // Update or create king of room
        await tx.kingOfRoom.upsert({
          where: { streamId },
          create: {
            streamId,
            userId: sender.id,
            totalTokens: senderNewTotal,
            createdAt: now
          },
          update: {
            userId: sender.id,
            totalTokens: senderNewTotal,
            createdAt: now
          }
        });
      }

      return { updatedSender, updatedRecipient };
    });

    return NextResponse.json({
      success: true,
      newBalance: result.updatedSender.tokens,
      recipientBalance: result.updatedRecipient.tokens
    });

  } catch (error) {
    console.error("[TIPS_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
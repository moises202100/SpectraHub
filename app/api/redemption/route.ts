import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";

// Token to USD conversion rate (100 tokens = $8 USD)
const TOKEN_TO_USD_RATE = 8; // Changed to 8 to represent $8 per 100 tokens
const MINIMUM_REDEMPTION = 100; // Minimum 100 tokens ($8 USD)

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { paypalEmail, tokensToRedeem } = body;

    if (!paypalEmail || !tokensToRedeem) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate minimum redemption amount
    if (tokensToRedeem < MINIMUM_REDEMPTION) {
      return NextResponse.json(
        { error: `Minimum redemption amount is ${MINIMUM_REDEMPTION} tokens` },
        { status: 400 }
      );
    }

    // Get user and verify token balance
    const user = await db.user.findUnique({
      where: { externalUserId: userId },
      select: { id: true, tokens: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.tokens < tokensToRedeem) {
      return NextResponse.json(
        { error: "Insufficient tokens" },
        { status: 400 }
      );
    }

    // Calculate USD amount (tokensToRedeem / 100 * 8)
    const usdAmount = (tokensToRedeem / 100) * TOKEN_TO_USD_RATE;

    // Get PayPal access token
    const paypalAuth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
    const tokenResponse = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${paypalAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
    });

    const { access_token } = await tokenResponse.json();

    // Create PayPal payout
    const payoutResponse = await fetch('https://api-m.sandbox.paypal.com/v1/payments/payouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender_batch_header: {
          sender_batch_id: `Batch_${Date.now()}`,
          email_subject: "You have a payout!",
          email_message: "You have received a payout from your token redemption"
        },
        items: [{
          recipient_type: "EMAIL",
          amount: {
            value: usdAmount.toString(),
            currency: "USD"
          },
          receiver: paypalEmail,
          note: "Token redemption payout",
          sender_item_id: `Payout_${Date.now()}`
        }]
      })
    });

    const payoutData = await payoutResponse.json();

    if (!payoutResponse.ok) {
      throw new Error(payoutData.message || "PayPal payout failed");
    }

    // Update user's token balance
    await db.user.update({
      where: { id: user.id },
      data: {
        tokens: {
          decrement: tokensToRedeem
        }
      }
    });

    // Create redemption record
    await db.redemption.create({
      data: {
        userId: user.id,
        tokensRedeemed: tokensToRedeem,
        usdAmount,
        paypalEmail,
        status: "COMPLETED"
      }
    });

    return NextResponse.json({
      success: true,
      message: "Redemption successful",
      newBalance: user.tokens - tokensToRedeem,
      payoutBatchId: payoutData.batch_header.payout_batch_id
    });

  } catch (error) {
    console.error("[REDEMPTION_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { externalUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get request data
    const body = await req.json();
    const { fullName, birthDate, idFrontImage, idBackImage, selfieImage } = body;

    // Validate required fields
    if (!fullName || !birthDate || !idFrontImage || !idBackImage || !selfieImage) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
      // Update user verification status immediately
      const updatedUser = await db.user.update({
        where: { id: user.id },
        data: { 
          isVerifiedModel: true 
        },
      });

      // Create verification record
      const verification = await db.modelVerification.create({
        data: {
          userId: user.id,
          fullName,
          birthDate: new Date(birthDate),
          idFrontImage,
          idBackImage,
          selfieImage,
          status: "APPROVED", // Set status to APPROVED immediately
        },
      });

      return NextResponse.json({ 
        success: true,
        message: "Verification approved",
        isVerified: true,
        user: updatedUser
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

    } catch (error) {
      console.error("Transaction error:", error);
      return NextResponse.json({ 
        error: "Failed to update verification status" 
      }, { status: 500 });
    }

  } catch (error) {
    console.error("[MODEL_VERIFICATION_ERROR]", error);
    return NextResponse.json({ 
      error: "Internal Server Error" 
    }, { status: 500 });
  }
}
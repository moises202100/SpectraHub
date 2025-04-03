import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { userId, tokens } = await req.json();

        if (!userId || !tokens) {
            return NextResponse.json(
                { error: "Datos incompletos" },
                { status: 400 }
            );
        }

        const user = await db.user.update({
            where: { externalUserId: userId },
            data: {
                tokens: {
                    increment: tokens
                }
            }
        });

        return NextResponse.json({ 
            success: true, 
            user 
        });
    } catch (error) {
        console.error("Error al actualizar tokens:", error);
        return NextResponse.json(
            { error: "Error al actualizar tokens" },
            { status: 500 }
        );
    }
}
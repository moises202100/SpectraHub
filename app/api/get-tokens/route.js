import { prisma } from "@/lib/db";

export async function GET(req) {
    const userId = "user-id-aqui"; // Reemplaza con el id del usuario actual

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { tokens: true },
        });

        if (!user) {
            return new Response(
                JSON.stringify({ error: "Usuario no encontrado" }),
                { status: 404 }
            );
        }

        return new Response(JSON.stringify({ tokens: user.tokens }), {
            status: 200,
        });
    } catch (error) {
        console.error("Error al obtener tokens:", error);
        return new Response(
            JSON.stringify({ error: "Error al obtener tokens" }),
            { status: 500 }
        );
    }
}
import { auth } from "@clerk/nextjs";
import { clerkClient } from "@clerk/nextjs/server";

export async function getCurrentUser() {
  const { userId } = auth(); // Obtiene el ID del usuario autenticado
  if (!userId) return null;

  try {
    const user = await clerkClient.users.getUser(userId); // Obtiene detalles del usuario
    return user;
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
    return null;
  }
}

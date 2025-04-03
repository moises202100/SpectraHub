import NextAuth, { AuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github"; // Cambia a tu proveedor si no usas GitHub

export const authOptions: AuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET, // Define esto en tu .env
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

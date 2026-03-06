import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import type { Role } from "@tmi/contracts";
import { getAdapter } from "./auth/adapter";

export const authOptions: NextAuthOptions = {
  // Use lazy adapter resolver which returns undefined during build/collection
  // but constructs the real PrismaAdapter at runtime when envs are present.
  adapter: getAdapter(),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as { role?: Role };
        token.role = u.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
};

export default authOptions;

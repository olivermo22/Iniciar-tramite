import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const fallbackUsername = process.env.OPERATOR_DEMO_USERNAME || "ADMIN";
const fallbackPassword = process.env.OPERATOR_DEMO_PASSWORD || "1793";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-change-me",
  session: { strategy: "jwt" },
  pages: { signIn: "/operators/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials.password) return null;

        try {
          const user = await prisma.operator.findFirst({ where: { username: credentials.username, isActive: true } });
          if (user) {
            const valid = await bcrypt.compare(credentials.password, user.passwordHash);
            if (!valid) return null;
            return { id: user.id, name: user.name, email: user.username, role: user.role } as any;
          }
        } catch {
          // fallback provisional login when DB/migrations are not ready
        }

        if (credentials.username === fallbackUsername && credentials.password === fallbackPassword) {
          return { id: "fallback-operator", name: "Operador provisional", email: fallbackUsername, role: "admin" } as any;
        }

        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = token.role;
      return session;
    }
  }
};

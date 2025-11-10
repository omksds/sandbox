import NextAuth, { getServerSession, type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Agent",
      credentials: {
        email: { label: "メールアドレス", type: "email" },
        password: { label: "パスワード", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // データベースからユーザーを検索
        const agent = await prisma.agent.findUnique({
          where: { email: credentials.email as string },
        });

        if (!agent || !agent.passwordHash) {
          return null;
        }

        // パスワードを検証
        const isValidPassword = await compare(
          credentials.password as string,
          agent.passwordHash,
        );

        if (!isValidPassword) {
          return null;
        }

        // ユーザー情報を返す
        return {
          id: agent.id,
          email: agent.email,
          name: agent.name,
          role: agent.role,
          organization: agent.organization,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
  secret: process.env.AUTH_SECRET ?? "dev-auth-secret",
  callbacks: {
    async jwt({ token, user }) {
      // 初回サインイン時にユーザー情報をトークンに追加
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organization = user.organization;
      }
      return token;
    },
    async session({ session, token }) {
      // セッションにユーザー情報を追加
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.organization = token.organization as string;
      }
      return session;
    },
  },
};

export async function auth() {
  return getServerSession(authOptions);
}

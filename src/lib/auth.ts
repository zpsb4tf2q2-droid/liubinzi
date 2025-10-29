import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcrypt";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import prisma from "@/lib/prisma";

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: {
        label: "Email",
        type: "email",
        placeholder: "you@example.com",
      },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials.password) {
        throw new Error("Please enter both an email and password.");
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      });

      if (!user?.hashedPassword) {
        throw new Error("Invalid email or password");
      }

      const isValidPassword = await bcrypt.compare(
        credentials.password,
        user.hashedPassword
      );

      if (!isValidPassword) {
        throw new Error("Invalid email or password");
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
    },
  }),
];

const googleFlag = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH;
const googleProviderEnabled =
  (googleFlag === "true" || googleFlag === "1") &&
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET;

if (googleProviderEnabled) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  providers,
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, user, token }) {
      if (session.user) {
        const tokenId = typeof token?.id === "string" ? token.id : undefined;
        const tokenSub = typeof token?.sub === "string" ? token.sub : undefined;
        const tokenEmail = typeof token?.email === "string" ? token.email : undefined;
        const tokenName = typeof token?.name === "string" ? token.name : undefined;
        const tokenImage = typeof token?.picture === "string" ? token.picture : undefined;

        session.user.id =
          user?.id ?? tokenSub ?? tokenId ?? (session.user.id ?? "");
        session.user.email =
          user?.email ?? tokenEmail ?? session.user.email ?? null;
        session.user.name =
          user?.name ?? tokenName ?? session.user.name ?? null;
        session.user.image =
          user?.image ?? tokenImage ?? session.user.image ?? null;
      }

      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }

      return token;
    },
  },
};

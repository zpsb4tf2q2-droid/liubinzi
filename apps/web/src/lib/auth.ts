import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GitHubProvider from "next-auth/providers/github";
import nodemailer from "nodemailer";
import prisma from "@repo/db";
import { env, serverEnv } from "@/src/env/server";
import { pushMagicLink } from "@/src/lib/magic-link-store";

const transport = nodemailer.createTransport({
  streamTransport: true,
  newline: "unix",
  buffer: true,
});

const providers = [
  EmailProvider({
    from: serverEnv.EMAIL_FROM,
    maxAge: 60 * 15, // 15 minutes
    async sendVerificationRequest({ identifier, url, expires, provider }) {
      pushMagicLink({ identifier, url, expires });

      const result = await transport.sendMail({
        to: identifier,
        from: provider.from ?? serverEnv.EMAIL_FROM,
        subject: `Sign in to ${env.NEXT_PUBLIC_APP_NAME}`,
        text: `Sign in to ${env.NEXT_PUBLIC_APP_NAME} using this link: ${url}`,
        html: `<p>Click the button below to sign in to <strong>${env.NEXT_PUBLIC_APP_NAME}</strong>.</p><p><a href="${url}">Sign in</a></p>`,
      });

      if (serverEnv.NODE_ENV !== "production") {
        console.info(`[auth] Magic link for ${identifier}: ${url} (${result.messageId ?? "dev"})`);
      }
    },
  }),
  GitHubProvider({
    clientId: serverEnv.GITHUB_ID ?? "github-client-id",
    clientSecret: serverEnv.GITHUB_SECRET ?? "github-client-secret",
  }),
];

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: serverEnv.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-out",
  },
  providers,
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user = session.user ?? {};
        session.user.id = token.sub;
      }
      if (token.email) {
        session.user = session.user ?? {};
        session.user.email = token.email as string;
      }
      if (token.name) {
        session.user = session.user ?? {};
        session.user.name = token.name as string;
      }
      if (token.picture) {
        session.user = session.user ?? {};
        session.user.image = token.picture as string;
      }
      if (typeof token.accessToken === "string") {
        (session as Record<string, unknown>).accessToken = token.accessToken;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
};

export const getServerAuthSession = () => getServerSession(authOptions);

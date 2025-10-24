import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { env } from "@/src/env/server";
import { AppProviders } from "@/src/providers/session-provider";
import type { ReactNode } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: env.NEXT_PUBLIC_APP_NAME,
  description: "Secure access to your dashboard with passwordless authentication.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-950 text-slate-100`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

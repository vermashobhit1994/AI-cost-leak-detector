import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Cost Leak Detector — Free AI Spend Audit",
    template: "%s | Cost Leak Detector",
  },
  description:
    "Instant audit of your AI tool spend. Find overspend on Cursor, Copilot, Claude, ChatGPT, and more.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    siteName: "Cost Leak Detector",
    title: "Free AI Spend Audit for Startups",
    description:
      "See where you're overspending on AI tools — and how much you could save monthly.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Spend Audit",
    description: "Mint for AI tool spend — instant audit, no login required.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="gradient-hero min-h-screen">{children}</div>
      </body>
    </html>
  );
}

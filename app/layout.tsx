import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aethelgard Protocol — Autonomous Parimutuel Clearinghouse",
  description:
    "Decentralized prediction markets and live-web consensus oracle on GenLayer Intelligent Contracts with O(1) pull-payment claim clearing.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-obsidian-950 text-slate-100 antialiased selection:bg-gold-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}

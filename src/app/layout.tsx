import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Insigra Reports | Marketing Analytics Platform",
  description: "Secure, multi-tenant marketing campaign performance analytics with PostgreSQL Row-Level Security.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-purple-100 selection:text-purple-900">
        {children}
      </body>
    </html>
  );
}

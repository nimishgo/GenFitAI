import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GenFit AI",
  description: "AI-powered personalized fitness plans from your Strava data",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        {children}
      </body>
    </html>
  );
}

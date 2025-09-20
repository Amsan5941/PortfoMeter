import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
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
  title: "PortfoMeter - AI-Powered Portfolio Review & Stock Insights",
  description: "Upload your portfolio screenshot and get AI-powered insights. Search stocks, track market movers, and make informed investment decisions.",
  keywords: ["portfolio", "stocks", "investment", "AI", "analysis", "market", "trading"],
  authors: [{ name: "PortfoMeter Team" }],
  openGraph: {
    title: "PortfoMeter - AI-Powered Portfolio Review",
    description: "Get AI-powered insights on your stock portfolio",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
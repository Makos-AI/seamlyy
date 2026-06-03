import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "Seamlyy | Open Art Marketplace",
  description: "Buy, sell, and unlock premium art with Open Payments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${outfit.variable} antialiased min-h-screen flex flex-col`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

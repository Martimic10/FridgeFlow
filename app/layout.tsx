import type { Metadata } from "next";
import { Fredoka, Space_Mono } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "FridgeFlow — Real meals from what you already have",
  description: "Turn your random fridge ingredients into actual meals. No more staring at the fridge. No more takeout regret.",
  icons: {
    icon: "/fridgeflow-logo.png",
    apple: "/fridgeflow-logo.png",
  },
  openGraph: {
    title: "FridgeFlow — Real meals from what you already have",
    description: "Turn your random fridge ingredients into actual meals.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fredoka.variable} ${spaceMono.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}

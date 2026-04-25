import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Echo Server Lookup | Minecraft Server Analytics",
  description: "Platform analytics server Minecraft dengan performa tinggi. Cek status, players, dan informasi network server Minecraft secara real-time.",
  keywords: ["minecraft", "server", "lookup", "analytics", "echo", "status"],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48 64x64' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} min-h-full flex flex-col bg-[#050505] text-white antialiased`}>{children}</body>
    </html>
  );
}

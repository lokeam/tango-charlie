import { ThemeProvider } from '@/context/theme-provider';

// Components
import { NavBar } from '@/components/navbar';
import { Footer } from '@/components/footer';

// Fonts
import { Geist, Geist_Mono } from "next/font/google";

// Types
import type { Metadata } from "next";

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
  title: "Hotel Charlie",
  description: "An exercise in charting and visualization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}>
        <ThemeProvider attribute="class" defaultTheme="system">
          <main className="h-full bg-black antialiased">
            <NavBar />
            {children}
            <Footer />
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}

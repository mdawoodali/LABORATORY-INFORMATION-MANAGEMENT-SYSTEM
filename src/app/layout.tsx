import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

import SecurityShield from "@/components/SecurityShield";

export const metadata: Metadata = {
  title: "Laboratory Information Management System",
  description: "LIMS Desktop & Web Application",
  icons: {
    icon: '/icon.jpg?v=4',
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col select-none">
        <Toaster position="top-center" />
        <SecurityShield />
        {children}
      </body>
    </html>
  );
}

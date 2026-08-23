import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Updater from "@/components/Updater";

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
import FolderInit from "@/components/FolderInit";

export const metadata: Metadata = {
  title: "Laboratory Information Management System",
  description: "LIMS Desktop & Web Application",
  icons: {
    icon: '/icon.jpg?v=4',
  },
};

import Providers from "@/components/Providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col select-none">
        <Providers>
          <Updater />
          <FolderInit />
          <Toaster position="bottom-right" />
          <SecurityShield />
          {children}
        </Providers>
      </body>
    </html>
  );
}

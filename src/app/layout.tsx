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
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#002f6c',
};

export const metadata: Metadata = {
  title: "Precision Quality Services LIMS",
  description: "Official Laboratory Information Management System - Desktop & Mobile Application",
  manifest: '/manifest.json',
  applicationName: 'PQS LIMS',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PQS LIMS',
  },
  icons: {
    icon: '/pqs-logo.png',
    apple: '/pqs-logo.png',
  },
};

import Providers from "@/components/Providers";
import GlobalSync from "@/components/GlobalSync";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import AdminAuthGuard from "@/components/auth/AdminAuthGuard";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col select-none overflow-x-hidden">
        <Providers>
          <AdminAuthProvider>
            <PWAInstallPrompt variant="banner" />
            <Updater />
            <GlobalSync />
            <FolderInit />
            <Toaster position="bottom-right" />
            <SecurityShield />
            <AdminAuthGuard>
              {children}
            </AdminAuthGuard>
          </AdminAuthProvider>
        </Providers>
      </body>
    </html>
  );
}

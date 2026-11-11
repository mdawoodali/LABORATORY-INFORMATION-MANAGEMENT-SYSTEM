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
  metadataBase: new URL('https://limsreportgenerator.vercel.app'),
  title: {
    default: "Precision Quality Services LIMS",
    template: "%s | Precision Quality Services LIMS",
  },
  description: "Official Laboratory Information Management System - ISO/IEC 17025 compliant report generation, electronic certificate verification, and invoice tracking.",
  manifest: '/manifest.json',
  applicationName: 'PQS LIMS',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Precision Quality Services LIMS',
    description: 'Official Laboratory Information Management System for standard-compliant test reports, invoicing, and electronic document verification.',
    url: 'https://limsreportgenerator.vercel.app',
    siteName: 'PQS LIMS',
    images: [
      {
        url: '/pqs-banner.png',
        width: 1200,
        height: 630,
        alt: 'Precision Quality Services LIMS',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Precision Quality Services LIMS',
    description: 'Official Laboratory Information Management System - Desktop & Mobile Application',
    images: ['/pqs-banner.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PQS LIMS',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/pqs-logo.png', type: 'image/png' },
    ],
    apple: '/pqs-logo.png',
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://limsreportgenerator.vercel.app/#organization",
      "name": "Precision Quality Services",
      "url": "https://limsreportgenerator.vercel.app",
      "logo": "https://limsreportgenerator.vercel.app/pqs-logo.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "precisionqualityserviceslabs@gmail.com",
        "contactType": "laboratory service"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://limsreportgenerator.vercel.app/#website",
      "url": "https://limsreportgenerator.vercel.app",
      "name": "Precision Quality Services LIMS",
      "description": "Official Laboratory Information Management System - ISO/IEC 17025 compliant",
      "publisher": {
        "@id": "https://limsreportgenerator.vercel.app/#organization"
      }
    }
  ]
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col select-none overflow-x-hidden">
        {/* Skip to Content Accessible Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[#2b579a] focus:text-white focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2b579a] text-xs font-bold"
        >
          Skip to main content
        </a>

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

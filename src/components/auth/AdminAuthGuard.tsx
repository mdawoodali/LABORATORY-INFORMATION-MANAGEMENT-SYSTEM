"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import AdminLoginForm from './AdminLoginForm';
import PQSLogoImage from '@/components/report/PQSLogoImage';

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAdminAuth();

  // Public routes (Clients scanning QR codes / public verification)
  const isPublicRoute = 
    pathname?.startsWith('/verify') || 
    pathname?.startsWith('/icon') || 
    pathname === '/manifest.json' ||
    pathname === '/_not-found';

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans text-gray-700 p-4">
        <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center p-3 shadow-md mb-4 animate-pulse">
          <PQSLogoImage className="w-full h-full object-contain" />
        </div>
        <div className="w-6 h-6 border-2 border-[#2b579a] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-gray-500 font-medium tracking-wide">
          Precision Quality Services LIMS • Initializing...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLoginForm />;
  }

  return <>{children}</>;
}

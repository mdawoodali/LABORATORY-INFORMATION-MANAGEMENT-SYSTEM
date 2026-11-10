"use client";

import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, Smartphone, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PWAInstallPrompt({ variant = 'banner' }: { variant?: 'banner' | 'button' }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Check if running inside desktop Tauri binary
    const isTauri = typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);
    if (isTauri) {
      setIsStandalone(true);
      return;
    }

    // 2. Check if already running as installed PWA (standalone)
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };
    checkStandalone();

    // 3. Check if iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(isIOSDevice);

    // 4. Capture beforeinstallprompt for Android / Chrome / Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (isStandalone || isDismissed || isInstalled) {
    return null;
  }

  // Only show if browser supports prompt OR if on iOS device
  const canShow = deferredPrompt !== null || isIOS;
  if (!canShow && variant === 'banner') {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('Install prompt failed:', err);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  if (variant === 'button') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 shrink-0"
          title="Install Phone App"
        >
          <Smartphone size={14} />
          <span>Install App</span>
        </button>

        {showIOSModal && (
          <IOSInstallModal onClose={() => setShowIOSModal(false)} />
        )}
      </>
    );
  }

  return (
    <>
      <div className="w-full bg-gradient-to-r from-[#002f6c] to-[#1e4e8c] text-white px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs z-40 border-b border-blue-900/30">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 rounded-lg bg-white p-1 shrink-0 flex items-center justify-center shadow-xs">
            <img src="/pqs-logo.png" alt="PQS Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-wide truncate">Install PQS LIMS on Phone</span>
            <span className="text-blue-100 text-[11px] truncate">Fast offline access & full-screen editing</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="bg-white text-[#002f6c] hover:bg-blue-50 font-bold px-3 py-1.5 rounded-md shadow-sm transition-all active:scale-95 flex items-center gap-1 text-xs"
          >
            <Download size={13} />
            <span>Install</span>
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-blue-200 hover:text-white p-1 transition-colors"
            title="Dismiss"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {showIOSModal && (
        <IOSInstallModal onClose={() => setShowIOSModal(false)} />
      )}
    </>
  );
}

function IOSInstallModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 z-[99999] animate-fadeIn">
      <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl text-slate-800 space-y-4 border border-slate-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 p-1.5 border border-blue-100 flex items-center justify-center">
              <img src="/pqs-logo.png" alt="PQS" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Install PQS LIMS</h3>
              <p className="text-xs text-slate-500">For iPhone & iPad</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 text-xs bg-slate-50 rounded-xl p-3.5 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0 text-xs">
              1
            </div>
            <p className="text-slate-700">
              Tap the <span className="font-semibold text-blue-600 inline-flex items-center gap-1"><Share size={12} /> Share</span> button in the Safari bottom toolbar.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0 text-xs">
              2
            </div>
            <p className="text-slate-700">
              Scroll down and select <span className="font-semibold text-slate-900 inline-flex items-center gap-1"><PlusSquare size={12} /> Add to Home Screen</span>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0 text-xs">
              3
            </div>
            <p className="text-slate-700">
              Tap <span className="font-bold text-blue-600">Add</span> in the top right corner.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-[#002f6c] hover:bg-[#002554] text-white font-bold py-2.5 rounded-xl transition-all text-xs"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}

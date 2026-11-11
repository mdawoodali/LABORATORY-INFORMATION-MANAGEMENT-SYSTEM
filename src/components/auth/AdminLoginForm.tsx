"use client";

import React, { useState } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import PQSLogoImage from '@/components/report/PQSLogoImage';
import PQSWordmark from '@/components/report/PQSWordmark';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminLoginForm() {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter the administrator email.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter the administrator password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success('Welcome back, Administrator!', { id: 'admin-login' });
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please check your credentials.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-[#071328] to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 font-sans select-text">
      
      {/* Background Decorative Rings */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center p-3 shadow-inner mb-4">
            <PQSLogoImage className="w-full h-full object-contain" />
          </div>
          
          <PQSWordmark className="h-6 object-contain mb-2 brightness-110" />
          
          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-950/70 border border-blue-800/50 rounded-full text-[11px] font-semibold text-blue-300 uppercase tracking-widest mt-1">
            <ShieldCheck size={13} className="text-blue-400" />
            <span>Restricted Lab Access</span>
          </div>
          
          <p className="text-xs text-slate-400 mt-3 leading-relaxed max-w-xs">
            Sign in with authorized credentials to manage laboratory reports, invoices, and audit records.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-3.5 bg-red-950/80 border border-red-800/80 rounded-2xl flex items-start gap-3 text-red-200 text-xs animate-shake">
            <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email Field */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
              <Mail size={13} className="text-blue-400" />
              <span>Admin Email</span>
            </label>
            <div className="relative">
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="precisionqualityserviceslabs@gmail.com"
                required
                autoComplete="email"
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
              <Lock size={13} className="text-blue-400" />
              <span>Admin Password</span>
            </label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Checkbox */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
              <input 
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
              />
              <span>Remember this browser</span>
            </label>
            <span className="text-[11px] text-slate-500">Persistent Session</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-sm mt-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to LIMS</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 pt-4 border-t border-slate-800 text-center">
          <p className="text-[10.5px] text-slate-500 tracking-wide font-medium">
            Precision Quality Services • ISO/IEC 17025 Compliant System
          </p>
        </div>

      </div>

    </div>
  );
}

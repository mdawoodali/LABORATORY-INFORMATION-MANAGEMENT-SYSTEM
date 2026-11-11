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
    <div className="flex-1 min-h-[calc(100vh-60px)] w-full bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200/60 flex flex-col justify-center items-center py-4 px-4 font-sans select-text text-gray-900 relative">
      
      {/* Background Subtle Gradient Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[600px] h-[600px] rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-indigo-100/40 blur-3xl" />
      </div>

      <div className="w-full max-w-md bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-200/60 relative z-10">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-gray-200 flex items-center justify-center p-2.5 shadow-sm mb-3">
            <PQSLogoImage className="w-full h-full object-contain" />
          </div>
          
          <PQSWordmark className="h-5 sm:h-6 object-contain mb-1.5" />
          
          <div className="flex items-center gap-1.5 px-3 py-0.5 bg-blue-50 border border-blue-200 rounded-full text-[10.5px] font-semibold text-blue-900 uppercase tracking-widest mt-1">
            <ShieldCheck size={12} className="text-[#2b579a]" />
            <span>Restricted Lab Access</span>
          </div>
          
          <p className="text-xs text-gray-500 mt-2 leading-relaxed max-w-xs">
            Sign in with authorized credentials to manage laboratory reports, invoices, and audit records.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs animate-shake">
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email Field */}
          <div>
            <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5 block flex items-center gap-1.5">
              <Mail size={12} className="text-[#2b579a]" />
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
                className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2b579a]/20 focus:border-[#2b579a] transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5 block flex items-center gap-1.5">
              <Lock size={12} className="text-[#2b579a]" />
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
                className="w-full bg-slate-50 border border-gray-300 rounded-xl px-3.5 py-2.5 pr-11 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2b579a]/20 focus:border-[#2b579a] transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Remember Checkbox */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer text-gray-700 select-none font-medium text-[11.5px]">
              <input 
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-gray-300 text-[#2b579a] focus:ring-[#2b579a]"
              />
              <span>Remember this browser</span>
            </label>
            <span className="text-[11px] text-gray-400">Persistent Session</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2b579a] hover:bg-[#1e4178] active:scale-[0.99] disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-900/10 transition-all flex items-center justify-center gap-2 text-sm mt-1 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to LIMS</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 tracking-wide font-medium">
            Precision Quality Services • ISO/IEC 17025 Compliant System
          </p>
        </div>

      </div>

    </div>
  );
}

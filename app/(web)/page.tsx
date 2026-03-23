"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; 

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter(); 

  const handleLogin = () => {
    router.push("/dashboard"); 
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center relative font-sans">
      
      <div className="absolute top-8 left-8 flex items-center gap-4 cursor-pointer">
        <div className="relative w-14 h-14 overflow-hidden rounded-xl shadow-lg border border-slate-700/50 bg-[#1E293B]">
          <img 
            src="/alerto_logo1.png" 
            alt="Alerto Logo" 
            className="w-full h-full object-contain p-1"
            onError={(e) => {
               e.currentTarget.src = "/alerto_logo1.jpg.jpg";
            }}
          />
        </div>
        <span className="text-white font-bold text-3xl tracking-wide">Alerto</span>
      </div>

      <div className="bg-[#1E293B] p-8 rounded-2xl w-full max-w-[420px] shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-1.5">Admin Login</h1>
        <p className="text-slate-400 text-sm mb-8">
          Please enter your credentials to manage the platform.
        </p>

        <form className="space-y-5">
          
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
              <input
                type="email"
                placeholder="admin@commutewake.com"
                className="w-full bg-[#0F172A] text-white border border-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg py-2.5 pl-10 pr-4 outline-none transition-all placeholder:text-slate-600 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <a href="#" className="text-xs text-blue-500 hover:text-blue-400 transition-colors">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full bg-[#0F172A] text-white border border-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg py-2.5 pl-10 pr-10 outline-none transition-all placeholder:text-slate-600 text-sm tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                    <line x1="2" x2="22" y1="2" y2="22"></line>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          
          <button
            type="button"
            onClick={handleLogin}
            className="w-full mt-2 bg-[#3B82F6] hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
          >
            Sign In to Dashboard
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
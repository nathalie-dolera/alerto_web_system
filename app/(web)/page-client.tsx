"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminLoginSchema, type AdminLoginInput } from "@/lib/validationSchemas";
import { FormErrors, FieldError } from "@/components/FormErrors";

export default function AdminLoginClient() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
    mode: "onBlur",
  });

  const email = watch("email");
  const password = watch("password");

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleTogglePassword = () => {
    if (showPassword) {
      setShowPassword(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    } else {
      setShowPassword(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setShowPassword(false);
      }, 4000);
    }
  };

  const handleLogin = async (data: AdminLoginInput) => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420"
        },
        body: JSON.stringify(data),
      });

      let responseData;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        responseData = await res.json();
      } else {
        const text = await res.text();
        console.error("Non-JSON response received:", text);
        throw new Error("Server returned an unexpected response. Check console for details.");
      }

      if (res.ok) {
        router.push("/dashboard"); 
      } else {
        setError(responseData.error || "Login failed");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center relative font-sans">
      
      <div className="absolute top-8 left-8 flex items-center gap-4 cursor-pointer">
        <div className="relative w-14 h-14 overflow-hidden rounded-xl shadow-lg border border-slate-700/50 bg-[#1E293B]">
          <Image 
            src="/alerto_logo1.png" 
            alt="Alerto Logo" 
            width={56}
            height={56}
            className="w-full h-full object-contain p-1"
          />
        </div>
        <span className="text-white font-bold text-3xl tracking-wide">Alerto</span>
      </div>

      <div className="bg-[#1E293B] p-8 rounded-2xl w-full max-w-105 shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-1.5">Admin Login</h1>
        <p className="text-slate-400 text-sm mb-6">
          Please enter your credentials to manage the platform.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit(handleLogin)}>
          {Object.keys(errors).length > 0 && (
            <FormErrors errors={Object.keys(errors).length > 0 ? undefined : undefined} />
          )}
          
          <div className="space-y-2">
            <label htmlFor="admin-email" className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
              <input
                id="admin-email"
                type="email"
                placeholder="admin@commutewake.com"
                {...register("email")}
                className={`w-full bg-[#0F172A] text-white border ${
                  errors.email ? "border-red-500" : "border-transparent"
                } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg py-2.5 pl-10 pr-4 outline-none transition-all placeholder:text-slate-600 text-sm`}
              />
            </div>
            {errors.email && <FieldError error={errors.email.message} />}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="admin-password" id="label-admin-password" className="text-xs font-semibold text-slate-300">Password</label>
              <Link href="/forgot-password" title="Forgot password?" className="text-xs text-blue-500 hover:text-blue-400 transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                className={`w-full bg-[#0F172A] text-white border ${
                  errors.password ? "border-red-500" : "border-transparent"
                } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg py-2.5 pl-10 pr-10 outline-none transition-all placeholder:text-slate-600 text-sm tracking-widest`}
              />
              <button
                type="button"
                onClick={handleTogglePassword}
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
            {errors.password && <FieldError error={errors.password.message} />}
          </div>

          
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 bg-[#3B82F6] hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm ${loading ? "opacity-75 cursor-not-allowed" : ""}`}
          >
            {loading ? "Signing In..." : "Sign In to Dashboard"}
            {!loading && (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

import { Metadata } from "next";
"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm, watch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validationSchemas";
import { FieldError, SuccessMessage } from "@/components/FormErrors";

export const metadata: Metadata = {
  title: "Alerto | Reset Password",
  description: "Reset your admin account password",
};

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch: watchForm,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const password = watchForm("password");
  
  // Password strength rules for display
  const rules = {
    length: password?.length >= 8,
    upper: /[A-Z]/.test(password || ""),
    lower: /[a-z]/.test(password || ""),
    number: /\d/.test(password || ""),
    symbol: /[!@#$%^&*(),.?":{}|<>\-_]/.test(password || ""),
  };

  const onSubmit = async (data: ResetPasswordInput) => {
    setError("");
    setMessage("");

    if (!token) {
      setError("This reset link is missing its token.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/mobile/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setError(responseData.error || "Unable to reset password.");
        return;
      }

      setMessage("Success! Your password has been updated. You can now log in to the Alerto app.");
    } catch {
      setError("Unable to reset password due to a connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-12 text-[#1E293B] font-sans">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-blue-600 to-blue-400"></div>
        
        <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-blue-600 font-bold">
          Alerto Reset Password
        </p>
        <h1 className="text-3xl font-extrabold text-black tracking-tight">
          New Password
        </h1>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed font-medium">
          Create a secure password for your Alerto account.
        </p>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 animate-in fade-in slide-in-from-top-1">
            {error}
          </div>
        ) : null}

        {message ? (
          <SuccessMessage message={message} />
        ) : null}

        {!message && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="new-password" id="label-new-password" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">New Password</label>
                <input
                  id="new-password"
                  type="password"
                  placeholder="Create a strong password"
                  autoFocus
                  {...register("password")}
                  className={`w-full rounded-2xl border ${
                    errors.password ? "border-red-300" : "border-slate-200"
                  } bg-slate-50 px-4 py-4 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-300`}
                />
                {errors.password && <FieldError error={errors.password.message} />}
              </div>

              <div>
                <label htmlFor="confirm-password" id="label-confirm-password" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  placeholder="Repeat new password"
                  {...register("confirmPassword")}
                  className={`w-full rounded-2xl border ${
                    errors.confirmPassword ? "border-red-300" : "border-slate-200"
                  } bg-slate-50 px-4 py-4 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-300`}
                />
                {errors.confirmPassword && <FieldError error={errors.confirmPassword.message} />}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100 space-y-4">
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-2">
                Security Checklist
              </p>
              
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Rule label="8+ Characters" met={rules.length} />
                <Rule label="Uppercase Letter" met={rules.upper} />
                <Rule label="Lowercase Letter" met={rules.lower} />
                <Rule label="A Number" met={rules.number} />
                <Rule label="Special Symbol" met={rules.symbol} />
                <Rule label="Passwords Match" met={!errors.confirmPassword} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 px-4 py-4 text-sm font-bold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              {loading ? "Updating Account..." : "Reset Password"}
            </button>
          </form>
        )}

        {message && (
            <div className="mt-8">
                <button 
                    onClick={() => globalThis.window.location.href = "alertofrontendmobile://"}
                    className="w-full rounded-2xl bg-slate-900 px-4 py-4 text-sm font-bold text-white transition-all hover:bg-slate-800 text-center shadow-lg hover:shadow-slate-500/20"
                >
                    Open Alerto App
                </button>
            </div>
        )}

      </div>
    </main>
  );
}

function Rule({ label, met }: Readonly<{ label: string; met: boolean }>) {
  return (
    <div className={`flex items-center space-x-3 transition-all duration-300 ${met ? "opacity-100" : "opacity-40"}`}>
      <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${met ? "bg-emerald-500 border-emerald-500 shadow-md shadow-emerald-500/20" : "bg-transparent border-slate-300"}`}>
        {met && (
            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
        )}
      </div>
      <span className={`text-[11px] font-bold tracking-tight ${met ? "text-slate-700" : "text-slate-400"}`}>{label}</span>
    </div>
  );
}

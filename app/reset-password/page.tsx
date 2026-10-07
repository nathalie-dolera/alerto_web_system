"use client";
import { FieldError } from "@/components/FormErrors";
import { useMemo, useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validationSchemas";
import { useSearchParams } from "next/navigation";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function Rule({ label, met }: Readonly<{ label: string; met: boolean }>) {
  return (
    <div className={`flex items-center space-x-3 transition-all duration-300 ${met ? "opacity-100" : "opacity-40"}`}>
      <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${met ? "bg-emerald-500 border-emerald-500 shadow-md shadow-emerald-500/20" : "bg-transparent border-slate-600"}`}>
        {met && <CheckIcon />}
      </div>
      <span className={`text-[11px] font-bold tracking-tight ${met ? "text-slate-200" : "text-slate-500"}`}>{label}</span>
    </div>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch: watchForm,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const password = watchForm("password") || "";
  const confirmPassword = watchForm("confirmPassword") || "";

  const rules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[!@#$%^&*(),.?":{}|<>\-_]/.test(password),
    match: password.length > 0 && confirmPassword.length > 0 && password === confirmPassword,
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

  const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border ${hasError ? "border-red-500" : "border-slate-700"} bg-slate-800 px-4 py-4 pr-12 text-sm text-slate-100 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-600`;

  return (
    <main className="min-h-screen bg-[#0b1120] px-4 py-12 text-slate-100 font-sans flex items-center justify-center">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-700/60 bg-[#111827] p-8 shadow-2xl shadow-black/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-400" />

        <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-blue-400 font-bold">
          Alerto Reset Password
        </p>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          New Password
        </h1>
        <p className="mt-3 text-sm text-slate-400 leading-relaxed">
          Create a secure password for your Alerto account.
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-red-700/50 bg-red-900/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-6 rounded-xl border border-emerald-700/50 bg-emerald-900/20 px-4 py-3 text-sm text-emerald-400 font-medium">
            {message}
          </div>
        )}

        {!message && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="new-password" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    autoFocus
                    {...register("password")}
                    className={inputClass(!!errors.password)}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
                {errors.password && <FieldError error={errors.password.message} />}
              </div>

              <div>
                <label htmlFor="confirm-password" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat new password"
                    {...register("confirmPassword")}
                    className={inputClass(!!errors.confirmPassword)}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
                {errors.confirmPassword && <FieldError error={errors.confirmPassword.message} />}
              </div>
            </div>

            <div className="rounded-xl bg-slate-800/60 p-5 border border-slate-700/50 space-y-4">
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 mb-2">
                Security Checklist
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Rule label="8+ Characters" met={rules.length} />
                <Rule label="Uppercase Letter" met={rules.upper} />
                <Rule label="Lowercase Letter" met={rules.lower} />
                <Rule label="A Number" met={rules.number} />
                <Rule label="Special Symbol" met={rules.symbol} />
                <Rule label="Passwords Match" met={rules.match} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-4 text-sm font-bold text-white transition-all hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}

        {message && (
          <div className="mt-6">
            <button
              onClick={() => { globalThis.window.location.href = "alertofrontendmobile://"; }}
              className="w-full rounded-xl bg-slate-700 px-4 py-4 text-sm font-bold text-white transition-all hover:bg-slate-600 text-center"
            >
              Open Alerto App
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#0b1120] px-4 py-12 flex items-center justify-center">
          <p className="text-slate-400 font-bold text-sm">Loading...</p>
        </main>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

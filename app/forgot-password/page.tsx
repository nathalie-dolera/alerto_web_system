"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validationSchemas";
import { FieldError, SuccessMessage } from "@/components/FormErrors";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/mobile/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        setError(responseData.error || "Unable to send reset link.");
        return;
      }

      setMessage(responseData.message || "Check your email for your password reset link.");
    } catch {
      setError("Unable to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B1120] px-4 py-12 text-white">
      <div className="mx-auto max-w-md rounded-2xl border border-slate-800 bg-[#111827] p-8 shadow-2xl">
        <p className="mb-2 text-sm uppercase tracking-[0.25em] text-blue-400">Alerto</p>
        <h1 className="text-3xl font-bold">Forgot password</h1>
        <p className="mt-3 text-sm text-slate-400">
          Enter the email used in the mobile app. We&apos;ll send a reset link through SendGrid.
        </p>

        {error ? (
          <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {message ? (
          <SuccessMessage message={message} />
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">Email</label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register("email")}
              className={`w-full rounded-lg border ${
                errors.email ? "border-red-500" : "border-slate-700"
              } bg-[#0F172A] px-4 py-3 text-sm outline-none transition focus:border-blue-500`}
            />
            {errors.email && <FieldError error={errors.email.message} />}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Sending link..." : "Send reset link"}
          </button>
        </form>

        <div className="mt-6 text-sm text-slate-400">
          <Link className="text-blue-400 hover:text-blue-300" href="/">
            Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}

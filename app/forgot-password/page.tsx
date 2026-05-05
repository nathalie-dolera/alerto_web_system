"use client";

import Link from "next/link";
import React, { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const errors: { email?: string } = {};
    if (!email.trim()) {
      errors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    } else {
      const domain = email.split('@')[1]?.toLowerCase();
      const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'commutewake.com'];
      if (!allowedDomains.includes(domain)) {
        errors.email = "Incorrect domain format";
      }
    }
    
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/mobile/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to send reset link.");
        return;
      }

      setMessage(data.message || "Check your email for your password reset link.");
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
          <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex items-start gap-2">
            <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>{error}</span>
          </div>
        ) : null}

        {message ? (
          <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 flex items-start gap-2">
            <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span>{message}</span>
          </div>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (fieldErrors.email) setFieldErrors({});
              }}
              className={`w-full rounded-lg border ${fieldErrors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-blue-500'} bg-[#0F172A] px-4 py-3 text-sm outline-none transition`}
              placeholder="name@example.com"
            />
            {fieldErrors.email && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-70 mt-4"
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

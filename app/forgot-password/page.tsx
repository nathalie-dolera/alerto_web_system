"use client";

import Link from "next/link";
import React, { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
    <main className="min-h-screen bg-slate-50 dark:bg-[#0B1120] px-4 py-12 text-slate-900 dark:text-white transition-colors duration-200">
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-8 shadow-2xl transition-colors duration-200">
        <p className="mb-2 text-sm uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">Alerto</p>
        <h1 className="text-3xl font-bold">Forgot password</h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Enter the email used in the mobile app. We&apos;ll send a reset link through SendGrid.
        </p>

        {error ? (
          <div className="mt-6 rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-200">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="mt-6 rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-200">
            {message}
          </div>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0F172A] px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition focus:border-blue-500"
              placeholder="name@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 dark:bg-blue-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 dark:hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Sending link..." : "Send reset link"}
          </button>
        </form>

        <div className="mt-6 text-sm text-slate-500 dark:text-slate-400">
          <Link className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300" href="/">
            Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}

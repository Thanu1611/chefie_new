"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { getLoginBannerMessage } from "@/lib/auth/messages";
import { isSafeGuestRedirect } from "@/lib/auth/protected-paths";
import { getSupabaseClient } from "@/lib/supabase/client";
import { hasSupabaseAuthConfig } from "@/lib/supabase/env";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const reason = searchParams.get("reason");

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const bannerMessage = getLoginBannerMessage(reason, redirect);
  const guestHref = isSafeGuestRedirect(redirect) ? redirect! : "/";
  const afterLoginPath = isSafeGuestRedirect(redirect) ? redirect! : "/";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!hasSupabaseAuthConfig()) {
      setError(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.",
      );
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setError("Could not connect to authentication.");
      return;
    }

    setSubmitting(true);

    try {
      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (signUpError) throw signUpError;
        setInfo(
          "Account created. Check your email to confirm, or sign in if confirmation is disabled.",
        );
        setMode("login");
        setSubmitting(false);
        return;
      }

      router.push(afterLoginPath);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Authentication failed.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-8 sm:py-12">
      <Image
        src="/logo.png"
        alt="Chefie"
        width={96}
        height={96}
        className="mb-6 rounded-2xl object-contain"
        priority
      />

      <h1 className="text-center text-2xl font-bold text-foreground">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-2 text-center text-sm text-muted">
        Sign in to use voice guidance, AI recipes, meal planning, and your library.
      </p>

      {bannerMessage && (
        <p
          className="mt-4 w-full rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-center text-sm font-medium text-brand-dark"
          role="status"
        >
          {bannerMessage}
        </p>
      )}

      {error && (
        <p
          className="mt-4 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}

      {info && (
        <p
          className="mt-4 w-full rounded-xl border border-brand/20 bg-warm-50 px-4 py-3 text-center text-sm text-foreground"
          role="status"
        >
          {info}
        </p>
      )}

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="mt-6 w-full space-y-4"
      >
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full py-3 disabled:opacity-60"
        >
          {submitting
            ? "Please wait…"
            : mode === "login"
              ? "Log in"
              : "Sign up"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
                setInfo(null);
              }}
              className="font-semibold text-brand hover:text-brand-dark hover:underline"
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
                setInfo(null);
              }}
              className="font-semibold text-brand hover:text-brand-dark hover:underline"
            >
              Log in
            </button>
          </>
        )}
      </p>

      <Link
        href={guestHref}
        className="btn-secondary mt-6 w-full justify-center py-3"
      >
        Continue as guest
      </Link>
    </div>
  );
}

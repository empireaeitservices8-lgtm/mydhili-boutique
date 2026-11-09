"use client";

import { FormEvent, useEffect, useState, KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const REMEMBER_EMAIL_KEY = "mydhili_admin_remembered_email";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  // Initialize year
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    try {
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Monitor Caps Lock state for better user password entry experience
  function handleKeyEvent(event: KeyboardEvent<HTMLInputElement>) {
    if (typeof event.getModifierState === "function") {
      setCapsLockOn(event.getModifierState("CapsLock"));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError("Please provide both your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Invalid email or password. Please verify your credentials.");
        return;
      }

      // Handle remember email preference
      try {
        if (rememberEmail) {
          localStorage.setItem(REMEMBER_EMAIL_KEY, cleanEmail);
        } else {
          localStorage.removeItem(REMEMBER_EMAIL_KEY);
        }
      } catch {
        // Ignore localStorage write errors
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Unable to connect to the authentication server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col justify-between bg-[#FAF7F2] text-[#380712] px-4 py-6 sm:px-6 sm:py-8">
      {/* Top Header Navigation */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-90">
          <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-[#E7DECE] bg-white p-1 shadow-sm">
            <Image
              src="/logo/logo.png"
              alt="Mydhili Logo"
              width={30}
              height={30}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <span className="font-serif text-base font-bold tracking-tight text-[#380712]">
              Mydhili
            </span>
            <span className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9A6B35]">
              Store Administration
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs font-medium text-stone-600 transition hover:text-[#380712]"
        >
          Return to storefront ↗
        </Link>
      </header>

      {/* Centered Luxury Card */}
      <div className="my-auto flex w-full justify-center py-8">
        <div className="w-full max-w-[420px] rounded-2xl border border-[#E7DECE] bg-white p-7 shadow-[0_4px_24px_rgba(56,7,18,0.04)] sm:p-9">
          {/* Card Header */}
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-[#E7DECE] bg-[#FAF7F2] p-2">
              <Image
                src="/logo/logo.png"
                alt="Mydhili Emblem"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>

            <h1 className="font-serif text-2xl font-bold tracking-tight text-[#380712] sm:text-[26px]">
              Boutique Sign In
            </h1>
            <p className="mt-1.5 text-xs text-stone-500">
              Enter your credentials to access store operations, products, and analytics.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-semibold text-stone-700"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="off"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                className="h-11 w-full rounded-lg border border-stone-200 bg-white px-3.5 text-sm text-[#380712] outline-none transition placeholder:text-stone-400 focus:border-[#380712] focus:ring-1 focus:ring-[#380712]"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-stone-700"
                >
                  Password
                </label>
                {capsLockOn && (
                  <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                    Caps Lock is ON
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyEvent}
                  onKeyUp={handleKeyEvent}
                  placeholder="Enter your password"
                  className="h-11 w-full rounded-lg border border-stone-200 bg-white pl-3.5 pr-10 text-sm text-[#380712] outline-none transition placeholder:text-stone-400 focus:border-[#380712] focus:ring-1 focus:ring-[#380712]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 transition hover:text-stone-700"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Email Toggle */}
            <div className="flex items-center gap-2 pt-0.5">
              <input
                id="remember"
                type="checkbox"
                checked={rememberEmail}
                onChange={(e) => setRememberEmail(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-[#380712] accent-[#380712] focus:ring-0 focus:ring-offset-0"
              />
              <label
                htmlFor="remember"
                className="cursor-pointer text-xs font-normal text-stone-600 select-none"
              >
                Remember email on this browser
              </label>
            </div>

            {/* Error Feedback */}
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs font-medium text-rose-800"
              >
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#380712] px-4 text-sm font-semibold text-[#FAF7F2] shadow-sm transition hover:bg-[#27040B] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-[#D4AF69]" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In to Boutique</span>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 border-t border-stone-100 pt-4 text-center">
            <p className="text-[11px] text-stone-400">
              Protected boutique management portal · Session authenticated
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mx-auto w-full max-w-5xl text-center text-xs text-stone-400">
        © {currentYear ?? ""} Mydhili Collections. All rights reserved.
      </footer>
    </main>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    console.log("LOGIN BUTTON SUBMITTED");

    setLoading(true);
    setError("");

    try {
      console.log("SENDING LOGIN REQUEST");

      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      console.log(
        "LOGIN RESPONSE STATUS:",
        response.status
      );

      const data = await response.json();

      console.log(
        "LOGIN RESPONSE DATA:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.error || "Login failed"
        );
      }

      /*
       * ============================================================
       * ADMIN
       * ============================================================
       */

      if (data.user?.role === "admin") {
        router.push("/admin");
        return;
      }

      /*
       * ============================================================
       * MEDICAL TEAM
       * ============================================================
       */

      if (
        data.user?.role === "medical_team"
      ) {
        router.push("/team");
        return;
      }

      /*
       * ============================================================
       * PATIENT
       * ============================================================
       */

      if (data.user?.role === "patient") {
        router.push("/patient");
        return;
      }

      /*
       * ============================================================
       * UNKNOWN ROLE
       * ============================================================
       */

      throw new Error(
        "Unknown user role"
      );
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8">

      {/* ============================================================
          BACK TO HOMEPAGE
      ============================================================ */}

      <div className="mx-auto max-w-md">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m15 18-6-6 6-6"
            />
          </svg>

          Back to homepage
        </button>
      </div>

      {/* ============================================================
          LOGIN CONTAINER
      ============================================================ */}

      <div className="flex min-h-[calc(100vh-100px)] items-center justify-center">

        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          {/* ========================================================
              HEADER
          ======================================================== */}

          <div className="mb-6">

            <button
              type="button"
              onClick={() => router.push("/")}
              className="group text-left"
            >
              <div className="text-lg font-bold text-slate-900 transition group-hover:text-blue-600">
                PTalk
              </div>
            </button>

            <h1 className="mt-6 text-2xl font-bold text-slate-900">
              Sign in
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to your PTalk account.
            </p>

          </div>

          {/* ========================================================
              LOGIN FORM
          ======================================================== */}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* Email */}

            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-700"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                placeholder="Email"
                autoComplete="email"
              />
            </div>

            {/* Password */}

            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                placeholder="Password"
                autoComplete="current-password"
              />
            </div>

            {/* Error */}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Sign in */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>

          </form>

          {/* ========================================================
              REGISTER
          ======================================================== */}

          <div className="mt-6 border-t border-slate-200 pt-6">

            <p className="text-center text-sm text-slate-500">
              Don't have a PTalk account?
            </p>

            <button
              type="button"
              onClick={() =>
                router.push("/register")
              }
              className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-900 transition hover:bg-slate-50"
            >
              Create account
            </button>

          </div>

        </div>

      </div>

    </main>
  );
}
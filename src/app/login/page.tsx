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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <div className="text-lg font-bold text-slate-900">
            PTalk
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            Sign in
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Sign in to your PTalk account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="text-sm font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="Email"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Password
            </label>

            <input
              type="password"
              required
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="Password"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

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
    </main>
  );
}
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters long."
      );
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            date_of_birth: dateOfBirth,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Registration failed"
        );
      }

      if (data.user?.role === "patient") {
        router.push("/patient");
      } else {
        router.push("/login");
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-6">
          <div className="text-lg font-bold text-slate-900">
            PTalk
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            Create account
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Create your PTalk patient account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <div>
            <label className="text-sm font-medium text-slate-700">
              First name
            </label>

            <input
              type="text"
              value={firstName}
              onChange={(event) =>
                setFirstName(event.target.value)
              }
              required
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="First name"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Last name
            </label>

            <input
              type="text"
              value={lastName}
              onChange={(event) =>
                setLastName(event.target.value)
              }
              required
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="Last name"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Date of birth
            </label>

            <input
              type="date"
              value={dateOfBirth}
              onChange={(event) =>
                setDateOfBirth(event.target.value)
              }
              required
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
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
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              minLength={8}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Confirm password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              required
              minLength={8}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              placeholder="Repeat password"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Creating account..."
              : "Create account"}
          </button>

        </form>

        <div className="mt-6 border-t border-slate-200 pt-6 text-center">

          <p className="text-sm text-slate-500">
            Are you a medical team member?
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/register/medical")
            }
            className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-900 transition hover:bg-slate-50"
          >
            Register as medical team
          </button>

          <p className="mt-6 text-sm text-slate-500">
            Already have a PTalk account?
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/login")
            }
            className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-900 transition hover:bg-slate-50"
          >
            Back to sign in
          </button>

        </div>

      </div>
    </main>
  );
}
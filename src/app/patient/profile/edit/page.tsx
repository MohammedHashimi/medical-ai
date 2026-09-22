"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PatientBottomNav from "../../../../components/BottomNavigation";

type Patient = {
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
};

type ApiError = {
  error?: string;
  response?: string;
  status?: number;
  details?: string;
};

export default function EditProfilePage() {
  const [patient, setPatient] =
    useState<Patient | null>(null);

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [dateOfBirth, setDateOfBirth] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch(
          "/api/patient/me",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const text =
          await response.text();

        let data:
          | Patient
          | ApiError;

        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(
            `Invalid server response: ${text}`
          );
        }

        if (!response.ok) {
          const errorData =
            data as ApiError;

          console.error(
            "PROFILE LOAD FAILED:",
            response.status,
            errorData
          );

          throw new Error(
            errorData.response ||
              errorData.error ||
              "Failed to load profile"
          );
        }

        const profile =
          data as Patient;

        setPatient(profile);

        setFirstName(
          profile.first_name
        );

        setLastName(
          profile.last_name
        );

        setDateOfBirth(
          profile.date_of_birth.slice(
            0,
            10
          )
        );
      } catch (err) {
        console.error(
          "Profile loading error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!firstName.trim()) {
      setError(
        "Please enter your first name."
      );
      return;
    }

    if (!lastName.trim()) {
      setError(
        "Please enter your last name."
      );
      return;
    }

    if (!dateOfBirth) {
      setError(
        "Please enter your date of birth."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "/api/patient/me",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            first_name:
              firstName.trim(),

            last_name:
              lastName.trim(),

            date_of_birth:
              dateOfBirth,
          }),
        }
      );

      const text =
        await response.text();

      let data:
        | Patient
        | ApiError;

      try {
        data = JSON.parse(text);
      } catch {
        console.error(
          "PROFILE UPDATE INVALID RESPONSE:",
          response.status,
          text
        );

        throw new Error(
          `Invalid server response: ${text}`
        );
      }

      if (!response.ok) {
        const errorData =
          data as ApiError;

        console.error(
          "PROFILE UPDATE FAILED:",
          response.status,
          errorData
        );

        throw new Error(
          errorData.response ||
            errorData.error ||
            "Failed to update profile"
        );
      }

      const updatedPatient =
        data as Patient;

      setPatient(
        updatedPatient
      );

      setFirstName(
        updatedPatient.first_name
      );

      setLastName(
        updatedPatient.last_name
      );

      setDateOfBirth(
        updatedPatient.date_of_birth.slice(
          0,
          10
        )
      );

      setSuccess(
        "Your profile has been updated."
      );
    } catch (err) {
      console.error(
        "Profile update error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-8">
        <div className="mx-auto max-w-md">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Loading profile...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 pb-28 pt-8">
      <div className="mx-auto max-w-md">

        {/* ======================================================
            TOP NAVIGATION
        ====================================================== */}

        <header className="mb-6">
          <div className="flex items-center justify-between gap-3">

            <Link
              href="/patient/profile"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              ← Profile
            </Link>

            <Link
              href="/patient"
              className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Dashboard
            </Link>

          </div>

          <h1 className="mt-6 text-2xl font-semibold text-slate-900">
            Edit Profile
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Update your personal information.
          </p>
        </header>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ======================================================
            SUCCESS
        ====================================================== */}

        {success && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* ======================================================
            PROFILE FORM
        ====================================================== */}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-6 shadow-sm"
        >
          <div className="space-y-5">

            {/* First name */}

            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                First name
              </label>

              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(event) =>
                  setFirstName(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                autoComplete="given-name"
              />
            </div>

            {/* Last name */}

            <div>
              <label
                htmlFor="lastName"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Last name
              </label>

              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(event) =>
                  setLastName(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                autoComplete="family-name"
              />
            </div>

            {/* Date of birth */}

            <div>
              <label
                htmlFor="dateOfBirth"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Date of birth
              </label>

              <input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(event) =>
                  setDateOfBirth(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* Save */}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-slate-800 px-4 py-3 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>
        </form>

        {/* Patient ID */}

        {patient && (
          <p className="mt-4 text-center text-xs text-slate-400">
            Patient ID:{" "}
            {patient.patient_id}
          </p>
        )}
      </div>

      {/* ========================================================
          BOTTOM NAVIGATION
      ======================================================== */}
        <PatientBottomNav/>
      
    </main>
  );
}
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "../../../components/LogoutButton";
import PatientBottomNav from "../../../components/BottomNavigation";
type AuthUser = {
  id: string;
  role: "patient" | "medical_team";
  patient_id: string | null;
};

type Patient = {
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
};

export default async function PatientProfilePage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("ptalk_session");

  if (!session?.value) {
    redirect("/login");
  }

  /*
   * ============================================================
   * AUTHENTICATION
   * ============================================================
   */

  const authResponse = await fetch(
    "http://localhost:4000/api/auth/me",
    {
      headers: {
        Cookie: `ptalk_session=${session.value}`,
      },
      cache: "no-store",
    }
  );

  if (authResponse.status === 401) {
    redirect("/login");
  }

  if (!authResponse.ok) {
    throw new Error("Failed to authenticate");
  }

  const authData: { user: AuthUser } =
    await authResponse.json();

  const user = authData.user;

  if (user.role !== "patient") {
    throw new Error("Forbidden");
  }

  if (!user.patient_id) {
    throw new Error(
      "Patient account is not linked to a patient"
    );
  }

  /*
   * ============================================================
   * LOAD PATIENT
   * ============================================================
   */

  const patientResponse = await fetch(
    "http://localhost:4000/api/patient/me",
    {
      headers: {
        Cookie: `ptalk_session=${session.value}`,
      },
      cache: "no-store",
    }
  );

  if (patientResponse.status === 401) {
    redirect("/login");
  }

  if (patientResponse.status === 403) {
    throw new Error("Forbidden");
  }

  if (patientResponse.status === 404) {
    throw new Error("Patient not found");
  }

  if (!patientResponse.ok) {
    throw new Error("Failed to load patient");
  }

  const patient: Patient =
    await patientResponse.json();

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <main className="min-h-screen bg-slate-50 pb-24">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-4">

          <div className="flex items-center justify-between">

            <div>
              <div className="text-lg font-bold text-slate-900">
                PTalk
              </div>

              <div className="text-xs text-slate-400">
                Patient Portal
              </div>
            </div>

            <LogoutButton />

          </div>

        </div>
      </header>

      {/* Main */}
      <div className="mx-auto max-w-3xl px-5 py-8">

        {/* Page Header */}
        <section>
          <p className="text-sm text-slate-500">
            Account
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Profile
          </h1>

          <p className="mt-2 text-slate-500">
            Manage your personal information.
          </p>
        </section>

        {/* Profile Card */}
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          {/* Avatar */}
          <div className="flex items-center gap-4">

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-xl font-semibold text-white">
              {patient.first_name.charAt(0).toUpperCase()}
              {patient.last_name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {patient.first_name} {patient.last_name}
              </h2>

              <p className="text-sm text-slate-500">
                Patient
              </p>
            </div>

          </div>

          {/* Personal Information */}
          <div className="mt-8">

            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Personal information
            </h3>

            <div className="mt-4 divide-y divide-slate-100">

              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm text-slate-400">
                    First name
                  </p>

                  <p className="mt-1 font-medium text-slate-900">
                    {patient.first_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm text-slate-400">
                    Last name
                  </p>

                  <p className="mt-1 font-medium text-slate-900">
                    {patient.last_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm text-slate-400">
                    Date of birth
                  </p>

                  <p className="mt-1 font-medium text-slate-900">
                    {new Date(
                      patient.date_of_birth
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* Edit Profile */}
          <div className="mt-6 border-t border-slate-100 pt-6">

            <Link
              href="/patient/profile/edit"
              className="flex w-full items-center justify-between rounded-2xl bg-slate-800 px-5 py-4 text-white transition hover:bg-slate-700"
            >
              <div>
                <p className="font-medium">
                  Edit Profile
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Update your personal information
                </p>
              </div>

              <span className="text-xl">
                →
              </span>
            </Link>

          </div>

        </section>

        {/* Account Information */}
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Account
          </h3>

          <div className="mt-4">

            <div className="py-3">
              <p className="text-sm text-slate-400">
                Account type
              </p>

              <p className="mt-1 font-medium text-slate-900">
                Patient
              </p>
            </div>

          </div>

        </section>

        {/* Back */}
        <div className="mt-6">
          <Link
            href="/patient"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Back to dashboard
          </Link>
        </div>

      </div>

      {/* Bottom Navigation */}
<PatientBottomNav />

    </main>
  );
}
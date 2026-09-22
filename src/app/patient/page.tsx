import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AskPTalk from "./AskPTalk";
import Link from "next/link";
import LogoutButton from "../../components/LogoutButton";
import BottomNavigation from "@/components/BottomNavigation";
type Consultation = {
  consultation_id: string;
  patient_id: string;
  consultation_date: string;
  symptom_count: number;
};

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

export default async function PatientPage() {
  /*
   * ============================================================
   * AUTHENTICATION
   * ============================================================
   */

  const cookieStore = await cookies();
  const session = cookieStore.get("ptalk_session");

  if (!session?.value) {
    redirect("/login");
  }

  /*
   * Verify the current session.
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

  /*
   * Only patients can access this page.
   */
  if (user.role !== "patient") {
    throw new Error("Forbidden");
  }

  /*
   * Every patient account must be linked
   * to a patient_identity record.
   */
  if (!user.patient_id) {
    throw new Error(
      "Patient account is not linked to a patient"
    );
  }

  /*
   * ============================================================
   * LOAD PATIENT PROFILE
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
   * LOAD PATIENT HISTORY
   * ============================================================
   */

  const response = await fetch(
  "http://localhost:4000/api/patient/history",
  {
    headers: {
      Cookie: `ptalk_session=${session.value}`,
    },
    cache: "no-store",
  }
);

if (response.status === 401) {
  redirect("/login");
}

if (response.status === 403) {
  throw new Error("Forbidden");
}

if (!response.ok) {
  const errorText = await response.text();

  throw new Error(
    `Failed to load patient history (${response.status}): ${errorText}`
  );
}

const consultations: Consultation[] =
  await response.json();

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

            {/* Logo */}
            <div>
              <div className="text-lg font-bold text-slate-900">
                PTalk
              </div>

              <div className="text-xs text-slate-400">
                Patient Portal
              </div>
            </div>

            {/* Logout */}
            <LogoutButton />

          </div>

        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-5xl px-5 py-8">

        {/* Welcome */}
        <section>
          <p className="text-sm text-slate-500">
            Welcome back
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Hello, {patient.first_name}
          </h1>

          <p className="mt-2 text-slate-500">
            Your health information in one place.
          </p>
        </section>

        
{/* New Consultation */}
<section className="mt-6">
  <Link
    href="/patient/new-consultation"
    className="group flex w-full items-center justify-between rounded-2xl bg-slate-800 px-6 py-5 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow-md"
  >
    <div>
      <p className="text-sm font-medium text-slate-300">
        Start a new consultation
      </p>

      <p className="mt-1 text-xl font-semibold text-white">
        New Consultation
      </p>

      <p className="mt-1 text-sm text-slate-400">
        Talk to PTalk about your current symptoms
      </p>
    </div>

    <span
      className="ml-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xl text-slate-200 transition-all duration-200 group-hover:bg-slate-600 group-hover:translate-x-1"
      aria-hidden="true"
    >
      →
    </span>
  </Link>
</section>

        {/* PTalk AI */}
        <section className="mt-8 rounded-3xl bg-slate-900 p-6 text-white">
          <p className="text-sm text-slate-300">
            PTalk AI
          </p>

          <h2 className="mt-1 text-xl font-semibold">
            Ask about your health history
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            Ask questions about your previous
            consultations and reported symptoms.
          </p>

          <AskPTalk />

        </section>

        {/* Recent Consultations */}
        <section className="mt-10">

          <p className="text-sm text-slate-500">
            Your history
          </p>

          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Recent consultations
          </h2>

          <div className="mt-4 space-y-3">

            {consultations
              .slice(0, 3)
              .map((consultation) => {

                const date = new Date(
                  consultation.consultation_date
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });

                return (
                  <a
                    key={consultation.consultation_id}
                    href={`/patient/consultations/${consultation.consultation_id}`}
                    className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                  >

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-sm font-medium text-slate-900">
                          {date}
                        </p>

                        <h3 className="mt-1 font-semibold text-slate-800">
                          Clinical consultation
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {consultation.symptom_count}{" "}
                          reported symptoms
                        </p>

                      </div>

                      <span className="text-slate-400">
                        →
                      </span>

                    </div>

                  </a>
                );
              })}

          </div>

          {/* View All */}
          <a
            href="/patient/history"
            className="mt-4 block text-center text-sm font-medium text-slate-600"
          >
            View all consultations →
          </a>

        </section>

      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />

    </main>
  );
}
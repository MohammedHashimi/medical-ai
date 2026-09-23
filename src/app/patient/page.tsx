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
  symptom_count: number | string;
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

  const historyData = await response.json();

  /*
   * ============================================================
   * NORMALIZE HISTORY
   * ============================================================
   */

  let consultations: Consultation[] = [];

  if (Array.isArray(historyData)) {
    consultations = historyData;
  } else if (
    historyData &&
    Array.isArray(historyData.consultations)
  ) {
    consultations = historyData.consultations;
  }

  /*
   * ============================================================
   * FILTER EMPTY CONSULTATIONS
   * ============================================================
   *
   * Consultations with zero detected symptoms are not shown.
   */

  consultations = consultations.filter(
    (consultation) =>
      Number(consultation.symptom_count) > 0
  );

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <main className="min-h-screen bg-slate-50 pb-24">

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-4">

          <div className="flex items-center justify-between">

            {/* PTalk Logo / Home Link */}
            <Link
              href="/"
              className="group flex flex-col"
            >
              <div className="text-lg font-bold text-slate-900 transition group-hover:text-blue-600">
                PTalk
              </div>

              <div className="text-xs text-slate-400 transition group-hover:text-slate-500">
                Patient Portal
              </div>
            </Link>

            {/* Logout */}
            <LogoutButton />

          </div>

        </div>
      </header>


      {/* ====================================================== */}
      {/* MAIN CONTENT */}
      {/* ====================================================== */}

      <div className="mx-auto max-w-5xl px-5 py-8">

        {/* ==================================================== */}
        {/* WELCOME */}
        {/* ==================================================== */}

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


        {/* ==================================================== */}
        {/* NEW CONSULTATION */}
        {/* ==================================================== */}

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


            {/* Chevron */}
            <span
              className="ml-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-700 text-slate-200 transition-all duration-200 group-hover:translate-x-1 group-hover:bg-slate-600"
              aria-hidden="true"
            >

              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
              >

                <path
                  d="M9 5L15 12L9 19"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

              </svg>

            </span>

          </Link>

        </section>


        {/* ==================================================== */}
        {/* PTALK AI */}
        {/* ==================================================== */}

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


        {/* ==================================================== */}
        {/* RECENT CONSULTATIONS */}
        {/* ==================================================== */}

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
                  <Link
                    key={consultation.consultation_id}
                    href={`/patient/consultations/${consultation.consultation_id}`}
                    className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
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


                      {/* Chevron */}
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition-all duration-200 group-hover:translate-x-1 group-hover:bg-slate-50 group-hover:text-blue-600"
                        aria-hidden="true"
                      >

                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="h-5 w-5"
                        >

                          <path
                            d="M9 5L15 12L9 19"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                        </svg>

                      </span>

                    </div>

                  </Link>
                );
              })}

          </div>


          {/* ================================================== */}
          {/* VIEW ALL */}
          {/* ================================================== */}

          <Link
            href="/patient/history"
            className="group mt-5 flex items-center justify-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >

            <span>
              View all consultations
            </span>

            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
            >

              <path
                d="M9 5L15 12L9 19"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

            </svg>

          </Link>

        </section>

      </div>


      {/* ====================================================== */}
      {/* BOTTOM NAVIGATION */}
      {/* ====================================================== */}

      <BottomNavigation />

    </main>
  );
}
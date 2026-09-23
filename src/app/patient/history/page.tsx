import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import PatientBottomNav from "../../../components/BottomNavigation";

type Consultation = {
  consultation_id: string;
  patient_id: string;
  consultation_date: string;
  symptom_count: number | string;
};

type HistoryResponse =
  | Consultation[]
  | {
      consultations?: Consultation[];
    }
  | {
      error?: string;
    };

export default async function PatientHistoryPage() {
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
   * ============================================================
   * LOAD HISTORY
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
    const responseText = await response.text();

    console.error(
      "Patient history request failed:",
      response.status,
      responseText
    );

    throw new Error(
      "Failed to load consultation history"
    );
  }

  const data: HistoryResponse =
    await response.json();

  /*
   * ============================================================
   * NORMALIZE RESPONSE
   * ============================================================
   *
   * A patient with no consultations must still result
   * in an empty array.
   */

  let consultations: Consultation[] = [];

  if (Array.isArray(data)) {
    consultations = data;
  } else if (
    data &&
    "consultations" in data &&
    Array.isArray(data.consultations)
  ) {
    consultations = data.consultations;
  }

  /*
   * ============================================================
   * FILTER EMPTY CONSULTATIONS
   * ============================================================
   *
   * Consultations with zero detected symptoms are not shown
   * in the patient history.
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

      {/* ========================================================
          HEADER
      ======================================================== */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-4">

          <Link
            href="/"
            className="group flex flex-col"
          >
            <div className="text-lg font-bold text-slate-900 transition group-hover:text-blue-600">
              PTalk
            </div>

            <div className="text-xs text-slate-400 transition group-hover:text-slate-500">
              Patient History
            </div>
          </Link>

        </div>
      </header>

      {/* ========================================================
          MAIN
      ======================================================== */}

      <div className="mx-auto max-w-5xl px-5 py-8">

        {/* Back */}
        <Link
          href="/patient"
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

          Back to home
        </Link>

        {/* Page Header */}
        <section className="mt-6">

          <p className="text-sm text-slate-500">
            Your history
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Previous consultations
          </h1>

          <p className="mt-2 text-slate-500">
            View your previous consultations and
            health information.
          </p>

        </section>

        {/* ========================================================
            CONSULTATION LIST
        ======================================================== */}

        <section className="mt-8 space-y-3">

          {consultations.length === 0 ? (

            /*
             * ======================================================
             * EMPTY STATE
             * ======================================================
             */

            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-6 w-6 text-slate-400"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 6h8M8 10h8M8 14h5M6 3h9a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2V5a2 2 0 0 1 2-2Z"
                  />
                </svg>
              </div>

              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                No consultations yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                You have not completed any consultations
                yet. Start a new consultation to see your
                medical history here.
              </p>

              <Link
                href="/patient/new-consultation"
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Start a consultation
              </Link>

            </div>

          ) : (

            /*
             * ======================================================
             * CONSULTATIONS
             * ======================================================
             */

            consultations.map(
              (consultation) => {

                const date = new Date(
                  consultation.consultation_date
                ).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                );

                return (
                  <Link
                    key={
                      consultation.consultation_id
                    }
                    href={`/patient/consultations/${consultation.consultation_id}`}
                    className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                  >

                    <div className="flex items-center justify-between gap-4">

                      <div>

                        <p className="text-sm font-medium text-slate-900">
                          {date}
                        </p>

                        <h2 className="mt-1 font-semibold text-slate-800">
                          Clinical consultation
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          {
                            consultation.symptom_count
                          }{" "}
                          reported symptoms
                        </p>

                        <p className="mt-2 break-all font-mono text-xs text-slate-400">
                          {
                            consultation.consultation_id
                          }
                        </p>

                      </div>

                      {/* Chevron */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white transition group-hover:border-blue-200 group-hover:bg-blue-50">

                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="h-5 w-5 text-slate-500 transition group-hover:text-blue-600"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m9 18 6-6-6-6"
                          />
                        </svg>

                      </div>

                    </div>

                  </Link>
                );
              }
            )

          )}

        </section>

      </div>

      {/* ========================================================
          BOTTOM NAVIGATION
      ======================================================== */}

      <PatientBottomNav />

    </main>
  );
}
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import DateFilter from "../../components/Datefilter";

type Patient = {
  patient_id: string;
  first_name: string | null;
  last_name: string | null;
  consultation_count: string;
  last_consultation: string;
  emergency: string;
};

type TeamPageProps = {
  searchParams: Promise<{
    date?: string;
  }>;
};

export default async function TeamPage({
  searchParams,
}: TeamPageProps) {
  const cookieStore = await cookies();
  const session = cookieStore.get("ptalk_session");

  if (!session?.value) {
    redirect("/login");
  }

  /*
   * ============================================================
   * SELECTED DATE
   * ============================================================
   */

  const params = await searchParams;

  const selectedDate =
    params.date || "";

  /*
   * ============================================================
   * BACKEND URL
   * ============================================================
   */

  const backendUrl = selectedDate
    ? `http://localhost:4000/api/team/patients?date=${encodeURIComponent(
        selectedDate
      )}`
    : "http://localhost:4000/api/team/patients";

  /*
   * ============================================================
   * LOAD PATIENTS
   * ============================================================
   */

  const response = await fetch(
    backendUrl,
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
    const errorText =
      await response.text();

    console.error(
      "Backend patients error:",
      response.status,
      errorText
    );

    throw new Error(
      "Failed to load patients"
    );
  }

  const data =
    await response.json();

  /*
   * ============================================================
   * PATIENT DATA
   * ============================================================
   */

  const patients: Patient[] =
    Array.isArray(data)
      ? data
      : [data];

  const validPatients =
    patients.filter(
      (patient) =>
        patient &&
        patient.patient_id
    );

  /*
   * ============================================================
   * STATISTICS
   * ============================================================
   */

  const totalPatients =
    validPatients.length;

  const totalConsultations =
    validPatients.reduce(
      (total, patient) =>
        total +
        Number(
          patient.consultation_count || 0
        ),
      0
    );

  const totalEmergency =
    validPatients.reduce(
      (total, patient) =>
        total +
        Number(
          patient.emergency || 0
        ),
      0
    );

  /*
   * ============================================================
   * LATEST CONSULTATION
   * ============================================================
   */

  const latestConsultation =
    validPatients.length > 0
      ? new Date(
          validPatients[0]
            .last_consultation
        ).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        )
      : "No consultations";

  /*
   * ============================================================
   * DISPLAY DATE
   * ============================================================
   */

  let displayDate =
    "All consultations";

  if (selectedDate) {
    const parsedDate =
      new Date(
        `${selectedDate}T00:00:00`
      );

    if (
      !Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      displayDate =
        parsedDate.toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        );
    }
  }

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

        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">

          <div>

            <div className="text-lg font-bold text-slate-900">
              PTalk
            </div>

            <div className="text-xs text-slate-400">
              Medical Team
            </div>

          </div>

          <LogoutButton />

        </div>

      </header>

      {/* ====================================================== */}
      {/* MAIN CONTENT */}
      {/* ====================================================== */}

      <div className="mx-auto max-w-6xl px-5 py-8">

        {/* ==================================================== */}
        {/* HEADING */}
        {/* ==================================================== */}

        <section>

          <p className="text-sm text-slate-500">
            Medical Team
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>

          <p className="mt-2 text-slate-500">
            Overview of patients and clinical consultations.
          </p>

        </section>

        {/* ==================================================== */}
        {/* DATE FILTER */}
        {/* ==================================================== */}

        <DateFilter />

        {/* ==================================================== */}
        {/* SELECTED DATE */}
        {/* ==================================================== */}

        <div className="mt-4">

          <p className="text-sm text-slate-500">
            Showing data for
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {displayDate}
          </p>

        </div>

        {/* ==================================================== */}
        {/* STATISTICS */}
        {/* ==================================================== */}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* ================================================== */}
          {/* PATIENTS */}
          {/* ================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Patients
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalPatients}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Patients with consultations
            </p>

          </div>

          {/* ================================================== */}
          {/* CONSULTATIONS */}
          {/* ================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Consultations
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalConsultations}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Consultations on selected day
            </p>

          </div>

          {/* ================================================== */}
          {/* EMERGENCY */}
          {/* ================================================== */}

          <div
            className={`rounded-2xl border p-5 shadow-sm ${
              totalEmergency > 0
                ? "border-red-200 bg-red-50"
                : "border-slate-200 bg-white"
            }`}
          >

            <p
              className={`text-sm ${
                totalEmergency > 0
                  ? "text-red-600"
                  : "text-slate-500"
              }`}
            >
              Emergency cases
            </p>

            <p
              className={`mt-2 text-3xl font-bold ${
                totalEmergency > 0
                  ? "text-red-700"
                  : "text-slate-900"
              }`}
            >
              {totalEmergency}
            </p>

            <p
              className={`mt-1 text-xs ${
                totalEmergency > 0
                  ? "text-red-500"
                  : "text-slate-400"
              }`}
            >
              Emergency assessments
            </p>

          </div>

          {/* ================================================== */}
          {/* LATEST CONSULTATION */}
          {/* ================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Latest consultation
            </p>

            <p className="mt-2 text-lg font-bold text-slate-900">
              {latestConsultation}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Most recent record
            </p>

          </div>

        </section>

        {/* ==================================================== */}
        {/* PATIENTS */}
        {/* ==================================================== */}

        <section className="mt-10">

          <div className="mb-4 flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-500">
                Patient management
              </p>

              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                Patients
              </h2>

            </div>

            <span className="text-sm text-slate-500">

              {totalPatients} patient
              {totalPatients !== 1
                ? "s"
                : ""}

            </span>

          </div>

          <div className="space-y-3">

            {/* ================================================= */}
            {/* NO PATIENTS */}
            {/* ================================================= */}

            {validPatients.length === 0 ? (

              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">

                {selectedDate
                  ? "No consultations found for this date."
                  : "No patients found."}

              </div>

            ) : (

              /* ================================================= */
              /* PATIENT LIST */
              /* ================================================= */

              validPatients.map(
                (patient) => {

                  const consultationCount =
                    Number(
                      patient.consultation_count ||
                        0
                    );

                  const hasEmergency =
                    Number(
                      patient.emergency || 0
                    ) === 1;

                  const lastConsultation =
                    new Date(
                      patient.last_consultation
                    ).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    );

                  const fullName =
                    [
                      patient.first_name,
                      patient.last_name,
                    ]
                      .filter(Boolean)
                      .join(" ");

                  return (
                    <a
                      key={
                        patient.patient_id
                      }
                      href={`/team/patients/${patient.patient_id}`}
                      className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                    >

                      <div className="flex items-center justify-between gap-4">

                        <div className="min-w-0 flex-1">

                          {/* ================================= */}
                          {/* PATIENT LABEL */}
                          {/* ================================= */}

                          <div className="flex flex-wrap items-center gap-2">

                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                              Patient
                            </p>

                            {hasEmergency && (
                              <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                                Emergency
                              </span>
                            )}

                          </div>

                          {/* ================================= */}
                          {/* PATIENT NAME */}
                          {/* ================================= */}

                          <h3 className="mt-1 font-semibold text-slate-900">
                            {fullName ||
                              "Unknown patient"}
                          </h3>

                          {/* ================================= */}
                          {/* PATIENT ID */}
                          {/* ================================= */}

                          <p className="mt-1 break-all text-xs text-slate-400">
                            {patient.patient_id}
                          </p>

                          {/* ================================= */}
                          {/* PATIENT INFORMATION */}
                          {/* ================================= */}

                          <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-sm">

                            <div>

                              <p className="text-slate-400">
                                Consultations
                              </p>

                              <p className="mt-1 font-medium text-slate-700">
                                {consultationCount}
                              </p>

                            </div>

                            <div>

                              <p className="text-slate-400">
                                Last consultation
                              </p>

                              <p className="mt-1 font-medium text-slate-700">
                                {lastConsultation}
                              </p>

                            </div>

                          </div>

                        </div>

                        <span className="shrink-0 text-xl text-slate-400">
                          →
                        </span>

                      </div>

                    </a>
                  );
                }
              )

            )}

          </div>

        </section>

      </div>

      {/* ====================================================== */}
      {/* BOTTOM NAVIGATION */}
      {/* ====================================================== */}

      <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white">

        <div className="mx-auto flex max-w-6xl justify-around px-4 py-3">

          <a
            href="/team"
            className="flex flex-col items-center text-xs text-slate-900"
          >

            <span className="text-lg">
              ▤
            </span>

            Patients

          </a>

          <a
            href="/team/knowledge-graph"
            className="flex flex-col items-center text-xs text-slate-500"
          >

            <span className="text-lg">
              ◇
            </span>

            Knowledge Graph

          </a>

        </div>

      </nav>

    </main>
  );
}
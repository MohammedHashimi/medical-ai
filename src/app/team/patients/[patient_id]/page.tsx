import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type Consultation = {
  consultation_id: string;
  patient_id: string;
  consultation_date: string;
  symptom_count: string;
};

type PageProps = {
  params: Promise<{
    patient_id: string;
  }>;
};

export default async function PatientPage({
  params,
}: PageProps) {
  const { patient_id } = await params;

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

  const authData = await authResponse.json();
  const user = authData.user;

  /*
   * Only medical team can access
   * this page.
   */
  if (user.role !== "medical_team") {
    throw new Error("Forbidden");
  }

  /*
   * ============================================================
   * LOAD PATIENT HISTORY
   * ============================================================
   *
   * IMPORTANT:
   *
   * We do NOT use /api/patient/history here.
   *
   * That endpoint is intentionally restricted to the
   * currently authenticated patient.
   *
   * The medical team uses the dedicated team endpoint.
   */

  const response = await fetch(
    `http://localhost:4000/api/team/patients/${encodeURIComponent(
      patient_id
    )}/history`,
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

  if (response.status === 404) {
    throw new Error("Patient not found");
  }

  if (!response.ok) {
    const responseText = await response.text();

    console.error(
      "Medical team patient history request failed:",
      response.status,
      responseText
    );

    throw new Error(
      "Failed to load patient history"
    );
  }

  const data = await response.json();

  const consultations: Consultation[] =
    Array.isArray(data)
      ? data
      : [data];

  const validConsultations =
    consultations.filter(
      (consultation) =>
        consultation &&
        consultation.consultation_id
    );

  /*
   * ============================================================
   * LAST CONSULTATION
   * ============================================================
   */

  const lastConsultation =
    validConsultations.length > 0
      ? new Date(
          validConsultations[0].consultation_date
        ).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "No consultations";

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <main className="min-h-screen bg-slate-50 pb-24">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-4">

          <div className="text-lg font-bold text-slate-900">
            PTalk
          </div>

          <div className="text-xs text-slate-400">
            Medical Team
          </div>

        </div>
      </header>

      {/* Main */}
      <div className="mx-auto max-w-6xl px-5 py-8">

        {/* Back */}
        <a
          href="/team"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Back to patients
        </a>

        {/* Patient heading */}
        <section className="mt-6">

          <p className="text-sm text-slate-500">
            Patient
          </p>

          <h1 className="mt-1 break-all text-3xl font-bold tracking-tight text-slate-900">
            {patient_id}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Patient consultation history
          </p>

        </section>

        {/* Overview */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Consultations
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {validConsultations.length}
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Last consultation
            </p>

            <p className="mt-2 text-lg font-semibold text-slate-900">
              {lastConsultation}
            </p>

          </div>

        </section>

        {/* Consultation history */}
        <section className="mt-8">

          <div className="mb-3">

            <p className="text-sm text-slate-500">
              Medical history
            </p>

            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              Consultations
            </h2>

          </div>

          <div className="space-y-3">

            {validConsultations.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                No consultations found.
              </div>
            ) : (
              validConsultations.map(
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

                  const time = new Date(
                    consultation.consultation_date
                  ).toLocaleTimeString(
                    "en-US",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  );

                  return (
                    <a
                      key={
                        consultation.consultation_id
                      }
                      href={`/team/consultations/${consultation.consultation_id}`}
                      className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                    >

                      <div className="flex items-center justify-between gap-4">

                        <div>

                          <p className="text-sm font-medium text-slate-900">
                            {date} at {time}
                          </p>

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

      {/* Bottom navigation */}
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
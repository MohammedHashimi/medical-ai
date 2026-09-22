import { cookies } from "next/headers";
import { redirect } from "next/navigation";
type Symptom = {
  symptom_id: number;
  symptom: string;
  evidence: string;
  certainty: string;
};

type DiseaseMatch = {
  disease_id: number;
  disease: string;
  matching_symptoms: number;
  matched_symptoms: unknown;
};

type Consultation = {
  consultation_id: string;
  patient_id: string;
  consultation_date: string;
  language: string;
  transcript: string;
  chief_complaint: string | null;
  duration: string | null;
  severity: string | null;
  relevant_history: string | null;
  clinical_summary: string | null;
  emergency: boolean;
  urgency: string | null;
  red_flags: {
    symptom: string;
    reason: string;
  }[];
  emergency_reason: string | null;
  symptoms: Symptom[];
  disease_matches: DiseaseMatch[];
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ConsultationPage({
  params,
}: PageProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const session = cookieStore.get("ptalk_session");

  if (!session?.value) {
    redirect("/login");
  }

  const response = await fetch(
    `http://localhost:3000/api/patient/consultation/${encodeURIComponent(id)}`,
    {
      headers: {
        Cookie: `ptalk_session=${session.value}`,
      },
      cache: "no-store",
    }
  );

  const responseText = await response.text();

  if (response.status === 401) {
    redirect("/login");
  }

  if (response.status === 403) {
    throw new Error("Forbidden");
  }

  if (!response.ok) {
    console.error(
      "Patient consultation request failed:",
      response.status,
      responseText
    );

    throw new Error(
      `Failed to load consultation: ${response.status} ${responseText}`
    );
  }

  const consultation: Consultation =
    JSON.parse(responseText);
  const date = new Date(
    consultation.consultation_date
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const time = new Date(
    consultation.consultation_date
  ).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="min-h-screen bg-slate-50 pb-24">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-4">

          <div className="text-lg font-bold text-slate-900">
            PTalk
          </div>

          <div className="text-xs text-slate-400">
            Consultation
          </div>

        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-8">

        {/* Back */}
        <a
          href="/patient/history"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Back to history
        </a>

        {/* Title */}
        <section className="mt-6">

          <p className="text-sm text-slate-500">
            Clinical consultation
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Consultation details
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {date} at {time}
          </p>

        </section>

        {/* Emergency Assessment */}
        <section
          className={`mt-8 rounded-2xl border p-5 shadow-sm ${
            consultation.emergency
              ? "border-red-300 bg-red-50"
              : "border-slate-200 bg-white"
          }`}
        >

          <div className="flex items-center justify-between gap-4">

            <div>

              <p
                className={`text-sm ${
                  consultation.emergency
                    ? "text-red-600"
                    : "text-slate-500"
                }`}
              >
                Emergency assessment
              </p>

              <h2
                className={`mt-1 text-xl font-semibold ${
                  consultation.emergency
                    ? "text-red-700"
                    : "text-slate-900"
                }`}
              >
                {consultation.emergency
                  ? "Emergency: YES"
                  : "Emergency: NO"}
              </h2>

            </div>

            <div
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                consultation.emergency
                  ? "bg-red-600 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {consultation.urgency || "Not specified"}
            </div>

          </div>

          {consultation.emergency_reason && (
            <div
              className={`mt-5 rounded-xl p-4 ${
                consultation.emergency
                  ? "border border-red-200 bg-white"
                  : "bg-slate-50"
              }`}
            >

              <p
                className={`text-xs font-semibold uppercase tracking-wide ${
                  consultation.emergency
                    ? "text-red-600"
                    : "text-slate-500"
                }`}
              >
                Emergency reason
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                {consultation.emergency_reason}
              </p>

            </div>
          )}

        </section>

        {/* Chief Complaint */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Chief complaint
          </p>

          <p className="mt-2 text-base leading-7 text-slate-800">
            {consultation.chief_complaint ||
              "Not specified"}
          </p>

        </section>

        {/* Clinical Summary */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Clinical summary
          </p>

          <p className="mt-2 text-base leading-7 text-slate-800">
            {consultation.clinical_summary ||
              "Not specified"}
          </p>

        </section>

        {/* Symptoms */}
        <section className="mt-8">

          <p className="text-sm text-slate-500">
            Reported symptoms
          </p>

          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Symptoms
          </h2>

          <div className="mt-4 space-y-3">

            {consultation.symptoms.length === 0 ? (

              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
                No symptoms recorded.
              </div>

            ) : (

              consultation.symptoms.map((symptom) => (

                <div
                  key={symptom.symptom_id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <h3 className="font-semibold text-slate-900">
                        {symptom.symptom}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {symptom.evidence}
                      </p>

                    </div>

                    <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {symptom.certainty}
                    </span>

                  </div>

                </div>

              ))

            )}

          </div>

        </section>

        {/* Red Flags */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Safety assessment
          </p>

          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Red flags
          </h2>

          {consultation.red_flags.length === 0 ? (

            <p className="mt-4 text-sm text-slate-500">
              No red flags recorded.
            </p>

          ) : (

            <div className="mt-4 space-y-3">

              {consultation.red_flags.map(
                (flag, index) => (

                  <div
                    key={index}
                    className="rounded-xl bg-slate-50 p-4"
                  >

                    <p className="font-medium text-slate-900">
                      {flag.symptom}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {flag.reason}
                    </p>

                  </div>

                )
              )}

            </div>

          )}

        </section>

        {/* Disease Matches */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Dataset analysis
          </p>

          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Disease matches
          </h2>

          <div className="mt-3 rounded-xl bg-slate-50 p-4">

            <p className="text-sm leading-6 text-slate-600">
              These are symptom-based matches from the
              dataset. They are not confirmed medical
              diagnoses.
            </p>

          </div>

          <div className="mt-4 space-y-3">

            {consultation.disease_matches.length === 0 ? (

              <p className="text-sm text-slate-500">
                No disease matches recorded.
              </p>

            ) : (

              consultation.disease_matches.map(
                (match) => (

                  <div
                    key={match.disease_id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                  >

                    <span className="font-medium text-slate-800">
                      {match.disease}
                    </span>

                    <span className="text-sm text-slate-500">
                      {match.matching_symptoms} matching symptoms
                    </span>

                  </div>

                )
              )

            )}

          </div>

        </section>

        {/* Consultation Information */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Consultation information
          </p>

          <div className="mt-4 space-y-3 text-sm">

            <div className="flex justify-between gap-4">

              <span className="text-slate-500">
                Language
              </span>

              <span className="font-medium text-slate-800">
                {consultation.language}
              </span>

            </div>

            <div className="flex justify-between gap-4">

              <span className="text-slate-500">
                Duration
              </span>

              <span className="font-medium text-slate-800">
                {consultation.duration ||
                  "Not specified"}
              </span>

            </div>

            <div className="flex justify-between gap-4">

              <span className="text-slate-500">
                Severity
              </span>

              <span className="font-medium text-slate-800">
                {consultation.severity ||
                  "Not specified"}
              </span>

            </div>

          </div>

        </section>

        {/* Original Transcript */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Original consultation
          </p>

          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Transcript
          </h2>

          <div className="mt-4 rounded-xl bg-slate-50 p-4">

            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {consultation.transcript ||
                "Transcript not available."}
            </p>

          </div>

        </section>

      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white">

        <div className="mx-auto flex max-w-5xl justify-around px-4 py-3">

          <a
            href="/patient"
            className="flex flex-col items-center text-xs text-slate-500"
          >
            <span className="text-lg">⌂</span>
            Home
          </a>

          <a
            href="/patient/history"
            className="flex flex-col items-center text-xs text-slate-900"
          >
            <span className="text-lg">▤</span>
            History
          </a>

          <a
            href="/patient"
            className="flex flex-col items-center text-xs text-slate-500"
          >
            <span className="text-lg">✦</span>
            AI
          </a>

          <a
            href="/patient/profile"
            className="flex flex-col items-center text-xs text-slate-500"
          >
            <span className="text-lg">○</span>
            Profile
          </a>

        </div>

      </nav>

    </main>
  );
}
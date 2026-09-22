import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PatientBottomNav from "../../../components/BottomNavigation";

type Consultation = {
  consultation_id: string;
  patient_id: string;
  consultation_date: string;
  symptom_count: number;
};

export default async function PatientHistoryPage() {
const cookieStore = await cookies();
const session = cookieStore.get("ptalk_session");

if (!session?.value) {
  redirect("/login");
}

const response = await fetch(
  "http://localhost:3000/api/patient/history",
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

  const consultations: Consultation[] = await response.json();

  return (
    <main className="min-h-screen bg-slate-50 pb-24">

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-4">
          <div className="text-lg font-bold text-slate-900">
            PTalk
          </div>

          <div className="text-xs text-slate-400">
            Patient History
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-8">

        <a
          href="/patient"
          className="text-sm text-slate-500"
        >
          ← Back to home
        </a>

        <section className="mt-6">
          <p className="text-sm text-slate-500">
            Your history
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Previous consultations
          </h1>

          <p className="mt-2 text-slate-500">
            View your previous consultations and health information.
          </p>
        </section>

        <section className="mt-8 space-y-3">

          {consultations.map((consultation) => {
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

                    <h2 className="mt-1 font-semibold text-slate-800">
                      Clinical consultation
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {consultation.symptom_count} reported symptoms
                    </p>

                    <p className="mt-2 font-mono text-xs text-slate-400">
                      {consultation.consultation_id}
                    </p>

                  </div>

                  <span className="text-slate-400">
                    →
                  </span>

                </div>
              </a>
            );
          })}

        </section>

      </div>

      <PatientBottomNav/>

    </main>
  );
}
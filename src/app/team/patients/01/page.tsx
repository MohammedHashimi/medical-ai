type PatientPageProps = {
  params: Promise<{
    patient_id: string;
  }>;
};

export default async function PatientPage({
  params,
}: PatientPageProps) {
  const { patient_id } = await params;

  return (
    <main className="min-h-screen bg-slate-50">

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-5">
          <p className="text-xs text-slate-400">
            PTalk
          </p>

          <h1 className="mt-1 text-xl font-bold text-slate-900">
            Medical Team
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-8">

        <a
          href="/team"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Back to patients
        </a>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <p className="text-sm text-slate-500">
            Patient
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            Nguyen Van
          </h2>

          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-400">
              Patient ID
            </p>

            <p className="mt-1 font-mono text-sm text-slate-700">
              {patient_id}
            </p>
          </div>

        </section>

        <section className="mt-8">

          <h2 className="text-xl font-semibold text-slate-900">
            Consultations
          </h2>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Consultation history will appear here.
            </p>
          </div>

        </section>

      </div>

    </main>
  );
}
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6">

        {/* Header */}
        <header className="flex items-center justify-between py-6">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white shadow-sm">
              P
            </div>

            <div>
              <div className="text-xl font-bold tracking-tight">
                PTalk
              </div>

              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
                Clinical AI Research
              </div>
            </div>
          </Link>

          <Link
            href="/login"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            Sign in
          </Link>
        </header>

        {/* Hero */}
        <section className="flex flex-1 items-center py-16 lg:py-20">
          <div className="grid w-full items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">

            {/* Left side */}
            <div>

              <div className="mb-6 inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-500 shadow-sm">
                Clinical AI Research Project
              </div>

              <h1 className="max-w-3xl text-5xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                Better communication.
                <span className="block text-slate-500">
                  Smarter healthcare.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-500">
                PTalk is a research project of PTIT exploring
                AI-assisted clinical communication and intelligent
                healthcare applications.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="rounded-xl bg-slate-900 px-7 py-3.5 text-center text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
                >
                  Get started
                </Link>

                <Link
                  href="/register"
                  className="rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-center text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
                >
                  Create account
                </Link>
              </div>

              {/* Research affiliation */}
              <div className="mt-14 flex items-center gap-5 border-t border-slate-200 pt-7">
                <div className="flex h-20 w-24 items-center justify-center rounded-xl bg-white p-2 shadow-sm">
                  <img
                    src="/ptit-logo.png"
                    alt="PTIT"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                    Research Project
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    A research project of PTIT
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Research & Development in Clinical AI
                  </p>
                </div>
              </div>

            </div>

            {/* Right side */}
            <div className="relative">

              <div className="absolute -inset-8 rounded-[3rem] bg-slate-200/50 blur-3xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/60">

                {/* Card header */}
                <div className="border-b border-slate-100 px-6 py-5">
                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                        PTalk
                      </p>

                      <h2 className="mt-1 text-lg font-semibold text-slate-900">
                        Clinical Overview
                      </h2>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                      AI
                    </div>

                  </div>
                </div>

                {/* Card content */}
                <div className="space-y-4 p-6">

                  {/* Patient consultation */}
                  <div className="rounded-2xl bg-slate-50 p-5">

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                          Patient
                        </p>

                        <p className="mt-2 font-semibold text-slate-900">
                          Consultation
                        </p>
                      </div>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
                        Active
                      </span>
                    </div>

                  </div>

                  {/* AI */}
                  <div className="rounded-2xl border border-slate-100 p-5">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                        AI
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          PTalk AI
                        </p>

                        <p className="text-xs text-slate-400">
                          Clinical assistance
                        </p>
                      </div>

                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-500">
                      Ask questions, explore health information
                      and better understand your consultation.
                    </p>

                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-2 gap-4">

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-400">
                        Consultations
                      </p>

                      <p className="mt-2 text-2xl font-bold text-slate-900">
                        —
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Patient history
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-400">
                        AI Assistant
                      </p>

                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        Available
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Clinical support
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>
        </section>

        {/* Access section */}
        <section className="border-t border-slate-200 py-10">

          <div className="mb-6">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Platform access
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              Choose your workspace
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              PTalk provides dedicated experiences for patients
              and medical teams.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">

            {/* Patient */}
            <Link
              href="/login"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    For patients
                  </p>

                  <h2 className="mt-2 text-xl font-semibold text-slate-900">
                    Patient Portal
                  </h2>

                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Access your consultations, health information
                    and PTalk AI.
                  </p>
                </div>

                <span className="text-xl text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-900">
                  →
                </span>

              </div>
            </Link>

            {/* Medical team */}
            <Link
              href="/login"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    For medical teams
                  </p>

                  <h2 className="mt-2 text-xl font-semibold text-slate-900">
                    Medical Workspace
                  </h2>

                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Review patients, consultations and relevant
                    clinical information.
                  </p>
                </div>

                <span className="text-xl text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-900">
                  →
                </span>

              </div>
            </Link>

          </div>
        </section>

        {/* Research section */}
        <section className="border-t border-slate-200 py-12">

          <div className="mx-auto max-w-3xl text-center">

            <div className="mx-auto flex h-24 w-32 items-center justify-center rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
              <img
                src="/ptit-logo.png"
                alt="PTIT"
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
              Research & Development
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
              PTalk is a research project of PTIT
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
              The project explores the use of artificial intelligence
              to support communication, information access and
              clinical workflows in healthcare.
            </p>

          </div>

        </section>

        {/* Footer */}
        <footer className="flex flex-col gap-2 border-t border-slate-200 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">

          <p>
            PTalk · Clinical AI Research Project
          </p>

          <p>
            A research project of PTIT
          </p>

        </footer>

      </div>
    </main>
  );
}
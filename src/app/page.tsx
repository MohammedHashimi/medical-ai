"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ShowcaseItem = {
  title: string;
  description: string;
  image: string;
  features: string[];
};

const showcaseItems: ShowcaseItem[] = [
  {
    title: "Patient View",
    description:
      "A simple patient portal for consultations and health information.",
    image: "/showcase/patient-view.png",
    features: [
      "New consultations",
      "Health history",
      "PTalk AI",
    ],
  },
  {
    title: "AI Assistant",
    description:
      "Ask PTalk about symptoms and previously reported health information.",
    image: "/showcase/ai-assistant.png",
    features: [
      "Health questions",
      "Symptom conversations",
      "AI-assisted answers",
    ],
  },
  {
    title: "Medical Team View",
    description:
      "A structured overview of patients and clinical consultations.",
    image: "/showcase/medical-team.png",
    features: [
      "Patient management",
      "Consultation overview",
      "Emergency cases",
    ],
  },
  {
    title: "Knowledge Graph",
    description:
      "Explore connections between patients, consultations, symptoms and diseases.",
    image: "/showcase/knowledge-graph.png",
    features: [
      "Patient → Consultation",
      "Symptoms",
      "Disease relationships",
    ],
  },
];

export default function HomePage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setActiveIndex((current) =>
        current === showcaseItems.length - 1
          ? 0
          : current + 1
      );
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused]);

  const activeItem = showcaseItems[activeIndex];

  const previousSlide = () => {
    setActiveIndex((current) =>
      current === 0
        ? showcaseItems.length - 1
        : current - 1
    );
  };

  const nextSlide = () => {
    setActiveIndex((current) =>
      current === showcaseItems.length - 1
        ? 0
        : current + 1
    );
  };

  return (
    <main className="min-h-screen bg-white text-slate-950">

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <header className="border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-lg font-bold text-white shadow-sm">
              P
            </div>

            <div>
              <div className="text-xl font-bold tracking-tight text-slate-950">
                PTalk
              </div>

              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
                Clinical AI Research
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 md:flex">

            <a
              href="#home"
              className="text-sm font-medium text-blue-600"
            >
              Home
            </a>

            <a
              href="#about"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              About
            </a>

          </nav>

          {/* Authentication */}
          <div className="flex items-center gap-3">

            <Link
              href="/login"
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-600"
            >
              Sign in
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
            >
              Get Started
            </Link>

          </div>

        </div>
      </header>


      {/* ===================================================== */}
      {/* HERO */}
      {/* ===================================================== */}

      <section
        id="home"
        className="relative overflow-hidden"
      >

        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white via-white to-blue-50/70" />

        <div className="mx-auto max-w-7xl px-6 pb-16 pt-14 lg:px-8 lg:pb-20 lg:pt-20">

          <div className="grid items-center gap-14 lg:grid-cols-[0.88fr_1.12fr]">

            {/* ================================================= */}
            {/* HERO LEFT */}
            {/* ================================================= */}

            <div>

              {/* Project badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/70 px-4 py-2 text-xs font-medium text-blue-700">

                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

                Clinical AI Research Project

              </div>


              {/* Main headline */}
              <h1 className="max-w-2xl text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-[66px]">

                From Conversation
                <br />

                to{" "}
                <span className="text-blue-600">
                  Better Care
                </span>

              </h1>


              {/* Description */}
              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
                PTalk helps patients and medical teams understand
                symptoms, structure consultations and access
                medical knowledge — powered by AI.
              </p>


              {/* CTA buttons */}
              <div className="mt-9 flex flex-wrap gap-4">

                <Link
                  href="/login"
                  className="inline-flex items-center gap-3 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
                >
                  Get Started

                  <span className="text-lg leading-none">
                    →
                  </span>
                </Link>

                <Link
                  href="/register"
                  className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-600"
                >
                  Create account
                </Link>

              </div>


              {/* ================================================= */}
              {/* BENEFITS */}
              {/* ================================================= */}

              <div className="mt-12 grid max-w-2xl grid-cols-1 gap-7 sm:grid-cols-3">

                <Benefit
                  icon="↯"
                  title="Save Time"
                  description="Less documentation, more patient care"
                />

                <Benefit
                  icon="◇"
                  title="Detect Early"
                  description="AI identifies urgent red flags"
                />

                <Benefit
                  icon="♧"
                  title="Better Outcomes"
                  description="Structured insights for informed decisions"
                />

              </div>


              {/* ================================================= */}
              {/* PTIT RESEARCH AFFILIATION */}
              {/* ================================================= */}

              <div className="mt-12 border-t border-slate-200 pt-7">

                <div className="flex items-center gap-5">

                  <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white p-2 shadow-sm">

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

            </div>


            {/* ================================================= */}
            {/* HERO SHOWCASE */}
            {/* ================================================= */}

            <div
              className="relative"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >

              {/* Background glow */}
              <div className="absolute -inset-8 rounded-[3rem] bg-blue-100/40 blur-3xl" />


              {/* Main showcase */}
              <div className="relative rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_25px_80px_rgba(15,23,42,0.12)]">

                <div className="overflow-hidden rounded-[21px] border border-slate-100 bg-slate-50">

                  {/* Browser header */}
                  <div className="flex h-11 items-center justify-between border-b border-slate-100 bg-white px-5">

                    <div className="flex items-center gap-2">

                      <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />

                      <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />

                      <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />

                    </div>

                    <span className="text-xs font-medium text-slate-400">
                      PTalk
                    </span>

                    <div className="w-12" />

                  </div>


                  {/* Screenshots */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">

                    {showcaseItems.map((item, index) => (
                      <img
                        key={item.image}
                        src={item.image}
                        alt={item.title}
                        className={`absolute inset-0 h-full w-full object-cover object-top transition-all duration-700 ${
                          index === activeIndex
                            ? "scale-100 opacity-100"
                            : "scale-[1.015] opacity-0"
                        }`}
                      />
                    ))}

                  </div>

                </div>


                {/* ================================================= */}
                {/* PREVIOUS BUTTON */}
                {/* ================================================= */}

                <button
                  type="button"
                  onClick={previousSlide}
                  aria-label="Previous showcase"
                  className="group absolute left-[-22px] top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg shadow-slate-300/30 transition-all duration-200 hover:-translate-x-0.5 hover:border-blue-200 hover:shadow-xl"
                >

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-5 w-5 text-slate-500 transition group-hover:text-blue-600"
                  >

                    <path
                      d="M14.5 5L8.5 12L14.5 19"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                  </svg>

                </button>


                {/* ================================================= */}
                {/* NEXT BUTTON */}
                {/* ================================================= */}

                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next showcase"
                  className="group absolute right-[-22px] top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg shadow-slate-300/30 transition-all duration-200 hover:translate-x-0.5 hover:border-blue-200 hover:shadow-xl"
                >

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-5 w-5 text-slate-500 transition group-hover:text-blue-600"
                  >

                    <path
                      d="M9.5 5L15.5 12L9.5 19"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                  </svg>

                </button>

              </div>


              {/* ================================================= */}
              {/* SLIDE INFO */}
              {/* ================================================= */}

              <div className="mt-5 flex items-center justify-between px-2">

                <div>

                  <h2 className="text-base font-semibold text-slate-950">
                    {activeItem.title}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {activeItem.description}
                  </p>

                </div>

                <span className="text-sm font-medium text-slate-400">
                  {activeIndex + 1} / {showcaseItems.length}
                </span>

              </div>


              {/* ================================================= */}
              {/* DOTS */}
              {/* ================================================= */}

              <div className="mt-4 flex justify-center gap-2">

                {showcaseItems.map((item, index) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Show ${item.title}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === activeIndex
                        ? "w-7 bg-blue-600"
                        : "w-2 bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                ))}

              </div>

            </div>

          </div>


          {/* ===================================================== */}
          {/* SHOWCASE TILES */}
          {/* ===================================================== */}

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {showcaseItems.map((item, index) => (

              <button
                key={item.title}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`group text-left ${
                  index === activeIndex
                    ? "opacity-100"
                    : "opacity-90"
                }`}
              >

                <div
                  className={`overflow-hidden rounded-2xl border bg-white transition-all duration-200 ${
                    index === activeIndex
                      ? "border-blue-400 shadow-md shadow-blue-100"
                      : "border-slate-200 shadow-sm group-hover:border-blue-200 group-hover:shadow-md"
                  }`}
                >

                  <div className="aspect-[16/10] overflow-hidden bg-slate-50">

                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.02]"
                    />

                  </div>

                </div>


                <div className="px-1">

                  <h3 className="mt-4 text-base font-semibold text-slate-950">
                    {item.title}
                  </h3>

                  <p className="mt-1 min-h-[48px] text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>


                  <div className="mt-3 flex flex-wrap gap-2">

                    {item.features.map((feature) => (
                      <span
                        key={feature}
                        className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                      >
                        {feature}
                      </span>
                    ))}

                  </div>

                </div>

              </button>

            ))}

          </div>

        </div>

      </section>


   


      {/* ===================================================== */}
{/* ABOUT / PTIT */}
{/* ===================================================== */}

<section
  id="about"
  className="border-t border-slate-100 bg-slate-50/60"
>
  <div className="mx-auto max-w-4xl px-6 py-20 text-center lg:px-8">

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

    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
      PTalk is a research project of PTIT
    </h2>

    <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-500">
      PTalk was developed as part of a research project at PTIT
      under the supervision of{" "}
      <a
        href="https://www.linkedin.com/in/thuongvv/"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 transition hover:text-blue-600 hover:decoration-blue-300"
      >
        Lecturer Thuong Vu Van
      </a>
      .
    </p>

    <p className="mt-4 text-sm text-slate-400">
      Research & Development in Clinical AI
    </p>

  </div>
</section>
      {/* ===================================================== */}
      {/* FOOTER */}
      {/* ===================================================== */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-7 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between lg:px-8">

          <p>
            PTalk · Clinical AI Research Project
          </p>

          <p>
            A research project of PTIT
          </p>

        </div>

      </footer>

    </main>
  );
}


/* ========================================================= */
/* BENEFIT COMPONENT */
/* ========================================================= */

function Benefit({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center text-2xl font-light text-blue-600">
        {icon}
      </div>

      <div>

        <h3 className="text-sm font-semibold text-slate-950">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>

      </div>

    </div>
  );
}
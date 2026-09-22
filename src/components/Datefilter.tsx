"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function DateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentDate =
    searchParams.get("date") || "";

  function handleDateChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const date = event.target.value;

    if (!date) {
      router.push("/team");
      return;
    }

    router.push(
      `/team?date=${encodeURIComponent(date)}`
    );
  }

  function clearDate() {
    router.push("/team");
  }

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <p className="text-sm font-medium text-slate-700">
            Consultation date
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Filter the dashboard by consultation day.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">

          <div>
            <label
              htmlFor="consultation-date"
              className="block text-xs font-medium text-slate-500"
            >
              Select date
            </label>

            <input
              id="consultation-date"
              name="date"
              type="date"
              value={currentDate}
              onChange={handleDateChange}
              className="mt-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          {currentDate && (
            <button
              type="button"
              onClick={clearDate}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Clear
            </button>
          )}

        </div>
      </div>
    </section>
  );
}
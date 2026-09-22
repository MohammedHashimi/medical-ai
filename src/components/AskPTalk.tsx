export default function AskPTalk() {
  return (
    <section className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-300">
            PTalk AI
          </p>

          <h2 className="mt-1 text-xl font-semibold">
            Ask about your health history
          </h2>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
          ✨
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-300">
        Ask questions about your previous consultations and reported symptoms.
      </p>

      <div className="mt-5 rounded-2xl bg-white p-2">
        <input
          type="text"
          placeholder="What symptoms have I reported before?"
          className="w-full px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />

        <button className="mt-1 w-full rounded-xl bg-slate-900 py-3 text-sm font-medium text-white">
          Ask PTalk →
        </button>
      </div>
    </section>
  );
}
export default function PatientHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <div>
          <div className="text-lg font-bold text-slate-900">
            PTalk
          </div>
          <div className="text-xs text-slate-400">
            Patient Portal
          </div>
        </div>

        <button
          aria-label="Open menu"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600"
        >
          ☰
        </button>
      </div>
    </header>
  );
}
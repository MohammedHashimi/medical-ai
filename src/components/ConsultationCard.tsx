type ConsultationCardProps = {
  date: string;
  title: string;
  symptoms: number;
};

export default function ConsultationCard({
  date,
  title,
  symptoms,
}: ConsultationCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-900">
            {date}
          </p>

          <h3 className="mt-1 font-semibold text-slate-800">
            {title}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {symptoms} reported symptoms
          </p>
        </div>

        <span className="text-xl text-slate-400">
          →
        </span>
      </div>
    </div>
  );
}
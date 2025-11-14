interface StatCardProps {
  label: string;
  value: string;
  caption?: string;
}

export default function StatCard({ label, value, caption }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="text-sm font-medium text-slate-500 mb-1">{label}</div>
      <div className="text-3xl font-bold text-brand mb-1">{value}</div>
      {caption && <div className="text-xs text-slate-400">{caption}</div>}
    </div>
  );
}


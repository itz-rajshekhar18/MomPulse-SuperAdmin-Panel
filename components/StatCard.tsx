interface StatCardProps {
  label: string;
  value: string;
  change: string;
  changeType: 'up' | 'down';
}

export default function StatCard({ label, value, change, changeType }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
        {label}
      </p>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div
          className={`text-xs font-semibold ${
            changeType === 'up' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {changeType === 'up' ? '↑' : '↓'} {change}
        </div>
      </div>
    </div>
  );
}

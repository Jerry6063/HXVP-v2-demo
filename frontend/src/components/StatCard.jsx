export default function StatCard({ label, value, sub, icon: Icon, color = 'indigo', onClick, active = false }) {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    sky: 'bg-sky-50 text-sky-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  const ringMap = {
    indigo: 'ring-2 ring-indigo-400',
    emerald: 'ring-2 ring-emerald-400',
    amber: 'ring-2 ring-amber-400',
    sky: 'ring-2 ring-sky-400',
    red: 'ring-2 ring-red-400',
    purple: 'ring-2 ring-purple-400',
  };

  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      onClick={onClick}
      className={`w-full text-left bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all
        ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''}
        ${active ? ringMap[color] : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${colorMap[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </Wrapper>
  );
}

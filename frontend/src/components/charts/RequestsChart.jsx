import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function RequestsChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <p className="text-text-secondary text-sm font-body py-8 text-center">
        No request data yet — once your API keys are used, activity will appear here.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="requestsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff3b6b" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#ff3b6b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="day" stroke="#7a6670" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#7a6670" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: 'rgba(20,4,10,0.9)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            fontFamily: 'Lora, serif',
            color: '#f5eef0',
          }}
        />
        <Area
          type="monotone"
          dataKey="requests"
          stroke="#ff3b6b"
          strokeWidth={2}
          fill="url(#requestsGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
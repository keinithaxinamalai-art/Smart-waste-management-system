import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { weeklyTrendData, type CompositionSlice } from '../data/mockData';

export function CollectionsChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={weeklyTrendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="fillTeal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={28} />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            fontSize: 13,
          }}
        />
        <Area
          type="monotone"
          dataKey="collections"
          stroke="#0d5c4b"
          strokeWidth={2}
          fill="url(#fillTeal)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function VolumeChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={weeklyTrendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={32} unit="t" />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            fontSize: 13,
          }}
          formatter={(v) => [`${v ?? 0} t`, 'Volume']}
        />
        <Bar dataKey="volume" fill="#0d9488" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CompositionChart({ data }: { data: CompositionSlice[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={52}
          outerRadius={72}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            fontSize: 13,
          }}
          formatter={(v) => [`${v ?? 0}%`, 'Share']}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

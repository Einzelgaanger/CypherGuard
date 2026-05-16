"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function WeeklyVisitorChart({ data }: { data: number[] }) {
  const shortLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const chartData = data.map((visitors, i) => ({
    name: data.length <= 7 ? (shortLabels[i] ?? `Day ${i + 1}`) : `Day ${i + 1}`,
    visitors,
  }));
  const angled = data.length > 7;
  return (
    <div className="h-56 w-full min-h-[14rem] sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 4, left: -8, bottom: angled ? 16 : 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="var(--text-muted)"
            tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
            interval={0}
            angle={angled ? -35 : 0}
            textAnchor={angled ? "end" : "middle"}
            height={angled ? 48 : 28}
          />
          <YAxis stroke="var(--text-muted)" tick={{ fill: "var(--text-secondary)", fontSize: 11 }} width={36} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 12,
              color: "var(--text-primary)",
              boxShadow: "0 8px 24px rgba(61,52,41,0.12)",
            }}
            formatter={(value) => [`${Number(value ?? 0)} visitors`, ""]}
          />
          <Bar dataKey="visitors" fill="var(--accent)" fillOpacity={0.55} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

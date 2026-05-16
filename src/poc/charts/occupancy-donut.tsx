"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export function OccupancyDonut({
  activeUnits,
  totalUnits,
}: {
  activeUnits: number;
  totalUnits: number;
}) {
  const empty = Math.max(0, totalUnits - activeUnits);
  const data = [
    { name: "With guests", value: activeUnits },
    { name: "Quiet homes", value: empty },
  ];
  const pct = totalUnits ? Math.round((activeUnits / totalUnits) * 100) : 0;
  return (
    <div className="relative h-48 w-full min-h-[12rem] sm:h-52">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="48%"
            outerRadius="72%"
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            <Cell fill="var(--accent)" />
            <Cell fill="#e8dfd2" />
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 12,
              color: "var(--text-primary)",
              boxShadow: "0 8px 24px rgba(61,52,41,0.12)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-bold text-cs-text-primary sm:text-3xl">{pct}%</span>
        <span className="text-xs text-cs-text-muted">homes with guests</span>
      </div>
    </div>
  );
}

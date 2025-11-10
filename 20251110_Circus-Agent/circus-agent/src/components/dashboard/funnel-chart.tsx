"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

type FunnelData = {
  label: string;
  value: number;
  trend: number;
};

type Props = {
  data: FunnelData[];
};

const COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // orange
  "#EF4444", // red
];

export function FunnelChart({ data }: Props) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis type="number" stroke="#64748B" />
          <YAxis
            dataKey="label"
            type="category"
            stroke="#64748B"
            width={100}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#FFF",
              border: "1px solid #E2E8F0",
              borderRadius: "8px",
              padding: "8px 12px",
            }}
            formatter={(value: number, name: string) => [
              `${value}件`,
              name === "value" ? "件数" : name,
            ]}
          />
          <Legend />
          <Bar dataKey="value" name="件数" radius={[0, 8, 8, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


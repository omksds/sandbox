"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// モックデータ（実際には過去のKPIデータをAPIから取得）
const generateMockTrendData = () => {
  const weeks = ["4週間前", "3週間前", "2週間前", "先週", "今週"];
  return weeks.map((week, index) => ({
    week,
    candidates: 80 + index * 5,
    interviews: 12 + index * 2,
    offers: 5 + index,
    placements: 2 + Math.floor(index / 2),
  }));
};

export function KpiTrendChart() {
  const data = generateMockTrendData();

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="week" stroke="#64748B" />
          <YAxis stroke="#64748B" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#FFF",
              border: "1px solid #E2E8F0",
              borderRadius: "8px",
              padding: "8px 12px",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="candidates"
            name="候補者"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ fill: "#3B82F6", r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="interviews"
            name="面接"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ fill: "#10B981", r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="offers"
            name="オファー"
            stroke="#F59E0B"
            strokeWidth={2}
            dot={{ fill: "#F59E0B", r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="placements"
            name="成約"
            stroke="#EF4444"
            strokeWidth={2}
            dot={{ fill: "#EF4444", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


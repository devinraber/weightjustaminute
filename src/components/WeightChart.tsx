"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeightTrendPoint } from "@/lib/types";

interface WeightChartProps {
  points: WeightTrendPoint[];
}

/** Interactive chart: actual logged weight vs. 7-day EMA vs. goal projection. */
export default function WeightChart({ points }: WeightChartProps) {
  return (
    <div className="h-64 w-full rounded-xl border border-slate-200 bg-white p-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} minTickGap={24} />
          <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="actualWeightKg"
            name="Actual"
            stroke="#94a3b8"
            strokeWidth={1.5}
            dot={{ r: 2 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="emaWeightKg"
            name="7-day avg"
            stroke="#16a34a"
            strokeWidth={2.5}
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="projectedWeightKg"
            name="Projection"
            stroke="#0ea5e9"
            strokeDasharray="5 5"
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

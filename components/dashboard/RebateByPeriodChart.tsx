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

export interface RebatePeriodPoint {
  period: string;
  totalSpend: number;
  totalRebate: number;
}

interface RebateByPeriodChartProps {
  data: RebatePeriodPoint[];
}

export default function RebateByPeriodChart({
  data,
}: RebateByPeriodChartProps) {
  // Custom formatter for currency values in tooltip
  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="period"
          stroke="#64748b"
          style={{ fontSize: "12px" }}
        />
        <YAxis
          stroke="#64748b"
          style={{ fontSize: "12px" }}
          tickFormatter={formatCurrency}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value: number) => formatCurrency(value)}
        />
        <Legend
          wrapperStyle={{ fontSize: "12px" }}
          iconType="line"
        />
        <Line
          type="monotone"
          dataKey="totalSpend"
          stroke="#64748b"
          strokeWidth={2}
          name="Total Spend"
          dot={{ fill: "#64748b", r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="totalRebate"
          stroke="#10b981"
          strokeWidth={2}
          name="Total Rebate"
          dot={{ fill: "#10b981", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}


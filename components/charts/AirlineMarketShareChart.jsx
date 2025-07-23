"use client";
import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const COLORS = ['#1e3a8a', '#3b82f6', '#93c5fd', '#60a5fa'];

const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, percent, airline }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 18;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const textAnchor = x > cx ? 'start' : 'end';

  const text = `${airline}: ${(percent * 100).toFixed(2)}%`;
  const maxLen = 15;

  let lines = [text];
  if (text.length > maxLen) {
    const idx = text.lastIndexOf(' ', maxLen);
    if (idx > -1) {
      lines = [text.slice(0, idx), text.slice(idx + 1)];
    } else {
      lines = [text.slice(0, maxLen), text.slice(maxLen)];
    }
  }

  return (
    <g>
      {lines.map((line, i) => (
        <text
          key={i}
          x={x}
          y={y}
          dy={i * 12}
          textAnchor={textAnchor}
          fill="#333"
          fontSize={10}
        >
          {line}
        </text>
      ))}
    </g>
  );
};


const AirlineMarketShareChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div>No data available for the pie chart.</div>;
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart margin={{ top: 20, right: 40, left: 40, bottom: 40 }}>
        <Tooltip
          formatter={(value, name) => [`${(value * 100).toFixed(2)}%`, name]}
        />
        <Pie
          data={data}
          dataKey="percent"
          nameKey="airline"
          cx="50%"
          cy="50%"
          outerRadius={70}
          labelLine={{ strokeWidth: 0.5 }}
          label={renderCustomLabel}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

// RECOMMENDATION: Import this component dynamically where used for better performance.
// Example: const AirlineMarketShareChart = dynamic(() => import('@/components/charts/AirlineMarketShareChart'), { ssr: false });

export default AirlineMarketShareChart;

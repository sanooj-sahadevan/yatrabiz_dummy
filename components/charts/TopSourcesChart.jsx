"use client";
import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";

// RECOMMENDATION: Import this component dynamically where used for better performance.
// Example: const TopSourcesChart = dynamic(() => import('@/components/charts/TopSourcesChart'), { ssr: false });

const renderXAxisTick = (props) => {
  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={10} textAnchor="middle" fontSize="10" fill="#666">
        {payload.value}
      </text>
    </g>
  );
};
const renderYAxisTick = (props) => {
  const { x, y, payload } = props;
  const text = payload.value;
  const maxLen = 8;
  let lines = [text];
  if (text.length > maxLen) {
    // Always split into two lines
    const idx = text.lastIndexOf(" ", maxLen);
    if (idx > 0) {
      lines = [text.slice(0, idx), text.slice(idx + 1)];
    } else {
      lines = [text.slice(0, maxLen), text.slice(maxLen)];
    }
  }
  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, i) => (
        <text
          key={i}
          x={0}
          y={i * 11}
          textAnchor="end"
          fontSize="10"
          fill="#666"
          fontFamily="inherit"
        >
          {line}
        </text>
      ))}
    </g>
  );
};

const TopSourcesChart = ({ data }) => {
  const safeData = Array.isArray(data)
    ? data.filter(
        (d) =>
          typeof d.count === "number" &&
          !isNaN(d.count) &&
          typeof d.name === "string" &&
          d.name.length > 0
      )
    : [];

  if (!safeData.length) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        No data available
      </div>
    );
  }

  if (safeData.length === 1) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        Only one source: <b>{safeData[0].name}</b>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={safeData}
        layout="vertical"
        margin={{ left: 0, right: 10, top: 10, bottom: 10 }}
      >
        <XAxis type="number" height={10} tick={renderXAxisTick} />
        <YAxis
          type="category"
          dataKey="name"
          width={70}
          tick={renderYAxisTick}
        />
        <Tooltip />
        {/* <Legend
          verticalAlign="bottom"
          height={36}
          wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }}
        /> */}
        <Bar dataKey="count" fill="#3b82f6" name="Bookings" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TopSourcesChart;

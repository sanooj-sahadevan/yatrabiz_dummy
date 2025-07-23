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
  CartesianGrid,
} from "recharts";

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
  const maxLen = 12;
  let lines = [text];
  if (text.length > maxLen) {
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

const CompoundBarChart = ({ data }) => {
  const safeData = Array.isArray(data)
    ? data.filter(
        (d) =>
          typeof d.credit === "number" &&
          typeof d.due === "number" &&
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

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={safeData}
        margin={{ left: 0, right: 10, top: 10, bottom: 10 }}
      >
        <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={renderXAxisTick} />
        <YAxis tick={renderYAxisTick} width={40} />
        <Tooltip />
        <Legend
          verticalAlign="top"
          height={36}
          wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }}
        />
        <Bar dataKey="credit" fill="#1e3a8a" name="Credit" />
        <Bar dataKey="due" fill="#60a5fa" name="Due" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CompoundBarChart;

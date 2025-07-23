"use client";
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
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
const MonthlyBookingsChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ left: 0, right: 10, top: 10, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={renderXAxisTick} />
        <YAxis width={30} tick={renderYAxisTick} />
        <Tooltip />
        {/* <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} /> */}
        <Line
          type="monotone"
          dataKey="total"
          stroke="#1e3a8a"
          name="Confirmed Bookings"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MonthlyBookingsChart;

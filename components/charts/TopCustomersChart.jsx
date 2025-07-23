"use client";
import React from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Scatter,
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-[10px] border border-[#ccc] rounded-[5px]">
        <p className="font-bold">{`${data.name}`}</p>
        <p>{`Ticket Count: ${data.ticketCount}`}</p>
        <p>{`Total Amount: ₹${data.totalAmount.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

// RECOMMENDATION: Import this component dynamically where used for better performance.
// Example: const TopCustomersChart = dynamic(() => import('@/components/charts/TopCustomersChart'), { ssr: false });

const TopCustomersChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart
        margin={{
          top: 20,
          right: 30,
          bottom: 20,
          left: 20,
        }}
      >
        <CartesianGrid />
        <XAxis
          type="number"
          dataKey="ticketCount"
          name="Ticket Count"
          label={{
            value: "Ticket Count",
            position: "insideBottom",
            offset: -10,
            fontSize: 12,
          }}
          tick={{ fontSize: 10 }}
        />
        <YAxis
          type="number"
          dataKey="totalAmount"
          name="Total Amount"
          unit="₹"
          label={{
            value: "Amount (₹)",
            angle: -90,
            position: "left",
            offset: 10,
            fontSize: 12,
          }}
          tick={{ fontSize: 10 }}
          tickFormatter={(value) => value.toLocaleString()}
        />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          content={<CustomTooltip />}
        />
        <Scatter name="Customers" data={data} fill="#60a5fa" />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default TopCustomersChart;

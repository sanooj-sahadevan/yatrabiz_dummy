"use client";
import React, { useEffect, useState, useContext } from "react";
import AGTable from "@/components/admin/table/AGGrid";
import { LEDGER_BOOKING_COLUMNS } from "@/constants/tableColumns";
import Link from "next/link";
import { TopbarTitleContext } from "@/app/admin/layout";

async function getBookingDetails(id) {
  const res = await fetch(`/api/ledger/${id}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.success ? data.data : null;
}

export default function BookingDetailsPage({ params }) {
  const { setCustomTitle } = useContext(TopbarTitleContext);
  const [bookings, setBookings] = useState(null);
  const [loading, setLoading] = useState(true);

  const actualParams = React.use(params);
  const id = actualParams.id;

  useEffect(() => {
    setCustomTitle && setCustomTitle("PNR Details");
    return () => setCustomTitle && setCustomTitle(null);
  }, [setCustomTitle]);

  useEffect(() => {
    getBookingDetails(id).then((data) => {
      setBookings(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div className="p-6 text-gray-600">Loading booking details...</div>;
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          No Bookings Found for this PNR
        </h1>
      </div>
    );
  }

  const booking = bookings[0];
  const pnr = booking.ticket?.PNR || "-";
  const agent = booking.adminId?.name || booking.user?.name || "-";
  const bookingRef = booking.bookingReference || "-";
  const passengers = bookings.flatMap((b) => b.passengers || []);

  const bookingTableData = bookings.map((b, idx) => ({
    id: b._id || idx,
    pnr: b.ticket?.PNR || "-",
    agent: b.user?.name || "-",
    due:
      b.agentOutstanding !== undefined
        ? `₹${b.agentOutstanding.toLocaleString()}`
        : "-",
    paid:
      b.agentCredit !== undefined ? `₹${b.agentCredit.toLocaleString()}` : "-",
    bookingRef: b.bookingReference || "-",
    passengerList:
      Array.isArray(b.passengers) && b.passengers.length > 0
        ? b.passengers.map((p) =>
            p.type == "Infant"
              ? `${p.type} ${p.firstName || ""} ${p.lastName || ""}`.trim()
              : `${p.honorific || ""} ${p.firstName || ""} ${
                  p.lastName || ""
                }`.trim()
          )
        : [],
  }));

  return (
    <div className="p-6 min-h-screen">
      <Link href="/admin/ledger" className="inline-block  -mt-8 mb-4 -ml-4">
        <span className="mr-2" style={{ fontSize: "1.2em", lineHeight: 1 }}>
          &larr;
        </span>
        Back
      </Link>
      <AGTable
        data={bookingTableData}
        columns={LEDGER_BOOKING_COLUMNS}
        title="PNR Details"
        tableContext="booking-ledger"
        adminRole={{ role: "admin" }}
      />
    </div>
  );
}
